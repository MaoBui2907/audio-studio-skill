---
name: audio-studio
description: Sản xuất nhạc nền và SFX ngắn hoàn toàn bằng code với Tone.js, chỉ dùng 2 style đã duyệt cho HyperSense. Dùng khi cần bed nhạc 5-60 giây cho video, podcast, promo; có doctor kiểm môi trường, render tái lập theo seed và QA đo được. Không dùng cho bài hát có lời, giọng hát, hoặc nhạc cần model sinh.
---

# Audio Studio (v1)

Skill công ty để tạo nhạc nền bằng code: engine Tone.js render offline, thư viện style đóng, QA đo bằng ffmpeg. Không dùng model sinh nhạc, không dùng sample/loop có sẵn.

## Khi nào dùng

- Bed nhạc nền 5–60 giây cho video promo, explainer, onboarding, social clip, podcast.
- Cần bản quyền sạch: 100% synth nội bộ sinh từ code.
- Cần tái lập: cùng project + seed ⇒ cùng file (sha256 không đổi).

## Khi nào không dùng

- Bài hát có lời, giọng hát, cover, remix.
- Nhạc cần chất liệu thật (dàn nhạc, trống acoustic thu thật) hoặc model sinh nhạc.
- Style ngoài danh sách bên dưới, trừ khi CEO/CTO duyệt bổ sung.
- SFX phức tạp/thiết kế âm thanh cho phim — v1 chỉ có bed nhạc.

## Cài đặt một lần

Yêu cầu: Node >= 20, ffmpeg >= 7 (có ffprobe). Không cần root.

```sh
git clone https://github.com/MaoBui2907/audio-studio-skill.git
cd audio-studio-skill
npm install
sh scripts/doctor.sh --install   # tải ffmpeg 7 static + libasound nếu thiếu, vào .tools/
sh scripts/doctor.sh             # phải in doctor: PASS
```

- `doctor.sh` tìm `ffmpeg`/`ffprobe` theo `PATH`, rồi `AUDIO_STUDIO_BIN`, rồi `.tools/bin`.
- `AUDIO_STUDIO_BIN` mặc định `$PWD/.tools/bin`; đặt biến này nếu muốn dùng binary ở nơi khác (ví dụ `$HOME/.local/audio-studio/bin`).
- `--install` cần `curl` và `python3` (chỉ dùng để giải nén `.xz`/`.deb`).
- Linux x64 là môi trường được kiểm chứng. `node-web-audio-api` cần `libasound.so.2`; `doctor.sh --install` đặt bản shim vào `.tools/lib` và `render.sh` tự thêm vào `LD_LIBRARY_PATH`.

## 2 style được duyệt (danh sách đóng)

| Slug | Tên | Nhịp | Giọng | Dùng cho |
|---|---|---|---|---|
| `corporate-uplift` | Corporate Uplift | 110 BPM | C major | Promo sản phẩm, onboarding, báo cáo quý, giới thiệu công ty |
| `kids-playful` | Kids Playful | 132 BPM | F major | Thiếu nhi, hoạt hình, học tập vui, quảng cáo đồ chơi |

Danh sách máy đọc: `scripts/styles.txt`. Thêm style phải được CEO/CTO duyệt trước; không tự thêm.

## Quy trình bắt buộc

1. **Brief.** Chốt mục tiêu, đối tượng, cảm xúc, thời lượng, nơi phát (có thoại hay không), deadline. Không hỏi lại thứ brief đã trả lời.
2. **Chọn style.** Chỉ chọn trong 2 style trên. Không phù hợp thì báo CTO, không tự tạo style mới.
3. **Treatment.** Viết `TREATMENT.md` trong project: mục đích, cấu trúc (BPM/giọng/vòng hợp âm/nhạc cụ), cue theo mốc thời gian. Viết trước khi render.
4. **Render.** `sh scripts/render.sh <projectDir> [seconds]`. Không sửa `scripts/render.mjs` hay `styles/` cho từng project; chỉ tạo project mới.
5. **QA gate.** `render.sh` tự chạy `qa.mjs`; chỉ giao khi `qa.json` có `"pass": true`. FAIL thì đọc `reasons`, sửa project/style rồi render lại.
6. **Giao.** Gửi WAV (và MP3 nếu có), `qa.json`, `TREATMENT.md`, `CREDITS`.

## Lệnh

```sh
sh scripts/doctor.sh                    # kiểm môi trường, exit != 0 nếu thiếu
sh scripts/doctor.sh --install          # cài ffmpeg 7 static + libasound vào .tools/
sh scripts/render.sh demo/corporate-uplift 10
sh scripts/render.sh demo/kids-playful 10
node tests/selfcheck.mjs                # kiểm contract style + render ngắn
SEED=12345 sh scripts/render.sh demo/kids-playful 10   # đổi seed, vẫn tái lập
```

