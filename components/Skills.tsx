import { SKILL_CATS, site } from '@/lib/data';

export default function Skills() {
  const groups = [...SKILL_CATS, ...new Set(site.skills.map((s) => s.category).filter((c) => !SKILL_CATS.includes(c)))];
  return (
    <div className="skillset">
      {groups.map((c) => {
        const list = site.skills.filter((s) => s.category === c);
        if (!list.length) return null;
        return (
          <div key={c}>
            <h3>{c || 'อื่น ๆ'}</h3>
            <ul>
              {list.map((s) => (
                <li key={s.name}>{s.name}</li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
