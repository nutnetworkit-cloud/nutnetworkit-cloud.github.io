import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Heading from '@/components/Heading';
import Tile from '@/components/Tile';
import { getProject, isLink, paragraphs, period, projects } from '@/lib/data';

type Params = { params: Promise<{ slug: string }> };

export const dynamicParams = false;
export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const p = getProject((await params).slug);
  return p ? { title: p.title, description: p.summary } : {};
}

function Sec({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="cs-sec">
      <h2>{title}</h2>
      {children}
    </section>
  );
}

const Prose = ({ text }: { text: string }) => (
  <>
    {paragraphs(text).map((t) => (
      <p key={t}>{t}</p>
    ))}
  </>
);

export default async function ProjectPage({ params }: Params) {
  const p = getProject((await params).slug);
  if (!p) notFound();

  const i = projects.findIndex((x) => x.id === p.id);
  const next = projects.length > 1 ? projects[(i + 1) % projects.length] : null;
  const when = period(p);

  return (
    <>
      <section className="page-h">
        <Link className="back caps" href="/projects/">
          ← Projects
        </Link>
        <Heading light={p.category} bold={p.title} />
        <p className="lede">{p.summary}</p>
      </section>

      <div className="cs-hero">
        {p.cover ? (
          // รูปหน้าจอจริง: แสดงเต็มภาพ ไม่ครอป ไม่ทับตัวหนังสือ (ชื่อผลงานอยู่ด้านบนแล้ว)
          // eslint-disable-next-line @next/next/no-img-element
          <img className="cs-cover" src={p.cover} alt={p.title} />
        ) : (
          <Tile project={p} tone={i} />
        )}
      </div>

      <div className="cs-grid">
        <div className="cs-main">
          {p.overview && (
            <Sec title="ภาพรวม">
              <Prose text={p.overview} />
            </Sec>
          )}
          {p.problem && (
            <Sec title="ปัญหาและเป้าหมาย">
              <Prose text={p.problem} />
            </Sec>
          )}
          {p.role && (
            <Sec title="บทบาท">
              <Prose text={p.role} />
            </Sec>
          )}
          {p.process.length > 0 && (
            <Sec title="ขั้นตอนการทำงาน">
              <ol className="steps">
                {p.process.map((s) => (
                  <li key={s}>
                    <span>{s}</span>
                  </li>
                ))}
              </ol>
            </Sec>
          )}
          {p.results.length > 0 && (
            <Sec title="ผลลัพธ์">
              <ul className="outcomes">
                {p.results.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </Sec>
          )}
          {p.images.length > 0 && (
            <Sec title="ภาพประกอบ">
              <div className="gal">
                {p.images.map((m) => (
                  <figure key={m.src}>
                    <a href={m.src} target="_blank" rel="noopener">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={m.src} alt={m.alt} loading="lazy" />
                    </a>
                    {m.alt && <figcaption>{m.alt}</figcaption>}
                  </figure>
                ))}
              </div>
            </Sec>
          )}
        </div>

        <aside className="side">
          <dl>
            {p.metric.value && (
              <div>
                <dt className="caps muted">ผลลัพธ์เด่น</dt>
                <dd>
                  <div className="big">{p.metric.value}</div>
                  <span className="muted">{p.metric.label}</span>
                </dd>
              </div>
            )}
            {when && (
              <div>
                <dt className="caps muted">ช่วงเวลา</dt>
                <dd>{when}</dd>
              </div>
            )}
            <div>
              <dt className="caps muted">เครื่องมือ</dt>
              <dd>{p.tech.join(', ')}</dd>
            </div>
            <div>
              <dt className="caps muted">ลิงก์</dt>
              <dd style={{ display: 'grid', gap: 10, justifyItems: 'start' }}>
                {isLink(p.links.demo) && (
                  <a className="btn" href={p.links.demo} target="_blank" rel="noopener noreferrer">
                    Live demo <span className="arrow">↗</span>
                  </a>
                )}
                {isLink(p.links.github) && (
                  <a className="link-caps" href={p.links.github} target="_blank" rel="noopener noreferrer">
                    GitHub <span className="arrow">↗</span>
                  </a>
                )}
                {!isLink(p.links.demo) && !isLink(p.links.github) && <span className="muted">ระบบภายในองค์กร ไม่มีลิงก์สาธารณะ</span>}
              </dd>
            </div>
          </dl>
        </aside>
      </div>

      {next && next.id !== p.id && (
        <Link className="next" href={`/projects/${next.slug}/`}>
          <Tile project={next} tone={i + 1} />
          <div className="next-txt">
            <span className="caps muted">Next project</span>
            <b>{next.title}</b>
            <span className="link-caps">
              View project <span className="arrow">→</span>
            </span>
          </div>
        </Link>
      )}
    </>
  );
}
