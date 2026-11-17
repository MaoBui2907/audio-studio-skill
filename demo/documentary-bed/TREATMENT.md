# Documentary Bed — demo 10s

## Mục đích
Nền phóng sự trầm ấm 10 giây, để trống cho thoại/phỏng vấn chậm.

## Cấu trúc
- 78 BPM, E minor, vòng Em → C → G → D, lặp 4 ô nhịp.
- Pad triangle warm qua lowpass + delay dài.
- Piano triangle mềm đánh nốt rời từng phách chẵn, bass sine tròn.

## Cue
| Thời điểm | Nội dung |
|---|---|
| 0.0s | Pad + bass + piano vào |
| 3.1s | Ô nhịp 2 (C), piano biến đổi |
| 6.2s | Ô nhịp 3 (G), fade-out 0.2s cuối |

## Ghi chú
- Seed 20261116 cố định; render lặp lại byte-identical.
- Chỉ synth nội bộ Tone.js, không asset ngoài.
