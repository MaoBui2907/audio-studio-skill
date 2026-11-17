# Data Pulse — demo 10s

## Mục đích
Sonification KPI 10 giây, cảm giác số liệu chạy cho dashboard/báo cáo.

## Cấu trúc
- 120 BPM, C major, vòng C → G → Am → F, lặp 4 ô nhịp.
- Pulse square ngắn đều đặn, pad triangle nền, bass sine.

## Cue
| Thời điểm | Nội dung |
|---|---|
| 0.0s | Pad + bass + pulse vào |
| 2.0s | Ô nhịp 2 (G), pulse tiếp nối |
| 4.0s | Ô nhịp 3 (Am), fade-out 0.2s cuối |

## Ghi chú
- Seed 20261116 cố định; render lặp lại byte-identical.
- Chỉ synth nội bộ Tone.js, không asset ngoài.
