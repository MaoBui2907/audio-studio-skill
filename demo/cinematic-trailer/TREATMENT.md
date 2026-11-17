# Cinematic Trailer — demo 10s

## Mục đích
Nhạc trailer căng thẳng 10 giây, tension dâng dần cho launch/teaser.

## Cấu trúc
- 100 BPM, D minor, vòng Dm → B♭ → F → C, lặp 4 ô nhịp.
- Pad sawtooth qua lowpass + delay rộng, drone sine giữ nền.
- Bass triangle sâu, kick membrane dồn nhịp (phách 1 và 3), hit brown-noise lowpass cuối chu kỳ 4 ô.

## Cue
| Thời điểm | Nội dung |
|---|---|
| 0.0s | Drone + pad + kick vào |
| 2.4s | Ô nhịp 2 (B♭), kick dồn tiếp |
| 7.2s | Ô nhịp 4 (C), hit nhấn cuối, fade-out 0.2s |

## Ghi chú
- Seed 20261116 cố định; render lặp lại byte-identical.
- Chỉ synth nội bộ Tone.js, không asset ngoài.
