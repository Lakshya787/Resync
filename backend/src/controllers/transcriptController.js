import axios from "axios";

export const extractTranscript = async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ success: false, message: "URL is required" });
    }

    let videoId = null;
    try {
      const urlObj = new URL(url);
      if (urlObj.hostname.includes("youtube.com")) {
        if (urlObj.pathname === "/watch") {
          videoId = urlObj.searchParams.get("v");
        } else if (urlObj.pathname.startsWith("/embed/")) {
          videoId = urlObj.pathname.split("/")[2];
        }
      } else if (urlObj.hostname.includes("youtu.be")) {
        videoId = urlObj.pathname.slice(1);
      }
    } catch (err) {
      // Invalid URL format
    }

    if (!videoId) {
      return res.status(400).json({ success: false, message: "Invalid YouTube URL" });
    }

    const apiUrl = `https://www.youtube.com/api/timedtext?lang=en&v=${videoId}&fmt=json3`;
    const response = await axios.get(apiUrl);

    if (!response.data || !response.data.events) {
      return res.status(404).json({ success: false, message: "No captions found for this video. Make sure the video has closed captions enabled." });
    }

    const events = response.data.events;
    const textSegments = [];

    for (const event of events) {
      if (event.segs) {
        for (const seg of event.segs) {
          if (seg.utf8 && seg.utf8 !== "\n") {
            textSegments.push(seg.utf8);
          }
        }
      }
    }

    const transcript = textSegments.join("").replace(/\n/g, " ").trim();
    const wordCount = transcript === "" ? 0 : transcript.split(/\s+/).length;

    if (!transcript) {
       return res.status(404).json({ success: false, message: "Captions are empty" });
    }

    return res.status(200).json({
      success: true,
      transcript,
      videoId,
      wordCount,
    });
  } catch (error) {
    console.error("Transcript Extraction Error:", error.message);
    // Handle specific axios errors like 404
    if (error.response && error.response.status === 404) {
        return res.status(404).json({ success: false, message: "No captions found for this video." });
    }
    return res.status(500).json({ success: false, message: "Server error failed to extract transcript" });
  }
};
