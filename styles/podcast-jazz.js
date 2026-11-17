export const id = 'podcast-jazz';
export const name = 'Podcast Jazz';
export const description =
  'Intro/outro podcast mềm: hợp âm jazz swing nhẹ, bass walking, brush/hat, ấm áp.';
export const useFor = 'Intro/outro podcast, nền nói chuyện, thương hiệu cá nhân.';
export const avoidFor = 'Nội dung cần năng lượng cao, trailer, quảng cáo punchy.';
export const bpm = 88;
export const key = 'F major';
export const bars = 4;

const CHORDS = [
  { root: 'F2', notes: ['F3', 'A3', 'C4', 'E4'] },
  { root: 'D2', notes: ['D3', 'F3', 'A3', 'C4'] },
  { root: 'G2', notes: ['G3', 'B3', 'D4'] },
  { root: 'C2', notes: ['C3', 'E3', 'G3', 'B3'] },
];

export function render(tone, timeline) {
  const { bar, beat, duration, rng } = timeline;

  const master = new tone.Gain(0.5).toDestination();
  const verb = new tone.FeedbackDelay({ delayTime: beat * 0.75, feedback: 0.24, wet: 0.22 }).connect(master);

  const keys = new tone.PolySynth(tone.Synth, {
    oscillator: { type: 'triangle' },
    envelope: { attack: 0.01, decay: 0.5, sustain: 0.3, release: 0.7 },
    volume: -22,
  }).connect(verb);

  const bass = new tone.Synth({
    oscillator: { type: 'sine' },
    envelope: { attack: 0.01, decay: 0.3, sustain: 0.4, release: 0.5 },
    volume: -16,
  }).connect(master);

  const hat = new tone.NoiseSynth({
    noise: { type: 'white' },
    envelope: { attack: 0.001, decay: 0.03, sustain: 0, release: 0.03 },
    volume: -34,
  });
  hat.chain(new tone.Filter({ type: 'highpass', frequency: 9000 }), master);

  const bassNote = new tone.Synth({
    oscillator: { type: 'sine' },
    envelope: { attack: 0.01, decay: 0.2, sustain: 0.3, release: 0.2 },
    volume: -18,
  }).connect(master);

  const barsNeeded = Math.ceil(duration / bar);
  for (let b = 0; b < barsNeeded; b++) {
    const chord = CHORDS[b % CHORDS.length];
    const start = b * bar;
    if (start >= duration) break;

    keys.triggerAttackRelease(chord.notes, beat * 1.8, start);

    const steps = Math.round(bar / (beat * 0.5));
    for (let i = 0; i < steps; i++) {
      const time = start + i * beat * 0.5;
      if (time >= duration) break;
      const eighth = i % 8;
      if (eighth % 2 === 0) {
        const n = chord.notes[(eighth / 2) % chord.notes.length];
        bassNote.triggerAttackRelease(n, beat * 0.45, time);
      }
      if (eighth % 2 === 1) hat.triggerAttackRelease(0.02, time);
    }
    if (rng() < 0.3) {
      bass.triggerAttackRelease(chord.root, beat * 0.9, start + beat * 3);
    }
  }
}
