export const id = 'chiptune';
export const name = 'Chiptune';
export const description =
  'Nhạc game 8-bit: square/triangle, arp nhanh, bass square, noise hi-hat, retro.';
export const useFor = 'Game, retro, nội dung pixel, video về trò chơi.';
export const avoidFor = 'Nội dung doanh nghiệp, phóng sự, podcast, quảng cáo thông thường.';
export const bpm = 140;
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

  const lead = new tone.Synth({
    oscillator: { type: 'square' },
    envelope: { attack: 0.002, decay: 0.1, sustain: 0.2, release: 0.1 },
    volume: -18,
  }).connect(master);

  const arp = new tone.Synth({
    oscillator: { type: 'triangle' },
    envelope: { attack: 0.002, decay: 0.08, sustain: 0.1, release: 0.08 },
    volume: -20,
  }).connect(master);

  const bass = new tone.Synth({
    oscillator: { type: 'square' },
    envelope: { attack: 0.002, decay: 0.1, sustain: 0.3, release: 0.1 },
    volume: -20,
  }).connect(master);

  const noise = new tone.NoiseSynth({
    noise: { type: 'white' },
    envelope: { attack: 0.001, decay: 0.03, sustain: 0, release: 0.03 },
    volume: -32,
  });
  noise.chain(new tone.Filter({ type: 'highpass', frequency: 7000 }), master);

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
      if (eighth % 2 === 0) {
        arp.triggerAttackRelease(chord.notes[(eighth / 2) % chord.notes.length], beat * 0.3, time);
      }
      bass.triggerAttackRelease(chord.root, beat * 0.4, time);
      if (eighth === 0 || eighth === 4) {
        lead.triggerAttackRelease(chord.notes[eighth / 4], beat * 0.5, time);
      }
      if (eighth % 2 === 1) noise.triggerAttackRelease(0.02, time);
    }
  }
}
