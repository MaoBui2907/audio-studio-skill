import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import * as nwa from 'node-web-audio-api';

// Tone.js needs a Web Audio implementation; node-web-audio-api supplies one.
// Expose its constructors before Tone is imported so standardized-audio-context
// can type-check native AudioParam/AudioNode instances.
globalThis.window = globalThis;
for (const [key, value] of Object.entries(nwa)) {
  if (typeof value === 'function' && !(key in globalThis)) globalThis[key] = value;
}

const ROOT = path.resolve(import.meta.dirname, '..');
const SAMPLE_RATE = 48000;
const CHANNELS = 2;
const FADE_OUT = 0.2;

const [projectArg, secondsArg] = process.argv.slice(2);
if (!projectArg) {
  console.error('usage: node scripts/render.mjs <projectDir> [seconds]');
  process.exit(2);
}

const projectDir = path.resolve(projectArg);
const project = (await import(pathToFileURL(path.join(projectDir, 'index.js')).href)).default;
if (!project || !project.style) throw new Error(`${projectDir}/index.js must export default { style }`);

const stylePath = path.join(ROOT, 'styles', `${project.style}.js`);
if (!fs.existsSync(stylePath)) throw new Error(`unknown style "${project.style}" (no ${stylePath})`);
const style = await import(pathToFileURL(stylePath).href);
for (const key of ['id', 'name', 'description', 'useFor', 'avoidFor', 'bpm', 'key', 'bars', 'render']) {
  if (style[key] === undefined) throw new Error(`style ${project.style} missing export "${key}"`);
}
if (style.id !== project.style) throw new Error(`style id "${style.id}" != project.style "${project.style}"`);

const barSeconds = (4 * 60) / style.bpm;
const seconds = Number(secondsArg ?? project.seconds ?? style.bars * barSeconds);
if (!(seconds > 0)) throw new Error(`invalid duration: ${secondsArg}`);

const seed = Number(process.env.SEED ?? project.seed ?? 20261116);
if (!Number.isInteger(seed)) throw new Error(`SEED must be an integer, got "${process.env.SEED}"`);

function mulberry32(state) {
  return function next() {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const Tone = await import('tone');
// Tone's Noise nodes fill their buffers with Math.random; seed it so renders are
// byte-identical across processes. Styles must still use timeline.rng for choices.
Math.random = mulberry32(seed ^ 0x9e3779b9);
const timeline = {
  duration: seconds,
  seed,
  rng: mulberry32(seed),
  bpm: style.bpm,
  key: style.key,
  bars: style.bars,
  beat: 60 / style.bpm,
  bar: barSeconds,
};

const buffer = await Tone.Offline(({ transport }) => {
  transport.bpm.value = style.bpm;
  style.render(Tone, { ...timeline, transport });
}, seconds, CHANNELS, SAMPLE_RATE);

const frames = buffer.length;
const fadeFrames = Math.min(Math.floor(FADE_OUT * SAMPLE_RATE), Math.floor(frames / 2));
const channels = [];
let peak = 0;
for (let c = 0; c < CHANNELS; c++) {
  const data = Float32Array.from(buffer.getChannelData(c));
  for (let i = 0; i < fadeFrames; i++) data[frames - 1 - i] *= i / fadeFrames;
  for (let i = 0; i < frames; i++) peak = Math.max(peak, Math.abs(data[i]));
  channels.push(data);
}
if (peak > 1) throw new Error(`render clipped before mastering (peak ${peak.toFixed(3)}); lower style gains`);

const name = project.name ?? style.id;
const outDir = path.join(projectDir, 'out');
fs.mkdirSync(outDir, { recursive: true });
const wavPath = path.join(outDir, `${name}.raw.wav`);

const bytesPerSample = 2;
const dataSize = frames * CHANNELS * bytesPerSample;
const wav = Buffer.alloc(44 + dataSize);
wav.write('RIFF', 0);
wav.writeUInt32LE(36 + dataSize, 4);
wav.write('WAVE', 8);
wav.write('fmt ', 12);
wav.writeUInt32LE(16, 16);
wav.writeUInt16LE(1, 20);
wav.writeUInt16LE(CHANNELS, 22);
wav.writeUInt32LE(SAMPLE_RATE, 24);
wav.writeUInt32LE(SAMPLE_RATE * CHANNELS * bytesPerSample, 28);
wav.writeUInt16LE(CHANNELS * bytesPerSample, 32);
wav.writeUInt16LE(16, 34);
wav.write('data', 36);
wav.writeUInt32LE(dataSize, 40);
let offset = 44;
for (let i = 0; i < frames; i++) {
  for (let c = 0; c < CHANNELS; c++) {
    const sample = Math.max(-1, Math.min(1, channels[c][i]));
    wav.writeInt16LE(Math.round(sample < 0 ? sample * 0x8000 : sample * 0x7fff), offset);
    offset += 2;
  }
}
fs.writeFileSync(wavPath, wav);

console.log(
  JSON.stringify({
    style: style.id,
    name,
    seed,
    seconds,
    sampleRate: SAMPLE_RATE,
    channels: CHANNELS,
    peak: Number(peak.toFixed(4)),
    wav: wavPath,
    sha256: (await import('node:crypto')).createHash('sha256').update(wav).digest('hex'),
  })
);
