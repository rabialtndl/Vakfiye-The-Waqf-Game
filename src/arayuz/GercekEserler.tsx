import { useEffect, useState } from 'react'
import type React from 'react'
import type { AmacId } from '../motor/sabitler'
import { iki, L } from '../dil'
import { eserAc, gercekEserler, type GercekEser } from '../ortam'
import type { Ilham } from './ilham'
import type { BinaId } from '../sahne/koySvg'

// Oyundaki bina → envanterdeki eser türleri (Tekinoglu-Firin/web veri/ayarlar.json > eser_turleri).
export function binaTurleri(bina: BinaId, amac: AmacId): string[] {
  if (bina === 'hamam') return ['hamam']
  if (bina === 'han') return ['han', 'bedesten-carsi']
  if (bina === 'hayrat') return amac === 'asevi' ? ['imaret', 'kulliye'] : amac === 'medrese' ? ['medrese'] : amac === 'cami' ? ['cami'] : ['cesme', 'sebil']
  return []
}

const BASLIK: Record<string, string> = iki<Record<string, string>>({
  hamam: 'Gerçek hamamlar',
  han: 'Gerçek hanlar ve çarşılar',
  imaret: 'Gerçek imaretler ve külliyeler',
  medrese: 'Gerçek medreseler',
  cesme: 'Gerçek çeşmeler ve sebiller',
  cami: 'Gerçek camiler',
}, {
  hamam: 'Real bathhouses',
  han: 'Real inns and bazaars',
  imaret: 'Real imarets and külliyes',
  medrese: 'Real madrasas',
  cesme: 'Real fountains and sebils',
  cami: 'Real mosques',
})

/** Verilen türlerdeki gerçek eserler; fotoğraflılar önde. Yüklenirken null. */
export function useEserler(turler: string[]): GercekEser[] | null {
  const [eserler, setEserler] = useState<GercekEser[] | null>(null)
  const anahtar = turler.join(',')
  useEffect(() => {
    let iptal = false
    setEserler(null)
    gercekEserler(anahtar ? anahtar.split(',') : []).then((e) => {
      if (!iptal) setEserler([...e].sort((a, b) => Number(!!b.gorsel) - Number(!!a.gorsel)))
    })
    return () => {
      iptal = true
    }
  }, [anahtar])
  return eserler
}

export const ilAdi = (i: string) => i.charAt(0).toLocaleUpperCase('tr') + i.slice(1)

/** Fotoğrafı envanterde olmayan ya da yüklenemeyen eser: açıkça "fotoğraf yok" yazar. */
export function EserFoto({ e }: { e: GercekEser }) {
  return e.gorsel ? (
    <img src={e.gorsel} alt="" loading="lazy" onError={(ev) => ev.currentTarget.replaceWith(Object.assign(document.createElement('span'), { className: 'foto-yok', textContent: L('Fotoğraf yok', 'No photo') }))} />
  ) : (
    <span className="foto-yok">{L('Fotoğraf yok', 'No photo')}</span>
  )
}

/** İlham kaynağı kartı: bu binayı çizerken örnek aldığımız gerçek eser. */
export function IlhamKarti({ ilham, kucuk = false }: { ilham: Ilham; kucuk?: boolean }) {
  const eserler = useEserler([ilham.tur])
  const e = eserler?.find((x) => x.id === ilham.id)
  if (eserler === null) return <div className="ilham-karti bos" role="status">{L('İlham kaynağı yükleniyor…', 'Loading the inspiration…')}</div>
  if (!e) return null
  const foto = e.gorseller?.[ilham.foto - 1] ?? e.gorsel
  return (
    <button className={`ilham-karti ${kucuk ? 'kucuk-kart' : ''}`} onClick={() => eserAc(e.id)}>
      <span className="ilham-foto">
        {foto ? (
          <img src={foto} alt="" loading="lazy" onError={(ev) => { if (e.gorsel && ev.currentTarget.src !== e.gorsel) ev.currentTarget.src = e.gorsel }} />
        ) : (
          <span className="foto-yok" aria-hidden="true">🕌</span>
        )}
      </span>
      <span className="ilham-metin">
        <span className="ilham-etiket">{L('İlham kaynağı', 'Inspired by')}</span>
        <span className="eser-ad baslik">{e.ad}</span>
        <span className="kucuk">{ilAdi(e.il)}{e.ilce ? ` · ${e.ilce}` : ''}</span>
        {!kucuk && <span className="ilham-neden">{ilham.neden}</span>}
        <span className="ilham-git">{L('Eser sayfasını aç →', 'Open the monument page →')}</span>
      </span>
    </button>
  )
}

