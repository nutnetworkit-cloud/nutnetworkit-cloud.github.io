import type { Metadata } from 'next';
import Heading from '@/components/Heading';
import ProjectGrid from '@/components/ProjectGrid';
import { CATEGORIES, projects } from '@/lib/data';

export const metadata: Metadata = { title: 'ผลงาน' };

export default function ProjectsPage() {
  const extra = [...new Set(projects.map((p) => p.category))].filter((c) => !CATEGORIES.includes(c));
  return (
    <>
      <section className="page-h">
        <Heading light="My" bold="Projects" />
        <p className="lede">ระบบที่ออกแบบ พัฒนา และใช้งานจริงในองค์กร แต่ละชิ้นเล่าว่าเริ่มจากปัญหาอะไร รับผิดชอบส่วนไหน และได้ผลลัพธ์อะไร</p>
      </section>
      <ProjectGrid projects={projects} categories={[...CATEGORIES, ...extra]} />
    </>
  );
}
