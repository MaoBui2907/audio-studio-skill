# Kids Playful — demo 10s

## Mục đích
Nhạc nền 10 giây cho nội dung thiếu nhi/hoạt hình/học tập vui. Không lời, không sample.

## Cấu trúc
- 132 BPM, F major, vòng F → Dm → Bb → C, lặp 4 ô nhịp.
- Marimba (sine, decay ngắn) đánh hợp âm rải đều phách chẵn.
- Lead triangle chạy giai điệu pentatonic F-G-A-C-D, chọn nốt bằng PRNG seed cố định, có echo nhẹ.
- Bass square qua lowpass, kick membrane, lục lạc pink noise, chuông sine đầu mỗi ô nhịp.

## Cue
| Thời điểm | Nội dung |
|---|---|
| 0.0s | Chuông + kick + bass vào |
| 1.8s | Ô nhịp 2 (Dm), giai điệu lead biến đổi theo seed |
| 5.5s | Ô nhịp 3–4 (Bb, C) dày dần, fade-out 0.2s cuối |

## Ghi chú
- Seed 20261116 cố định; đổi `seed` trong `index.js` để đổi giai điệu, vẫn tái lập được.
- Chỉ dùng synth nội bộ Tone.js, không import asset ngoài.
