import type { Metadata } from 'next';
import ProjectGrid from '@/components/ProjectGrid';
import { CATEGORIES, projects } from '@/lib/data';

export const metadata: Metadata = { title: 'ผลงาน' };

export default function ProjectsPage() {
  const extra = [...new Set(projects.map((p) => p.category))].filter((c) => !CATEGORIES.includes(c));
  return (
    <>
      <section className="page-h">
        <span className="label">ผลงาน</span>
        <h1>ผลงานทั้งหมด</h1>
        <p className="lede">ระบบที่พัฒนาและใช้งานจริงในองค์กร กดแต่ละผลงานเพื่อดูปัญหา บทบาท ขั้นตอน และผลลัพธ์</p>
      </section>
      <ProjectGrid projects={projects} categories={[...CATEGORIES, ...extra]} />
    </>
  );
}
