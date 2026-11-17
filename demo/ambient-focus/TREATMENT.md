# Ambient Focus — demo 10s

## Mục đích
Nền chậm thưa 10 giây để giải thích/khoá học, không gây chú ý.

## Cấu trúc
- 70 BPM, C major, vòng C → Am → F → G, lặp 4 ô nhịp.
- Pad sine dài (attack chậm) qua delay dài, bass sine tròn.
- Shimmer sine rời rạc, chọn nốt bằng PRNG seed cố định.

## Cue
| Thời điểm | Nội dung |
|---|---|
| 0.0s | Pad + bass vào |
| 3.4s | Ô nhịp 2 (Am), shimmer điểm xuyết |
| 6.9s | Ô nhịp 3 (F), fade-out 0.2s cuối |

## Ghi chú
- Seed 20261116 cố định; render lặp lại byte-identical.
- Chỉ synth nội bộ Tone.js, không asset ngoài.
