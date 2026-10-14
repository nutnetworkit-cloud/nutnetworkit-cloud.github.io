import Link from 'next/link';
import { period } from '@/lib/data';
import type { Project } from '@/lib/types';
import Tile from './Tile';

// แถวผลงาน: ภาพ (หรือบล็อกตัวอักษร) + การ์ดพื้นเทา สลับซ้ายขวาทีละแถว
export default function ProjectCard({ project: p, index = 0 }: { project: Project; index?: number }) {
  const when = period(p);
  return (
    <Link href={`/projects/${p.slug}/`} className="prow">
      <Tile project={p} tone={index} />
      <div className="pcard">
        <span className="tile-cat">
          {p.category}
          {when && ` · ${when}`}
        </span>
        <h3>{p.title}</h3>
        <p>{p.summary}</p>
        {p.metric.value && (
          <div className="pm">
            <b>{p.metric.value}</b>
            <span>{p.metric.label}</span>
          </div>
        )}
        <span className="link-caps">
          Read more <span className="arrow">→</span>
        </span>
      </div>
    </Link>
  );
}
