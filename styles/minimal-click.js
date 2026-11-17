export const id = 'minimal-click';
export const name = 'Minimal Click';
export const description =
  'SFX/UI siêu ngắn 1-2s: click/tick/tap trong trẻo cho chuyển cảnh và tương tác.';
export const useFor = 'SFX UI ngắn, chuyển cảnh, thông báo nhẹ, tương tác giao diện.';
export const avoidFor = 'Bed nhạc dài, video có thoại dài, nội dung cần nhạc nền liên tục.';
export const bpm = 120;
export const key = 'C major';
export const bars = 1;

export function render(tone, timeline) {
  const { beat, duration } = timeline;

  const master = new tone.Gain(0.5).toDestination();

  const tick = new tone.Synth({
    oscillator: { type: 'sine' },
    envelope: { attack: 0.001, decay: 0.06, sustain: 0, release: 0.06 },
    volume: -16,
  }).connect(master);

  const ping = new tone.Synth({
    oscillator: { type: 'triangle' },
    envelope: { attack: 0.001, decay: 0.25, sustain: 0, release: 0.25 },
    volume: -22,
  }).connect(master);

  const noise = new tone.NoiseSynth({
    noise: { type: 'white' },
    envelope: { attack: 0.001, decay: 0.03, sustain: 0, release: 0.03 },
    volume: -34,
  });
  noise.chain(new tone.Filter({ type: 'highpass', frequency: 8000 }), master);

  const steps = Math.round(duration / (beat * 0.5));
  for (let i = 0; i < steps; i++) {
    const time = i * beat * 0.5;
    if (time >= duration) break;
    if (i % 4 === 0) {
      tick.triggerAttackRelease('C5', 0.08, time);
      noise.triggerAttackRelease(0.02, time);
    }
    if (i % 4 === 2) {
      ping.triggerAttackRelease(i % 8 === 6 ? 'G5' : 'E5', 0.2, time);
    }
  }
}
