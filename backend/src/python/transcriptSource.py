"""
YouTube Transcript Extractor
============================
Fetches transcripts via youtube-transcript-api with a MongoDB caching layer.
Optionally enriches documents with YouTube Data API v3 metadata.

Fetch priority:
  0. MongoDB cache          — instant, no API call
  1. youtube-transcript-api — direct YouTube fetch (cookies bypass supported)

Optional enrichment (set YOUTUBE_API_KEY in .env):
  - Video title, channel name, published date
  - View / like / comment counts
  - Subscriber count
  - Description analysis (citation links, disclaimer, spam signals)

Install dependencies:
    pip install youtube-transcript-api pymongo python-dotenv requests
    pip install google-api-python-client  # optional, for metadata

.env  (at backend/):
    MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net
    YOUTUBE_API_KEY=AIza...   # optional — enables metadata enrichment

Usage — interactive:
    python transcriptSource.py
    python transcriptSource.py https://www.youtube.com/watch?v=VIDEO_ID

Usage — Node.js bridge (JSON mode):
    python transcriptSource.py <URL> --json
    → single JSON line on stdout, all debug logs on stderr

Import:
    from transcriptSource import get_transcript
    text, source = get_transcript("https://www.youtube.com/watch?v=VIDEO_ID")
"""

import os
import re
import sys
import json as _json
from datetime import datetime, timezone
from typing import Optional, Tuple
from urllib.parse import urlparse, parse_qs

# ── Windows UTF-8 fix ─────────────────────────────────────────────────────────
if sys.stdout.encoding and sys.stdout.encoding.lower() not in ("utf-8", "utf8"):
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")
    except AttributeError:
        pass

# ── .env loader ───────────────────────────────────────────────────────────────
try:
    from pathlib import Path
    from dotenv import load_dotenv
    _backend_dir = Path(__file__).resolve().parent.parent.parent
    load_dotenv(dotenv_path=_backend_dir / ".env", override=False)
    load_dotenv(override=False)
except ImportError:
    pass

# ── youtube-transcript-api (v1.2+) ───────────────────────────────────────────
try:
    from youtube_transcript_api import YouTubeTranscriptApi
    from youtube_transcript_api._errors import (
        TranscriptsDisabled,
        NoTranscriptFound,
        VideoUnavailable,
        IpBlocked,
        RequestBlocked,
    )
    import http.cookiejar
    import requests

    # Try to load cookies.txt to bypass IP blocks
    # Check multiple locations to make deployment easier (especially on Render)
    cookie_paths = [
        os.path.join(os.path.dirname(__file__), "cookies.txt"), # Local dev
        "/etc/secrets/cookies.txt",                             # Render secret files
        "cookies.txt",                                          # Current working dir
        os.path.join(os.path.dirname(__file__), "..", "..", "cookies.txt") # backend root
    ]
    
    session = None
    for path in cookie_paths:
        if os.path.exists(path):
            try:
                # Robust manual parsing in case the # Netscape header is missing
                # which often happens when copy-pasting into Render
                temp_session = requests.Session()
                valid_cookies = 0
                with open(path, "r", encoding="utf-8") as f:
                    for line in f:
                        if not line.strip() or line.strip().startswith("#"):
                            continue
                        parts = line.strip().split("\t")
                        if len(parts) >= 7:
                            domain, flag, path_str, secure, expiry, name, value = parts[:7]
                            temp_session.cookies.set(name, value, domain=domain, path=path_str)
                            valid_cookies += 1
                
                if valid_cookies > 0:
                    session = temp_session
                    print(f"[YT-API] Loaded {valid_cookies} cookies from {path}", file=sys.stderr)
                    break
                else:
                    print(f"[YT-API] Found {path} but it contained no valid cookies", file=sys.stderr)
            except Exception as e:
                print(f"[YT-API] Failed to parse cookies from {path}: {e}", file=sys.stderr)

    if session:
        _yta = YouTubeTranscriptApi(http_client=session)
    else:
        _yta = YouTubeTranscriptApi()
except ImportError:
    print("[ERROR] Missing: pip install youtube-transcript-api requests", file=sys.stderr)
    sys.exit(1)

# ── YouTube Data API v3 (optional) ───────────────────────────────────────────
try:
    from googleapiclient.discovery import build as _yt_build
    YOUTUBE_DATA_API_AVAILABLE = True
