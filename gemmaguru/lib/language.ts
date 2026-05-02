export type Lang = 'mr' | 'hi' | 'hinglish';

export const LANGUAGES = [
  { code: 'mr'       as Lang, label: 'मराठी',    sublabel: 'Marathi'  },
  { code: 'hi'       as Lang, label: 'हिन्दी',   sublabel: 'Hindi'    },
  { code: 'hinglish' as Lang, label: 'Hinglish', sublabel: 'हिंग्लिश' },
] as const;

export function getLang(): Lang {
  if (typeof window === 'undefined') return 'mr';
  return (localStorage.getItem('gg_lang') as Lang) || 'mr';
}

export function setLang(lang: Lang) {
  localStorage.setItem('gg_lang', lang);
}
