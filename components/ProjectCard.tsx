import Link from 'next/link';
import { period } from '@/lib/data';
import type { Project } from '@/lib/types';

// แถวผลงานแบบ case study: ชื่อ + สรุป | ประเภท + เทคโนโลยี | ผลลัพธ์เด่น
export default function ProjectCard({ project: p }: { project: Project }) {
  const when = period(p);
  return (
    <Link href={`/projects/${p.slug}/`} className="row">
      <div className="row-main">
        <h3>{p.title}</h3>
        <p>{p.summary}</p>
      </div>
      <div className="row-info">
        <span className="meta">
          {p.category}
          {when && ` · ${when}`}
        </span>
        <span className="tech">{p.tech.slice(0, 4).join(' · ')}</span>
      </div>
      <div className="row-metric">
        {p.metric.value && (
          <>
            <b>{p.metric.value}</b>
            <span>{p.metric.label}</span>
          </>
        )}
      </div>
      <span className="arrow" aria-hidden="true">
        ↗
      </span>
      {p.cover && (
        <div className="row-thumb">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={p.cover} alt="" loading="lazy" />
        </div>
      )}
    </Link>
  );
}
