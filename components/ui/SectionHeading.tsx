export function SectionHeading({
  eyebrow,
  title,
}: {
  eyebrow: string;
  title: string;
}) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#888]">
        {eyebrow}
      </p>

      <h2 className="mt-1 text-2xl font-black tracking-tight">
        {title}
      </h2>
    </div>
  );
}
