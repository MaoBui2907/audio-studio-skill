export const id = 'documentary-bed';
export const name = 'Documentary Bed';
export const description =
  'Nhạc nền phóng sự trầm ấm: pad warm, piano mềm, bass gỗ, không gian mở cho thoại.';
export const useFor = 'Phóng sự, câu chuyện thương hiệu, tư liệu, phỏng vấn chậm.';
export const avoidFor = 'Quảng cáo punchy, nội dung trẻ em, nhạc lạc quan sôi động.';
export const bpm = 78;
export const key = 'E minor';
export const bars = 4;

const CHORDS = [
  { root: 'E2', notes: ['E3', 'G3', 'B3'] },
  { root: 'C2', notes: ['C3', 'E3', 'G3'] },
  { root: 'G1', notes: ['G2', 'B2', 'D3'] },
  { root: 'D2', notes: ['D3', 'F#3', 'A3'] },
];

export function render(tone, timeline) {
  const { bar, beat, duration } = timeline;

  const master = new tone.Gain(0.5).toDestination();
  const verb = new tone.FeedbackDelay({ delayTime: beat * 1.2, feedback: 0.32, wet: 0.3 }).connect(master);

  const pad = new tone.PolySynth(tone.Synth, {
    oscillator: { type: 'triangle' },
    envelope: { attack: 0.6, decay: 0.6, sustain: 0.8, release: 1.5 },
    volume: -24,
  });
  pad.chain(new tone.Filter({ type: 'lowpass', frequency: 1000 }), master);

  const piano = new tone.Synth({
    oscillator: { type: 'triangle' },
    envelope: { attack: 0.004, decay: 0.8, sustain: 0.1, release: 0.9 },
    volume: -20,
  }).connect(verb);

  const bass = new tone.Synth({
    oscillator: { type: 'sine' },
    envelope: { attack: 0.02, decay: 0.5, sustain: 0.5, release: 0.8 },
    volume: -16,
  }).connect(master);

  const barsNeeded = Math.ceil(duration / bar);
  for (let b = 0; b < barsNeeded; b++) {
    const chord = CHORDS[b % CHORDS.length];
    const start = b * bar;
    if (start >= duration) break;

    pad.triggerAttackRelease(chord.notes, bar * 0.98, start);
    bass.triggerAttackRelease(chord.root, bar * 0.9, start);

    const steps = Math.round(bar / beat);
    for (let i = 0; i < steps; i++) {
      const time = start + i * beat;
      if (time >= duration) break;
      if (i % 2 === 0) {
        const note = chord.notes[(i + b) % chord.notes.length];
        piano.triggerAttackRelease(note, beat * 0.7, time, 0.4 + (i % 4) * 0.1);
      }
    }
  }
}
