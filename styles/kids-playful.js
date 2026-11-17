export const id = 'kids-playful';
export const name = 'Kids Playful';
export const description =
  'Nhạc thiếu nhi vui nhộn: marimba dẫn giai điệu, bass "boop", trống và lục lạc nhẹ, chuông ở đầu ô nhịp.';
export const useFor = 'Video thiếu nhi, hoạt hình, nội dung học tập vui, quảng cáo đồ chơi.';
export const avoidFor = 'Nội dung doanh nghiệp nghiêm túc, tài chính, nội dung u tối.';
export const bpm = 132;
export const key = 'F major';
export const bars = 4;

const CHORDS = [
  { root: 'F2', notes: ['F3', 'A3', 'C4'] },
  { root: 'D2', notes: ['D3', 'F3', 'A3'] },
  { root: 'A#1', notes: ['A#2', 'D3', 'F3'] },
  { root: 'C2', notes: ['C3', 'E3', 'G3'] },
];
const PENTATONIC = ['F4', 'G4', 'A4', 'C5', 'D5', 'F5'];

export function render(tone, timeline) {
  const { bar, beat, duration, rng } = timeline;

  const master = new tone.Gain(0.5).toDestination();
  const echo = new tone.FeedbackDelay({ delayTime: beat * 0.5, feedback: 0.2, wet: 0.16 }).connect(master);

  const marimba = new tone.Synth({
    oscillator: { type: 'sine' },
    envelope: { attack: 0.002, decay: 0.18, sustain: 0, release: 0.2 },
    volume: -15,
  }).connect(master);

  const lead = new tone.Synth({
    oscillator: { type: 'triangle' },
    envelope: { attack: 0.004, decay: 0.12, sustain: 0.1, release: 0.18 },
    volume: -21,
  }).connect(echo);

  const bass = new tone.Synth({
    oscillator: { type: 'square' },
    envelope: { attack: 0.005, decay: 0.18, sustain: 0.35, release: 0.2 },
    volume: -22,
  });
  bass.chain(new tone.Filter({ type: 'lowpass', frequency: 700, rolloff: -24 }), master);

  const kick = new tone.MembraneSynth({
    pitchDecay: 0.02,
    octaves: 5,
    envelope: { attack: 0.001, decay: 0.16, sustain: 0.01, release: 0.2 },
    volume: -17,
  }).connect(master);

  const hat = new tone.NoiseSynth({
    noise: { type: 'pink' },
    envelope: { attack: 0.001, decay: 0.04, sustain: 0, release: 0.04 },
    volume: -35,
  });
  hat.chain(new tone.Filter({ type: 'highpass', frequency: 7000 }), master);

  const bell = new tone.Synth({
    oscillator: { type: 'sine' },
    envelope: { attack: 0.001, decay: 0.5, sustain: 0, release: 0.5 },
    volume: -24,
  }).connect(echo);

  const barsNeeded = Math.ceil(duration / bar);
  for (let b = 0; b < barsNeeded; b++) {
    const chord = CHORDS[b % CHORDS.length];
    const start = b * bar;
    if (start >= duration) break;

    bell.triggerAttackRelease(PENTATONIC[(b + 2) % PENTATONIC.length], 0.4, start);
    kick.triggerAttackRelease('F1', 0.08, start);
    kick.triggerAttackRelease('F1', 0.08, start + beat * 2);
    bass.triggerAttackRelease(chord.root, beat * 0.45, start);
    bass.triggerAttackRelease(chord.root, beat * 0.45, start + beat * 2.5);

    const steps = Math.round(bar / (beat * 0.5));
    for (let i = 0; i < steps; i++) {
      const time = start + i * beat * 0.5;
      if (time >= duration) break;
      if (i % 2 === 0) marimba.triggerAttackRelease(chord.notes[(i / 2) % chord.notes.length], 0.16, time);
      hat.triggerAttackRelease(0.02, time);

      // Seeded melody: deterministic per project seed, no Math.random.
      if (rng() < 0.42) {
        const note = PENTATONIC[Math.floor(rng() * PENTATONIC.length)];
        lead.triggerAttackRelease(note, 0.12, time, 0.5 + rng() * 0.4);
      }
    }
    // consume a fixed number of draws per bar so bar count does not change rhythm
    rng();
    rng();
  }
}
