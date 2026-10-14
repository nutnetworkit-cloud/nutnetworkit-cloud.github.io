// สร้าง data/site.json ตัวอย่างจากข้อมูล SEED ใน apps-script/Code.gs (ใช้ตอนยังไม่ได้เชื่อม Sheet)
// รัน: node scripts/make-sample.mjs apps-script/Code.gs

import fs from 'node:fs/promises';
import vm from 'node:vm';
import { normalize } from './normalize.mjs';

const src = await fs.readFile(process.argv[2] || 'apps-script/Code.gs', 'utf8');
const ctx = {};
vm.runInNewContext(src + '\nthis.SEED = SEED; this.SHEETS = SHEETS;', ctx);
const { SEED, SHEETS } = ctx;

const kv = (o) => Object.fromEntries(Object.entries(o).map(([k, v]) => [k, v[0]]));
const projects = SEED.projects
  .filter((p) => p.status === 'published')
  .map((p) => Object.fromEntries(SHEETS.projects.map((c) => [c, Array.isArray(p[c]) ? p[c].join(c === 'tech' ? ', ' : '\n') : p[c] ?? ''])));

const raw = {
  generatedAt: new Date().toISOString(),
  profile: kv(SEED.profile),
  settings: kv(SEED.settings),
  projects,
  images: [],
  skills: SEED.skills.map(([name, category]) => ({ name, category })),
  experiences: SEED.experiences
};
const cfg = JSON.parse(await fs.readFile('site.config.json', 'utf8'));
const site = normalize(raw, { siteUrl: cfg.siteUrl, contactEndpoint: cfg.gasUrl || '', media: {}, resumeUrl: null, source: 'sample' });
await fs.writeFile('data/site.json', JSON.stringify(site, null, 2) + '\n');
console.log(`data/site.json: ${site.projects.length} ผลงาน (ตัวอย่าง)`);
