import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import Link from 'next/link';
import './globals.css';
import Header from '@/components/Header';
import { isLink, monogram, site } from '@/lib/data';

const { profile, settings } = site;

export const metadata: Metadata = {
  metadataBase: new URL(settings.siteUrl),
  title: { default: settings.seoTitle, template: `%s — ${profile.name}` },
  description: settings.seoDescription,
  openGraph: { title: settings.seoTitle, description: settings.seoDescription, type: 'website', locale: 'th_TH' }
};

export default function RootLayout({ children }: { children: ReactNode }) {
  const mark = monogram(profile.name);
  return (
    <html lang="th">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Roboto:wght@200;300;400;500;700&family=Sarabun:wght@200;300;400;500;600&display=swap"
        />
      </head>
      <body>
        <Header mark={mark} name={profile.title} showResume={settings.showResume} />
        <main className="wrap">{children}</main>
        <footer className="foot">
          <div className="wrap foot-grid">
            <div>
              <Link className="logo" href="/">
                <b>{mark}</b>
                <span>{profile.title}</span>
              </Link>
              <p style={{ marginTop: 16, fontSize: 13.5, color: 'var(--on-dark-muted)' }}>{profile.name}</p>
            </div>
            <div>
              <h4>Information</h4>
              <ul>
                <li>
                  <Link href="/projects/">Projects</Link>
                </li>
                <li>
                  <Link href="/about/">About</Link>
                </li>
                <li>
                  <Link href="/experience/">Experience</Link>
                </li>
                {settings.showResume && (
                  <li>
                    <Link href="/resume/">Resume</Link>
                  </li>
                )}
              </ul>
            </div>
            <div>
              <h4>Contact</h4>
              <ul>
                <li>
                  <a href={`mailto:${profile.email}`}>{profile.email}</a>
                </li>
                {profile.phone && (
                  <li>
                    <a href={`tel:${profile.phone.replace(/[^\d+]/g, '')}`}>{profile.phone}</a>
                  </li>
                )}
                <li>{profile.location}</li>
                <li>
                  <Link href="/contact/">ส่งข้อความ →</Link>
                </li>
              </ul>
            </div>
            <div>
              <h4>Social Media</h4>
              <ul>
                {isLink(profile.github) && (
                  <li>
                    <a href={profile.github} target="_blank" rel="noopener noreferrer">
                      GitHub ↗
                    </a>
                  </li>
                )}
                {isLink(profile.linkedin) && (
                  <li>
                    <a href={profile.linkedin} target="_blank" rel="noopener noreferrer">
                      LinkedIn ↗
                    </a>
                  </li>
                )}
              </ul>
            </div>
          </div>
          <div className="foot-bottom">
            © {new Date(site.generatedAt).getFullYear()} {profile.name}. All rights reserved.
          </div>
        </footer>
      </body>
    </html>
  );
}
