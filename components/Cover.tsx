import type { Project } from '@/lib/types';

// แสดงเฉพาะรูปจริงจาก Drive — ถ้ายังไม่มีรูป จะไม่แสดงอะไร (ไม่ใช้ภาพประกอบปลอม)
export default function Cover({ project, className = '' }: { project: Project; className?: string }) {
  if (!project.cover) return null;
  return (
    <div className={className}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={project.cover} alt={project.title} />
    </div>
  );
}
