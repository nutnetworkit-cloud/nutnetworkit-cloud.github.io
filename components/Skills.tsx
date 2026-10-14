import { SKILL_CATS, site } from '@/lib/data';

export default function Skills() {
  const groups = [...SKILL_CATS, ...new Set(site.skills.map((s) => s.category).filter((c) => !SKILL_CATS.includes(c)))];
  return (
    <div className="skills">
      {groups.map((c) => {
        const list = site.skills.filter((s) => s.category === c);
        if (!list.length) return null;
        return (
          <div className="skill-g" key={c}>
            <span className="label">{c || 'อื่น ๆ'}</span>
            <div className="tags">
              {list.map((s) => (
                <span className="tag" key={s.name}>
                  {s.name}
                </span>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
