#!/bin/sh
set -eu
ROOT=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
. "$ROOT/scripts/env.sh"

fail=0
ok() { printf 'PASS  %s\n' "$1"; }
bad() { printf 'FAIL  %s\n' "$1"; fail=1; }

node_major=$(node -p 'process.versions.node.split(".")[0]' 2>/dev/null || echo 0)
if [ "$node_major" -ge 20 ]; then ok "node $(node -v)"; else bad "node >= 20 required (found $(node -v 2>/dev/null || echo none))"; fi

if command -v ffmpeg >/dev/null 2>&1; then
  ff_version=$(ffmpeg -version 2>/dev/null | sed -n '1s/.*version \([0-9]*\).*/\1/p')
  if [ "${ff_version:-0}" -ge 7 ]; then ok "ffmpeg $(ffmpeg -version | sed -n '1s/ffmpeg version \([^ ]*\).*/\1/p')"; else bad "ffmpeg >= 7 required (found ${ff_version:-unknown})"; fi
else
  bad "ffmpeg not found (PATH + AUDIO_STUDIO_BIN=$AUDIO_STUDIO_BIN)"
fi
if command -v ffprobe >/dev/null 2>&1; then ok "ffprobe"; else bad "ffprobe not found"; fi

if (cd "$ROOT" && node -e "import('tone')" >/dev/null 2>&1); then ok "tone"; else bad "tone not installed (npm install)"; fi
if (cd "$ROOT" && node -e "import('node-web-audio-api')" >/dev/null 2>&1); then
  ok "node-web-audio-api"
else
  bad "node-web-audio-api cannot load (missing libasound.so.2? run: sh scripts/doctor.sh --install)"
fi

for style in $(cat "$ROOT/scripts/styles.txt"); do
  if [ -f "$ROOT/styles/$style.js" ]; then ok "style $style"; else bad "style $style missing"; fi
done

if [ "$fail" -ne 0 ] && [ "${1:-}" = "--install" ]; then
  echo "--- installing tools into $ROOT/.tools"
  mkdir -p "$ROOT/.tools/bin" "$ROOT/.tools/lib"

  if ! command -v ffmpeg >/dev/null 2>&1 || [ "$(ffmpeg -version 2>/dev/null | sed -n '1s/.*version \([0-9]*\).*/\1/p')" -lt 7 ]; then
    url=https://johnvansickle.com/ffmpeg/releases/ffmpeg-release-amd64-static.tar.xz
    curl -fsSL "$url" -o "$ROOT/.tools/ffmpeg.tar.xz"
    rm -rf "$ROOT/.tools/ffmpeg"
    mkdir -p "$ROOT/.tools/ffmpeg"
    python3 - "$ROOT/.tools/ffmpeg.tar.xz" "$ROOT/.tools/ffmpeg" <<'PY'
import sys, tarfile
with tarfile.open(sys.argv[1], 'r:xz') as archive:
    archive.extractall(sys.argv[2])
PY
    rm -f "$ROOT/.tools/ffmpeg.tar.xz"
    ln -sf "$(find "$ROOT/.tools/ffmpeg" -name ffmpeg -type f | head -1)" "$ROOT/.tools/bin/ffmpeg"
    ln -sf "$(find "$ROOT/.tools/ffmpeg" -name ffprobe -type f | head -1)" "$ROOT/.tools/bin/ffprobe"
  fi

  if ! (cd "$ROOT" && node -e "import('node-web-audio-api')" >/dev/null 2>&1); then
    curl -fsSL https://deb.debian.org/debian/pool/main/a/alsa-lib/libasound2_1.2.8-1+b1_amd64.deb -o "$ROOT/.tools/libasound.deb"
    python3 - "$ROOT/.tools/libasound.deb" "$ROOT/.tools/lib/libasound.so.2" <<'PY'
import sys, tarfile, io
data = open(sys.argv[1], 'rb').read()
assert data[:8] == b'!<arch>\n'
pos, members = 8, {}
while pos < len(data):
    header = data[pos:pos + 60]; pos += 60
    size = int(header[48:58].decode().strip())
    name = header[:16].decode().strip().rstrip('/')
    members[name] = data[pos:pos + size]
    pos += size + (size & 1)
with tarfile.open(fileobj=io.BytesIO(members['data.tar.xz']), mode='r:xz') as archive:
    for member in archive.getmembers():
        if member.name.endswith('libasound.so.2.0.0'):
            open(sys.argv[2], 'wb').write(archive.extractfile(member).read())
PY
    rm -f "$ROOT/.tools/libasound.deb"
  fi
  echo "--- installed; re-checking"
  exec sh "$ROOT/scripts/doctor.sh"
fi

if [ "$fail" -ne 0 ]; then
  echo "doctor: FAIL (fix above, or run: sh scripts/doctor.sh --install)"
  exit 1
fi
echo "doctor: PASS"
