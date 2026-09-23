export type BigIdeaValue = { text?: string };

export default function BigIdeaBlock({ value }: { value: BigIdeaValue }) {
  if (!value.text) return null;

  return (
    <div className="mt-12 relative rounded-2xl bg-gradient-to-br from-forest-surface to-gold-surface px-8 py-12 sm:px-14 sm:py-14 text-center overflow-hidden">
      <span className="absolute top-2 left-5 text-[100px] leading-none text-forest/10 select-none pointer-events-none">
        “
      </span>
      <p className="relative text-[26px] sm:text-[32px] font-semibold italic text-forest leading-[1.35] max-w-2xl mx-auto">
        {value.text}
      </p>
      <div className="relative mt-6 mx-auto w-10 h-[3px] bg-gold rounded-full" />
    </div>
  );
}
