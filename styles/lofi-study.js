export const id = 'lofi-study';
export const name = 'Lo-fi Study';
export const description =
  'Lo-fi chill: hợp âm warm dusty, beat mềm lệch nhịp, bass tròn, vinyl noise nhẹ.';
export const useFor = 'Social, thư giãn, nội dung dài, học tập, live stream chill.';
export const avoidFor = 'Nội dung doanh nghiệp nghiêm túc, trailer, quảng cáo punchy.';
export const bpm = 76;
export const key = 'A minor';
export const bars = 4;

const CHORDS = [
  { root: 'A2', notes: ['A3', 'C4', 'E4'] },
  { root: 'F2', notes: ['F3', 'A3', 'C4'] },
  { root: 'C2', notes: ['C3', 'E3', 'G3'] },
  { root: 'G2', notes: ['G3', 'B3', 'D4'] },
];

export function render(tone, timeline) {
  const { bar, beat, duration, rng } = timeline;

  const master = new tone.Gain(0.5).toDestination();
  const verb = new tone.FeedbackDelay({ delayTime: beat * 1.5, feedback: 0.3, wet: 0.25 }).connect(master);

  const keys = new tone.PolySynth(tone.Synth, {
    oscillator: { type: 'triangle' },
    envelope: { attack: 0.01, decay: 0.5, sustain: 0.3, release: 0.8 },
    volume: -22,
  });
  keys.chain(new tone.Filter({ type: 'lowpass', frequency: 1800 }), verb);

  const bass = new tone.Synth({
    oscillator: { type: 'sine' },
    envelope: { attack: 0.01, decay: 0.3, sustain: 0.4, release: 0.5 },
    volume: -16,
  }).connect(master);

  const kick = new tone.MembraneSynth({
    pitchDecay: 0.03,
    octaves: 5,
    envelope: { attack: 0.001, decay: 0.2, sustain: 0.01, release: 0.3 },
    volume: -16,
  }).connect(master);

  const snare = new tone.NoiseSynth({
    noise: { type: 'white' },
    envelope: { attack: 0.001, decay: 0.14, sustain: 0, release: 0.15 },
    volume: -28,
  });
  snare.chain(new tone.Filter({ type: 'bandpass', frequency: 2000 }), master);

  const vinyl = new tone.NoiseSynth({
    noise: { type: 'pink' },
    envelope: { attack: 0.1, decay: 0.2, sustain: 0.9, release: 0.3 },
    volume: -42,
  });
  vinyl.chain(new tone.Filter({ type: 'lowpass', frequency: 500 }), master);
  vinyl.triggerAttackRelease(duration, 0);

  const barsNeeded = Math.ceil(duration / bar);
  for (let b = 0; b < barsNeeded; b++) {
    const chord = CHORDS[b % CHORDS.length];
    const start = b * bar;
    if (start >= duration) break;

    const steps = Math.round(bar / (beat * 0.5));
    for (let i = 0; i < steps; i++) {
      const time = start + i * beat * 0.5;
      if (time >= duration) break;
      const eighth = i % 8;
      if (eighth === 0) keys.triggerAttackRelease(chord.notes, beat * 1.6, time);
      bass.triggerAttackRelease(chord.root, beat * 0.9, time + beat * 0.25);
      if (eighth === 0) kick.triggerAttackRelease('C1', 0.1, time);
      if (eighth === 4) snare.triggerAttackRelease(0.1, time);
      if (rng() < 0.3 && eighth % 2 === 1) {
        const note = chord.notes[Math.floor(rng() * chord.notes.length)];
        keys.triggerAttackRelease(note, beat * 0.4, time, 0.25);
      }
    }
  }
}
