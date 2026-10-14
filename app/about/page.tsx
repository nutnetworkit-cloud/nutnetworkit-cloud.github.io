import type { Metadata } from 'next';
import Skills from '@/components/Skills';
import { paragraphs, site } from '@/lib/data';

export const metadata: Metadata = { title: 'เกี่ยวกับ' };

export default function AboutPage() {
  const { profile } = site;
  const edu = site.experiences.filter((e) => e.type === 'edu');
  return (
    <>
      <section className="page-h">
        <p className="meta">เกี่ยวกับ</p>
        <h1>{profile.name}</h1>
        <p className="lede">
          {profile.title} · {profile.location}
        </p>
      </section>

      <section className="cols">
        <h2>ประวัติ</h2>
        <div className="prose">
          {paragraphs(profile.bio).map((t) => (
            <p key={t}>{t}</p>
          ))}
        </div>
      </section>

      {profile.goal && (
        <section className="cols">
          <h2>เป้าหมาย</h2>
          <div className="prose">
            <p>{profile.goal}</p>
          </div>
        </section>
      )}

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
