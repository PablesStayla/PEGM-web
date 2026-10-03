type SectionHeadingProps = {
  label: string;
  title: string;
  description?: string;
};

export function SectionHeading({ label, title, description }: SectionHeadingProps) {
  return (
    <div className="mb-10 max-w-3xl">
      <p className="flex items-center gap-3 text-xs font-medium tracking-[0.2em] text-accent uppercase">
        <span className="h-px w-8 bg-accent" aria-hidden />
        {label}
      </p>
      <h2 className="mt-4 font-serif text-4xl leading-[1.05] tracking-tight text-balance md:text-5xl">
        {title}
      </h2>
      {description ? (
        <p className="mt-5 max-w-2xl leading-relaxed text-muted">{description}</p>
      ) : null}
    </div>
  );
}
