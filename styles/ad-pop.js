export const id = 'ad-pop';
export const name = 'Ad Pop';
export const description =
  'Nhạc quảng cáo ngắn sáng và punchy: hook pop, bass mạnh, kick/hat đều, CTA năng lượng.';
export const useFor = 'Quảng cáo 15-30s, CTA mạnh, promo sản phẩm, social clip.';
export const avoidFor = 'Nội dung u tối, phóng sự, podcast, nền giải thích dài.';
export const bpm = 122;
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

  const chords = new tone.PolySynth(tone.Synth, {
    oscillator: { type: 'sawtooth' },
    envelope: { attack: 0.008, decay: 0.2, sustain: 0.3, release: 0.3 },
    volume: -22,
  });
  chords.chain(new tone.Filter({ type: 'lowpass', frequency: 2200 }), master);

  const lead = new tone.Synth({
    oscillator: { type: 'square' },
    envelope: { attack: 0.003, decay: 0.15, sustain: 0.2, release: 0.2 },
    volume: -18,
  }).connect(master);

  const bass = new tone.Synth({
    oscillator: { type: 'sawtooth' },
    envelope: { attack: 0.005, decay: 0.18, sustain: 0.4, release: 0.2 },
    volume: -16,
  });
  bass.chain(new tone.Filter({ type: 'lowpass', frequency: 700 }), master);

  const kick = new tone.MembraneSynth({
    pitchDecay: 0.03,
    octaves: 6,
    envelope: { attack: 0.001, decay: 0.22, sustain: 0.01, release: 0.25 },
    volume: -13,
  }).connect(master);

  const hat = new tone.NoiseSynth({
    noise: { type: 'white' },
    envelope: { attack: 0.001, decay: 0.04, sustain: 0, release: 0.04 },
    volume: -32,
  });
  hat.chain(new tone.Filter({ type: 'highpass', frequency: 8000 }), master);

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
      if (eighth === 0) chords.triggerAttackRelease(chord.notes, beat * 0.9, time);
      bass.triggerAttackRelease(chord.root, beat * 0.4, time);
      if (eighth % 2 === 0) kick.triggerAttackRelease('C1', 0.1, time);
      if (eighth % 2 === 1) hat.triggerAttackRelease(0.02, time);
      if (eighth === 4 || eighth === 6) {
        lead.triggerAttackRelease(chord.notes[eighth % chord.notes.length], beat * 0.3, time);
      }
    }
  }
}
