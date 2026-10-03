type SectionHeadingProps = {
  label: string;
  title: string;
  description?: string;
};

export function SectionHeading({ label, title, description }: SectionHeadingProps) {
  return (
    <div className="mb-10 max-w-2xl">
      <p className="text-xs font-medium tracking-[0.2em] text-accent uppercase">{label}</p>
      <h2 className="mt-3 font-serif text-3xl tracking-tight text-balance md:text-4xl">{title}</h2>
      {description ? <p className="mt-4 leading-relaxed text-muted">{description}</p> : null}
    </div>
  );
}
