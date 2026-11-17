#!/bin/sh
# Chuẩn bị công cụ render một lần, không nằm trong skill package:
# tải ffmpeg 7 static + libasound shim vào .tools/ (đã gitignore).
set -eu
ROOT=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
. "$ROOT/scripts/env.sh"

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
echo "setup-tools: done (.tools/bin, .tools/lib)"
