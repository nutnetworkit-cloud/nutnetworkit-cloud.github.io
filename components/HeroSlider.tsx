'use client';

import Link from 'next/link';
import { useState } from 'react';
import type { Project } from '@/lib/types';
import Heading from './Heading';
import Tile from './Tile';

type Props = { title: string; name: string; tagline: string; available: boolean; projects: Project[] };

// hero หน้าแรก: ซ้าย = ชื่อ + ตัวเลื่อนผลงานเด่น, ขวา = ผลงานที่เลือกอยู่
export default function HeroSlider({ title, name, tagline, available, projects }: Props) {
  const [i, setI] = useState(0);
  const n = projects.length;
  const p = projects[i];
  const go = (d: number) => setI((x) => (x + d + n) % n);

  return (
    <section className="hero">
      <div className="hero-left">
        {available && (
          <span className="hero-status">
            <i aria-hidden="true" />
            เปิดรับงาน
          </span>
        )}
        <Heading light={title} bold={name} />
        <p className="hero-tag">{tagline}</p>
        {n > 1 && (
          <div className="slider-ctl">
            <button type="button" className="sq" onClick={() => go(-1)} aria-label="ผลงานก่อนหน้า">
              ←
            </button>
            <button type="button" className="sq" onClick={() => go(1)} aria-label="ผลงานถัดไป">
              →
            </button>
            <span className="counter" aria-live="polite">
              <b>{String(i + 1).padStart(2, '0')}</b> / {String(n).padStart(2, '0')}
            </span>
          </div>
        )}
      </div>
      {p && (
        <div className="hero-right">
          <Tile project={p} href={`/projects/${p.slug}/`} />
          <div className="hero-meta">
            <span>{p.summary}</span>
            <Link className="link-caps" href={`/projects/${p.slug}/`}>
              View project <span className="arrow">→</span>
            </Link>
          </div>
        </div>
      )}
    </section>
  );
}
