# shellcheck shell=sh
# Shared environment resolution for doctor.sh / render.sh.
ROOT=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
AUDIO_STUDIO_BIN=${AUDIO_STUDIO_BIN:-$ROOT/.tools/bin}
for dir in "$AUDIO_STUDIO_BIN" "$ROOT/.tools/bin"; do
  if [ -d "$dir" ]; then PATH="$dir:$PATH"; fi
done
if [ -d "$ROOT/.tools/lib" ]; then
  LD_LIBRARY_PATH="$ROOT/.tools/lib${LD_LIBRARY_PATH:+:$LD_LIBRARY_PATH}"
fi
export PATH
export LD_LIBRARY_PATH
