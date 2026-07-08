#!/bin/bash
# download_textures.sh — Downloads 2K planet textures from Solar System Scope
# License: CC-BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
# Attribution: Solar System Scope / INOVE — https://www.solarsystemscope.com/textures/

set -e

TEXTURES_DIR="public/textures"
BASE_URL="https://www.solarsystemscope.com/textures/download"

echo "=== Downloading Solar System Textures (2K resolution) ==="
echo "Source: Solar System Scope (CC-BY 4.0)"
echo ""

mkdir -p "$TEXTURES_DIR"

download() {
    local url="$1"
    local dest="$2"
    echo "  ↓ $(basename "$dest") ..."
    curl -L --fail --silent --show-error -o "$dest" "$url" || {
        echo "    ⚠ FAILED: $url"
        return 1
    }
    local size=$(stat -c%s "$dest" 2>/dev/null || stat -f%z "$dest" 2>/dev/null)
    echo "    ✓ $(( size / 1024 )) KB"
}

echo "Planets:"
download "$BASE_URL/2k_sun.jpg"                "$TEXTURES_DIR/sun.jpg"
download "$BASE_URL/2k_mercury.jpg"             "$TEXTURES_DIR/mercury.jpg"
download "$BASE_URL/2k_venus_surface.jpg"       "$TEXTURES_DIR/venus.jpg"
download "$BASE_URL/2k_earth_daymap.jpg"        "$TEXTURES_DIR/earth_daymap.jpg"
download "$BASE_URL/2k_earth_clouds.jpg"        "$TEXTURES_DIR/earth_clouds.jpg"
download "$BASE_URL/2k_mars.jpg"                "$TEXTURES_DIR/mars.jpg"
download "$BASE_URL/2k_jupiter.jpg"             "$TEXTURES_DIR/jupiter.jpg"
download "$BASE_URL/2k_saturn.jpg"              "$TEXTURES_DIR/saturn.jpg"
download "$BASE_URL/2k_saturn_ring_alpha.png"   "$TEXTURES_DIR/saturn_ring.png"
download "$BASE_URL/2k_uranus.jpg"              "$TEXTURES_DIR/uranus.jpg"
download "$BASE_URL/2k_neptune.jpg"             "$TEXTURES_DIR/neptune.jpg"

echo ""
echo "Skybox:"
download "$BASE_URL/2k_stars_milky_way.jpg"     "$TEXTURES_DIR/starfield.jpg"

echo ""
echo "=== Creating placeholder audio files ==="
AUDIO_DIR="public/audio"
mkdir -p "$AUDIO_DIR"

# Create minimal valid MP3 files (silent, ~1 second)
# This is a minimal valid MP3 frame (MPEG1 Layer 3, 128kbps, 44100Hz, mono, silent)
python3 -c "
import struct, sys

def create_silent_mp3(filename):
    # Minimal MP3: ID3v2 header + one silent MPEG1 Layer3 frame
    # ID3v2 header (10 bytes)
    id3 = b'ID3'
    id3 += struct.pack('>BBB', 3, 0, 0)  # version 2.3, no flags
    id3 += struct.pack('>BBBB', 0, 0, 0, 0)  # size = 0
    
    # MPEG1 Layer3 frame header: 0xFFFB9004
    # FF FB = sync + MPEG1, Layer3, no CRC
    # 90 = 128kbps, 44100Hz
    # 04 = padding, stereo
    frame_header = bytes([0xFF, 0xFB, 0x90, 0x04])
    
    # Frame data (417 bytes for 128kbps @ 44100Hz minus header)
    frame_data = bytes(413)
    
    with open(filename, 'wb') as f:
        f.write(id3)
        # Write a few silent frames
        for _ in range(40):  # ~1 second of silence
            f.write(frame_header)
            f.write(frame_data)
    print(f'  ✓ {filename}')

create_silent_mp3('$AUDIO_DIR/engine-hum.mp3')
create_silent_mp3('$AUDIO_DIR/ambient-space.mp3')
create_silent_mp3('$AUDIO_DIR/arrival-chime.mp3')
" 2>/dev/null || {
    # Fallback: create tiny files that won't crash the audio loader
    echo "  (Python not available, creating minimal placeholder files)"
    for f in engine-hum.mp3 ambient-space.mp3 arrival-chime.mp3; do
        # Write minimal MP3 header bytes
        printf '\xff\xfb\x90\x04' > "$AUDIO_DIR/$f"
        dd if=/dev/zero bs=413 count=1 >> "$AUDIO_DIR/$f" 2>/dev/null
        echo "  ✓ $AUDIO_DIR/$f"
    done
}

echo ""
echo "=== Done! ==="
echo ""
echo "Downloaded textures:"
ls -lhS "$TEXTURES_DIR"/*.jpg "$TEXTURES_DIR"/*.png 2>/dev/null
echo ""
echo "Audio placeholders:"
ls -lh "$AUDIO_DIR"/*.mp3 2>/dev/null
echo ""
echo "Total texture size:"
du -sh "$TEXTURES_DIR"
