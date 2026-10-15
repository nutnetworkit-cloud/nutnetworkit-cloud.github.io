import Link from 'next/link';
import type { Project } from '@/lib/types';
import TileShow from './TileShow';

const TONES = ['', 'light', 'mid'] as const;

// ภาพของผลงาน: ถ้ามีรูปจริงใช้รูป ถ้าไม่มีเป็นบล็อกตัวอักษร (สีสลับตาม tone)
export default function Tile({ project: p, tone = 0, href, className = '' }: { project: Project; tone?: number; href?: string; className?: string }) {
  const cls = `tile ${p.cover ? 'has-img' : TONES[tone % TONES.length]} ${className}`;
  const body = (
    <>
      {p.cover && <TileShow srcs={[p.cover, ...p.images.map((m) => m.src)]} alt={p.title} />}
      <div className="tile-body">
        <div>
          <div className="tile-cat">{p.category}</div>
          <div className="tile-title">{p.title}</div>
        </div>
        {p.metric.value && <div className="tile-metric">{p.metric.value}</div>}
      </div>
    </>
  );
  return href ? (
    <Link href={href} className={cls}>
      {body}
    </Link>
  ) : (
    <div className={cls}>{body}</div>
  );
}
