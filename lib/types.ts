export type CoverStyle = 'liff' | 'web' | 'map' | 'node' | 'data' | 'mobile' | 'doc';

export interface Project {
  id: string;
  title: string;
  slug: string;
  category: string;
  coverStyle: CoverStyle;
  hue: number;
  summary: string;
  overview: string;
  problem: string;
  role: string;
  process: string[];
  tech: string[];
  results: string[];
  metric: { value: string; label: string };
  links: { demo: string; github: string };
  start: string;
  end: string;
  featured: boolean;
  cover: string | null;
  images: { src: string; alt: string }[];
}

export interface Profile {
  name: string;
  title: string;
  tagline: string;
  bio: string;
  goal: string;
  location: string;
  email: string;
  phone: string;
  github: string;
  linkedin: string;
  available: boolean;
  photo: string | null;
}

export interface Experience {
  type: 'work' | 'edu';
  organization: string;
  position: string;
  start: string;
  end: string;
  description: string;
}

export interface Site {
  generatedAt: string;
  source: 'sheet' | 'sample';
  profile: Profile;
  skills: { name: string; category: string }[];
  experiences: Experience[];
  projects: Project[];
  settings: {
    seoTitle: string;
    seoDescription: string;
    showResume: boolean;
    resumeUrl: string | null;
    stats: { value: string; label: string }[];
    skillCats?: string[];
    contactEndpoint: string;
    siteUrl: string;
  };
}
