#!/usr/bin/env node
// Chuẩn bị công cụ render một lần: tải ffmpeg 7 static + libasound shim vào .tools/.
// Chỉ chạy khi người dùng gọi trực tiếp; doctor.sh và skill import không cần script này.
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const binDir = path.join(ROOT, '.tools', 'bin');
const libDir = path.join(ROOT, '.tools', 'lib');
fs.mkdirSync(binDir, { recursive: true });
fs.mkdirSync(libDir, { recursive: true });

function ffmpegOk() {
  try {
    const out = execFileSync('ffmpeg', ['-version'], { encoding: 'utf8' });
    const m = out.match(/version (\d+)/);
    return m && Number(m[1]) >= 7;
  } catch {
    return false;
  }
}

if (!ffmpegOk()) {
  const url = 'https://johnvansickle.com/ffmpeg/releases/ffmpeg-release-amd64-static.tar.xz';
  const tar = path.join(ROOT, '.tools', 'ffmpeg.tar.xz');
  console.error(`downloading ffmpeg static from ${url}`);
  execFileSync('curl', ['-fsSL', url, '-o', tar]);
  fs.rmSync(path.join(ROOT, '.tools', 'ffmpeg'), { recursive: true, force: true });
  fs.mkdirSync(path.join(ROOT, '.tools', 'ffmpeg'), { recursive: true });
  const { execSync } = await import('node:child_process'); // tar xz: bun qua curl|tar, không eval nội dung
  execSync(`tar -xJf ${JSON.stringify(tar)} -C ${JSON.stringify(path.join(ROOT, '.tools', 'ffmpeg'))}`);
  fs.rmSync(tar);
  const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(d, e.name);
    return e.isDirectory() ? walk(p) : [p];
  });
  const ffmpeg = walk(path.join(ROOT, '.tools', 'ffmpeg')).find((p) => p.endsWith('/ffmpeg'));
  const ffprobe = walk(path.join(ROOT, '.tools', 'ffmpeg')).find((p) => p.endsWith('/ffprobe'));
  fs.symlinkSync(ffmpeg, path.join(binDir, 'ffmpeg'));
  fs.symlinkSync(ffprobe, path.join(binDir, 'ffprobe'));
}

{
  try {
    const probe = execFileSync(process.execPath, ['--input-type=module', '-e', "import('node-web-audio-api')"], {
      cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'ignore', 'pipe'],
    });
  } catch {
    const url = 'https://deb.debian.org/debian/pool/main/a/alsa-lib/libasound2_1.2.8-1+b1_amd64.deb';
    const deb = path.join(ROOT, '.tools', 'libasound.deb');
    console.error(`downloading libasound shim from ${url}`);
    execFileSync('curl', ['-fsSL', url, '-o', deb]);
    const { execSync } = await import('node:child_process');
    // .deb = ar archive chứa data.tar.xz; bung rồi chép libasound.so.2
    const extractDir = path.join(ROOT, '.tools', 'libasound');
    fs.rmSync(extractDir, { recursive: true, force: true });
    fs.mkdirSync(extractDir, { recursive: true });
    execSync(`ar x ${JSON.stringify(deb)} --output ${JSON.stringify(extractDir)} || (cd ${JSON.stringify(extractDir)} && ar x ${JSON.stringify(deb)})`, { shell: '/bin/sh' });
    const dataTar = path.join(extractDir, 'data.tar.xz');
    execSync(`tar -xJf ${JSON.stringify(dataTar)} -C ${JSON.stringify(extractDir)}`);
    const so = (function walk(d) {
      return fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => {
        const p = path.join(d, e.name);
        return e.isDirectory() ? walk(p) : [p];
      });
    })(extractDir).find((p) => p.endsWith('libasound.so.2.0.0'));
    fs.copyFileSync(so, path.join(libDir, 'libasound.so.2'));
    fs.rmSync(deb);
    fs.rmSync(extractDir, { recursive: true, force: true });
  }
}
console.log('setup-tools: done (.tools/bin, .tools/lib)');
