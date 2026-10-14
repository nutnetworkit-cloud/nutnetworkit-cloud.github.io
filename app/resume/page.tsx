import type { Metadata } from 'next';
import { projects, site } from '@/lib/data';

export const metadata: Metadata = { title: 'Resume' };

export default function ResumePage() {
  const { profile, settings } = site;
  const work = site.experiences.filter((e) => e.type === 'work');
  const edu = site.experiences.filter((e) => e.type === 'edu');
  return (
    <>
      <section className="page-h">
        <span className="label">Resume</span>
        <h1>Resume / CV</h1>
        {settings.resumeUrl && (
          <div className="ctas" style={{ marginTop: 6 }}>
            <a className="btn pri" href={settings.resumeUrl} download>
              ดาวน์โหลด PDF
            </a>
          </div>
        )}
      </section>
      <article className="sheet">
        <header>
          <h1 style={{ fontSize: 30 }}>{profile.name}</h1>
          <p className="muted">
            {profile.title} · {profile.location} · {profile.email}
          </p>
        </header>
        <section>
          <h2>สรุป</h2>
          <p>{profile.tagline}</p>
        </section>
        <section>
          <h2>ประสบการณ์ทำงาน</h2>
          {work.map((e) => (
            <div className="sheet-row" key={e.organization + e.position}>
              <span>
                {e.start} – {e.end}
              </span>
              <div>
                <b>{e.position}</b>, {e.organization}
                {e.description && <p className="muted">{e.description}</p>}
              </div>
            </div>
          ))}
        </section>
        <section>
          <h2>ผลงานที่เลือก</h2>
          {projects.slice(0, 4).map((p) => (
            <div className="sheet-row" key={p.id}>
              <span>{p.category}</span>
              <div>
                <b>{p.title}</b>
                <p className="muted">{p.summary}</p>
              </div>
            </div>
          ))}
        </section>
        <section>
          <h2>การศึกษา</h2>
          {edu.map((e) => (
            <div className="sheet-row" key={e.organization + e.position}>
              <span>
                {e.start} – {e.end}
              </span>
              <div>
                <b>{e.organization}</b>
                <p className="muted">{e.position}</p>
              </div>
            </div>
          ))}
        </section>
        <section>
          <h2>ทักษะ</h2>
          <div className="tags" style={{ paddingTop: 0 }}>
            {site.skills.map((s) => (
              <span className="tag" key={s.name}>
                {s.name}
              </span>
            ))}
          </div>
        </section>
      </article>
    </>
  );
}
