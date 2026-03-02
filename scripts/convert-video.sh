#!/usr/bin/env bash

# ============================================================
# convert-video.sh — Convert a screen recording to web video + GIF
#
# Takes an input video file and an output name, and produces:
#   public/videos/<name>.mp4  — H.264 video (small, web-ready)
#   public/videos/<name>.gif  — Animated GIF fallback (720px wide)
#
# Requirements:
#   brew install ffmpeg
#
# Usage:
#   ./scripts/convert-video.sh <input-file> <output-name>
#
# Example:
#   ./scripts/convert-video.sh ~/Desktop/recording.mov checkout-flow
#
#   Produces:
#     public/videos/checkout-flow.mp4
#     public/videos/checkout-flow.gif
#
# Then in your MDX file:
#   <VideoPlayer
#     src="/videos/checkout-flow.mp4"
#     fallback="/videos/checkout-flow.gif"
#     alt="Demo of the checkout flow"
#   />
# ============================================================

set -euo pipefail

# --- Validate arguments ---
if [ $# -lt 2 ]; then
  echo "Usage: $0 <input-file> <output-name>"
  echo ""
  echo "Example:"
  echo "  $0 ~/Desktop/recording.mov my-demo"
  echo ""
  echo "Produces:"
  echo "  public/videos/my-demo.mp4"
  echo "  public/videos/my-demo.gif"
  exit 1
fi

INPUT="$1"
OUTPUT_NAME="$2"
OUTPUT_DIR="$(cd "$(dirname "$0")/.." && pwd)/public/videos"

# --- Check dependencies ---
if ! command -v ffmpeg &> /dev/null; then
  echo "Error: ffmpeg is not installed."
  echo "Install it with: brew install ffmpeg"
  exit 1
fi

# --- Ensure output directory exists ---
mkdir -p "$OUTPUT_DIR"

echo "Converting: $INPUT"
echo "Output:     $OUTPUT_DIR/$OUTPUT_NAME.mp4 + .gif"
echo ""

# --- Step 1: Convert to web-ready MP4 ---
# H.264 codec, CRF 23 (good quality/size balance), no audio,
# fast-start for web streaming, scale to max 1920px wide.
echo "→ Creating MP4..."
ffmpeg -i "$INPUT" \
  -c:v libx264 \
  -crf 23 \
  -preset medium \
  -an \
  -movflags +faststart \
  -vf "scale='min(1920,iw)':-2" \
  -y \
  "$OUTPUT_DIR/$OUTPUT_NAME.mp4"

echo "  ✓ MP4 created: $(du -h "$OUTPUT_DIR/$OUTPUT_NAME.mp4" | cut -f1)"

# --- Step 2: Create GIF fallback ---
# Two-pass approach for better quality: first generate a color palette,
# then use it to create the GIF. 720px wide, 12fps.
echo "→ Creating GIF..."

# Generate optimized color palette
ffmpeg -i "$INPUT" \
  -vf "fps=12,scale=720:-1:flags=lanczos,palettegen=stats_mode=diff" \
  -y \
  /tmp/palette.png

# Create GIF using the palette
ffmpeg -i "$INPUT" \
  -i /tmp/palette.png \
  -lavfi "fps=12,scale=720:-1:flags=lanczos[x];[x][1:v]paletteuse=dither=bayer:bayer_scale=5:diff_mode=rectangle" \
  -y \
  "$OUTPUT_DIR/$OUTPUT_NAME.gif"

# Clean up temp palette
rm -f /tmp/palette.png

echo "  ✓ GIF created: $(du -h "$OUTPUT_DIR/$OUTPUT_NAME.gif" | cut -f1)"

echo ""
echo "Done! Use in your MDX file:"
echo ""
echo "  <VideoPlayer"
echo "    src=\"/videos/$OUTPUT_NAME.mp4\""
echo "    fallback=\"/videos/$OUTPUT_NAME.gif\""
echo "    alt=\"Description of your video\""
echo "  />"
