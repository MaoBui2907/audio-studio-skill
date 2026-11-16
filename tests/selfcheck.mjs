import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

const ROOT = path.resolve(import.meta.dirname, '..');

// node-web-audio-api needs libasound.so.2; doctor.sh --install puts a shim in .tools/lib.
const shim = path.join(ROOT, '.tools/lib');
if (fs.existsSync(path.join(shim, 'libasound.so.2')) && !(process.env.LD_LIBRARY_PATH ?? '').split(':').includes(shim)) {
  const rerun = spawnSync(process.execPath, [import.meta.filename, ...process.argv.slice(2)], {
    stdio: 'inherit',
    env: { ...process.env, LD_LIBRARY_PATH: [shim, process.env.LD_LIBRARY_PATH].filter(Boolean).join(':') },
  });
  process.exit(rerun.status ?? 1);
}

const nwa = await import('node-web-audio-api');

globalThis.window = globalThis;
for (const [key, value] of Object.entries(nwa)) {
  if (typeof value === 'function' && !(key in globalThis)) globalThis[key] = value;
}

const SEED = 20261116;
function mulberry32(state) {
  return function next() {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const slugs = fs.readFileSync(path.join(ROOT, 'scripts/styles.txt'), 'utf8').split('\n').filter(Boolean);
assert.deepEqual(
  slugs,
  fs.readdirSync(path.join(ROOT, 'styles')).map((f) => f.replace(/\.js$/, '')).sort(),
  'styles.txt must match styles/'
);

const Tone = await import('tone');

async function renderStyle(style, seconds) {
  Math.random = mulberry32(SEED ^ 0x9e3779b9);
  const bar = (4 * 60) / style.bpm;
  return Tone.Offline(({ transport }) => {
    transport.bpm.value = style.bpm;
    style.render(Tone, {
      duration: seconds,
      seed: SEED,
      rng: mulberry32(SEED),
      bpm: style.bpm,
      key: style.key,
      bars: style.bars,
      beat: 60 / style.bpm,
      bar,
      transport,
    });
  }, seconds, 2, 48000);
}

const buffers = {};
for (const slug of slugs) {
  const style = await import(pathToFileURL(path.join(ROOT, 'styles', `${slug}.js`)).href);
  for (const key of ['id', 'name', 'description', 'useFor', 'avoidFor', 'bpm', 'key', 'bars', 'render']) {
    assert.ok(style[key] !== undefined, `${slug}: missing export ${key}`);
  }
  assert.equal(style.id, slug, `${slug}: id mismatch`);
  assert.equal(typeof style.render, 'function', `${slug}: render must be a function`);
  assert.ok(style.bpm >= 60 && style.bpm <= 180, `${slug}: bpm out of range`);
  assert.ok(style.bars >= 1, `${slug}: bars must be >= 1`);

  const seconds = Number(((4 * 60 * 2) / style.bpm).toFixed(3));
  const buffer = await renderStyle(style, seconds);
  buffers[slug] = [style, seconds, buffer];

  assert.equal(buffer.sampleRate, 48000, `${slug}: sample rate`);
  assert.equal(buffer.numberOfChannels, 2, `${slug}: channels`);
  const data = buffer.getChannelData(0);
  let peak = 0;
  for (let i = 0; i < data.length; i++) peak = Math.max(peak, Math.abs(data[i]));
  assert.ok(peak > 0.005, `${slug}: rendered silence`);
  assert.ok(peak <= 1, `${slug}: clipped before mastering (${peak})`);
  console.log(`ok ${slug} (${seconds}s, peak ${peak.toFixed(3)})`);
}

// Byte-identical repeat renders are proven by running scripts/render.sh twice
// (separate processes); in-process repeated renders share Tone's global context.
console.log('selfcheck: PASS');
