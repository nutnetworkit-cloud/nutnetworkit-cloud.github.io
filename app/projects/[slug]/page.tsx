import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Cover from '@/components/Cover';
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
    <section className="pd-sec">
      <h2>{title}</h2>
      {children}
    </section>
  );
}

export default async function ProjectPage({ params }: Params) {
  const p = getProject((await params).slug);
  if (!p) notFound();

  const i = projects.findIndex((x) => x.id === p.id);
  const next = projects.length > 1 ? projects[(i + 1) % projects.length] : null;
  const when = period(p);

  return (
    <>
      <section className="page-h">
        <Link className="back" href="/projects/">
          ← ผลงานทั้งหมด
        </Link>
        <span className="label">{p.category}</span>
        <h1>{p.title}</h1>
        <p className="lede">{p.summary}</p>
      </section>

      <Cover project={p} className="pd-cover" />

      <div className="pd-grid">
        <div className="pd-main">
          {p.overview && <Sec title="ภาพรวมโปรเจกต์">{paragraphs(p.overview).map((t) => <p key={t}>{t}</p>)}</Sec>}
          {p.problem && <Sec title="ปัญหาและเป้าหมาย">{paragraphs(p.problem).map((t) => <p key={t}>{t}</p>)}</Sec>}
          {p.role && <Sec title="บทบาทในโปรเจกต์">{paragraphs(p.role).map((t) => <p key={t}>{t}</p>)}</Sec>}
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
              <ul className="results">
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
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={m.src} src={m.src} alt={m.alt} loading="lazy" />
                ))}
              </div>
            </Sec>
          )}
        </div>

        <aside className="pd-side">
          <dl>
            {p.metric.value && (
              <div>
                <dt className="label">ผลลัพธ์เด่น</dt>
                <dd className="pd-metric">
                  <b>{p.metric.value}</b>
                  <span>{p.metric.label}</span>
                </dd>
              </div>
            )}
            {when && (
              <div>
                <dt className="label">ช่วงเวลา</dt>
                <dd>{when}</dd>
              </div>
            )}
            <div>
              <dt className="label">เครื่องมือและเทคโนโลยี</dt>
              <dd className="tags">
                {p.tech.map((t) => (
                  <span className="tag" key={t}>
                    {t}
                  </span>
                ))}
              </dd>
            </div>
            <div>
              <dt className="label">ลิงก์</dt>
              <dd className="copy-row" style={{ paddingTop: 6 }}>
                {isLink(p.links.demo) && (
                  <a className="btn pri sm" href={p.links.demo} target="_blank" rel="noopener noreferrer">
                    เปิด Demo ↗
                  </a>
                )}
                {isLink(p.links.github) && (
                  <a className="btn ghost sm" href={p.links.github} target="_blank" rel="noopener noreferrer">
                    GitHub ↗
                  </a>
                )}
                {!isLink(p.links.demo) && !isLink(p.links.github) && (
                  <span className="muted" style={{ fontSize: 14 }}>
                    ระบบภายในองค์กร ไม่มีลิงก์สาธารณะ
                  </span>
                )}
              </dd>
            </div>
          </dl>
        </aside>
      </div>

      {next && next.id !== p.id && (
        <div className="nextp">
          <span className="muted">ผลงานถัดไป</span>
          <Link className="linkbtn" href={`/projects/${next.slug}/`}>
            {next.title} →
          </Link>
        </div>
      )}
    </>
  );
}
