import type { Metadata } from 'next';
import Skills from '@/components/Skills';
import { projects, site } from '@/lib/data';

export const metadata: Metadata = { title: 'Resume' };

export default function ResumePage() {
  const { profile, settings } = site;
  const work = site.experiences.filter((e) => e.type === 'work');
  const edu = site.experiences.filter((e) => e.type === 'edu');
  return (
    <>
      <section className="page-h">
        <p className="meta">Resume</p>
        <h1>{profile.name}</h1>
        <p className="lede">
          {profile.title} · {profile.location} · {profile.email}
        </p>
        {settings.resumeUrl && (
          <div className="resume-actions">
            <a className="btn" href={settings.resumeUrl} download>
              ดาวน์โหลด PDF <span aria-hidden="true">↓</span>
            </a>
          </div>
        )}
      </section>

      <section className="cols" style={{ borderTopColor: 'var(--fg)' }}>
        <h2>สรุป</h2>
        <div className="prose">
          <p>{profile.tagline}</p>
        </div>
      </section>
      <section className="cols">
        <h2>ประสบการณ์ทำงาน</h2>
        <ul className="tl">
          {work.map((e) => (
            <li key={e.organization + e.position}>
              <span className="meta">
                {e.start} – {e.end}
              </span>
              <div>
                <h3>
                  {e.position}, {e.organization}
                </h3>
                {e.description && <p>{e.description}</p>}
              </div>
            </li>
          ))}
        </ul>
      </section>
      <section className="cols">
        <h2>ผลงานที่เลือก</h2>
        <ul className="tl">
          {projects.slice(0, 5).map((p) => (
            <li key={p.id}>
              <span className="meta">{p.category}</span>
              <div>
                <h3>{p.title}</h3>
                <p>{p.summary}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>
      <section className="cols">
        <h2>ทักษะ</h2>
        <Skills />
      </section>
      <section className="cols">
        <h2>การศึกษา</h2>
        <ul className="tl">
          {edu.map((e) => (
            <li key={e.organization + e.position}>
              <span className="meta">
                {e.start} – {e.end}
              </span>
              <div>
                <h3>{e.organization}</h3>
                <p>{e.position}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
