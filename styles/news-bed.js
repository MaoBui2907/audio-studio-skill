export const id = 'news-bed';
export const name = 'News Bed';
export const description =
  'Nền bản tin trung tính: pulse nhẹ giữ nhịp, pad trung tính, bass kín đáo, không át thoại.';
export const useFor = 'Bản tin, podcast tin tức, phỏng vấn, nội dung thông tin.';
export const avoidFor = 'Nội dung giải trí sôi động, quảng cáo, trailer, thiếu nhi.';
export const bpm = 96;
export const key = 'C major';
export const bars = 4;

const CHORDS = [
  { root: 'C2', notes: ['C3', 'E3', 'G3'] },
  { root: 'G1', notes: ['G2', 'B2', 'D3'] },
  { root: 'A1', notes: ['A2', 'C3', 'E3'] },
  { root: 'F1', notes: ['F2', 'A2', 'C3'] },
];

export function render(tone, timeline) {
  const { bar, beat, duration } = timeline;

  const master = new tone.Gain(0.5).toDestination();

  const pad = new tone.PolySynth(tone.Synth, {
    oscillator: { type: 'triangle' },
    envelope: { attack: 0.3, decay: 0.3, sustain: 0.7, release: 0.6 },
    volume: -26,
  }).connect(master);

  const pulse = new tone.Synth({
    oscillator: { type: 'triangle' },
    envelope: { attack: 0.002, decay: 0.12, sustain: 0, release: 0.15 },
    volume: -20,
  }).connect(master);

  const bass = new tone.Synth({
    oscillator: { type: 'sine' },
    envelope: { attack: 0.01, decay: 0.25, sustain: 0.4, release: 0.3 },
    volume: -18,
  }).connect(master);

  const tick = new tone.NoiseSynth({
    noise: { type: 'white' },
    envelope: { attack: 0.001, decay: 0.02, sustain: 0, release: 0.02 },
    volume: -38,
  });
  tick.chain(new tone.Filter({ type: 'highpass', frequency: 9000 }), master);

  const barsNeeded = Math.ceil(duration / bar);
  for (let b = 0; b < barsNeeded; b++) {
    const chord = CHORDS[b % CHORDS.length];
    const start = b * bar;
    if (start >= duration) break;

    pad.triggerAttackRelease(chord.notes, bar * 0.9, start);
    bass.triggerAttackRelease(chord.root, beat * 1.8, start);

    const steps = Math.round(bar / (beat * 0.5));
    for (let i = 0; i < steps; i++) {
      const time = start + i * beat * 0.5;
      if (time >= duration) break;
      if (i % 4 === 0) pulse.triggerAttackRelease(chord.notes[(i / 4) % chord.notes.length], beat * 0.2, time);
      if (i % 4 === 2) tick.triggerAttackRelease(0.015, time);
    }
  }
}
