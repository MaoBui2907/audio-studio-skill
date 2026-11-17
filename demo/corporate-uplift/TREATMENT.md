# Corporate Uplift — demo 10s

## Mục đích
Nhạc nền 10 giây cho video promo/onboarding doanh nghiệp. Không lời, không sample.

## Cấu trúc
- 110 BPM, C major, vòng hợp âm Cmaj9 → Am7 → Fmaj7 → G6, lặp 4 ô nhịp.
- Pad hợp âm rộng (attack chậm) giữ nền hài hoà.
- Arpeggio triangle móc 8th qua hợp âm, có FeedbackDelay nhẹ.
- Bass sine ở nửa ô nhịp, kick nhẹ ở phách 1 và 3, shaker highpass ở phách lẻ.

## Cue
| Thời điểm | Nội dung |
|---|---|
| 0.0s | Pad + kick vào, arpeggio bắt đầu |
| 4.4s | Sang vòng hợp âm 2 (Am7), cùng mật độ |
| 8.7s | Vòng 3 (Fmaj7) tiếp nối, fade-out 0.2s cuối |

## Ghi chú
- Seed 20261116 cố định; render lặp lại cho file byte-identical.
- Chỉ dùng synth nội bộ Tone.js, không import asset ngoài.
