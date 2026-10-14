import Link from 'next/link';
import type { Project } from '@/lib/types';

const TONES = ['', 'light', 'mid'] as const;

// ภาพของผลงาน: ถ้ามีรูปจริงใช้รูป ถ้าไม่มีเป็นบล็อกตัวอักษร (สีสลับตาม tone)
export default function Tile({ project: p, tone = 0, href, className = '' }: { project: Project; tone?: number; href?: string; className?: string }) {
  const cls = `tile ${p.cover ? 'has-img' : TONES[tone % TONES.length]} ${className}`;
  const body = (
    <>
      {p.cover && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={p.cover} alt={p.title} loading="lazy" />
      )}
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
