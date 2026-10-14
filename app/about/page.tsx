import type { Metadata } from 'next';
import Link from 'next/link';
import Skills from '@/components/Skills';
import { paragraphs, site } from '@/lib/data';

export const metadata: Metadata = { title: 'เกี่ยวกับ' };

export default function AboutPage() {
  const { profile } = site;
  const edu = site.experiences.filter((e) => e.type === 'edu');
  return (
    <>
      <section className="page-h">
        <span className="label">เกี่ยวกับ</span>
        <h1>{profile.name}</h1>
        <p className="lede">
          {profile.title} · {profile.location}
        </p>
      </section>
      <section className="two">
        <div className="prose">
          {paragraphs(profile.bio).map((t) => (
            <p key={t}>{t}</p>
          ))}
          {profile.goal && (
            <>
              <h2 style={{ fontSize: 20, marginTop: 10 }}>เป้าหมายในสายอาชีพ</h2>
              <p>{profile.goal}</p>
            </>
          )}
        </div>
        <div className="col">
          <div className="panel">
            <h2>การศึกษา</h2>
            {edu.length ? (
              edu.map((e) => (
                <div key={e.organization + e.position}>
                  <b>{e.organization}</b>
                  <div className="muted">
                    {e.position} · {e.start} – {e.end}
                  </div>
                </div>
              ))
            ) : (
              <p className="muted">ยังไม่ได้เพิ่ม</p>
            )}
          </div>
          <div className="panel">
            <h2>ประสบการณ์</h2>
            <p className="muted">ประวัติการทำงานทั้งหมดอยู่ในหน้าประสบการณ์</p>
            <Link className="btn ghost sm" href="/experience/" style={{ justifySelf: 'start' }}>
              ดูประสบการณ์
            </Link>
          </div>
        </div>
      </section>
      <section>
        <div className="sec-h">
          <h2>ทักษะ</h2>
        </div>
        <Skills />
      </section>
    </>
  );
}
