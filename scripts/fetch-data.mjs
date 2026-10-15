// ดึงข้อมูลจาก Google Sheet (ผ่าน Apps Script) → data/site.json + รูปย่อใน public/media + public/resume.pdf
// รันอัตโนมัติก่อน `next build` (npm run build)
//
// - ถ้า site.config.json ยังไม่มี gasUrl → ใช้ data/site.json ที่มีอยู่ (ข้อมูลตัวอย่าง)
// - ถ้ามี gasUrl แต่ดึงไม่สำเร็จ → หยุด build (เว็บเดิมบน GitHub Pages ยังอยู่ ไม่ถูกทับด้วยข้อมูลผิด)

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { normalize } from './normalize.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const cfg = JSON.parse(await fs.readFile(path.join(root, 'site.config.json'), 'utf8'));
const dataFile = path.join(root, 'data', 'site.json');
const mediaDir = path.join(root, 'public', 'media');
const resumeFile = path.join(root, 'public', 'resume.pdf');

if (!cfg.gasUrl) {
  console.warn('[fetch-data] ยังไม่ได้ตั้ง gasUrl ใน site.config.json → ใช้ data/site.json เดิม (ข้อมูลตัวอย่าง)');
  process.exit(0);
}

async function getJson(url) {
  const res = await fetch(url, { redirect: 'follow' });
  if (!res.ok) throw new Error(`HTTP ${res.status} จาก ${url.split('?')[0]}`);
  const text = await res.text();
  let json;
  try { json = JSON.parse(text); } catch { throw new Error('Apps Script ไม่ได้ตอบเป็น JSON — ตรวจว่า deploy เป็นเว็บแอป สิทธิ์ "ทุกคน" แล้ว'); }
  if (!json.ok) throw new Error('Apps Script ตอบ error: ' + json.error);
  return json;
}

const raw = await getJson(`${cfg.gasUrl}?action=site`);
console.log(`[fetch-data] ได้ข้อมูล ${raw.projects.length} ผลงาน, ${raw.skills.length} ทักษะ`);

// รูปภาพ: ดาวน์โหลดจาก Drive ผ่าน Apps Script แล้วย่อเป็น WebP กว้างไม่เกิน 1600px
await fs.rm(mediaDir, { recursive: true, force: true });
await fs.mkdir(mediaDir, { recursive: true });
const ids = new Set();
raw.projects.forEach((p) => p.cover_image_id && ids.add(String(p.cover_image_id).trim()));
raw.images.forEach((i) => i.drive_file_id && ids.add(String(i.drive_file_id).trim()));
const photoId = String(raw.profile.photo_drive_id || '').trim();
if (photoId) ids.add(photoId);

let sharp = null;
try { sharp = (await import('sharp')).default; } catch { console.warn('[fetch-data] ไม่มี sharp → เก็บรูปขนาดเดิม'); }

const media = {};
for (const id of ids) {
  const f = await getJson(`${cfg.gasUrl}?action=file&id=${encodeURIComponent(id)}`);
  if (!/^image\//.test(f.mime)) { console.warn(`[fetch-data] ข้าม ${f.name}: ไม่ใช่ไฟล์รูป (${f.mime})`); continue; }
  const buf = Buffer.from(f.b64, 'base64');
  const safe = id.replace(/[^A-Za-z0-9_-]/g, '');
  if (sharp && f.mime !== 'image/gif' && f.mime !== 'image/svg+xml') {
    const size = id === photoId ? { width: 800, height: 800, fit: 'cover' } : { width: 1600 }; // รูปโปรไฟล์ครอปเป็นสี่เหลี่ยมจัตุรัส
    await sharp(buf).rotate().resize({ ...size, withoutEnlargement: true }).webp({ quality: 82 }).toFile(path.join(mediaDir, `${safe}.webp`));
    media[id] = `/media/${safe}.webp`;
  } else {
    const ext = { 'image/png': 'png', 'image/gif': 'gif', 'image/svg+xml': 'svg', 'image/webp': 'webp' }[f.mime] || 'jpg';
    await fs.writeFile(path.join(mediaDir, `${safe}.${ext}`), buf);
    media[id] = `/media/${safe}.${ext}`;
  }
  console.log(`[fetch-data] รูป ${f.name} → ${media[id]}`);
}

// Resume PDF
let resumeUrl = null;
await fs.rm(resumeFile, { force: true });
const rid = String(raw.settings.resume_drive_id || '').trim();
if (rid) {
  const f = await getJson(`${cfg.gasUrl}?action=file&id=${encodeURIComponent(rid)}`);
  await fs.writeFile(resumeFile, Buffer.from(f.b64, 'base64'));
  resumeUrl = '/resume.pdf';
  console.log('[fetch-data] Resume → /resume.pdf');
}

const site = normalize(raw, { siteUrl: cfg.siteUrl, contactEndpoint: cfg.gasUrl, media, resumeUrl, source: 'sheet' });
await fs.writeFile(dataFile, JSON.stringify(site, null, 2) + '\n');
console.log('[fetch-data] เขียน data/site.json แล้ว');