except ImportError:
    YOUTUBE_DATA_API_AVAILABLE = False

# ── pymongo ───────────────────────────────────────────────────────────────────
try:
    from pymongo import MongoClient, ASCENDING
    from pymongo.errors import PyMongoError
    MONGODB_AVAILABLE = True
except ImportError:
    print("[WARN] pymongo not installed — caching disabled.", file=sys.stderr)
    MONGODB_AVAILABLE = False

# ── Constants ─────────────────────────────────────────────────────────────────
DB_NAME         = "resync"
COLLECTION_NAME = "transcripts"
MIN_WORDS       = 10


# ══════════════════════════════════════════════════════════════════════════════
# MongoDB Cache
# ══════════════════════════════════════════════════════════════════════════════

_mongo_client = None


def _get_collection():
    global _mongo_client
    if not MONGODB_AVAILABLE:
        return None
    uri = os.getenv("MONGODB_URI", "").strip()
    if not uri:
        print("[MONGO] MONGODB_URI not set — caching disabled", file=sys.stderr)
        return None
    try:
        if _mongo_client is None:
            _mongo_client = MongoClient(uri, serverSelectionTimeoutMS=5000)
            _mongo_client[DB_NAME][COLLECTION_NAME].create_index(
                [("videoId", ASCENDING)], unique=True, background=True
            )
        return _mongo_client[DB_NAME][COLLECTION_NAME]
    except PyMongoError as e:
        print(f"[MONGO] Connection error: {e}", file=sys.stderr)
        return None


def _cache_get(video_id: str) -> Optional[Tuple[str, str]]:
    """Return (transcript, source) from MongoDB cache, or None."""
    col = _get_collection()
    if col is None:
        return None
    try:
        doc = col.find_one({"videoId": video_id}, {"transcript": 1, "source": 1})
        if doc and doc.get("transcript"):
            print(f"[MONGO] ✅ Cache hit: {video_id}", file=sys.stderr)
            return doc["transcript"], doc.get("source", "cache")
    except PyMongoError as e:
        print(f"[MONGO] Read error: {e}", file=sys.stderr)
    return None


def _cache_set(video_id: str, transcript: str, source: str, metadata: dict = None) -> None:
    """
    Upsert a transcript + optional metadata into MongoDB.

    Document shape:
        videoId       : str       — unique key
        videoUrl      : str
        transcript    : str
        source        : str       — "official" | "cache"
        wordCount     : int
        fetchedAt     : datetime (UTC)
        -- enriched fields (if YOUTUBE_API_KEY set) --
        title         : str
        channelName   : str
        channelId     : str
        publishedDate : str
        viewCount     : int
        likeCount     : int
        commentCount  : int
        subscriberCount : int
        description   : str
        descAnalysis  : dict
    """
    col = _get_collection()
    if col is None:
        return
    try:
        doc = {
            "videoId":   video_id,
            "videoUrl":  f"https://www.youtube.com/watch?v={video_id}",
            "transcript": transcript,
            "source":    source,
            "wordCount": len(transcript.split()),
            "fetchedAt": datetime.now(timezone.utc),
        }
        if metadata:
            doc.update(metadata)

        col.update_one({"videoId": video_id}, {"$set": doc}, upsert=True)
        print(f"[MONGO] 💾 Cached: {video_id} ({len(transcript.split()):,} words)", file=sys.stderr)
    except PyMongoError as e:
        print(f"[MONGO] Write error: {e}", file=sys.stderr)


# ══════════════════════════════════════════════════════════════════════════════
# Video ID Parsing
# ══════════════════════════════════════════════════════════════════════════════

def extract_video_id(url: str) -> Optional[str]:
    """
    Extract an 11-char video ID from any YouTube URL format.

    Handles:
      youtube.com/watch?v=ID
      youtu.be/ID
      youtube.com/embed/ID
      youtube.com/shorts/ID
      Raw 11-char video ID
    """
    if not url:
        return None
    url = url.strip()
    try:
        parsed = urlparse(url)
    except Exception:
        return None

    if "youtube.com" in parsed.netloc:
        if parsed.path == "/watch":
            return parse_qs(parsed.query).get("v", [None])[0]
        for prefix in ("/embed/", "/v/", "/shorts/"):
            if parsed.path.startswith(prefix):
                return parsed.path.split(prefix)[1].split("/")[0].split("?")[0]

    if "youtu.be" in parsed.netloc:
        return parsed.path.lstrip("/").split("?")[0]

    if re.match(r'^[A-Za-z0-9_-]{11}$', url):
        return url

    return None


