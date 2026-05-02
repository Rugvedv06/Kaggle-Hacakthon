'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LANGUAGES, setLang, type Lang } from '@/lib/language';

export default function LanguagePicker() {
  const router = useRouter();
  const [selected, setSelected] = useState<Lang | null>(null);

  function choose(code: Lang) {
    setSelected(code);
    setLang(code);
    setTimeout(() => router.push('/ask'), 300);
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 gap-8">
      <div className="text-center">
        <h1 className="text-3xl font-semibold text-emerald-800">GemmaGuru</h1>
        <p className="text-emerald-600 mt-2 text-sm">
          अपनी भाषा चुनें · आपली भाषा निवडा
        </p>
      </div>

      <div className="flex flex-col gap-3 w-full max-w-xs">
        {LANGUAGES.map(({ code, label, sublabel }) => (
          <button
            key={code}
            onClick={() => choose(code)}
            className={`
              py-4 px-6 rounded-xl border-2 text-left transition-all
              ${selected === code
                ? 'border-emerald-500 bg-emerald-50'
                : 'border-gray-200 bg-white hover:border-emerald-300'}
            `}
          >
            <span className="block text-xl font-medium text-gray-800">{label}</span>
            <span className="block text-sm text-gray-400 mt-0.5">{sublabel}</span>
          </button>
        ))}
      </div>

      <p className="text-xs text-gray-400 text-center max-w-xs">
        You can change this later in settings
      </p>
    </div>
  );
}
