'use client';

import { useState } from 'react';
import type { Project } from '@/lib/types';
import ProjectCard from './ProjectCard';

export default function ProjectGrid({ projects, categories }: { projects: Project[]; categories: string[] }) {
  const [filter, setFilter] = useState('ทั้งหมด');
  const cats = ['ทั้งหมด', ...categories.filter((c) => projects.some((p) => p.category === c))];
  const list = filter === 'ทั้งหมด' ? projects : projects.filter((p) => p.category === filter);
  const count = (c: string) => (c === 'ทั้งหมด' ? projects.length : projects.filter((p) => p.category === c).length);

  return (
    <section className="stack">
      <div className="chips" role="group" aria-label="กรองตามประเภท">
        {cats.map((c) => (
          <button key={c} type="button" className={`chip ${c === filter ? 'on' : ''}`} aria-pressed={c === filter} onClick={() => setFilter(c)}>
            {c}
            <b>{count(c)}</b>
          </button>
        ))}
      </div>
      <div className="grid">
        {list.map((p) => (
          <ProjectCard key={p.id} project={p} />
        ))}
      </div>
    </section>
  );
}