# ══════════════════════════════════════════════════════════════════════════════
# Transcript Cleaning & Validation
# ══════════════════════════════════════════════════════════════════════════════

def is_english_text(text: str) -> bool:
    """
    Check if a string is primarily composed of Latin/English characters.
    Useful for detecting mislabeled transcripts (e.g. Kannada labeled as 'en').
    """
    if not text:
        return False
    sample = text[:500]
    non_whitespace = "".join(sample.split())
    if not non_whitespace:
        return False
    
    ascii_count = sum(1 for c in non_whitespace if ord(c) < 128)
    return (ascii_count / len(non_whitespace)) >= 0.65

def clean_transcript(text: str) -> str:
    """
    Clean raw transcript text.

    Strips:
      [Music] [Applause] [Laughter]  — bracketed annotations
      (inaudible) (crosstalk)        — parenthetical noise
      HTML entities & excess whitespace
    """
    if not text:
        return ""
    text = re.sub(r'\[.*?\]', '', text)
    text = re.sub(r'\(.*?\)', '', text)
    text = (
        text.replace("&amp;",  "&")
            .replace("&lt;",   "<")
            .replace("&gt;",   ">")
            .replace("&quot;", '"')
            .replace("&#39;",  "'")
    )
    return re.sub(r'\s+', ' ', text).strip()


# ══════════════════════════════════════════════════════════════════════════════
# YouTube Data API v3 — Video & Channel Metadata  (reference: youtube_scraper.py)
# ══════════════════════════════════════════════════════════════════════════════

def _get_youtube_client():
    """Build YouTube Data API v3 client. Returns None if key not set."""
    api_key = os.getenv("YOUTUBE_API_KEY", "").strip()
    if not api_key or not YOUTUBE_DATA_API_AVAILABLE:
        return None
    try:
        return _yt_build("youtube", "v3", developerKey=api_key)
    except Exception as e:
        print(f"[YT-DATA] Client build failed: {e}", file=sys.stderr)
        return None


def _fetch_video_metadata(youtube, video_id: str) -> dict:
    """
    Fetch video metadata from YouTube Data API v3.
    Adapted from reference/backend/scraper/youtube_scraper.py.

    Returns dict with: title, channelName, channelId, publishedDate,
                       viewCount, likeCount, commentCount, description
    """
    try:
        response = youtube.videos().list(
            part="snippet,statistics",
            id=video_id,
        ).execute()

        items = response.get("items", [])
        if not items:
            return {}

        video   = items[0]
        snippet = video.get("snippet", {})
        stats   = video.get("statistics", {})

        pub_raw = snippet.get("publishedAt", "")
        try:
            pub_date = datetime.fromisoformat(
                pub_raw.replace("Z", "+00:00")
            ).strftime("%Y-%m-%d")
        except Exception:
            pub_date = "Unknown"

        result = {
            "title":         snippet.get("title", "Unknown Title"),
            "channelName":   snippet.get("channelTitle", "Unknown Channel"),
            "channelId":     snippet.get("channelId", ""),
            "publishedDate": pub_date,
            "description":   snippet.get("description", ""),
            "viewCount":     int(stats.get("viewCount",    0)),
            "likeCount":     int(stats.get("likeCount",    0)),
            "commentCount":  int(stats.get("commentCount", 0)),
        }

        print(f"[YT-DATA] ✅ Title  : {result['title'][:60]}", file=sys.stderr)
        print(f"[YT-DATA] ✅ Channel: {result['channelName']}", file=sys.stderr)
        print(f"[YT-DATA] ✅ Views  : {result['viewCount']:,}", file=sys.stderr)
        return result

    except Exception as e:
        print(f"[YT-DATA] Video metadata failed: {e}", file=sys.stderr)
        return {}


