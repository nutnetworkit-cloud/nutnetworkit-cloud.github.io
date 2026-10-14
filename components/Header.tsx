'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Header({ name, title, showResume }: { name: string; title: string; showResume: boolean }) {
  const path = usePathname();
  const items: [string, string][] = [
    ['/projects/', 'ผลงาน'],
    ['/about/', 'เกี่ยวกับ'],
    ['/experience/', 'ประสบการณ์'],
    ...(showResume ? ([['/resume/', 'Resume']] as [string, string][]) : []),
    ['/contact/', 'ติดต่อ']
  ];

  return (
    <header className="top">
      <div className="wrap">
        <div className="top-in">
          <Link className="brand" href="/">
            {name} <span>— {title}</span>
          </Link>
          <nav className="nav" aria-label="เมนูหลัก">
            {items.map(([href, label]) => {
              const on = path.startsWith(href);
              return (
                <Link key={href} href={href} className={on ? 'on' : ''} aria-current={on ? 'page' : undefined}>
                  {label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
}
