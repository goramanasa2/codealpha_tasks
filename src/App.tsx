import { useState, useCallback } from "react";
import {
  ArrowLeftRight,
  ClipboardCopy,
  Check,
  Loader2,
  Trash2,
  Languages,
  Volume2,
} from "lucide-react";
import {
  LANGUAGES,
  LANG_MAP,
  translateText,
  type LangCode,
} from "@/lib/translate";

const CHAR_LIMIT = 1000;

function speak(text: string, lang: LangCode) {
  if (!text.trim() || typeof window === "undefined" || !window.speechSynthesis)
    return;
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = lang === "en" ? "en-US" : lang === "hi" ? "hi-IN" : "te-IN";
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utter);
}

function App() {
  const [source, setSource] = useState<LangCode>("en");
  const [target, setTarget] = useState<LangCode>("te");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const swap = useCallback(() => {
    setSource(target);
    setTarget(source);
    setInput(output);
    setOutput(input);
    setError("");
  }, [source, target, input, output]);

  const handleTranslate = useCallback(async () => {
    setError("");
    if (!input.trim()) {
      setError("Please enter some text to translate.");
      return;
    }
    if (input.length > CHAR_LIMIT) {
      setError(`Text is too long. Please keep it under ${CHAR_LIMIT} characters.`);
      return;
    }
    setLoading(true);
    setOutput("");
    try {
      const result = await translateText(input, source, target);
      setOutput(result);
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Something went wrong while translating."
      );
    } finally {
      setLoading(false);
    }
  }, [input, source, target]);

  const handleClear = useCallback(() => {
    setInput("");
    setOutput("");
    setError("");
    setCopied(false);
  }, []);

  const handleCopy = useCallback(async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Could not copy to clipboard.");
    }
  }, [output]);

  const renderLangSelect = (
    value: LangCode,
    onChange: (c: LangCode) => void,
    id: string
  ) => (
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value as LangCode)}
      className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-3 pr-10 text-sm font-medium text-slate-700 shadow-sm transition focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E\")",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "right 12px center",
      }}
    >
      {LANGUAGES.map((lang) => (
        <option key={lang.code} value={lang.code}>
          {lang.label} — {lang.nativeLabel}
        </option>
      ))}
    </select>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-emerald-50">
      {/* Header */}
      <header className="border-b border-slate-100 bg-white/70 backdrop-blur-md">
        <div className="mx-auto flex max-w-4xl items-center gap-3 px-4 py-5 sm:px-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-emerald-500 text-white shadow-md">
            <Languages className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-slate-800 sm:text-xl">
              Language Translation Tool
            </h1>
            <p className="text-xs text-slate-500 sm:text-sm">
              Translate between English, Hindi &amp; Telugu
            </p>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-10">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
          {/* Language selectors */}
          <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-end">
            <div className="flex-1">
              <label
                htmlFor="source-lang"
                className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-400"
              >
                From
              </label>
              {renderLangSelect(source, setSource, "source-lang")}
            </div>

            <button
              onClick={swap}
              className="mx-auto flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:scale-105 hover:border-sky-300 hover:text-sky-600 active:scale-95 sm:mb-0"
              aria-label="Swap languages"
              title="Swap languages"
            >
              <ArrowLeftRight className="h-4 w-4" />
            </button>

            <div className="flex-1">
              <label
                htmlFor="target-lang"
                className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-400"
              >
                To
              </label>
              {renderLangSelect(target, setTarget, "target-lang")}
            </div>
          </div>

          {/* Text panels */}
          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Input */}
            <div className="flex flex-col rounded-xl border border-slate-200 bg-slate-50/60">
              <div className="flex items-center justify-between border-b border-slate-200 px-4 py-2.5">
                <span className="text-xs font-semibold text-slate-500">
                  {LANG_MAP[source].label}
                </span>
                <span className="text-[11px] text-slate-400">
                  {input.length}/{CHAR_LIMIT}
                </span>
              </div>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value.slice(0, CHAR_LIMIT))}
                placeholder="Type or paste text here…"
                rows={7}
                className="w-full flex-1 resize-none rounded-b-xl bg-transparent px-4 py-3 text-[15px] leading-relaxed text-slate-800 placeholder:text-slate-400 focus:outline-none"
              />
            </div>

            {/* Output */}
            <div className="flex flex-col rounded-xl border border-slate-200 bg-gradient-to-br from-sky-50/50 to-emerald-50/40">
              <div className="flex items-center justify-between border-b border-slate-200 px-4 py-2.5">
                <span className="text-xs font-semibold text-slate-500">
                  {LANG_MAP[target].label}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => speak(output, target)}
                    disabled={!output}
                    className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 transition hover:bg-slate-200/60 hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-30"
                    aria-label="Listen to translation"
                    title="Listen"
                  >
                    <Volume2 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={handleCopy}
                    disabled={!output}
                    className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 transition hover:bg-slate-200/60 hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-30"
                    aria-label="Copy translated text"
                    title="Copy"
                  >
                    {copied ? (
                      <Check className="h-3.5 w-3.5 text-emerald-500" />
                    ) : (
                      <ClipboardCopy className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
              </div>
              <div className="min-h-[168px] flex-1 px-4 py-3 text-[15px] leading-relaxed text-slate-800">
                {loading ? (
                  <div className="flex h-full min-h-[148px] items-center justify-center text-slate-400">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span className="ml-2 text-sm">Translating…</span>
                  </div>
                ) : output ? (
                  output
                ) : (
                  <span className="text-slate-400">
                    Translation will appear here.
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button
              onClick={handleTranslate}
              disabled={loading}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-emerald-500 px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:shadow-lg hover:brightness-105 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Translating…
                </>
              ) : (
                <>
                  <Languages className="h-4 w-4" />
                  Translate
                </>
              )}
            </button>
            <button
              onClick={handleClear}
              disabled={!input && !output}
              className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Trash2 className="h-4 w-4" />
              Clear
            </button>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-slate-400">
          Powered by MyMemory Translation API · Free for student use
        </p>
      </main>
    </div>
  );
}

export default App;