def _fetch_channel_info(youtube, channel_id: str) -> dict:
    """
    Fetch channel metadata from YouTube Data API v3.
    Adapted from reference/backend/scraper/youtube_scraper.py.

    Returns dict with: subscriberCount, totalVideos, totalViews
    """
    if not channel_id:
        return {}
    try:
        response = youtube.channels().list(
            part="snippet,statistics",
            id=channel_id,
        ).execute()

        items = response.get("items", [])
        if not items:
            return {}

        ch     = items[0]
        stats  = ch.get("statistics", {})
        hidden = stats.get("hiddenSubscriberCount", False)
        subs   = 0 if hidden else int(stats.get("subscriberCount", 0))

        result = {
            "subscriberCount": subs,
            "totalVideos":     int(stats.get("videoCount", 0)),
            "totalViews":      int(stats.get("viewCount",  0)),
        }
        print(f"[YT-DATA] ✅ Subs   : {subs:,}", file=sys.stderr)
        return result

    except Exception as e:
        print(f"[YT-DATA] Channel info failed: {e}", file=sys.stderr)
        return {}


def _analyze_description(description: str) -> dict:
    """
    Extract trust/quality signals from the video description.
    Adapted from reference/backend/scraper/youtube_scraper.py.

    Returns:
        citationLinks  : int  — academic/citation URLs found
        hasDisclaimer  : bool — medical/educational disclaimer present
        spamSignals    : int  — promotional spam phrase count
        totalUrls      : int  — total URLs in description
    """
    if not description:
        return {"citationLinks": 0, "hasDisclaimer": False, "spamSignals": 0, "totalUrls": 0}

    desc_lower = description.lower()

    academic_patterns = [
        r'pubmed\.ncbi\.nlm\.nih\.gov', r'doi\.org/10\.',
        r'ncbi\.nlm\.nih\.gov',         r'scholar\.google\.com',
        r'nature\.com/articles',        r'thelancet\.com',
        r'nejm\.org',                   r'jamanetwork\.com',
    ]
    citation_links = sum(
        len(re.findall(p, desc_lower)) for p in academic_patterns
    )

    disclaimer_phrases = [
        "not medical advice", "consult a doctor", "for educational purposes",
        "informational purposes only", "healthcare professional",
        "not a substitute", "always consult", "not intended to diagnose",
    ]
    has_disclaimer = any(p in desc_lower for p in disclaimer_phrases)

    spam_signals = [
        "use my code", "promo code", "discount", "affiliate",
        "sponsored", "buy now", "limited time offer", "link in bio",
    ]
    spam_count = sum(1 for s in spam_signals if s in desc_lower)

    return {
        "citationLinks": citation_links,
        "hasDisclaimer": has_disclaimer,
        "spamSignals":   spam_count,
        "totalUrls":     len(re.findall(r'https?://', description)),
    }


def _fetch_enriched_metadata(video_id: str) -> dict:
    """
    Fetch video + channel metadata and description analysis.
    Returns empty dict if YOUTUBE_API_KEY is not set.
    """
    youtube = _get_youtube_client()
    if not youtube:
        return {}

    print(f"[YT-DATA] Fetching metadata for: {video_id}", file=sys.stderr)
    video_meta   = _fetch_video_metadata(youtube, video_id)
    if not video_meta:
        return {}

    channel_info = _fetch_channel_info(youtube, video_meta.get("channelId", ""))
    desc_analysis = _analyze_description(video_meta.get("description", ""))

    return {
        **video_meta,
        **channel_info,
        "descAnalysis": desc_analysis,
    }


# ══════════════════════════════════════════════════════════════════════════════
# Transcript Fetch — youtube-transcript-api
# ══════════════════════════════════════════════════════════════════════════════

