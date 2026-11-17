import { spawnSync } from 'node:child_process';

const [input, output] = process.argv.slice(2);
if (!input || !output) {
  console.error('usage: node scripts/loudnorm.mjs <in.wav> <out.wav>');
  process.exit(2);
}

const TARGET = 'I=-14:TP=-1.5:LRA=11';

function ffmpeg(args) {
  const run = spawnSync('ffmpeg', ['-hide_banner', '-nostats', ...args], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  if (run.status !== 0) {
    throw new Error(`ffmpeg failed (${run.status})\n${run.stderr}`);
  }
  return run.stderr;
}

const firstPass = ffmpeg(['-i', input, '-af', `loudnorm=${TARGET}:print_format=json`, '-f', 'null', '-']);
const json = firstPass.slice(firstPass.lastIndexOf('{'), firstPass.lastIndexOf('}') + 1);
const measured = JSON.parse(json);

const secondPass = [
  `loudnorm=${TARGET}`,
  `measured_I=${measured.input_i}`,
  `measured_LRA=${measured.input_lra}`,
  `measured_TP=${measured.input_tp}`,
  `measured_thresh=${measured.input_thresh}`,
  `offset=${measured.target_offset}`,
  'linear=true',
  'print_format=summary',
].join(':');

ffmpeg(['-i', input, '-af', secondPass, '-ar', '48000', '-ac', '2', '-c:a', 'pcm_s16le', '-y', output]);

const mp3 = output.replace(/\.wav$/, '.mp3');
const mp3Run = spawnSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-i', output, '-codec:a', 'libmp3lame', '-b:a', '192k', '-y', mp3], {
  encoding: 'utf8',
});

console.log(
  JSON.stringify({
    inputLufs: Number(measured.input_i),
    inputTruePeak: Number(measured.input_tp),
    wav: output,
    mp3: mp3Run.status === 0 ? mp3 : null,
  })
);
