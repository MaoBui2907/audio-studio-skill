# audio-studio-skill

Agent skill: nhạc nền sinh hoàn toàn bằng code với Tone.js. 16 style đóng, render tái lập theo seed, QA đo bằng ffmpeg.

## Yêu cầu

- Node >= 20
- ffmpeg >= 7 + ffprobe (cài bằng `scripts/setup-tools.mjs`)
- Linux x64 đã được kiểm chứng

## Cài đặt

```sh
npm install
sh scripts/setup-tools.mjs
sh scripts/doctor.sh
```

## Dùng

```sh
sh scripts/render.sh demo/corporate-uplift 10
sh scripts/render.sh demo/kids-playful 10
node tests/selfcheck.mjs
```

Output nằm trong `<project>/out/`: WAV 48 kHz stereo, MP3 192 kbps, `qa.json`, `render.json`.

## Style

| Slug | BPM | Giọng | Dùng cho |
|---|---|---|---|
| `corporate-uplift` | 110 | C major | Promo, onboarding, báo cáo doanh nghiệp |
| `kids-playful` | 132 | F major | Thiếu nhi, hoạt hình, học tập vui |
| `tech-minimal` | 90 | C major | SaaS demo, thông báo, UI sound |
| `cinematic-trailer` | 100 | D minor | Launch, teaser, sự kiện lớn |
| `documentary-bed` | 78 | E minor | Phóng sự, câu chuyện thương hiệu |
| `ad-pop` | 122 | G major | Quảng cáo 15-30s, CTA mạnh |
| `ambient-focus` | 70 | C major | Nền giải thích, khóa học |
| `lofi-study` | 76 | A minor | Social, thư giãn, nội dung dài |
| `news-bed` | 96 | C major | Bản tin, podcast tin tức |
| `podcast-jazz` | 88 | F major | Intro/outro podcast |
| `acoustic-uplift` | 96 | G major | Brand ấm, câu chuyện người thật |
| `chiptune` | 140 | C major | Game, retro |
| `synthwave` | 108 | A minor | Công nghệ, hoài niệm 80s |
| `minimal-click` | 120 | C major | SFX/UI ngắn, chuyển cảnh |
| `data-pulse` | 120 | C major | Báo cáo KPI, sonification |
| `corporate-hiphop` | 92 | A minor | Social trẻ, năng lượng |

Danh sách đóng. Thêm style cần CEO/CTO duyệt.

## Cấu trúc

```text
SKILL.md              hướng dẫn cho agent
scripts/doctor.sh      kiểm môi trường, không tải gì
scripts/setup-tools.mjs tải ffmpeg 7 + libasound vào .tools/ (một lần)
scripts/render.sh     render → loudnorm 2-pass → QA
scripts/render.mjs    engine Tone.Offline, seed, WAV
scripts/loudnorm.mjs  loudnorm 2-pass + MP3
scripts/qa.mjs        ebur128/loudnorm, true peak, clipping, silence
styles/<slug>.js      contract: id/name/.../bpm/key/bars/render(tone, timeline)
demo/<slug>/          project mẫu 10s + TREATMENT.md
tests/selfcheck.mjs   assert contract + render ngắn
```

## Biến môi trường

| Biến | Mặc định | Ý nghĩa |
|---|---|---|
| `AUDIO_STUDIO_BIN` | `$PWD/.tools/bin` | Thư mục chứa ffmpeg/ffprobe |
| `SEED` | `20261116` | Seed PRNG; cùng seed ⇒ cùng sha256 |

## QA gate

Duration lệch ≤ 0.25s; true peak ≤ −1.0 dBTP; 0 clipping; −16…−12 LUFS; không lặng > 1s; 48 kHz stereo ≥ 16-bit. FAIL ⇒ exit 1.

## License

Internal project. Không dùng sample/asset ngoài; không dùng edge-tts/Coqui cho thương mại.
