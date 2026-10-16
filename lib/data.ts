import raw from '@/data/site.json';
import type { Project, Site } from './types';

// data/site.json ถูกสร้างโดย scripts/fetch-data.mjs ตอน build (มีเฉพาะผลงานที่ status = published)
export const site = raw as unknown as Site;

export const CATEGORIES = ['LINE LIFF', 'Web App', 'AI & Automation', 'Data', 'UI/UX'];
// ลำดับหมวดทักษะ: ตั้งได้ในหน้า admin (settings.skill_categories) · ยังไม่ตั้ง = ค่าเริ่มต้นชุดนี้
const DEFAULT_SKILL_CATS = ['ภาษาและ Frontend', 'Backend และแพลตฟอร์ม', 'เครื่องมือและข้อมูล', 'การวิเคราะห์และออกแบบระบบ', 'IT Infrastructure', 'ใบรับรองและการอบรม'];
export const SKILL_CATS: string[] = site.settings.skillCats?.length ? site.settings.skillCats : DEFAULT_SKILL_CATS;

export const projects: Project[] = site.projects;
export const featured = projects.filter((p) => p.featured);
export const getProject = (slug: string) => projects.find((p) => p.slug === slug);

const TH_M = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
const month = (m: string) => {
  const r = /^(\d{4})-(\d{2})$/.exec(m);
  return r ? `${TH_M[Number(r[2]) - 1]} ${r[1]}` : m;
};

export function period(p: Pick<Project, 'start' | 'end'>) {
  if (p.start && p.end) return p.start === p.end ? month(p.start) : `${month(p.start)} – ${month(p.end)}`;
  if (p.start) return `${month(p.start)} – ปัจจุบัน`;
  if (p.end) return `เสร็จ ${month(p.end)}`;
  return '';
}

export const isLink = (u: string) => /^https?:\/\//.test(u);
export const paragraphs = (s: string) => s.split(/\r?\n/).map((x) => x.trim()).filter(Boolean);

export function monogram(name: string) {
  const n = name.trim();
  if (!n || n.startsWith('[')) return '</>';
  return n.split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase();
}
