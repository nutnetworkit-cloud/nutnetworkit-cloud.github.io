'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Header({ mark, name, showResume }: { mark: string; name: string; showResume: boolean }) {
  const path = usePathname();
  const [open, setOpen] = useState(false); // เมนูมือถือ
  const items: [string, string][] = [
    ['/', 'Home'],
    ['/projects/', 'Projects'],
    ['/about/', 'About'],
    ['/experience/', 'Experience'],
    ...(showResume ? ([['/resume/', 'Resume']] as [string, string][]) : []),
    ['/contact/', 'Contact']
  ];
  const isOn = (href: string) => (href === '/' ? path === '/' : path.startsWith(href));

  useEffect(() => setOpen(false), [path]);
  useEffect(() => {
    document.documentElement.classList.toggle('menu-open', open);
    if (!open) return;
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    addEventListener('keydown', esc);
    return () => removeEventListener('keydown', esc);
  }, [open]);

  return (
    <header className="top">
      <div className="wrap top-in">
        <Link className="logo" href="/" aria-label="หน้าแรก">
          <b>{mark}</b>
          <span>{name}</span>
        </Link>
        <button type="button" className={`menu-btn ${open ? 'x' : ''}`} aria-expanded={open} aria-controls="mainnav" aria-label={open ? 'ปิดเมนู' : 'เปิดเมนู'} onClick={() => setOpen((o) => !o)}>
          <span aria-hidden="true">
            <i />
            <i />
          </span>
        </button>
        <nav id="mainnav" className={`nav caps ${open ? 'open' : ''}`} aria-label="เมนูหลัก">
          {items.map(([href, label]) => (
            <Link key={href} href={href} className={isOn(href) ? 'on' : ''} aria-current={isOn(href) ? 'page' : undefined} onClick={() => setOpen(false)}>
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
