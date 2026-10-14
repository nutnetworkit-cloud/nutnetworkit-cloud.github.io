'use client';

import { useState } from 'react';
import type { Project } from '@/lib/types';
import ProjectCard from './ProjectCard';

export default function ProjectGrid({ projects, categories }: { projects: Project[]; categories: string[] }) {
  const [filter, setFilter] = useState('All');
  const cats = ['All', ...categories.filter((c) => projects.some((p) => p.category === c))];
  const list = filter === 'All' ? projects : projects.filter((p) => p.category === filter);
  const count = (c: string) => (c === 'All' ? projects.length : projects.filter((p) => p.category === c).length);

  return (
    <section>
      <div className="filters caps" role="group" aria-label="กรองตามประเภท">
        {cats.map((c) => (
          <button key={c} type="button" className={c === filter ? 'on' : ''} aria-pressed={c === filter} onClick={() => setFilter(c)}>
            {c}
            <sup>{count(c)}</sup>
          </button>
        ))}
      </div>
      <div className="plist">
        {list.map((p, i) => (
          <ProjectCard key={p.id} project={p} index={i} />
        ))}
      </div>
    </section>
  );
}
