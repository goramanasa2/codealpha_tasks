export type LangCode = "en" | "hi" | "te";

export interface Language {
  code: LangCode;
  label: string;
  nativeLabel: string;
  flag: string;
}

export const LANGUAGES: Language[] = [
  { code: "en", label: "English", nativeLabel: "English", flag: "EN" },
  { code: "hi", label: "Hindi", nativeLabel: "हिन्दी", flag: "HI" },
  { code: "te", label: "Telugu", nativeLabel: "తెలుగు", flag: "TE" },
];

export const LANG_MAP: Record<LangCode, Language> = LANGUAGES.reduce(
  (acc, lang) => ({ ...acc, [lang.code]: lang }),
  {} as Record<LangCode, Language>
);

export async function translateText(
  text: string,
  source: LangCode,
  target: LangCode
): Promise<string> {
  if (!text.trim()) return "";
  if (source === target) return text;

  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(
    text
  )}&langpair=${source}|${target}`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Translation request failed (status ${res.status})`);
  }

  const data = await res.json();

  if (data.responseStatus !== 200 && data.responseStatus !== "200") {
    const detail =
      data.responseDetails ||
      "The translation service could not process this request.";
    throw new Error(detail);
  }

  const translated: string | undefined = data?.responseData?.translatedText;
  if (!translated) {
    throw new Error("No translation was returned by the service.");
  }
  return translated;
}
