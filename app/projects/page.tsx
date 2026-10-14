import type { Metadata } from 'next';
import ProjectGrid from '@/components/ProjectGrid';
import { CATEGORIES, projects } from '@/lib/data';

export const metadata: Metadata = { title: 'ผลงาน' };

export default function ProjectsPage() {
  const extra = [...new Set(projects.map((p) => p.category))].filter((c) => !CATEGORIES.includes(c));
  return (
    <>
      <section className="page-h">
        <p className="meta">ผลงาน</p>
        <h1>ระบบที่ออกแบบ พัฒนา และใช้งานจริง</h1>
        <p className="lede">แต่ละชิ้นเล่าว่าเริ่มจากปัญหาอะไร รับผิดชอบส่วนไหน ทำอย่างไร และได้ผลลัพธ์อะไร</p>
      </section>
      <ProjectGrid projects={projects} categories={[...CATEGORIES, ...extra]} />
    </>
  );
}
