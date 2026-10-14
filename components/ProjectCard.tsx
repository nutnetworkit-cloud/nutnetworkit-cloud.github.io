import Link from 'next/link';
import type { Project } from '@/lib/types';
import Cover from './Cover';

export default function ProjectCard({ project: p }: { project: Project }) {
  return (
    <Link href={`/projects/${p.slug}/`} className="card">
      <Cover project={p} />
      <div className="card-b">
        <span className="label">{p.category}</span>
        <h3>{p.title}</h3>
        <p>{p.summary}</p>
        {p.metric.value && (
          <div className="metric">
            <b>{p.metric.value}</b>
            <span>{p.metric.label}</span>
          </div>
        )}
        <div className="tags">
          {p.tech.slice(0, 4).map((t) => (
            <span className="tag" key={t}>
              {t}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}
