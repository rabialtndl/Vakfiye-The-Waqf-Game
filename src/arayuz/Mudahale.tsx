import { useEffect, useMemo, useRef, useState } from 'react'
import type { Durum } from '../motor/motor'
import { dokun, mudahaleAdim, mudahaleBitir, mudahaleKur, mudahaleOrani, SU_EN_COK, suDoldur, type Mudahale as MudahaleDurumu, type MudahaleTuru } from '../mudahale'
import { rolBul } from '../roller'
import { ARABA_YOLU, ARSA_ALANI, BINA_ALANI, HAYRAT_ALANI, kutuOf, type Nokta } from '../sahne/harita'

export type MudahaleHaritasi = { m: MudahaleDurumu; alanlar: Nokta[][]; kuyu: Nokta | null; yataklar: Nokta[]; onDokun: (id: number) => void; onKuyu: () => void }

type Props = {
  durum: Durum
  tur: MudahaleTuru
  hareketiAzalt: boolean
  onHarita: (h: MudahaleHaritasi | null) => void
  /** oran null: oyuncu müdahaleyi geçti. */
  onBitir: (oran: number | null, mesaj: string) => void
  /** Olay şeridinden "Koş" ile gelindiyse tanıtım atlanır, oyun hemen başlar. */
  dogrudan?: boolean
  /** Kalfa rütbesi: görev süresine eklenen saniye. */
  ekSure?: number
}

/** Müdahalenin haritadaki yerleri: yangında han (ve arasta), depremde yıkılan binalar, salgında hayratın önü. */
export function yerler(d: Durum, tur: MudahaleTuru): { alanlar: Nokta[][]; kuyu: Nokta | null; yataklar: Nokta[] } {
  if (tur === 'yangin') {
    const alanlar = [BINA_ALANI.han, ...(d.yapilar.c1 ? [ARSA_ALANI.c1] : [])]
    const c = kutuOf(HAYRAT_ALANI.cesme)
    return { alanlar, kuyu: [c.x + c.w / 2, c.y + c.h * 0.55], yataklar: [] }
  }
  if (tur === 'deprem') {
    const k = d.bekleyenKarar
    const alanlar = [...(!k || k.hasarHamam > 0 ? [BINA_ALANI.hamam] : []), ...(!k || k.hasarHan > 0 ? [BINA_ALANI.han] : [])]
    return { alanlar: alanlar.length ? alanlar : [BINA_ALANI.hamam], kuyu: null, yataklar: [] }
  }
  const yol = ARABA_YOLU[d.ayarlar.amac]
  const [x, y] = yol[yol.length - 1]
  const bekleme: Nokta[] = [[x - 170, y + 20], [x + 170, y + 20], [x + 170, y + 150], [x - 170, y + 150]]
  return { alanlar: [bekleme], kuyu: null, yataklar: [[x - 150, y - 70], [x, y - 90], [x + 150, y - 70]] }
}

