export const id = 'tech-minimal';
export const name = 'Tech Minimal';
export const description =
  'Âm thanh UI tối giản: pad mỏng, pluck ngắn, tick nhẹ, không khí sạch cho SaaS demo và thông báo.';
export const useFor = 'SaaS demo, thông báo sản phẩm, UI sound, onboarding kỹ thuật.';
export const avoidFor = 'Nội dung cảm xúc mạnh, kịch tính, hoặc cần nhạc dày đặc.';
export const bpm = 90;
export const key = 'C major';
export const bars = 4;

const CHORDS = [
  { root: 'C2', notes: ['C4', 'E4', 'G4'] },
  { root: 'A1', notes: ['A3', 'C4', 'E4'] },
  { root: 'F1', notes: ['F3', 'A3', 'C4'] },
  { root: 'G1', notes: ['G3', 'B3', 'D4'] },
];

export function render(tone, timeline) {
  const { bar, beat, duration } = timeline;

  const master = new tone.Gain(0.5).toDestination();
  const space = new tone.FeedbackDelay({ delayTime: beat * 0.75, feedback: 0.28, wet: 0.28 }).connect(master);

  const pad = new tone.PolySynth(tone.Synth, {
    oscillator: { type: 'sine' },
    envelope: { attack: 0.3, decay: 0.4, sustain: 0.7, release: 0.8 },
    volume: -22,
  }).connect(master);

  const pluck = new tone.Synth({
    oscillator: { type: 'triangle' },
    envelope: { attack: 0.002, decay: 0.16, sustain: 0, release: 0.2 },
    volume: -20,
  }).connect(space);

  const bass = new tone.Synth({
    oscillator: { type: 'sine' },
    envelope: { attack: 0.01, decay: 0.3, sustain: 0.4, release: 0.3 },
    volume: -18,
  }).connect(master);

  const tick = new tone.NoiseSynth({
    noise: { type: 'white' },
    envelope: { attack: 0.001, decay: 0.02, sustain: 0, release: 0.02 },
    volume: -36,
  });
  tick.chain(new tone.Filter({ type: 'highpass', frequency: 8000 }), master);

  const barsNeeded = Math.ceil(duration / bar);
  for (let b = 0; b < barsNeeded; b++) {
    const chord = CHORDS[b % CHORDS.length];
    const start = b * bar;
    if (start >= duration) break;

    pad.triggerAttackRelease(chord.notes, bar * 0.95, start);
    bass.triggerAttackRelease(chord.root, beat * 0.9, start);

    const steps = Math.round(bar / (beat * 0.5));
    for (let i = 0; i < steps; i++) {
      const time = start + i * beat * 0.5;
      if (time >= duration) break;
      if (i % 2 === 0) {
        pluck.triggerAttackRelease(chord.notes[i % chord.notes.length], beat * 0.18, time);
      }
      if (i % 4 === 2) tick.triggerAttackRelease(0.015, time);
    }
  }
}
