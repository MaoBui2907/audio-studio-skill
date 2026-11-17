export const id = 'ambient-focus';
export const name = 'Ambient Focus';
export const description =
  'Nền chậm thưa để giải thích: pad dài thoảng, nốt rời, không gây chú ý, để trống cho thoại.';
export const useFor = 'Nền giải thích, khóa học, chờ cuộc họp, video hướng dẫn dài.';
export const avoidFor = 'Quảng cáo, trailer, nội dung cần năng lượng và hook mạnh.';
export const bpm = 70;
export const key = 'C major';
export const bars = 4;

const CHORDS = [
  { root: 'C2', notes: ['C3', 'G3', 'E4'] },
  { root: 'A1', notes: ['A2', 'E3', 'C4'] },
  { root: 'F1', notes: ['F2', 'C3', 'A3'] },
  { root: 'G1', notes: ['G2', 'D3', 'B3'] },
];

export function render(tone, timeline) {
  const { bar, beat, duration, rng } = timeline;

  const master = new tone.Gain(0.5).toDestination();
  const verb = new tone.FeedbackDelay({ delayTime: beat * 1.5, feedback: 0.4, wet: 0.4 }).connect(master);

  const pad = new tone.PolySynth(tone.Synth, {
    oscillator: { type: 'sine' },
    envelope: { attack: 1.2, decay: 1.0, sustain: 0.8, release: 2.0 },
    volume: -26,
  }).connect(verb);

  const shimmer = new tone.Synth({
    oscillator: { type: 'sine' },
    envelope: { attack: 0.3, decay: 1.0, sustain: 0, release: 1.5 },
    volume: -24,
  }).connect(verb);

  const bass = new tone.Synth({
    oscillator: { type: 'sine' },
    envelope: { attack: 0.4, decay: 0.8, sustain: 0.6, release: 1.5 },
    volume: -20,
  }).connect(master);

  const barsNeeded = Math.ceil(duration / bar);
  for (let b = 0; b < barsNeeded; b++) {
    const chord = CHORDS[b % CHORDS.length];
    const start = b * bar;
    if (start >= duration) break;

    pad.triggerAttackRelease(chord.notes, bar * 0.98, start);
    bass.triggerAttackRelease(chord.root, bar * 0.95, start);

    const steps = Math.round(bar / beat);
    for (let i = 0; i < steps; i++) {
      const time = start + i * beat;
      if (time >= duration) break;
      if (rng() < 0.4) {
        const note = chord.notes[Math.floor(rng() * chord.notes.length)];
        shimmer.triggerAttackRelease(note, beat * 0.6, time, 0.3 + rng() * 0.3);
      }
    }
  }
}
