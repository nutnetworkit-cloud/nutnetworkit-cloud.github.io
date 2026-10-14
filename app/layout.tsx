import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import Link from 'next/link';
import './globals.css';
import Header from '@/components/Header';
import { isLink, site } from '@/lib/data';

const { profile, settings } = site;

export const metadata: Metadata = {
  metadataBase: new URL(settings.siteUrl),
  title: { default: settings.seoTitle, template: `%s — ${profile.name}` },
  description: settings.seoDescription,
  openGraph: { title: settings.seoTitle, description: settings.seoDescription, type: 'website', locale: 'th_TH' }
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="th">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Thai:wght@300;400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap"
        />
      </head>
      <body>
        <Header name={profile.name} title={profile.title} showResume={settings.showResume} />
        <main className="wrap">{children}</main>
        <footer className="foot">
          <div className="wrap">
            <div className="foot-cta">
              <p className="meta">ติดต่อ</p>
              <h2>มีตำแหน่งที่เหมาะกัน หรืออยากคุยเรื่องงาน ยินดีเสมอ</h2>
              <a className="email-big" href={`mailto:${profile.email}`}>
                {profile.email} <span className="arrow">↗</span>
              </a>
            </div>
            <div className="foot-bar meta">
              <span>
                © {new Date(site.generatedAt).getFullYear()} {profile.name}
              </span>
              <nav aria-label="ลิงก์ภายนอก">
                {isLink(profile.github) && (
                  <a href={profile.github} target="_blank" rel="noopener noreferrer">
                    GitHub
                  </a>
                )}
                {isLink(profile.linkedin) && (
                  <a href={profile.linkedin} target="_blank" rel="noopener noreferrer">
                    LinkedIn
                  </a>
                )}
                <Link href="/contact/">ติดต่อ</Link>
              </nav>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
