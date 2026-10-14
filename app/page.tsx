import Link from 'next/link';
import ContactBlock from '@/components/ContactBlock';
import HeroSlider from '@/components/HeroSlider';
import Tile from '@/components/Tile';
import { featured, paragraphs, projects, SKILL_CATS, site } from '@/lib/data';

export default function Home() {
  const { profile } = site;
  const heroProjects = featured.length ? featured : projects.slice(0, 3);
  const mosaic = [...heroProjects, ...projects.filter((p) => !heroProjects.includes(p))].slice(0, 5);
  const firstBio = paragraphs(profile.bio)[0] ?? '';
  const focus = SKILL_CATS.map((c) => ({ cat: c, skills: site.skills.filter((s) => s.category === c).map((s) => s.name) })).filter((f) => f.skills.length);

  return (
    <>
      <HeroSlider title={profile.title} name={profile.name} tagline={profile.tagline} available={profile.available} projects={heroProjects} />

      <section className="about">
        <div className="collage" aria-hidden="true">
          <div className="stat s1">
            <b>{projects.length}</b>
            <span>ระบบที่ออกแบบและส่งมอบ</span>
          </div>
          <div className="stat s2">
            <b>1,049</b>
            <span>เคสบริการที่วิเคราะห์</span>
          </div>
          <div className="stat s3">
            <b>24→69%</b>
            <span>เคสที่บอทปิดเองได้ (ประเมิน)</span>
          </div>
        </div>
        <div className="about-text">
          <h2 className="sec-title">About</h2>
          <p>{firstBio}</p>
          <Link className="btn" href="/about/">
            Read more <span className="arrow">→</span>
          </Link>
        </div>
      </section>

      <section className="focus">
        <h2 className="sec-title">What I Do</h2>
        <div className="focus-grid">
          {focus.map((f, i) => (
            <div className="focus-item" key={f.cat}>
              <b aria-hidden="true">{i + 1}</b>
              <div>
                <h3>{f.cat}</h3>
                <p>{f.skills.join(' · ')}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="works">
        <h2 className="sec-title">Selected Projects</h2>
        <div className="mosaic">
          {mosaic.map((p, i) => (
            <Tile key={p.id} project={p} tone={i} href={`/projects/${p.slug}/`} />
          ))}
        </div>
        <div className="works-foot">
          <Link className="btn" href="/projects/">
            See all {projects.length} <span className="arrow">→</span>
          </Link>
        </div>
      </section>

      <section className="works">
        <h2 className="sec-title">Get in Touch</h2>
        <ContactBlock />
      </section>
    </>
  );
}
