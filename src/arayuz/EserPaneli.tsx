import { useEffect, useState } from 'react'
import { eserBul, eserSayfasi, type GercekEser } from '../ortam'
import { L } from '../dil'

// Oyun içi eser paneli: eser oyunun yanında açılır (masaüstünde sağda, telefonda altta),
// harita görünür kalır. "Oyuna dön" paneli kapatır; tam sayfa yeni sekmede açılır, oyun kaybolmaz.

export const TUR: Record<string, [string, string]> = {
  cami: ['Cami', 'Mosque'], mescit: ['Mescit', 'Masjid'], medrese: ['Medrese', 'Madrasa'], han: ['Han', 'Inn'],
  hamam: ['Hamam', 'Bathhouse'], cesme: ['Çeşme', 'Fountain'], sebil: ['Sebil', 'Sebil'], turbe: ['Türbe', 'Tomb'],
  kulliye: ['Külliye', 'Complex'], imaret: ['İmaret', 'Soup kitchen'], 'bedesten-carsi': ['Bedesten, çarşı', 'Covered bazaar'],
}

export function EserPaneli({ id, onKapat }: { id: string; onKapat: () => void }) {
  const [e, setE] = useState<GercekEser | null | undefined>(undefined)
  const [foto, setFoto] = useState(0)
  useEffect(() => {
    let iptal = false
    setE(undefined)
    setFoto(0)
    eserBul(id).then((x) => !iptal && setE(x)).catch(() => !iptal && setE(null))
    return () => { iptal = true }
  }, [id])
  useEffect(() => {
    const tus = (ev: KeyboardEvent) => ev.key === 'Escape' && onKapat()
    window.addEventListener('keydown', tus)
    return () => window.removeEventListener('keydown', tus)
  }, [onKapat])

  const fotolar = e?.gorseller?.length ? e.gorseller : e?.gorsel ? [e.gorsel] : []
  const tur = e && TUR[e.tur] ? L(TUR[e.tur][0], TUR[e.tur][1]) : e?.tur

  return (
    <>
      <div className="eser-perde" onClick={onKapat} aria-hidden="true" />
      <aside className="eser-paneli" role="dialog" aria-modal="true" aria-labelledby="eser-paneli-baslik">
        <div className="ep-ust">
          <button className="dugme yesil baslik ep-don" onClick={onKapat}>◀ {L('OYUNA DÖN', 'BACK TO GAME')}</button>
        </div>
        {e === undefined && <p className="ep-bilgi">{L('Eser yükleniyor…', 'Loading the monument…')}</p>}
        {e === null && <p className="ep-bilgi">{L('Bu eserin bilgisi şu an açılamadı. Tam sayfayı yeni sekmede deneyebilirsin.', 'This monument could not be loaded right now. You can try the full page in a new tab.')}</p>}
        {e && (
          <>
            <div className="ep-foto">
              {fotolar.length ? <img src={fotolar[foto]} alt={e.ad} /> : <div className="ep-foto-yok">{L('Fotoğraf yok', 'No photo')}</div>}
              {fotolar.length > 1 && (
                <div className="ep-noktalar">
                  {fotolar.map((_, i) => (
                    <button key={i} aria-label={L(`${i + 1}. fotoğraf`, `Photo ${i + 1}`)} aria-pressed={i === foto} onClick={() => setFoto(i)} />
                  ))}
                </div>
              )}
            </div>
            <h1 id="eser-paneli-baslik" className="baslik">{e.ad}</h1>
            <p className="ep-yer">{[tur, e.ilce, e.il].filter(Boolean).join(' · ')}</p>
            <p className="ep-not">{L('Vakıf Katılım envanterindeki gerçek bir eser. Oyun bu sırada duraklatıldı.', 'A real monument from the Vakıf Katılım inventory. The game is paused meanwhile.')}</p>
          </>
        )}
        <a className="dugme krem baslik ep-sayfa" href={eserSayfasi(id)} target="_blank" rel="noopener noreferrer">
          {L('Tam sayfayı yeni sekmede aç ↗', 'Open the full page in a new tab ↗')}
        </a>
      </aside>
    </>
  )
}
