import type { Metadata } from 'next';
import { site } from '@/lib/data';
import type { Experience } from '@/lib/types';

export const metadata: Metadata = { title: 'ประสบการณ์' };

function Timeline({ list }: { list: Experience[] }) {
  if (!list.length) return <p className="muted">ยังไม่ได้เพิ่ม</p>;
  return (
    <div className="tl">
      {list.map((e) => (
        <div className="tl-i" key={e.organization + e.position + e.start}>
          <span className="label">
            {e.start} – {e.end}
          </span>
          <h3>{e.position}</h3>
          <b className="muted" style={{ fontWeight: 500 }}>
            {e.organization}
          </b>
          {e.description && <p>{e.description}</p>}
        </div>
      ))}
    </div>
  );
}

export default function ExperiencePage() {
  return (
    <>
      <section className="page-h">
        <span className="label">ประสบการณ์</span>
        <h1>ประสบการณ์และการศึกษา</h1>
      </section>
      <section className="two">
        <div className="col">
          <h2 style={{ fontSize: 20 }}>การทำงาน</h2>
          <Timeline list={site.experiences.filter((e) => e.type === 'work')} />
        </div>
        <div className="col">
          <h2 style={{ fontSize: 20 }}>การศึกษา</h2>
          <Timeline list={site.experiences.filter((e) => e.type === 'edu')} />
        </div>
      </section>
    </>
  );
}
