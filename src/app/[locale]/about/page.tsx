import { useTranslations } from "next-intl";

export default function AboutPage() {
    const t = useTranslations("auto");
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-black text-[hsl(var(--color-text))]">{t('aboutUs')}</h1>
        <p className="text-[hsl(var(--color-text-muted))]">{t('thisPageIsUnder')}</p>
      </div>
    </div>
  );
}
