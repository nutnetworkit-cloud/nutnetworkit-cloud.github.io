import type { Metadata } from 'next';
import { site } from '@/lib/data';
import type { Experience } from '@/lib/types';

export const metadata: Metadata = { title: 'ประสบการณ์' };

function Timeline({ list }: { list: Experience[] }) {
  if (!list.length) return <p className="muted">ยังไม่ได้เพิ่ม</p>;
  return (
    <ul className="tl">
      {list.map((e) => (
        <li key={e.organization + e.position + e.start}>
          <span className="meta">
            {e.start} – {e.end}
          </span>
          <div>
            <h3>{e.position}</h3>
            <p style={{ color: 'var(--fg)', marginTop: 0 }}>{e.organization}</p>
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
        <p className="meta">ประสบการณ์</p>
        <h1>การทำงานและการศึกษา</h1>
      </section>
      <section className="cols">
        <h2>การทำงาน</h2>
        <Timeline list={site.experiences.filter((e) => e.type === 'work')} />
      </section>
      <section className="cols">
        <h2>การศึกษา</h2>
        <Timeline list={site.experiences.filter((e) => e.type === 'edu')} />
      </section>
    </>
  );
}
