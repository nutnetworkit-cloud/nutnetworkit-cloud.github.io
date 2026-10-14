// หัวข้อสองระดับ: คำบางสีเทาด้านบน + คำหลักสีเข้มด้านล่าง
export default function Heading({ light, bold, as = 'h1', small = false }: { light: string; bold: string; as?: 'h1' | 'h2'; small?: boolean }) {
  const Tag = as;
  return (
    <Tag className={`tt${small ? ' sm' : ''}`}>
      <span className="t1">{light}</span>
      <span className="t2">{bold}</span>
    </Tag>
  );
}
