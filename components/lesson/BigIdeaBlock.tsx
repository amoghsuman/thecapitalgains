export type BigIdeaValue = { text?: string };

export default function BigIdeaBlock({ value }: { value: BigIdeaValue }) {
  if (!value.text) return null;

  return (
    <div className="my-10 py-8 border-y-2 border-gold text-center">
      <p className="text-[24px] sm:text-[28px] font-bold text-forest leading-[1.3] max-w-2xl mx-auto">
        &ldquo;{value.text}&rdquo;
      </p>
    </div>
  );
}
