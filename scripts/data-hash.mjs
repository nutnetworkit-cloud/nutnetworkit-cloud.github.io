// พิมพ์ hash ของข้อมูลใน Google Sheet (ไม่นับ generatedAt) — ใช้เช็กว่าข้อมูลเปลี่ยนหรือยัง
//   node scripts/data-hash.mjs          → hash ของข้อมูลปัจจุบันใน Sheet
// GitHub Actions เทียบกับ <siteUrl>/data-hash.txt ของเว็บที่ขึ้นอยู่ ถ้าไม่ตรงจึงสร้างเว็บใหม่

import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const cfg = JSON.parse(await fs.readFile(path.join(root, 'site.config.json'), 'utf8'));
if (!cfg.gasUrl) {
  console.log('no-gas-url');
  process.exit(0);
}

const res = await fetch(`${cfg.gasUrl}?action=site`, { redirect: 'follow' });
const json = await res.json();
if (!json.ok) throw new Error('Apps Script ตอบ error: ' + json.error);
delete json.generatedAt;
console.log(crypto.createHash('sha256').update(JSON.stringify(json)).digest('hex'));