/** Bina panelindeki yatay şerit: birkaç gerçek eser büyük fotoğrafla, sonda "Hepsini gör". */
export function EserSeridi({ turler, onHepsi, haric }: { turler: string[]; onHepsi: () => void; haric?: string }) {
  const tumu = useEserler(turler)
  // Şeritte yalnız fotoğraflı eserler; fotoğrafsızlar "Hepsini gör" listesinde.
  const eserler = tumu && tumu.filter((e) => e.id !== haric && e.gorsel)
  if (eserler === null) return <div className="eser-seridi bos" role="status">{L('Gerçek örnekler yükleniyor…', 'Loading real examples…')}</div>
  if (eserler.length === 0) return null
  return (
    <div className="eser-seridi-kap">
      <div className="eser-seridi-baslik">
        <span className="baslik">{L('Benzer gerçek yapılar', 'Similar real buildings')}</span>
        <span className="kucuk">{L('Vakıf Katılım envanterinden · dokun, eser kartını aç', 'From the Vakıf Katılım inventory · tap to open the monument card')}</span>
      </div>
      <ul className="eser-seridi">
        {eserler.slice(0, 6).map((e) => (
          <li key={e.id}>
            <button className="eser-kucuk" onClick={() => eserAc(e.id)}>
              <EserFoto e={e} />
              <span className="eser-ad baslik">{e.ad}</span>
              <span className="kucuk">{ilAdi(e.il)}{e.ilce ? ` · ${e.ilce}` : ''}</span>
            </button>
          </li>
        ))}
        {eserler.length > 6 && (
          <li>
            <button className="eser-hepsi baslik" onClick={onHepsi}>
              {L('Hepsini gör', 'See all')}
              <span>{L(`${tumu!.length} yapı →`, `${tumu!.length} buildings →`)}</span>
            </button>
          </li>
        )}
      </ul>
    </div>
  )
}

type Props = {
  turler: string[]
  onKapat: () => void
  /** Haritadaki bir yerden (köprü, değirmen...) açıldıysa: başlık, açıklama, süzgeç ve ek bilgi. */
  baslik?: string
  aciklama?: string
  sec?: (e: GercekEser) => boolean
  ek?: React.ReactNode
}

/** Oyundaki binanın envanterdeki gerçek karşılıkları: oyun buradan eser kartına açılır. */
export function GercekEserler({ turler, onKapat, baslik, aciklama, sec, ek }: Props) {
  const tumu = useEserler(turler)
  const eserler = tumu && sec ? tumu.filter(sec) : tumu
  const [il, setIl] = useState<string>('hepsi')

  const iller = eserler ? [...new Set(eserler.map((e) => e.il))].sort() : []
  const gorunen = (eserler ?? []).filter((e) => il === 'hepsi' || e.il === il)

  return (
    <div className="ortala" onClick={(e) => e.stopPropagation()}>
      <section className="ahsap-panel bilgi-paneli" aria-labelledby="gercek-baslik">
        <h1 id="gercek-baslik" className="kurdele yesil baslik golgeli">{baslik ?? BASLIK[turler[0]] ?? L('Gerçek eserler', 'Real monuments')}</h1>
        <button className="kapat-dugmesi" aria-label={L('Kapat', 'Close')} onClick={onKapat}>✕</button>
        <p className="ayar-aciklama" style={{ margin: '0 0 8px' }}>
          {aciklama ?? L('Oyundaki bina, Vakıf Katılım envanterindeki bu yapılardan esinlenir. Birine dokun, eser kartını aç.', 'The building in the game is inspired by these buildings in the Vakıf Katılım inventory. Tap one to open its monument card.')}
        </p>
        {ek}
        {eserler && iller.length > 1 && (
          <div className="parcali" role="radiogroup" aria-label={L('Şehir', 'City')} style={{ alignSelf: 'flex-start', marginBottom: 8 }}>
            {['hepsi', ...iller].map((i) => (
              <button key={i} role="radio" aria-checked={il === i} onClick={() => setIl(i)}>
                {i === 'hepsi' ? L('Hepsi', 'All') : ilAdi(i)}
              </button>
            ))}
          </div>
        )}
        <div className="kaydirilir">
          {eserler === null && <p className="kucuk" role="status">{L('Eserler yükleniyor…', 'Loading monuments…')}</p>}
          {eserler !== null && gorunen.length === 0 && !ek && (
            <p className="kucuk" role="status">{L('Şu an gösterilecek eser yok. İnternet bağlantını kontrol et ya da Keşfet sekmesinden ara.', 'No monuments to show right now. Check your internet connection or search in the Explore tab.')}</p>
          )}
          <ul className="eser-izgara">
            {gorunen.map((e) => (
              <li key={e.id}>
                <button className="eser-kucuk" onClick={() => eserAc(e.id)}>
                  <EserFoto e={e} />
                  <span className="eser-ad baslik">{e.ad}</span>
                  <span className="kucuk">{ilAdi(e.il)}{e.ilce ? ` · ${e.ilce}` : ''}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  )
}
