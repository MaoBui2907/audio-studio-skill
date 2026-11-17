export const id = 'cinematic-trailer';
export const name = 'Cinematic Trailer';
export const description =
  'Nhạc trailer căng thẳng: pad dàn trải, bass sâu, kick mạnh dồn nhịp, tension dâng dần.';
export const useFor = 'Launch, teaser, sự kiện lớn, mở đầu video cao trào.';
export const avoidFor = 'Nội dung nhẹ nhàng, explainer, podcast, nội dung trẻ em.';
export const bpm = 100;
export const key = 'D minor';
export const bars = 4;

const CHORDS = [
  { root: 'D2', notes: ['D3', 'F3', 'A3'] },
  { root: 'A#1', notes: ['A#2', 'D3', 'F3'] },
  { root: 'F1', notes: ['F2', 'A2', 'C3'] },
  { root: 'C2', notes: ['C3', 'E3', 'G3'] },
];

export function render(tone, timeline) {
  const { bar, beat, duration } = timeline;

  const master = new tone.Gain(0.5).toDestination();
  const verb = new tone.FeedbackDelay({ delayTime: beat * 0.5, feedback: 0.35, wet: 0.3 }).connect(master);

  const pad = new tone.PolySynth(tone.Synth, {
    oscillator: { type: 'sawtooth' },
    envelope: { attack: 0.5, decay: 0.6, sustain: 0.8, release: 1.2 },
    volume: -24,
  });
  pad.chain(new tone.Filter({ type: 'lowpass', frequency: 1200 }), verb);

  const drone = new tone.Synth({
    oscillator: { type: 'sine' },
    envelope: { attack: 0.4, decay: 0.5, sustain: 0.9, release: 1.2 },
    volume: -14,
  }).connect(master);

  const bass = new tone.Synth({
    oscillator: { type: 'triangle' },
    envelope: { attack: 0.01, decay: 0.4, sustain: 0.5, release: 0.4 },
    volume: -14,
  }).connect(master);

  const kick = new tone.MembraneSynth({
    pitchDecay: 0.02,
    octaves: 6,
    envelope: { attack: 0.001, decay: 0.35, sustain: 0.01, release: 0.4 },
    volume: -12,
  }).connect(master);

  const hit = new tone.NoiseSynth({
    noise: { type: 'brown' },
    envelope: { attack: 0.01, decay: 0.4, sustain: 0, release: 0.5 },
    volume: -20,
  });
  hit.chain(new tone.Filter({ type: 'lowpass', frequency: 900 }), master);

  const barsNeeded = Math.ceil(duration / bar);
  for (let b = 0; b < barsNeeded; b++) {
    const chord = CHORDS[b % CHORDS.length];
    const start = b * bar;
    if (start >= duration) break;

    pad.triggerAttackRelease(chord.notes, bar * 0.98, start);
    drone.triggerAttackRelease(chord.root.toUpperCase().replace(/[0-9]/, '2'), bar, start);
    bass.triggerAttackRelease(chord.root, beat * 1.8, start);
    kick.triggerAttackRelease('C1', 0.12, start);
    kick.triggerAttackRelease('C1', 0.12, start + beat * 2);
    if (b % 4 === 3) hit.triggerAttackRelease(0.3, start);
  }
}
