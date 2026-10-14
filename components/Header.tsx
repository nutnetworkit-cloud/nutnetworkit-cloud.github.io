'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Header({ name, mark, showResume }: { name: string; mark: string; showResume: boolean }) {
  const path = usePathname();
  const items: [string, string][] = [
    ['/', 'หน้าแรก'],
    ['/about/', 'เกี่ยวกับ'],
    ['/projects/', 'ผลงาน'],
    ['/experience/', 'ประสบการณ์'],
    ...(showResume ? ([['/resume/', 'Resume']] as [string, string][]) : []),
    ['/contact/', 'ติดต่อ']
  ];
  const isOn = (href: string) => (href === '/' ? path === '/' : path.startsWith(href));

  return (
    <header className="top">
      <div className="wrap top-in">
        <Link className="brand" href="/">
          <span className="mono-mark">{mark}</span>
          <span>{name}</span>
        </Link>
        <nav className="nav" aria-label="เมนูหลัก">
          {items.map(([href, label]) => (
            <Link key={href} href={href} className={isOn(href) ? 'on' : ''} aria-current={isOn(href) ? 'page' : undefined}>
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
