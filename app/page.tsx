import Link from 'next/link';
import ProjectCard from '@/components/ProjectCard';
import Skills from '@/components/Skills';
import { featured, isLink, projects, site } from '@/lib/data';

export default function Home() {
  const { profile, settings } = site;
  const shown = featured.length ? featured : projects.slice(0, 3);

  return (
    <>
      <section className="hero">
        <div className="hero-id">
          <b>{profile.name}</b>
          <span className="meta">
            {profile.title} · {profile.location}
          </span>
          {profile.available && (
            <span className="meta status">
              <i aria-hidden="true" />
              เปิดรับงาน
            </span>
          )}
        </div>
        <h1>{profile.tagline}</h1>
        <div className="hero-links">
          <Link href="/projects/" className="ulink">
            ดูผลงาน <span className="arrow">→</span>
          </Link>
          {settings.resumeUrl ? (
            <a href={settings.resumeUrl} download className="ulink">
              Resume (PDF) <span className="arrow">↓</span>
            </a>
          ) : (
            settings.showResume && (
              <Link href="/resume/" className="ulink">
                Resume <span className="arrow">→</span>
              </Link>
            )
          )}
          {isLink(profile.github) && (
            <a href={profile.github} target="_blank" rel="noopener noreferrer" className="ulink">
              GitHub <span className="arrow">↗</span>
            </a>
          )}
          {isLink(profile.linkedin) && (
            <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="ulink">
              LinkedIn <span className="arrow">↗</span>
            </a>
          )}
        </div>
      </section>

      <div className="facts">
        <div>
          <b>{projects.length}</b>
          <span>ระบบที่ออกแบบและส่งมอบให้องค์กร</span>
        </div>
        <div>
          <b>1,049</b>
          <span>เคสบริการที่วิเคราะห์เพื่อออกแบบบอท</span>
        </div>
        <div>
          <b>24% → 69%</b>
          <span>เคสที่บอทปิดเองได้ (ประเมินจากข้อมูลจริง)</span>
        </div>
      </div>

      <section className="block">
        <div className="block-h">
          <h2>ผลงานที่เลือก</h2>
          <Link href="/projects/">ผลงานทั้งหมด {projects.length} ชิ้น →</Link>
        </div>
        <div className="rows">
          {shown.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </div>
      </section>

      <section className="block">
        <div className="block-h">
          <h2>ทักษะ</h2>
          <Link href="/about/">เกี่ยวกับฉัน →</Link>
        </div>
        <div className="cols" style={{ gridTemplateColumns: 'minmax(0,1fr)', borderTopColor: 'var(--fg)' }}>
          <Skills />
        </div>
      </section>
    </>
  );
}
