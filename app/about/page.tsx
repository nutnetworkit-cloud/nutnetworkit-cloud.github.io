import type { Metadata } from 'next';
import Heading from '@/components/Heading';
import Skills from '@/components/Skills';
import { paragraphs, site } from '@/lib/data';
import Avatar from '@/components/Avatar';

export const metadata: Metadata = { title: 'เกี่ยวกับ' };

export default function AboutPage() {
  const { profile } = site;
  const edu = site.experiences.filter((e) => e.type === 'edu');
  return (
    <>
      <section className={`page-h${profile.photo ? ' has-photo' : ''}`}>
        {profile.photo && <Avatar src={profile.photo} alt={profile.name} lg />}
        <div className="page-h-text">
          <Heading light="About" bold={profile.name} />
          <p className="lede">
            {profile.title} · {profile.location}
          </p>
        </div>
      </section>

      <section className="panel">
        <div className="prose">
          {paragraphs(profile.bio).map((t) => (
            <p key={t}>{t}</p>
          ))}
        </div>
      </section>

      {profile.goal && (
        <section className="cols2">
          <h2 className="sec-title">Career Goal</h2>
          <div className="prose">
            <p>{profile.goal}</p>
          </div>
        </section>
      )}

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
