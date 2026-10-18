// รูปโปรไฟล์: กรอบสี่เหลี่ยม + เส้นเยื้อง · ชี้เมาส์ (หรือกด Tab มาโฟกัส) = ขึ้นภาพขยายเต็มรูปไม่ครอป
export default function Avatar({ src, alt, lg = false }: { src: string; alt: string; lg?: boolean }) {
  return (
    <span className={`avatar-f${lg ? ' lg' : ''}`} tabIndex={0} aria-label={`${alt} — ชี้เพื่อดูรูปขยาย`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} width={lg ? 200 : 120} height={lg ? 240 : 144} />
      <span className="avatar-zoom" aria-hidden="true">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt="" loading="lazy" />
      </span>
    </span>
  );
}
