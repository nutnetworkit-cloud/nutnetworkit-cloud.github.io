'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Header({ mark, name, showResume }: { mark: string; name: string; showResume: boolean }) {
  const path = usePathname();
  const items: [string, string][] = [
    ['/', 'Home'],
    ['/projects/', 'Projects'],
    ['/about/', 'About'],
    ['/experience/', 'Experience'],
    ...(showResume ? ([['/resume/', 'Resume']] as [string, string][]) : []),
    ['/contact/', 'Contact']
  ];
  const isOn = (href: string) => (href === '/' ? path === '/' : path.startsWith(href));

  return (
    <header className="top">
      <div className="wrap top-in">
        <Link className="logo" href="/" aria-label="หน้าแรก">
          <b>{mark}</b>
          <span>{name}</span>
        </Link>
        <nav className="nav caps" aria-label="เมนูหลัก">
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
