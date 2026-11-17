export const id = 'data-pulse';
export const name = 'Data Pulse';
export const description =
  'Sonification KPI: pulse data-driven đều, arp ngắn, bass nền, cảm giác số liệu chạy.';
export const useFor = 'Báo cáo KPI, dashboard, sonification dữ liệu, video số liệu.';
export const avoidFor = 'Nội dung cảm xúc, giải trí, phóng sự, thiếu nhi.';
export const bpm = 120;
export const key = 'C major';
export const bars = 4;

const CHORDS = [
  { root: 'C2', notes: ['C4', 'E4', 'G4'] },
  { root: 'G1', notes: ['G3', 'B3', 'D4'] },
  { root: 'A1', notes: ['A3', 'C4', 'E4'] },
  { root: 'F1', notes: ['F3', 'A3', 'C4'] },
];

export function render(tone, timeline) {
  const { bar, beat, duration } = timeline;

  const master = new tone.Gain(0.5).toDestination();

  const pulse = new tone.Synth({
    oscillator: { type: 'square' },
    envelope: { attack: 0.002, decay: 0.08, sustain: 0.1, release: 0.08 },
    volume: -20,
  }).connect(master);

  const pad = new tone.PolySynth(tone.Synth, {
    oscillator: { type: 'triangle' },
    envelope: { attack: 0.2, decay: 0.3, sustain: 0.5, release: 0.5 },
    volume: -26,
  }).connect(master);

  const bass = new tone.Synth({
    oscillator: { type: 'sine' },
    envelope: { attack: 0.01, decay: 0.2, sustain: 0.3, release: 0.2 },
    volume: -18,
  }).connect(master);

  const barsNeeded = Math.ceil(duration / bar);
  for (let b = 0; b < barsNeeded; b++) {
    const chord = CHORDS[b % CHORDS.length];
    const start = b * bar;
    if (start >= duration) break;

    pad.triggerAttackRelease(chord.notes, bar * 0.9, start);
    bass.triggerAttackRelease(chord.root, beat * 1.5, start);

    const steps = Math.round(bar / (beat * 0.5));
    for (let i = 0; i < steps; i++) {
      const time = start + i * beat * 0.5;
      if (time >= duration) break;
      if (i % 2 === 0) {
        pulse.triggerAttackRelease(chord.notes[(i / 2) % chord.notes.length], beat * 0.2, time);
      }
    }
  }
}
