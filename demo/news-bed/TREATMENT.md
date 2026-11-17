# News Bed — demo 10s

## Mục đích
Nền bản tin trung tính 10 giây, giữ nhịp mà không át thoại.

## Cấu trúc
- 96 BPM, C major, vòng C → G → Am → F, lặp 4 ô nhịp.
- Pad triangle trung tính, pulse triangle ngắn giữ nhịp, bass sine kín đáo.
- Tick highpass trắng đánh nhịp phụ.

## Cue
| Thời điểm | Nội dung |
|---|---|
| 0.0s | Pad + bass + pulse vào |
| 2.5s | Ô nhịp 2 (G), cùng mật độ |
| 5.0s | Ô nhịp 3 (Am), fade-out 0.2s cuối |

## Ghi chú
- Seed 20261116 cố định; render lặp lại byte-identical.
- Chỉ synth nội bộ Tone.js, không asset ngoài.
