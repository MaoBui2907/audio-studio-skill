# Chiptune — demo 10s

## Mục đích
Nhạc game 8-bit 10 giây, retro/pixel.

## Cấu trúc
- 140 BPM, C major, vòng C → Am → F → G, lặp 4 ô nhịp.
- Lead square, arp triangle nhanh móc 8th, bass square.
- Noise white highpass làm hi-hat 8th lẻ.

## Cue
| Thời điểm | Nội dung |
|---|---|
| 0.0s | Lead + arp + bass + noise vào |
| 1.7s | Ô nhịp 2 (Am), arp tiếp nối |
| 3.4s | Ô nhịp 3 (F), fade-out 0.2s cuối |

## Ghi chú
- Seed 20261116 cố định; render lặp lại byte-identical.
- Chỉ synth nội bộ Tone.js, không asset ngoài.
