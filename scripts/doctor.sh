#!/bin/sh
# Kiểm tra môi trường audio-studio trước khi sản xuất. Không dynamic-exec.
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
  bad "node-web-audio-api cannot load (missing libasound.so.2? run: sh scripts/setup-tools.sh)"
fi

for style in $(cat "$ROOT/scripts/styles.txt"); do
  if [ -f "$ROOT/styles/$style.js" ]; then ok "style $style"; else bad "style $style missing"; fi
done

if [ "$fail" -ne 0 ]; then
  echo "doctor: FAIL (fix above, or run: sh scripts/setup-tools.sh)"
  exit 1
fi
echo "doctor: PASS"