def _fetch_via_official_api(video_id: str) -> Tuple[str, str]:
    """
    Fetch transcript using youtube-transcript-api v1.2+ instance API.

    Try order:
      1. English (manual > auto-generated)
      2. If no English, take the first available language and translate to English.

    Returns:
        (text, "official") on success
        ("",   "failed")   on any failure
    """
    print(f"[YT-API] Fetching: {video_id}", file=sys.stderr)

    try:
        transcript_list = _yta.list(video_id)
    except (IpBlocked, RequestBlocked):
        print("[YT-API] ❌ IP/Request blocked — add cookies.txt to bypass", file=sys.stderr)
        return "", "failed"
    except TranscriptsDisabled:
        print("[YT-API] Transcripts disabled for this video", file=sys.stderr)
        return "", "failed"
    except Exception as e:
        print(f"[YT-API] List unavailable: {type(e).__name__}", file=sys.stderr)
        return "", "failed"

    transcript = None
    text = ""
    
    # 1. Try specifically requesting English
    try:
        candidate = transcript_list.find_transcript(["en", "en-US", "en-GB"])
        candidate_entries = candidate.fetch()
        candidate_text = " ".join(e.text if hasattr(e, "text") else e.get("text", "") for e in candidate_entries).strip()
        
        if is_english_text(candidate_text):
            transcript = candidate
            text = candidate_text
        else:
            print(f"[YT-API] Transcript tagged as '{candidate.language}' is not actually English text.", file=sys.stderr)
    except NoTranscriptFound:
        pass
        
    # 2. Iterate through ALL transcripts to find genuine English
    if not text:
        print("[YT-API] Searching all transcripts for valid English text...", file=sys.stderr)
        for t in transcript_list:
            try:
                t_entries = t.fetch()
                t_text = " ".join(e.text if hasattr(e, "text") else e.get("text", "") for e in t_entries).strip()
                if is_english_text(t_text):
                    transcript = t
                    text = t_text
                    print(f"[YT-API] Found genuine English in transcript tagged '{t.language}'", file=sys.stderr)
                    break
            except Exception:
                continue

    # 3. If STILL no English found, translate the first translatable one
    if not text:
        print("[YT-API] No genuine English transcript found. Translating...", file=sys.stderr)
        try:
            translatable = [t for t in transcript_list if t.is_translatable]
            if translatable:
                manuals = [t for t in translatable if not t.is_generated]
                base_transcript = manuals[0] if manuals else translatable[0]
                
                if base_transcript.language_code.startswith("en"):
                    # Edge case: It's tagged English but it's not. 
                    # If we try to translate it to 'en', API might fail.
                    # We'll just fallback to returning whatever it is.
                    entries = base_transcript.fetch()
                    text = " ".join(e.text if hasattr(e, "text") else e.get("text", "") for e in entries).strip()
                    transcript = base_transcript
                else:
                    translated = base_transcript.translate("en")
                    entries = translated.fetch()
                    text = " ".join(e.text if hasattr(e, "text") else e.get("text", "") for e in entries).strip()
                    transcript = translated
        except Exception as e:
            print(f"[YT-API] Translation fallback failed: {e}", file=sys.stderr)

    if transcript and text and len(text.split()) > MIN_WORDS:
        try:
            gen_tag = "Auto-Generated" if transcript.is_generated else "Manual"
            print(f"[YT-API] ✅ {gen_tag} English  words={len(text.split()):,}", file=sys.stderr)
            return text, "official"
        except Exception as e:
            print(f"[YT-API] Fetch failed: {e}", file=sys.stderr)

    return "", "failed"


# ══════════════════════════════════════════════════════════════════════════════
# Public API
# ══════════════════════════════════════════════════════════════════════════════

def get_transcript(url: str) -> Tuple[str, str]:
    """
    Extract and clean the full transcript from a YouTube video URL.

    Fetch priority:
      0. MongoDB cache          — instant, no API call
      1. youtube-transcript-api — direct fetch (cookies bypass if cookies.txt present)

    On a fresh fetch, also pulls YouTube Data API v3 metadata (title, channel,
    views, description analysis) if YOUTUBE_API_KEY is set, and stores
    everything in MongoDB.

    Args:
        url: YouTube video URL or raw 11-char video ID

    Returns:
        (transcript_text, source)
        source = "cache" | "official" | "none"
    """
    video_id = extract_video_id(url)
    if not video_id:
        print(f"[ERROR] Cannot parse video ID from: {url}", file=sys.stderr)
        return "", "none"

    canonical_url = f"https://www.youtube.com/watch?v={video_id}"

    print(f"\n{'─'*52}", file=sys.stderr)
    print(f"  video_id : {video_id}", file=sys.stderr)
    print(f"  url      : {canonical_url}", file=sys.stderr)
    print(f"{'─'*52}", file=sys.stderr)

    # 0 — MongoDB cache
    cached = _cache_get(video_id)
    if cached:
        text, source = cached
        if text and len(text.split()) > MIN_WORDS:
            return clean_transcript(text), source

    # 1 — youtube-transcript-api
    text, source = _fetch_via_official_api(video_id)
    if text and len(text.split()) > MIN_WORDS:
        cleaned  = clean_transcript(text)
        metadata = _fetch_enriched_metadata(video_id)
        _cache_set(video_id, cleaned, source, metadata)
        return cleaned, source

    print("[RESULT] No transcript retrieved", file=sys.stderr)
    return "", "none"


