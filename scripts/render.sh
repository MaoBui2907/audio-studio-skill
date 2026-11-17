#!/bin/sh
# Render project: render.mjs → loudnorm 2-pass → qa.mjs. Không dynamic-exec.
set -eu
ROOT=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
. "$ROOT/scripts/env.sh"

project=${1:?usage: sh scripts/render.sh <projectDir> [seconds]}
seconds=${2:-}
project=$(CDPATH= cd -- "$project" && pwd)
mkdir -p "$project/out"

node "$ROOT/scripts/render.mjs" "$project" $seconds > "$project/out/render.json"

name=$(node -e 'const j=require(process.argv[1]);console.log(j.name)' "$project/out/render.json")

node "$ROOT/scripts/loudnorm.mjs" "$project/out/$name.raw.wav" "$project/out/$name.wav"
if [ -n "$seconds" ]; then
  node "$ROOT/scripts/qa.mjs" "$project/out/$name.wav" "$seconds" > "$project/out/qa.json" || {
    cat "$project/out/qa.json" >&2
    exit 1
  }
else
  node "$ROOT/scripts/qa.mjs" "$project/out/$name.wav" > "$project/out/qa.json" || {
    cat "$project/out/qa.json" >&2
    exit 1
  }
fi

printf 'out/%s.wav\n' "$name"
printf 'sha256 %s\n' "$(sha256sum "$project/out/$name.wav" | cut -d' ' -f1)"
cat "$project/out/qa.json"
