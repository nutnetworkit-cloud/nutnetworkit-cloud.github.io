import Link from 'next/link';
import ProjectCard from '@/components/ProjectCard';
import Skills from '@/components/Skills';
import { featured, projects, site } from '@/lib/data';

export default function Home() {
  const { profile, settings } = site;
  const techCount = new Set(projects.flatMap((p) => p.tech)).size;

  return (
    <>
      <section className="hero">
        <div>
          {profile.available ? (
            <span className="avail">
              <i />
              เปิดรับงาน · {profile.title}
            </span>
          ) : (
            <span className="label">{profile.title}</span>
          )}
          <h1>{profile.name}</h1>
          <p className="lede">{profile.tagline}</p>
          <div className="ctas">
            <Link className="btn pri" href="/projects/">
              ดูผลงานทั้งหมด
            </Link>
            {settings.resumeUrl ? (
              <a className="btn ghost" href={settings.resumeUrl} download>
                ดาวน์โหลด Resume (PDF)
              </a>
            ) : (
              settings.showResume && (
                <Link className="btn ghost" href="/resume/">
                  ดู Resume
                </Link>
              )
            )}
          </div>
        </div>
        <div className="facts">
          <div>
            <b>{projects.length}</b>
            <span>ผลงานที่พัฒนาตั้งแต่ออกแบบจนส่งมอบ</span>
          </div>
          <div>
            <b>{techCount}</b>
            <span>เครื่องมือและเทคโนโลยีที่ใช้ในงานจริง</span>
          </div>
          <div>
            <b>1,049</b>
            <span>เคสบริการจอที่วิเคราะห์เพื่อออกแบบบอทแก้ปัญหาเอง</span>
          </div>
        </div>
      </section>

      <section>
        <div className="sec-h">
          <h2>ผลงานเด่น</h2>
          <Link className="linkbtn" href="/projects/">
            ดูทั้งหมด {projects.length} ชิ้น →
          </Link>
        </div>
        <div className="grid">
          {(featured.length ? featured : projects.slice(0, 3)).map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </div>
      </section>

      <section>
        <div className="sec-h">
          <h2>ทักษะหลัก</h2>
          <Link className="linkbtn" href="/about/">
            เกี่ยวกับฉัน →
          </Link>
        </div>
        <Skills />
      </section>

      <section className="panel cta-panel">
        <div>
          <h2>สนใจร่วมงานกัน?</h2>
          <p className="muted">ติดต่อผ่านอีเมลหรือฟอร์มในหน้าติดต่อ ตอบกลับภายใน 1–2 วันทำการ</p>
        </div>
        <Link className="btn pri" href="/contact/">
          ติดต่อ
        </Link>
      </section>
    </>
  );
}
