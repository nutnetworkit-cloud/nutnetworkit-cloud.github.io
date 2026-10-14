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
    <section className="cs-sec">
      <h2>{title}</h2>
      <div>{children}</div>
    </section>
  );
}

const Prose = ({ text }: { text: string }) => (
  <div className="prose">
    {paragraphs(text).map((t) => (
      <p key={t}>{t}</p>
    ))}
  </div>
);

export default async function ProjectPage({ params }: Params) {
  const p = getProject((await params).slug);
  if (!p) notFound();

  const i = projects.findIndex((x) => x.id === p.id);
  const next = projects.length > 1 ? projects[(i + 1) % projects.length] : null;
  const when = period(p);
  const hasLinks = isLink(p.links.demo) || isLink(p.links.github);

  return (
    <article>
      <header className="page-h">
        <Link className="back" href="/projects/">
          ← ผลงานทั้งหมด
        </Link>
        <h1>{p.title}</h1>
        <p className="lede">{p.summary}</p>
      </header>

      <dl className="cs-meta">
        <div>
          <dt className="meta">ประเภท</dt>
          <dd>{p.category}</dd>
        </div>
        <div>
          <dt className="meta">ช่วงเวลา</dt>
          <dd>{when || '—'}</dd>
        </div>
        <div>
          <dt className="meta">เครื่องมือหลัก</dt>
          <dd>{p.tech.slice(0, 3).join(', ')}</dd>
        </div>
        <div>
          <dt className="meta">{p.metric.value ? p.metric.label : 'ลิงก์'}</dt>
          <dd className={p.metric.value ? 'big' : ''}>{p.metric.value || (hasLinks ? 'ด้านล่าง' : 'ระบบภายในองค์กร')}</dd>
        </div>
      </dl>

      <Cover project={p} className="cs-cover" />

      <div className="cs-body">
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
        <Sec title="เครื่องมือและเทคโนโลยี">
          <p style={{ fontSize: 17 }}>{p.tech.join(' · ')}</p>
        </Sec>
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
        {hasLinks && (
          <Sec title="ลิงก์">
            <div className="cs-links">
              {isLink(p.links.demo) && (
                <a className="ulink" href={p.links.demo} target="_blank" rel="noopener noreferrer">
                  เปิดดูระบบจริง <span className="arrow">↗</span>
                </a>
              )}
              {isLink(p.links.github) && (
                <a className="ulink" href={p.links.github} target="_blank" rel="noopener noreferrer">
                  ซอร์สโค้ดบน GitHub <span className="arrow">↗</span>
                </a>
              )}
            </div>
          </Sec>
        )}
      </div>

      {next && next.id !== p.id && (
        <Link className="next" href={`/projects/${next.slug}/`}>
          <span className="meta">ผลงานถัดไป</span>
          <b>
            {next.title} <span className="arrow">→</span>
          </b>
        </Link>
      )}
    </article>
  );
}
