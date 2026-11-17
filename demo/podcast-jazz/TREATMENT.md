# Podcast Jazz — demo 10s

## Mục đích
Intro/outro podcast mềm 10 giây, swing nhẹ ấm áp.

## Cấu trúc
- 88 BPM, F major, vòng Fmaj7 → Dm7 → G → Cmaj7, lặp 4 ô nhịp.
- Keys triangle ấm qua delay, bass walking rời từng móc 8th chẵn.
- Hat highpass đánh móc 8th lẻ, bass nền điểm xuyết cuối ô (PRNG seed).

## Cue
| Thời điểm | Nội dung |
|---|---|
| 0.0s | Keys + bass walking + hat vào |
| 2.7s | Ô nhịp 2 (Dm7), cùng swing |
| 5.5s | Ô nhịp 3 (G), fade-out 0.2s cuối |

## Ghi chú
- Seed 20261116 cố định; render lặp lại byte-identical.
- Chỉ synth nội bộ Tone.js, không asset ngoài.