`render.sh` ghi vào `<projectDir>/out/`: `<name>.raw.wav` (engine, chưa master), `<name>.wav` (48 kHz stereo 16-bit, loudnorm 2-pass), `<name>.mp3` (nếu ffmpeg có libmp3lame), `qa.json`, `render.json`. Không ghi đè file input.

## Project tối thiểu

```text
my-bed/
  index.js          # export default { style: 'corporate-uplift', seconds: 20, seed: 20261116 }
  TREATMENT.md
  out/              # sinh ra, đã gitignore
```

Style module contract (`styles/<slug>.js`) — named export:

```js
export const id = 'corporate-uplift';   // phải trùng tên file và slug trong project
export const name = 'Corporate Uplift';
export const description = '...';
export const useFor = '...';
export const avoidFor = '...';
export const bpm = 110;
export const key = 'C major';
export const bars = 4;                  // độ dài vòng hài hoà, tính bằng ô 4/4
export function render(tone, timeline) { /* lập lịch nốt */ }
```

`timeline` gồm `{ duration, seed, rng, bpm, key, bars, beat, bar, transport }`. `rng` là PRNG mulberry32 đã seed; **cấm `Math.random()`** trong style. Chỉ dùng synth nội bộ Tone.js, không import file ngoài repo. Mọi tham số BPM/scale/thời lượng nằm trong style hoặc project, không hardcode trong engine.

## QA gate (v1)

| Kiểm tra | Ngưỡng |
|---|---|
| Duration | lệch ≤ 0.25s so với yêu cầu |
| True peak | ≤ −1.0 dBTP |
| Clipping | 0 sample \|x\| ≥ 0.999 |
| Integrated loudness | −16…−12 LUFS (bed không thoại) |
| Khoảng lặng giữa track | ≤ 1.0s |
| Sample rate | 48000 |
| Channels | 2 (stereo) |
| Bit depth | ≥ 16-bit |

`qa.json` in `{duration, peakDb, lufs, clipped, sampleRate, channels, bitDepth, longestSilence, pass, reasons}`. FAIL ⇒ exit code 1 và in lý do.

## Guardrails

- Danh sách style đóng; thêm/bớt cần CEO/CTO duyệt.
- Không dùng edge-tts, Coqui TTS hay bất kỳ model giọng nói cho mục đích thương mại.
- Không nhúng sample/loop/asset không rõ license. Toàn bộ âm thanh sinh bằng synth trong repo.
- Không sửa `scripts/render.mjs` hay `styles/` để chữa một project; sửa project trước, nếu thiếu năng lực thì báo CTO.
- Không commit `out/`, `node_modules/`, `.tools/`; không commit WAV demo ≥ 2 MB/file.
- Không đưa secret/token vào project, style hay prompt.

## Giao hàng

- `<name>.wav` (48 kHz, stereo, 16-bit, loudnorm 2-pass), `<name>.mp3` (192 kbps) nếu có.
- `qa.json` PASS, `render.json` (seed + sha256 engine), `TREATMENT.md`, `CREDITS`.
- Báo người yêu cầu: vị trí file, thời lượng, style, seed, và điểm cần họ xác nhận (cảm xúc, mật độ, điểm vào/ra).

## Troubleshooting

- `ffmpeg not found` / `< 7`: chạy `sh scripts/doctor.sh --install` hoặc đặt `AUDIO_STUDIO_BIN` trỏ tới thư mục chứa ffmpeg 7.
- `libasound.so.2: cannot open shared object file`: chạy `sh scripts/doctor.sh --install` (shim vào `.tools/lib`) rồi dùng `render.sh` (tự export `LD_LIBRARY_PATH`).
- `param must be an AudioParam` hoặc `Missing the native OfflineAudioContext constructor`: đang import `tone` trước khi gán global Web Audio; dùng `render.mjs`/`selfcheck.mjs` làm mẫu, đừng import Tone trực tiếp trong script mới.
- Loudness lệch ngoài −16…−12 LUFS: kiểm tra `qa.json` `lufs`; nếu loudnorm không hội tụ do track quá ngắn (< 3s), tăng thời lượng hoặc giảm dynamic (thêm pad/comp nhẹ ở style — cần CTO duyệt vì sửa style).
- Khoảng lặng > 1s: thường do style để trống giữa track; thêm nhạc cụ giữ nhịp hoặc giảm khoảng nghỉ trong project.
- Duration lệch: `render.mjs` cắt đúng `seconds`; lệch thường do truyền sai tham số — kiểm tra `seconds` trong `index.js` và CLI.
