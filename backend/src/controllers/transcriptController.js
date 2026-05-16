import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const extractTranscript = async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ success: false, message: "URL is required" });
    }

    // Basic YouTube URL validation before spawning Python
    let videoId = null;
    try {
      const urlObj = new URL(url);
      if (urlObj.hostname.includes("youtube.com")) {
        if (urlObj.pathname === "/watch") {
          videoId = urlObj.searchParams.get("v");
        } else if (urlObj.pathname.startsWith("/embed/")) {
          videoId = urlObj.pathname.split("/")[2];
        } else if (urlObj.pathname.startsWith("/shorts/")) {
          videoId = urlObj.pathname.split("/")[2];
        }
      } else if (urlObj.hostname.includes("youtu.be")) {
        videoId = urlObj.pathname.slice(1);
      }
    } catch {
      // Invalid URL format — let Python surface the error
    }

    if (!videoId) {
      return res.status(400).json({ success: false, message: "Invalid YouTube URL" });
    }

    // ── Spawn transcriptSource.py in JSON mode ──────────────────────────────
    // Pass the full URL so transcriptSource can try Supadata (needs canonical URL)
    // and use the MongoDB cache. The --json flag makes stdout emit clean JSON only.
    const scriptPath = path.join(__dirname, "../python/transcriptSource.py");
    const pythonCmd = process.platform === "win32" ? "python" : "python3";
    const python = spawn(pythonCmd, [scriptPath, url, "--json"], {
      env: { ...process.env, PYTHONIOENCODING: "utf-8", PYTHONUTF8: "1" },
    });

    let stdoutData = "";
    let stderrData = "";
    let isFinished = false;

    // 45-second timeout (transcriptSource may try multiple strategies)
    const timeoutId = setTimeout(() => {
      if (!isFinished) {
        isFinished = true;
        python.kill(); // SIGTERM on Linux/Mac, forceful terminate on Windows
        return res.status(504).json({
          success: false,
          message: "Request timed out after 45 seconds",
        });
      }
    }, 45000);

    python.stdout.on("data", (data) => {
      stdoutData += data.toString();
    });

    // transcriptSource.py routes its debug logs to stderr in --json mode
    python.stderr.on("data", (data) => {
      stderrData += data.toString();
    });

    python.on("error", (error) => {
      if (!isFinished) {
        isFinished = true;
        clearTimeout(timeoutId);
        console.error("[transcriptController] Spawn error:", error);
        return res.status(500).json({
          success: false,
          message: "Failed to start transcript process",
        });
      }
    });

    python.on("close", (code) => {
      if (isFinished) return;
      isFinished = true;
      clearTimeout(timeoutId);

      // Log debug output from Python for server-side visibility
      if (stderrData.trim()) {
        console.log("[transcriptSource.py]", stderrData.trim());
      }

      try {
        if (!stdoutData.trim()) {
          console.error("[transcriptController] No stdout from Python. Stderr:", stderrData);
          return res.status(500).json({
            success: false,
            message: "Failed to fetch transcript (no output from script)",
          });
        }

        const result = JSON.parse(stdoutData.trim());

        if (result.error) {
          return res.status(404).json({ success: false, message: result.error });
        }

        if (!result.transcript) {
          return res.status(404).json({ success: false, message: "Transcript is empty" });
        }

        return res.status(200).json({
          success:    true,
          transcript: result.transcript,
          videoId:    result.videoId || videoId,
          wordCount:  result.wordCount,
          source:     result.source, // "cache" | "supadata" | "official"
        });
      } catch (parseError) {
        console.error("[transcriptController] JSON parse error:", parseError, "| stdout:", stdoutData, "| stderr:", stderrData);
        return res.status(500).json({
          success: false,
          message: "Failed to parse transcript response",
        });
      }
    });
  } catch (error) {
    console.error("[transcriptController] Unexpected error:", error.message);
    return res.status(500).json({ success: false, message: "Server error — failed to extract transcript" });
  }
};
