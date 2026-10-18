import type { Metadata } from 'next';
import Heading from '@/components/Heading';
import Skills from '@/components/Skills';
import { projects, site } from '@/lib/data';
import Avatar from '@/components/Avatar';

export const metadata: Metadata = { title: 'Resume' };

export default function ResumePage() {
  const { profile, settings } = site;
  const work = site.experiences.filter((e) => e.type === 'work');
  const edu = site.experiences.filter((e) => e.type === 'edu');
  return (
    <>
      <section className={`page-h${profile.photo ? ' has-photo' : ''}`}>
        {profile.photo && <Avatar src={profile.photo} alt={profile.name} lg />}
        <div className="page-h-text">
          <Heading light="Resume" bold={profile.name} />
          <p className="lede">{[profile.title, profile.location, profile.email, profile.phone].filter(Boolean).join(' · ')}</p>
          {settings.resumeUrl && (
            <div>
              <a className="btn" href={settings.resumeUrl} download>
                Download PDF <span className="arrow">↓</span>
              </a>
            </div>
          )}
        </div>
      </section>

      <section className="panel">
        <div className="prose">
          <p>{profile.tagline}</p>
        </div>
      </section>

      <section className="works">
        <h2 className="sec-title">Experience</h2>
        <ul className="tl">
          {work.map((e) => (
            <li key={e.organization + e.position}>
              <span className="yr">
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

      <section className="works">
        <h2 className="sec-title">Selected Projects</h2>
        <ul className="tl">
          {projects.slice(0, 5).map((p) => (
            <li key={p.id}>
              <span className="yr" style={{ fontSize: 15 }}>
                {p.category}
              </span>
              <div>
                <h3>{p.title}</h3>
                <p>{p.summary}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="works">
        <h2 className="sec-title">Skills</h2>
        <Skills />
      </section>

      <section className="works">
        <h2 className="sec-title">Education</h2>
        <ul className="tl">
          {edu.map((e) => (
            <li key={e.organization + e.position}>
              <span className="yr">
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
