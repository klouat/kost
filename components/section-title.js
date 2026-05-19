export function SectionTitle({ eyebrow, title, description }) {
  return (
    <div className="max-w-3xl">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--primary)]">{eyebrow}</p>
      <h2 className="mt-3 text-3xl font-semibold leading-tight text-balance md:text-4xl">{title}</h2>
      {description ? (
        <p className="mt-4 text-base leading-7 text-[var(--body)] md:text-lg">{description}</p>
      ) : null}
    </div>
  );
}
