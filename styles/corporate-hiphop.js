export const id = 'corporate-hiphop';
export const name = 'Corporate Hip-hop';
export const description =
  'Beat hip-hop năng lượng cho social trẻ: kick/hat trap, bass 808, hook synth sáng tông corporate.';
export const useFor = 'Social trẻ, năng lượng, sự kiện giới trẻ, brand hướng gen Z.';
export const avoidFor = 'Nội dung doanh nghiệp truyền thống nghiêm túc, phóng sự, podcast.';
export const bpm = 92;
export const key = 'A minor';
export const bars = 4;

const CHORDS = [
  { root: 'A1', notes: ['A3', 'C4', 'E4'] },
  { root: 'F1', notes: ['F3', 'A3', 'C4'] },
  { root: 'C1', notes: ['C3', 'E3', 'G3'] },
  { root: 'G1', notes: ['G3', 'B3', 'D4'] },
];

export function render(tone, timeline) {
  const { bar, beat, duration } = timeline;

  const master = new tone.Gain(0.5).toDestination();

  const keys = new tone.PolySynth(tone.Synth, {
    oscillator: { type: 'triangle' },
    envelope: { attack: 0.005, decay: 0.3, sustain: 0.2, release: 0.3 },
    volume: -20,
  }).connect(master);

  const hook = new tone.Synth({
    oscillator: { type: 'square' },
    envelope: { attack: 0.003, decay: 0.15, sustain: 0.15, release: 0.15 },
    volume: -22,
  }).connect(master);

  const bass = new tone.Synth({
    oscillator: { type: 'sine' },
    envelope: { attack: 0.004, decay: 0.3, sustain: 0.3, release: 0.3 },
    volume: -14,
  }).connect(master);

  const kick = new tone.MembraneSynth({
    pitchDecay: 0.02,
    octaves: 7,
    envelope: { attack: 0.001, decay: 0.3, sustain: 0.01, release: 0.3 },
    volume: -12,
  }).connect(master);

  const hat = new tone.NoiseSynth({
    noise: { type: 'white' },
    envelope: { attack: 0.001, decay: 0.04, sustain: 0, release: 0.04 },
    volume: -30,
  });
  hat.chain(new tone.Filter({ type: 'highpass', frequency: 8000 }), master);

  const snare = new tone.NoiseSynth({
    noise: { type: 'white' },
    envelope: { attack: 0.001, decay: 0.12, sustain: 0, release: 0.13 },
    volume: -26,
  });
  snare.chain(new tone.Filter({ type: 'bandpass', frequency: 2000 }), master);

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
      bass.triggerAttackRelease(chord.root, beat * 0.4, time);
      if (eighth === 0) kick.triggerAttackRelease('C1', 0.12, time);
      if (eighth === 2) kick.triggerAttackRelease('C1', 0.12, time);
      if (eighth === 4) snare.triggerAttackRelease(0.1, time);
      if (eighth % 2 === 1) hat.triggerAttackRelease(0.02, time);
      if (eighth === 6) hook.triggerAttackRelease(chord.notes[0], beat * 0.3, time);
    }
  }
}