export function Mudahale({ durum, tur, hareketiAzalt, onHarita, onBitir, dogrudan = false, ekSure = 0 }: Props) {
  const takvim = durum.ayarlar.takvim ? durum.ayarlar.takvim + durum.yil : null
  const rol = rolBul(tur, takvim)
  const yer = useMemo(() => yerler(durum, tur), [durum, tur])
  const [m, setM] = useState<MudahaleDurumu>(() => mudahaleKur(tur, yer.alanlar.length, durum.rng ^ (durum.yil * 7919), ekSure))
  const [asama, setAsama] = useState<'giris' | 'oyun' | 'sonuc'>(dogrudan ? 'oyun' : 'giris')

  const son = useRef<number | null>(null)
  useEffect(() => {
    if (asama !== 'oyun') return
    let id = 0
    const kare = (simdi: number) => {
      const dt = son.current === null ? 0 : Math.min(0.25, (simdi - son.current) / 1000)
      son.current = simdi
      setM((o) => mudahaleAdim(o, dt))
      id = requestAnimationFrame(kare)
    }
    id = requestAnimationFrame(kare)
    return () => {
      cancelAnimationFrame(id)
      son.current = null
    }
  }, [asama])
  useEffect(() => {
    if (asama === 'oyun' && m.bitti) setAsama('sonuc')
  }, [asama, m.bitti])

  useEffect(() => {
    onHarita(asama === 'oyun' ? { m, ...yer, onDokun: (id) => setM((o) => dokun(o, id)), onKuyu: () => setM((o) => suDoldur(o)) } : null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [asama, m])
  useEffect(() => () => onHarita(null), [onHarita])

  const oran = mudahaleOrani(m)
  const dar = typeof window !== 'undefined' && window.matchMedia?.('(orientation: portrait) and (max-width: 600px)').matches

  if (asama === 'giris') {
    return (
      <div className="ortala" onClick={(e) => e.stopPropagation()}>
        <section className="ahsap-panel tarih-karti mudahale-giris" aria-labelledby="mud-baslik" role="dialog">
          <h1 className="kurdele kirmizi baslik golgeli">{tur === 'yangin' ? 'YANGIN!' : tur === 'deprem' ? 'DEPREM!' : 'SALGIN!'}</h1>
          <div className="tarih-ust">
            <span className="esnaf-simge" aria-hidden="true">{rol.simge}</span>
            <span><span className="kucuk">Şimdi sen:</span> <b className="baslik mud-rol">{rol.ad}</b></span>
          </div>
          <ul className="mud-gorev">
            {rol.gorev.map((g) => <li key={g}>{g}</li>)}
          </ul>
          <p className="tarih-oyunda">
            {tur === 'salgin' ? 'İyi iş çıkarırsan salgının fazladan giderinin bir kısmı yedek fona döner.' : 'İyi iş çıkarırsan hasar, dolayısıyla onarım bedeli %50’ye kadar azalır.'} 20 saniye sürer.
          </p>
          <details className="mud-tarih">
            <summary>Tarihte böyle miydi?</summary>
            <p>{rol.tarih}</p>
          </details>
          <div className="ikili">
            <button className="dugme krem baslik" onClick={() => onBitir(null, '')}>Geç</button>
            <button className="dugme yesil baslik buyuk-dugme" onClick={() => setAsama('oyun')} autoFocus>BAŞLA</button>
          </div>
        </section>
      </div>
    )
  }

  if (asama === 'sonuc') {
    return (
      <div className="ortala" onClick={(e) => e.stopPropagation()}>
        <section className="ahsap-panel tarih-karti" aria-labelledby="mud-sonuc" role="dialog">
          <h1 id="mud-sonuc" className="kurdele yesil baslik golgeli">{rol.ad.toLocaleUpperCase('tr')}</h1>
          <div className="sezon-skor">
            <div><span className="baslik">{m.kurtarilan}</span><span className="kucuk">{tur === 'yangin' ? 'alev söndü' : tur === 'deprem' ? 'yığın kalktı' : 'hasta iyileşti'}</span></div>
            <div><span className="baslik">{m.kaybedilen}</span><span className="kucuk">{tur === 'yangin' ? 'alev yayıldı' : tur === 'deprem' ? 'yığın çöktü' : 'hasta ağırlaştı'}</span></div>
            <div className="vurgu"><span className="baslik">%{Math.round(oran * 100)}</span><span className="kucuk">başarı</span></div>
          </div>
          {tur === 'deprem' && m.kisiKurtarilan > 0 && <p className="tarih-oyunda">Enkazın altından <b>{m.kisiKurtarilan} kişiye</b> ulaştın.</p>}
          <p className="tarih-metin">{rol.sonuc(oran)}</p>
          <details className="mud-tarih" open>
            <summary>Tarihte böyle miydi?</summary>
            <p>{rol.tarih}</p>
          </details>
          <button className="dugme yesil baslik buyuk-dugme" onClick={() => onBitir(oran, rol.sonuc(oran))} autoFocus>DEVAM</button>
        </section>
      </div>
    )
  }

  const kalan = Math.max(0, m.sure - m.t)
  return (
    <div className={`sezon-oyun mudahale-oyun ${hareketiAzalt ? '' : 'canli'}`} role="region" aria-label={rol.ad}>
      <div className="sezon-ust" onClick={(e) => e.stopPropagation()}>
        <span className="mud-rol-cip" aria-hidden="true">{rol.simge}</span>
        <div className="sezon-sure" role="timer" aria-label={`${Math.ceil(kalan)} saniye kaldı`}>
          <div className="dolu" style={{ width: `${(kalan / m.sure) * 100}%` }} />
          <span className="baslik">{Math.ceil(kalan)} sn</span>
        </div>
        {tur === 'yangin' &&
          (dar ? (
            // Dar ekranda çeşme kadraja sığmaz: su, kova göstergesine dokunarak doldurulur.
            <button className={`cip su-cip dugme-cip ${m.su === 0 ? 'bos' : ''}`} aria-label={`${m.su} kova su. Doldurmak için dokun`} onClick={() => setM((o) => suDoldur(o))}>
              {m.su === 0 ? '💧 Doldur' : `💧×${m.su}`}
            </button>
          ) : (
            <span className={`cip su-cip ${m.su === 0 ? 'bos' : ''}`} aria-label={`${m.su} kova su`}>
              {'💧'.repeat(m.su)}{'·'.repeat(SU_EN_COK - m.su)}
            </span>
          ))}
        <span className="cip mud-sayac" style={{ background: '#e4f3dc', color: '#3f8a25' }}>✓ {m.kurtarilan}</span>
        <span className="cip mud-sayac" style={{ background: '#f8e0d8', color: 'var(--tugla)' }}>✗ {m.kaybedilen}</span>
        <button className="dugme krem kucuk-dugme" onClick={() => setM((o) => mudahaleBitir(o))}>Bitir</button>
      </div>
      <div className="sezon-alt-panel mud-ipucu" onClick={(e) => e.stopPropagation()}>
        <span>{tur === 'yangin' ? (m.su === 0 ? (dar ? 'Su bitti! Üstteki 💧 Doldur’a dokun.' : 'Su bitti! Çeşmeye (💧) dokun.') : 'Alevlere dokun, büyümelerine izin verme.') : tur === 'deprem' ? 'Yığınlara üç kez dokun. Sarı rozetliler: altında insan var.' : 'Ateşi yükselen hastaya dokun, boş yatağa yatır.'}</span>
      </div>
    </div>
  )
}
