import type { Metadata } from 'next';
import Heading from '@/components/Heading';
import { site } from '@/lib/data';
import type { Experience } from '@/lib/types';

export const metadata: Metadata = { title: 'ประสบการณ์' };

function Timeline({ list }: { list: Experience[] }) {
  if (!list.length) return <p className="muted">ยังไม่ได้เพิ่ม</p>;
  return (
    <ul className="tl">
      {list.map((e) => (
        <li key={e.organization + e.position + e.start}>
          <span className="yr">
            {e.start} – {e.end}
          </span>
          <div>
            <h3>{e.position}</h3>
            <p style={{ color: 'var(--ink)' }}>{e.organization}</p>
            {e.description && <p>{e.description}</p>}
          </div>
        </li>
      ))}
    </ul>
  );
}

export default function ExperiencePage() {
  return (
    <>
      <section className="page-h">
        <Heading light="Work &" bold="Experience" />
      </section>
      <section className="works">
        <h2 className="sec-title">การทำงาน</h2>
        <Timeline list={site.experiences.filter((e) => e.type === 'work')} />
      </section>
      <section className="works">
        <h2 className="sec-title">การศึกษา</h2>
        <Timeline list={site.experiences.filter((e) => e.type === 'edu')} />
      </section>
    </>
  );
}
