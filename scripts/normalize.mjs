// แปลงข้อมูลดิบจาก Apps Script (?action=site) ให้เป็นรูปแบบที่หน้าเว็บใช้ (data/site.json)

const truthy = (v) => v === true || /^(true|yes|1|y)$/i.test(String(v ?? '').trim());
const str = (v) => (v === null || v === undefined ? '' : String(v).trim());
const lines = (v) => str(v).split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
const list = (v) => str(v).split(',').map((s) => s.trim()).filter(Boolean);
const COVER_STYLES = ['liff', 'web', 'map', 'node', 'data', 'mobile', 'doc'];
const STAT_DEFAULTS = [['1,049', 'เคสบริการที่วิเคราะห์'], ['24→69%', 'เคสที่บอทปิดเองได้ (ประเมิน)']];

/**
 * @param {any} raw  ผลลัพธ์จาก Apps Script
 * @param {{ siteUrl: string, contactEndpoint: string, media: Record<string,string>, resumeUrl: string|null, source: string }} opt
 */
export function normalize(raw, opt) {
  const pr = raw.profile || {};
  const st = raw.settings || {};
  const images = raw.images || [];

  const projects = (raw.projects || []).map((p) => {
    const id = str(p.id);
    return {
      id,
      title: str(p.title),
      slug: str(p.slug),
      category: str(p.category) || 'Web App',
      coverStyle: COVER_STYLES.includes(str(p.cover_style)) ? str(p.cover_style) : 'web',
      hue: Number.isFinite(Number(p.hue)) && str(p.hue) !== '' ? Number(p.hue) : 170,
      summary: str(p.summary),
      overview: str(p.overview),
      problem: str(p.problem),
      role: str(p.role),
      process: lines(p.process),
      tech: list(p.tech),
      results: lines(p.results),
      metric: { value: str(p.metric_value), label: str(p.metric_label) },
      links: { demo: str(p.demo_url), github: str(p.github_url) },
      start: str(p.start),
      end: str(p.end),
      featured: truthy(p.featured),
      cover: opt.media[str(p.cover_image_id)] || null,
      images: images
        .filter((i) => str(i.project_id) === id && opt.media[str(i.drive_file_id)])
        .map((i) => ({ src: opt.media[str(i.drive_file_id)], alt: str(i.alt_text) || str(p.title) }))
    };
  });

  return {
    generatedAt: raw.generatedAt || new Date().toISOString(),
    source: opt.source,
    profile: {
      name: str(pr.name),
      title: str(pr.title),
      tagline: str(pr.tagline),
      bio: str(pr.bio),
      goal: str(pr.goal),
      location: str(pr.location),
      email: str(pr.email),
      phone: str(pr.phone),
      github: str(pr.github),
      linkedin: str(pr.linkedin),
      available: truthy(pr.available),
      photo: opt.media[str(pr.photo_drive_id)] || null
    },
    skills: (raw.skills || []).filter((s) => str(s.name)).map((s) => ({ name: str(s.name), category: str(s.category) })),
    experiences: (raw.experiences || []).map((e) => ({
      type: str(e.type) === 'edu' ? 'edu' : 'work',
      organization: str(e.organization),
      position: str(e.position),
      start: str(e.start),
      end: str(e.end),
      description: str(e.description)
    })),
    projects,
    settings: {
      seoTitle: str(st.seo_title) || 'Portfolio',
      seoDescription: str(st.seo_description),
      showResume: str(st.show_resume) === '' ? true : truthy(st.show_resume),
      resumeUrl: opt.resumeUrl,
      // ตัวเลขเด่นหน้าแรก: ยังไม่มีคีย์ใน Sheet = ใช้ค่าเดิม · มีคีย์แต่เว้นว่าง = ไม่แสดงช่องนั้น
      stats: STAT_DEFAULTS.map(([v, l], i) => {
        const n = i + 2;
        return st[`stat${n}_value`] === undefined ? { value: v, label: l } : { value: str(st[`stat${n}_value`]), label: str(st[`stat${n}_label`]) };
      }).filter((x) => x.value),
      // หมวดทักษะตามลำดับที่ตั้งในหน้า admin (บรรทัดละหมวด) · ว่าง = ใช้ค่าเริ่มต้นใน lib/data.ts
      skillCats: str(st.skill_categories).split('\n').map((x) => x.trim()).filter(Boolean),
      contactEndpoint: opt.contactEndpoint,
      siteUrl: opt.siteUrl
    }
  };
}
