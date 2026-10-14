import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './globals.css';
import Header from '@/components/Header';
import { monogram, site } from '@/lib/data';

const { profile, settings } = site;

export const metadata: Metadata = {
  metadataBase: new URL(settings.siteUrl),
  title: { default: settings.seoTitle, template: `%s · ${settings.seoTitle}` },
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
          href="https://fonts.googleapis.com/css2?family=Anuphan:wght@400;500;600;700&family=IBM+Plex+Sans+Thai:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap"
        />
      </head>
      <body>
        <Header name={profile.name} mark={monogram(profile.name)} showResume={settings.showResume} />
        <main className="wrap pub">{children}</main>
        <footer className="foot">
          <div className="wrap">
            <span>
              © {new Date(site.generatedAt).getFullYear()} {profile.name}
            </span>
            <span>
              {profile.title} · {profile.location}
            </span>
          </div>
        </footer>
      </body>
    </html>
  );
}
