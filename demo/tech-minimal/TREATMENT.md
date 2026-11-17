# Tech Minimal — demo 10s

## Mục đích
Nền UI tối giản 10 giây cho SaaS demo/thông báo sản phẩm. Sạch, thưa, không át thoại.

## Cấu trúc
- 90 BPM, C major, vòng C → Am → F → G, lặp 4 ô nhịp.
- Pad sine rộng (attack chậm) giữ nền, qua FeedbackDelay nhẹ.
- Pluck triangle ngắn đánh móc 8th, có delay.
- Bass sine ở nửa ô nhịp, tick highpass trắng ở mỗi nửa ô nhịp thứ 2.

## Cue
| Thời điểm | Nội dung |
|---|---|
| 0.0s | Pad + bass + pluck vào |
| 2.7s | Sang ô nhịp 2 (Am), cùng mật độ |
| 5.3s | Ô nhịp 3 (F), fade-out 0.2s cuối |

## Ghi chú
- Seed 20261116 cố định; render lặp lại byte-identical.
- Chỉ synth nội bộ Tone.js, không asset ngoài.
