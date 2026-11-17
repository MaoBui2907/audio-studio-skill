export const id = 'synthwave';
export const name = 'Synthwave';
export const description =
  'Hoài niệm 80s: pad analog, arp sequencer, bass đặc trưng, kick mạnh, neon.';
export const useFor = 'Công nghệ, hoài niệm 80s, gaming, nội dung retro-futuristic.';
export const avoidFor = 'Nội dung doanh nghiệp truyền thống, phóng sự, podcast.';
export const bpm = 108;
export const key = 'A minor';
export const bars = 4;

const CHORDS = [
  { root: 'A2', notes: ['A3', 'C4', 'E4'] },
  { root: 'F2', notes: ['F3', 'A3', 'C4'] },
  { root: 'C2', notes: ['C3', 'E3', 'G3'] },
  { root: 'G2', notes: ['G3', 'B3', 'D4'] },
];
const ARP = ['A3', 'C4', 'E4', 'A4', 'E4', 'C4'];

export function render(tone, timeline) {
  const { bar, beat, duration } = timeline;

  const master = new tone.Gain(0.5).toDestination();
  const verb = new tone.FeedbackDelay({ delayTime: beat * 0.75, feedback: 0.3, wet: 0.24 }).connect(master);

  const pad = new tone.PolySynth(tone.Synth, {
    oscillator: { type: 'sawtooth' },
    envelope: { attack: 0.4, decay: 0.5, sustain: 0.7, release: 1.0 },
    volume: -24,
  });
  pad.chain(new tone.Filter({ type: 'lowpass', frequency: 1500 }), verb);

  const arp = new tone.Synth({
    oscillator: { type: 'square' },
    envelope: { attack: 0.002, decay: 0.1, sustain: 0.1, release: 0.12 },
    volume: -22,
  }).connect(verb);

  const bass = new tone.Synth({
    oscillator: { type: 'sawtooth' },
    envelope: { attack: 0.004, decay: 0.2, sustain: 0.3, release: 0.25 },
    volume: -16,
  });
  bass.chain(new tone.Filter({ type: 'lowpass', frequency: 600 }), master);

  const kick = new tone.MembraneSynth({
    pitchDecay: 0.02,
    octaves: 6,
    envelope: { attack: 0.001, decay: 0.25, sustain: 0.01, release: 0.3 },
    volume: -12,
  }).connect(master);

  const snare = new tone.NoiseSynth({
    noise: { type: 'white' },
    envelope: { attack: 0.001, decay: 0.12, sustain: 0, release: 0.13 },
    volume: -26,
  });
  snare.chain(new tone.Filter({ type: 'bandpass', frequency: 1800 }), master);

  const barsNeeded = Math.ceil(duration / bar);
  for (let b = 0; b < barsNeeded; b++) {
    const chord = CHORDS[b % CHORDS.length];
    const start = b * bar;
    if (start >= duration) break;

    pad.triggerAttackRelease(chord.notes, bar * 0.95, start);

    const steps = Math.round(bar / (beat * 0.5));
    for (let i = 0; i < steps; i++) {
      const time = start + i * beat * 0.5;
      if (time >= duration) break;
      const eighth = i % 8;
      arp.triggerAttackRelease(ARP[(i * 2) % ARP.length], beat * 0.3, time);
      bass.triggerAttackRelease(chord.root, beat * 0.4, time);
      if (eighth % 2 === 0) kick.triggerAttackRelease('C1', 0.1, time);
      if (eighth === 4) snare.triggerAttackRelease(0.1, time);
    }
  }
}
