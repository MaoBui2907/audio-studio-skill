# Minimal Click — demo 2s

## Mục đích
SFX/UI siêu ngắn 2 giây cho chuyển cảnh/tương tác, trong trẻo.

## Cấu trúc
- 120 BPM, C major, bars=1 (1 ô nhịp).
- Tick sine ngắn (C5) + noise highpass ở đầu mỗi nhịp.
- Ping triangle (E5/G5) điểm giữa ô, tạo cảm giác tương tác.

## Cue
| Thời điểm | Nội dung |
|---|---|
| 0.0s | Tick + noise vào |
| 0.25s | Ping E5 |
| 0.5s | Tick + noise, fade-out 0.2s cuối |

## Ghi chú
- Seed 20261116 cố định; render lặp lại byte-identical.
- Chỉ synth nội bộ Tone.js, không asset ngoài.
