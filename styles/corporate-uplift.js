export const id = 'corporate-uplift';
export const name = 'Corporate Uplift';
export const description =
  'Nhạc nền doanh nghiệp tươi sáng: pad hợp âm rộng, arpeggio đều, bass vững, shaker nhẹ.';
export const useFor = 'Promo sản phẩm, onboarding, báo cáo quý, video giới thiệu công ty.';
export const avoidFor = 'Nội dung u tối, kịch tính, hành động nhanh, nội dung trẻ em.';
export const bpm = 110;
export const key = 'C major';
export const bars = 4;

const CHORDS = [
  { root: 'C2', notes: ['C3', 'E3', 'G3', 'B3', 'D4'] },
  { root: 'A1', notes: ['A2', 'C3', 'E3', 'G3', 'B3'] },
  { root: 'F1', notes: ['F2', 'A2', 'C3', 'E3', 'G3'] },
  { root: 'G1', notes: ['G2', 'B2', 'D3', 'E3', 'A3'] },
];

export function render(tone, timeline) {
  const { bar, beat, duration } = timeline;

  const master = new tone.Gain(0.5).toDestination();
  const delay = new tone.FeedbackDelay({ delayTime: beat * 0.75, feedback: 0.22, wet: 0.22 }).connect(master);

  const pad = new tone.PolySynth(tone.Synth, {
    oscillator: { type: 'triangle' },
    envelope: { attack: 0.35, decay: 0.4, sustain: 0.75, release: 0.9 },
    volume: -20,
  }).connect(master);

  const arp = new tone.Synth({
    oscillator: { type: 'triangle' },
    envelope: { attack: 0.004, decay: 0.14, sustain: 0.15, release: 0.25 },
    volume: -19,
  }).connect(delay);

  const bass = new tone.Synth({
    oscillator: { type: 'sine' },
    envelope: { attack: 0.01, decay: 0.3, sustain: 0.5, release: 0.35 },
    volume: -13,
  }).connect(master);

  const kick = new tone.MembraneSynth({
    pitchDecay: 0.03,
    octaves: 6,
    envelope: { attack: 0.001, decay: 0.22, sustain: 0.01, release: 0.25 },
    volume: -16,
  }).connect(master);

  const shaker = new tone.NoiseSynth({
    noise: { type: 'white' },
    envelope: { attack: 0.001, decay: 0.045, sustain: 0, release: 0.05 },
    volume: -34,
  });
  shaker.chain(new tone.Filter({ type: 'highpass', frequency: 6000 }), master);

  const barsNeeded = Math.ceil(duration / bar);
  for (let b = 0; b < barsNeeded; b++) {
    const chord = CHORDS[b % CHORDS.length];
    const start = b * bar;
    if (start >= duration) break;

    pad.triggerAttackRelease(chord.notes, bar * 0.95, start);
    bass.triggerAttackRelease(chord.root, bar * 0.45, start);
    bass.triggerAttackRelease(chord.root, bar * 0.4, start + bar * 0.5);
    kick.triggerAttackRelease('C1', 0.1, start);
    kick.triggerAttackRelease('C1', 0.1, start + bar * 0.5);

    const steps = Math.round(bar / (beat * 0.5));
    for (let i = 0; i < steps; i++) {
      const time = start + i * beat * 0.5;
      if (time >= duration) break;
      const note = chord.notes[(i * 2) % chord.notes.length];
      arp.triggerAttackRelease(note, beat * 0.42, time, 0.55 + (i % 2) * 0.2);
      if (i % 2 === 1) shaker.triggerAttackRelease(0.03, time);
    }
  }
}
