#!/bin/sh
# Kiểm tra môi trường audio-studio trước khi sản xuất. Chỉ đọc/kiểm tra, không tải gì, không inline JS.
set -eu
ROOT=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
. "$ROOT/scripts/env.sh"

fail=0
ok() { printf 'PASS  %s\n' "$1"; }
bad() { printf 'FAIL  %s\n' "$1"; fail=1; }

# node: kiểm tra sự tồn tại + version bằng lệnh chuẩn
if command -v node >/dev/null 2>&1; then
  node -v | grep -Eq '^v(2[0-9]|[3-9][0-9])\.' \
    && ok "node $(node -v)" \
    || bad "node >= 20 required (found $(node -v 2>/dev/null || echo none))"
else
  bad "node not found (need node >= 20)"
fi

if command -v ffmpeg >/dev/null 2>&1; then
  ff_version=$(ffmpeg -version 2>/dev/null | sed -n '1s/.*version \([0-9]*\).*/\1/p')
  if [ "${ff_version:-0}" -ge 7 ]; then ok "ffmpeg $(ffmpeg -version | sed -n '1s/ffmpeg version \([^ ]*\).*/\1/p')"; else bad "ffmpeg >= 7 required (found ${ff_version:-unknown})"; fi
else
  bad "ffmpeg not found (PATH + AUDIO_STUDIO_BIN=$AUDIO_STUDIO_BIN)"
fi
if command -v ffprobe >/dev/null 2>&1; then ok "ffprobe"; else bad "ffprobe not found"; fi

# node deps: kiểm tra bằng file marker trong node_modules, không chạy JS inline
[ -d "$ROOT/node_modules/tone" ] && ok "tone" || bad "tone not installed (run: npm install)"
[ -d "$ROOT/node_modules/node-web-audio-api" ] \
  && ok "node-web-audio-api" \
  || bad "node-web-audio-api not installed (run: npm install; libasound shim: sh scripts/setup-tools.sh)"

for style in $(cat "$ROOT/scripts/styles.txt"); do
  if [ -f "$ROOT/styles/$style.js" ]; then ok "style $style"; else bad "style $style missing"; fi
done

if [ "$fail" -ne 0 ]; then
  echo "doctor: FAIL (fix above, or set up tools: see scripts/setup-tools.sh + README.md)"
  exit 1
fi
echo "doctor: PASS"
