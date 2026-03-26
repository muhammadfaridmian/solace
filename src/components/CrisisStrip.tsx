export function CrisisStrip() {
  return (
    <div className="w-full bg-semantic-crisis-bg border-t-2 border-[rgba(255,107,107,0.25)] px-md py-sm text-center relative z-crisis">
      <p className="font-body text-sm text-text-primary leading-relaxed">
        If you&apos;re in crisis:{' '}
        <a
          href="tel:988"
          className="text-accent-warm font-semibold underline underline-offset-[3px] inline-block min-h-[48px] leading-[24px] px-[8px] py-[12px]"
        >
          988 Suicide &amp; Crisis Lifeline
        </a>{' '}
        ·{' '}
        <a
          href="sms:741741?body=HOME"
          className="text-accent-warm font-semibold underline underline-offset-[3px] inline-block min-h-[48px] leading-[24px] px-[8px] py-[12px]"
        >
          Text HOME to 741741
        </a>
      </p>
    </div>
  );
}
