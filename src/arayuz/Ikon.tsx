// Basit çizgi ikonlar. G1/G2/G4 assetleri gelince bunların yerine geçecek.
type Ad = 'vakif' | 'sikke' | 'fon' | 'nakit' | 'gunluk' | 'etiket' | 'ilerle' | 'yeniden' | 'kapat' | 'hamam' | 'han' | 'arazi' | 'sandik' | 'hayrat' | 'mutevelli' | 'harita' | 'kesif' | 'insa' | 'koy'

const YOL: Record<Ad, string> = {
  vakif: 'M4 20h16M6 20v-7h12v7M7 13a5 5 0 0 1 10 0M12 4v4',
  sikke: 'M12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16zM12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7z',
  fon: 'M4 9h16v11H4zM4 9a8 4 0 0 1 16 0M10 13h4',
  nakit: 'M5 7a7 3 0 1 0 14 0 7 3 0 1 0-14 0M5 7v5c0 1.7 3.1 3 7 3s7-1.3 7-3V7M5 12v5c0 1.7 3.1 3 7 3s7-1.3 7-3v-5',
  gunluk: 'M7 4h11v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2h11M7 4a2 2 0 0 0-2 2v10M10 8h5M10 12h5',
  etiket: 'M3 4h6v5H3zM15 4h6v5h-6zM9 15h6v5H9zM6 9v3h12V9M12 12v3',
  ilerle: 'M3 5l9 7-9 7zM12 5l9 7-9 7z',
  yeniden: 'M4 12a8 8 0 1 0 2.3-5.7M4 4v4h4',
  kapat: 'M5 5l14 14M19 5L5 19',
  hamam: 'M3 20h18M5 20v-6h14v6M6 14a3 3 0 0 1 6 0M12 14a4 4 0 0 1 7 0',
  han: 'M3 20h18M4 20V9h16v11M4 9l8-5 8 5M8 20v-5h3v5M13 20v-5h3v5',
  arazi: 'M3 18c3-2 6-2 9 0s6 2 9 0M12 18V8M12 8c-3 0-4-2-4-4 3 0 4 2 4 4zM12 11c3 0 4-2 4-4-3 0-4 2-4 4z',
  sandik: 'M4 9h16v11H4zM4 9a8 4 0 0 1 16 0M12 13v3',
  hayrat: 'M5 20h14M7 20v-8h10v8M6 12h12M9 12a3 3 0 0 1 6 0M16 9V4',
  mutevelli: 'M12 4a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7zM5 20c0-4 3-6 7-6s7 2 7 6',
  harita: 'M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2zM9 4v14M15 6v14',
  kesif: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM15.5 8.5l-2 5-5 2 2-5z',
  insa: 'M4 20l9-9M13 4l7 7-3 3-7-7zM10 7l-2 2',
  koy: 'M4 11l8-6 8 6v9H4zM10 20v-5h4v5',
}

export function Ikon({ ad, boyut = 22, renk = 'currentColor', dolu = false }: { ad: Ad; boyut?: number; renk?: string; dolu?: boolean }) {
  return (
    <svg width={boyut} height={boyut} viewBox="0 0 24 24" fill={dolu ? renk : 'none'} stroke={dolu ? 'none' : renk} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={YOL[ad]} />
    </svg>
  )
}
