import { spawnSync } from 'node:child_process';

const REQUIRED = ['duration', 'peakDb', 'lufs', 'clipped', 'sampleRate', 'channels', 'pass'];
const [file, requestedArg] = process.argv.slice(2);
if (!file) {
  console.error('usage: node scripts/qa.mjs <wav> [requestedSeconds]');
  process.exit(2);
}

function run(bin, args, binary = false) {
  const prefix = bin === 'ffmpeg' ? ['-hide_banner', '-nostats'] : ['-hide_banner'];
  const result = spawnSync(bin, [...prefix, ...args], {
    encoding: binary ? 'buffer' : 'utf8',
    maxBuffer: 128 * 1024 * 1024,
  });
  if (result.error) throw new Error(`${bin}: ${result.error.message}`);
  if (result.status !== 0) throw new Error(`${bin} exited ${result.status}\n${result.stderr}`);
  return { stdout: result.stdout, stderr: result.stderr };
}

const probe = JSON.parse(
  run('ffprobe', ['-v', 'error', '-print_format', 'json', '-show_format', '-show_streams', file]).stdout
);
const stream = probe.streams.find((s) => s.codec_type === 'audio');
if (!stream) throw new Error('no audio stream');

const duration = Number(probe.format.duration);
const sampleRate = Number(stream.sample_rate);
const channels = Number(stream.channels);
const bitDepth = Number(stream.bits_per_raw_sample || stream.bits_per_sample || 0);

const loud = run('ffmpeg', ['-i', file, '-af', 'loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json', '-f', 'null', '-']).stderr;
const loudJson = JSON.parse(loud.slice(loud.lastIndexOf('{'), loud.lastIndexOf('}') + 1));
const lufs = Number(loudJson.input_i);
const peakDb = Number(loudJson.input_tp);

const raw = run('ffmpeg', ['-i', file, '-f', 'f32le', '-acodec', 'pcm_f32le', '-'], true).stdout;
const samples = new Float32Array(raw.buffer, raw.byteOffset, Math.floor(raw.length / 4));

const CLIP = 0.999;
let clipped = 0;
for (let i = 0; i < samples.length; i++) if (Math.abs(samples[i]) >= CLIP) clipped++;

const windowFrames = Math.floor(sampleRate * 0.1);
const windowSamples = windowFrames * channels;
const SILENCE_DB = -50;
const silent = [];
for (let i = 0; i + windowSamples <= samples.length; i += windowSamples) {
  let sum = 0;
  for (let j = i; j < i + windowSamples; j++) sum += samples[j] * samples[j];
  const rms = Math.sqrt(sum / windowSamples);
  silent.push(rms === 0 || 20 * Math.log10(rms) < SILENCE_DB);
}
const firstAudible = silent.indexOf(false);
const lastAudible = silent.lastIndexOf(false);
let longestGap = 0;
let run_ = 0;
for (let i = firstAudible + 1; i < lastAudible; i++) {
  if (silent[i]) {
    run_++;
    longestGap = Math.max(longestGap, run_);
  } else {
    run_ = 0;
  }
}
const longestSilence = Number((longestGap * 0.1).toFixed(2));

const requested = requestedArg === undefined ? null : Number(requestedArg);
const reasons = [];
if (requested !== null && Math.abs(duration - requested) > 0.25) {
  reasons.push(`duration ${duration.toFixed(3)}s lệch quá 0.25s so với ${requested}s`);
}
if (!(peakDb <= -1.0)) reasons.push(`true peak ${peakDb} dBTP > -1.0`);
if (clipped !== 0) reasons.push(`${clipped} sample clipping`);
if (!(lufs >= -16 && lufs <= -12)) reasons.push(`integrated loudness ${lufs} LUFS ngoài -16…-12`);
if (longestSilence > 1.0) reasons.push(`khoảng lặng ${longestSilence}s > 1.0s`);
if (sampleRate !== 48000) reasons.push(`sample rate ${sampleRate} != 48000`);
if (channels !== 2) reasons.push(`channels ${channels} != 2`);
if (bitDepth < 16) reasons.push(`bit depth ${bitDepth} < 16`);

const report = {
  duration: Number(duration.toFixed(3)),
  peakDb,
  lufs,
  clipped,
  sampleRate,
  channels,
  bitDepth,
  longestSilence,
  pass: reasons.length === 0,
  reasons,
};
for (const key of REQUIRED) if (!(key in report)) throw new Error(`qa report missing ${key}`);

console.log(JSON.stringify(report, null, 2));
if (!report.pass) {
  console.error(`QA FAIL: ${reasons.join('; ')}`);
  process.exit(1);
}
console.error('QA PASS');