def get_transcript_with_timestamps(url: str) -> list:
    """
    Return transcript as timestamped segments (English only).

    Each segment: {"start": float, "duration": float, "text": str}

    Returns:
        List of segment dicts, or [] on failure
    """
    video_id = extract_video_id(url)
    if not video_id:
        return []
    try:
        transcript_list = _yta.list(video_id)
        transcript = transcript_list.find_transcript(["en", "en-US", "en-GB"])
        entries    = transcript.fetch()
        
        segments = []
        for e in entries:
            # Handle both dictionary and FetchedTranscriptSnippet object
            start = getattr(e, "start", None)
            if start is None: start = e.get("start", 0)
            
            duration = getattr(e, "duration", None)
            if duration is None: duration = e.get("duration", 0)
            
            text = getattr(e, "text", None)
            if text is None: text = e.get("text", "")
            
            cleaned_text = clean_transcript(text)
            if cleaned_text.strip():
                segments.append({
                    "start": round(start, 2),
                    "duration": round(duration, 2),
                    "text": cleaned_text,
                })
        return segments
    except Exception as e:
        print(f"[TIMESTAMPS] Failed: {e}", file=sys.stderr)
        return []


# ══════════════════════════════════════════════════════════════════════════════
# CLI / Node.js bridge
# ══════════════════════════════════════════════════════════════════════════════

def _exit_json(payload: dict, code: int = 0):
    """Write a single JSON line to stdout and exit."""
    print(_json.dumps(payload))
    sys.exit(code)


if __name__ == "__main__":

    args      = sys.argv[1:]
    json_mode = "--json" in args
    url_args  = [a for a in args if a != "--json"]

    # ── JSON mode — called by Node.js transcriptController ────────────────────
    if json_mode:
        if not url_args:
            _exit_json({"error": "No URL provided"}, code=1)

        url = url_args[0].strip()
        try:
            transcript, source = get_transcript(url)
        except Exception as exc:
            _exit_json({"error": str(exc)}, code=1)

        if not transcript:
            _exit_json({"error": "No transcript could be retrieved"}, code=1)

        vid = extract_video_id(url) or ""
        _exit_json({
            "transcript": transcript,
            "source":     source,
            "videoId":    vid,
            "wordCount":  len(transcript.split()),
        })

    # ── Interactive / manual mode ──────────────────────────────────────────────
    print("\n" + "=" * 55)
    print("  YouTube Transcript Extractor")
    print("=" * 55)

    if url_args:
        url = url_args[0].strip()
        print(f"\n  URL: {url}")
    else:
        print("\n  Paste a YouTube URL (or raw video ID):\n")
        url = input("  > ").strip()

    if not url:
        print("  No URL provided. Exiting.")
        sys.exit(0)

    transcript, source = get_transcript(url)

    print(f"\n{'='*55}")
    if not transcript:
        print("  ❌ No transcript found.")
        print("       • Captions / auto-captions disabled")
        print("       • Private or age-restricted video")
        print("       • Invalid URL")
        print("       • No cookies.txt — add one to bypass IP blocks")
        sys.exit(1)

    word_count = len(transcript.split())
    char_count = len(transcript)

    print(f"  ✅ Source : {source}")
    print(f"     Words  : {word_count:,}")
    print(f"     Chars  : {char_count:,}")
    print(f"{'='*55}\n")

    print("  Preview (first 80 words):")
    print("  " + " ".join(transcript.split()[:80]) + " …\n")

    video_id    = extract_video_id(url)
    output_path = f"transcript_{video_id}.txt"

    with open(output_path, "w", encoding="utf-8") as f:
        f.write(f"Video : https://www.youtube.com/watch?v={video_id}\n")
        f.write(f"Source: {source}\n")
        f.write(f"Words : {word_count:,}\n")
        f.write("─" * 55 + "\n\n")
        f.write(transcript)

    print(f"  💾 Saved → {output_path}\n")