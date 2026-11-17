export const id = 'acoustic-uplift';
export const name = 'Acoustic Uplift';
export const description =
  'Brand ấm áp organic: pluck acoustic, pad mềm, bass gỗ, không quá synth, cảm giác người thật.';
export const useFor = 'Brand ấm, câu chuyện người thật, video nông nghiệp, nội dung chân thật.';
export const avoidFor = 'Nội dung công nghệ lạnh, trailer, quảng cáo punchy.';
export const bpm = 96;
export const key = 'G major';
export const bars = 4;

const CHORDS = [
  { root: 'G2', notes: ['G3', 'B3', 'D4'] },
  { root: 'D2', notes: ['D3', 'F#3', 'A3'] },
  { root: 'E2', notes: ['E3', 'G3', 'B3'] },
  { root: 'C2', notes: ['C3', 'E3', 'G3'] },
];

export function render(tone, timeline) {
  const { bar, beat, duration } = timeline;

  const master = new tone.Gain(0.5).toDestination();
  const verb = new tone.FeedbackDelay({ delayTime: beat * 0.6, feedback: 0.2, wet: 0.18 }).connect(master);

  const pluck = new tone.Synth({
    oscillator: { type: 'triangle' },
    envelope: { attack: 0.002, decay: 0.35, sustain: 0, release: 0.4 },
    volume: -18,
  }).connect(verb);

  const pad = new tone.PolySynth(tone.Synth, {
    oscillator: { type: 'triangle' },
    envelope: { attack: 0.4, decay: 0.4, sustain: 0.6, release: 0.8 },
    volume: -26,
  }).connect(master);

  const bass = new tone.Synth({
    oscillator: { type: 'sine' },
    envelope: { attack: 0.01, decay: 0.4, sustain: 0.4, release: 0.5 },
    volume: -18,
  }).connect(master);

  const shaker = new tone.NoiseSynth({
    noise: { type: 'pink' },
    envelope: { attack: 0.002, decay: 0.06, sustain: 0, release: 0.06 },
    volume: -32,
  });
  shaker.chain(new tone.Filter({ type: 'highpass', frequency: 6000 }), master);

  const barsNeeded = Math.ceil(duration / bar);
  for (let b = 0; b < barsNeeded; b++) {
    const chord = CHORDS[b % CHORDS.length];
    const start = b * bar;
    if (start >= duration) break;

    pad.triggerAttackRelease(chord.notes, bar * 0.9, start);
    bass.triggerAttackRelease(chord.root, beat * 1.5, start);
    bass.triggerAttackRelease(chord.root, beat * 1.2, start + beat * 2.5);

    const steps = Math.round(bar / (beat * 0.5));
    for (let i = 0; i < steps; i++) {
      const time = start + i * beat * 0.5;
      if (time >= duration) break;
      const eighth = i % 8;
      if (eighth % 2 === 0) {
        pluck.triggerAttackRelease(chord.notes[(eighth / 2) % chord.notes.length], beat * 0.4, time);
      }
      if (eighth % 4 === 2) shaker.triggerAttackRelease(0.03, time);
    }
  }
}
