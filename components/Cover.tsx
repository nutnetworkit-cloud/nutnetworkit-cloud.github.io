import type { CSSProperties } from 'react';
import type { Project } from '@/lib/types';

// ภาพปกอัตโนมัติ (ใช้เมื่อผลงานยังไม่มีรูปจริง) — สีมาจาก hue ของแต่ละผลงาน
const SHAPES: Record<Project['coverStyle'], string> = {
  liff: '<rect class="w" x="118" y="14" width="84" height="172" rx="13"/><rect class="k" x="118" y="14" width="84" height="26" rx="13"/><rect class="k" x="118" y="30" width="84" height="12"/><rect class="b" x="128" y="54" width="64" height="18" rx="5"/><rect class="b" x="128" y="78" width="64" height="18" rx="5"/><rect class="b" x="128" y="102" width="44" height="18" rx="5"/><rect class="k" x="146" y="132" width="46" height="16" rx="8"/><rect class="b" x="128" y="156" width="54" height="16" rx="8"/>',
  web: '<rect class="w" x="28" y="22" width="264" height="158" rx="8"/><rect class="b" x="28" y="22" width="264" height="18" rx="8"/><rect class="b" x="28" y="32" width="264" height="8"/><circle class="k" cx="41" cy="31" r="3"/><circle class="w" cx="51" cy="31" r="3"/><rect class="b" x="40" y="52" width="54" height="116" rx="4"/><rect class="k" x="106" y="52" width="72" height="32" rx="4"/><rect class="b" x="186" y="52" width="94" height="32" rx="4"/><rect class="b" x="106" y="94" width="174" height="10" rx="3"/><rect class="b" x="106" y="112" width="174" height="10" rx="3"/><rect class="b" x="106" y="130" width="138" height="10" rx="3"/><rect class="b" x="106" y="148" width="160" height="10" rx="3"/>',
  map: '<rect class="w" x="28" y="22" width="264" height="158" rx="8"/><path class="ln" d="M28 72 L292 94 M28 142 L292 122 M108 22 L128 180 M222 22 L202 180"/><polyline class="rt" points="62,152 116,130 168,98 236,70"/><circle class="k" cx="62" cy="152" r="7"/><circle class="w" cx="62" cy="152" r="2.6"/><circle class="k" cx="168" cy="98" r="7"/><circle class="w" cx="168" cy="98" r="2.6"/><circle class="k" cx="236" cy="70" r="7"/><circle class="w" cx="236" cy="70" r="2.6"/>',
  node: '<polyline class="rt" points="90,53 112,53 112,100 136,100"/><polyline class="rt" points="90,100 136,100"/><polyline class="rt" points="90,147 112,147 112,100"/><polyline class="rt" points="192,100 232,100"/><rect class="w" x="26" y="36" width="64" height="34" rx="5"/><rect class="w" x="26" y="83" width="64" height="34" rx="5"/><rect class="w" x="26" y="130" width="64" height="34" rx="5"/><circle class="k" cx="78" cy="53" r="3.5"/><circle class="k" cx="78" cy="100" r="3.5"/><circle class="b" cx="78" cy="147" r="3.5"/><rect class="k" x="136" y="78" width="56" height="44" rx="7"/><rect class="w" x="232" y="48" width="64" height="104" rx="6"/><rect class="b" x="240" y="58" width="48" height="14" rx="3"/><rect class="b" x="240" y="80" width="48" height="8" rx="3"/><rect class="b" x="240" y="96" width="48" height="8" rx="3"/><rect class="b" x="240" y="112" width="34" height="8" rx="3"/>',
  data: '<rect class="w" x="28" y="22" width="264" height="158" rx="8"/><rect class="b" x="52" y="114" width="22" height="50" rx="3"/><rect class="b" x="86" y="86" width="22" height="78" rx="3"/><rect class="b" x="120" y="100" width="22" height="64" rx="3"/><rect class="b" x="154" y="62" width="22" height="102" rx="3"/><rect class="b" x="188" y="76" width="22" height="88" rx="3"/><rect class="k" x="222" y="44" width="22" height="120" rx="3"/><rect class="b" x="44" y="164" width="232" height="2"/>',
  mobile: '<rect class="w" x="112" y="12" width="96" height="178" rx="16"/><circle class="k" cx="160" cy="46" r="13"/><rect class="b" x="128" y="68" width="64" height="8" rx="4"/><rect class="b" x="124" y="88" width="34" height="34" rx="7"/><rect class="k" x="162" y="88" width="34" height="34" rx="7"/><rect class="b" x="124" y="126" width="34" height="34" rx="7"/><rect class="b" x="162" y="126" width="34" height="34" rx="7"/><rect class="b" x="124" y="170" width="72" height="8" rx="4"/>',
  doc: '<rect class="w" x="96" y="12" width="128" height="176" rx="4"/><rect class="k" x="110" y="26" width="56" height="9" rx="2"/><rect class="b" x="110" y="46" width="100" height="6" rx="2"/><rect class="b" x="110" y="58" width="88" height="6" rx="2"/><rect class="b" x="110" y="76" width="100" height="44" rx="3"/><rect class="b" x="110" y="130" width="72" height="6" rx="2"/><polyline class="rt" points="112,166 124,156 134,166 146,154 158,164"/><rect class="b" x="110" y="172" width="60" height="2"/>'
};

export default function Cover({ project, className = '' }: { project: Project; className?: string }) {
  const style = { '--h': project.hue } as CSSProperties;
  return (
    <div className={`cover cv ${className}`} style={style}>
      {project.cover ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={project.cover} alt={project.title} loading="lazy" />
      ) : (
        <svg
          viewBox="0 0 320 200"
          preserveAspectRatio="xMidYMid slice"
          aria-hidden="true"
          dangerouslySetInnerHTML={{ __html: SHAPES[project.coverStyle] ?? SHAPES.web }}
        />
      )}
    </div>
  );
}
