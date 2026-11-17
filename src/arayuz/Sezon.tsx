import { useEffect, useRef, useState } from 'react'
import type { Durum } from '../motor/motor'
import { SABITLER as S } from '../motor/sabitler'
import { eserAc } from '../ortam'
import { ARABA_KAPASITE, hazirla, hazirlaKontrol, keseTopla, sezonAdim, sezonKur, sezonPuani, sezonuBitir, topla, URUN_SIMGESI, URUNLER, yolaCik, yukIndir, type Sezon as SezonDurumu, type UrunId } from '../sezon'
import { useEserler } from './GercekEserler'

type Props = {
  durum: Durum
  okunan: string[]
  pullar: string[]
  sureli: boolean
  /** Level zorluğu (1–4). */
  zorluk?: number
  hareketiAzalt: boolean
  onOku: (eserId: string) => void
  onBitir: (bonus: number) => void
  /** Oyun sırasında sezon durumunu haritaya verir (null: harita normale döner). */
  onHarita: (h: { s: SezonDurumu; onTopla: (id: string) => void; onKese: (id: number) => void } | null) => void
}

const UYARI: Record<string, (u: string) => string> = {
  kilitli: (u) => `${u} henüz yok: önce eser kartını oku.`,
  mesgul: (u) => `${u} hazırlanıyor…`,
  bugday: () => 'Buğday yok: tarladaki 🌾 balonuna dokun.',
  'araba-yolda': () => 'Araba yolda. Dönünce yükleyebilirsin.',
  'araba-dolu': () => `Araba dolu (${ARABA_KAPASITE} ürün). “Yola çık”a bas.`,
}

/** Hayratın yönelme hâli: "aşevine", "camiye"... */
const YONELME: Record<string, string> = { asevi: 'aşevine', cami: 'camiye', medrese: 'medreseye', cesme: 'çeşmeye' }

const yuzde = (x: number) => `%${Math.round(x * 100)}`

/** Ürünün dayandığı gerçek eserin fotoğrafı. */
function UrunFoto({ u }: { u: UrunId }) {
  const eserler = useEserler([URUNLER[u].eserTur])
  const e = eserler?.find((x) => x.id === URUNLER[u].eser)
  return e?.gorsel ? <img src={e.gorsel} alt="" loading="lazy" /> : <span className="foto-yok" aria-hidden="true">🕌</span>
}

/** Sezon: hasat topla, hayrata gelenlere hizmet ver. Bitince o turun gelirine bonus. */
export function Sezon({ durum, okunan, pullar, sureli, zorluk = 1, hareketiAzalt, onOku, onBitir, onHarita }: Props) {
  const kur = () => sezonKur({ durum, okunan, pullar, sureli, zorluk })
  const [s, setS] = useState<SezonDurumu>(kur)
  const [asama, setAsama] = useState<'hazirlik' | 'oyun' | 'sonuc'>('hazirlik')
  const [uyari, setUyari] = useState<string | null>(null)
  const hayrat = S.AMACLAR[durum.ayarlar.amac].ad

  // Kart okununca açık ürünler güncellensin (hazırlıkta).
  useEffect(() => {
    if (asama === 'hazirlik') setS(kur())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [okunan.join(','), asama])

  // Zaman akışı.
  const son = useRef<number | null>(null)
  useEffect(() => {
    if (asama !== 'oyun') return
    let id = 0
    const kare = (simdi: number) => {
      const dt = son.current === null ? 0 : Math.min(0.25, (simdi - son.current) / 1000)
      son.current = simdi
      setS((o) => sezonAdim(o, dt))
      id = requestAnimationFrame(kare)
    }
    id = requestAnimationFrame(kare)
    return () => {
      cancelAnimationFrame(id)
      son.current = null
    }
  }, [asama])
  useEffect(() => {
    if (asama === 'oyun' && s.bitti) setAsama('sonuc')
  }, [asama, s.bitti])
  useEffect(() => {
    if (!uyari) return
    const id = setTimeout(() => setUyari(null), 1800)
    return () => clearTimeout(id)
  }, [uyari])

  const yukle = (u: UrunId) => {
    const k = hazirlaKontrol(s, u)
    if (k === 'tamam') setS((o) => hazirla(o, u))
    else setUyari(UYARI[k](URUNLER[u].ad))
  }

  // Oyun sırasında harita sezonu çizer; balon ve keselere dokunmak buradaki durumu değiştirir.
  useEffect(() => {
    onHarita(asama === 'oyun' ? { s, onTopla: (id) => setS((o) => topla(o, id)), onKese: (id) => setS((o) => keseTopla(o, id)) } : null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [asama, s])
  useEffect(() => () => onHarita(null), [onHarita])

  // ---------- Hazırlık ----------
  if (asama === 'hazirlik') {
    return (
      <div className="ortala" onClick={(e) => e.stopPropagation()}>
        <section className="ahsap-panel sezon-paneli" aria-labelledby="sezon-baslik">
          <h1 id="sezon-baslik" className="kurdele yesil baslik golgeli">SEZON</h1>
          <p className="sezon-giris">
            {durum.yil + 10}. yıla kadar olan sezon, haritanın üstünde oynanır:
          </p>
          <ol className="sezon-adimlar">
            <li><b>Topla:</b> mülklerin üstünde 🪙 ya da 🌾 balonu, yollarda 💰 yardım kesesi çıkınca dokun.</li>
            <li><b>Yükle:</b> {hayrat.toLocaleLowerCase('tr')} önünde bekleyenlerin istediği ürünü aşağıdan seç, arabaya en çok {ARABA_KAPASITE} ürün sığar.</li>
            <li><b>Gönder:</b> “Yola çık”a bas. Araba sandıktan {YONELME[durum.ayarlar.amac]} gider, ürünleri bekleyenlere dağıtır ve döner.</li>
          </ol>
          <p className="sezon-giris">
            İyi bir sezon bu turun gelirini <b>%20'ye kadar</b> artırır.
          </p>
          <h2 className="baslik sezon-alt">{hayrat} ne verir?{zorluk >= 3 && <span className="kucuk"> · Bu levelde 4 ürün, kişiler daha sabırsız</span>}</h2>
          <ul className="urun-kartlari">
            {s.menu.map((u) => {
              const acik = s.acik.includes(u)
              const t = URUNLER[u]
              return (
                <li key={u} className={acik ? 'acik' : 'kilitli'}>
                  <span className="urun-foto"><UrunFoto u={u} /></span>
                  <span className="urun-metin">
                    <span className="baslik urun-ad">{t.ad}{s.pullu.includes(u) && <span className="cip pul-cip">Pul · 2× hızlı</span>}</span>
                    <span className="kucuk">{t.eserAd}</span>
                    <span className="urun-neden">{t.neden}</span>
                    {acik ? (
                      <button className="ilham-git bag" onClick={() => eserAc(t.eser)}>Eser kartı →</button>
                    ) : (
                      <button
                        className="dugme altin kucuk-dugme"
                        onClick={() => {
                          eserAc(t.eser)
                          onOku(t.eser)
                        }}
                      >
                        Kartı oku, {t.ad.toLocaleLowerCase('tr')} açılsın →
                      </button>
                    )}
                  </span>
                </li>
              )
            })}
          </ul>
          <p className="kucuk sezon-not">
            {pullar.length > 0
              ? `Pasaportunda ${pullar.length} pul var: kişiler ${String(Math.min(3, pullar.length * 0.5)).replace('.', ',')} sn daha sabırlı. Pulu olan eserin ürünü iki kat hızlı hazırlanır.`
              : 'Mobil uygulamada eserleri gezip pul topla: pulu olan eserin ürünü iki kat hızlı hazırlanır.'}
            {!sureli && ' Süresiz sezon açık: acele etme.'}
          </p>
          <div className="ikili">
            <button className="dugme krem baslik" onClick={() => onBitir(0)}>Bu sezonu atla</button>
            <button className="dugme yesil baslik buyuk-dugme" onClick={() => setAsama('oyun')} autoFocus>BAŞLA</button>
          </div>
        </section>
      </div>
    )
  }

  const puan = sezonPuani(s)

  // ---------- Sonuç ----------
  if (asama === 'sonuc') {
    const kilitliKacan = s.kacan.filter((k) => k.kilitli)
    const eksik = [...new Set(kilitliKacan.map((k) => k.urun))]
    return (
      <div className="ortala" onClick={(e) => e.stopPropagation()}>
        <section className="ahsap-panel sezon-paneli" aria-labelledby="sezon-sonuc">
          <h1 id="sezon-sonuc" className="kurdele yesil baslik golgeli">SEZON BİTTİ</h1>
          <div className="sezon-skor">
            <div><span className="baslik">{s.hasatAlinan}</span><span className="kucuk">hasat · {yuzde(puan.hasat)}</span></div>
            <div><span className="baslik">{s.verilen}</span><span className="kucuk">kişiye hizmet · {yuzde(puan.hizmet)}</span></div>
            <div className="vurgu"><span className="baslik">+{yuzde(puan.bonus)}</span><span className="kucuk">bu turun geliri</span></div>
          </div>
          {eksik.length > 0 && (
            <div className="sezon-eksik">
              <p style={{ margin: 0 }}>
                <b>{kilitliKacan.length} kişi</b> {eksik.map((u) => URUNLER[u].ad.toLocaleLowerCase('tr')).join(' ve ')} istedi ama {hayrat.toLocaleLowerCase('tr')} veremedi. Eserin kartını okursan bir sonraki sezonda verebilirsin.
              </p>
              {eksik.map((u) => (
                <button
                  key={u}
                  className="dugme altin kucuk-dugme"
                  onClick={() => {
                    eserAc(URUNLER[u].eser)
                    onOku(URUNLER[u].eser)
                  }}
                >
                  {URUNLER[u].eserAd} kartını oku →
                </button>
              ))}
            </div>
          )}
          <button className="dugme yesil baslik buyuk-dugme" onClick={() => onBitir(puan.bonus)} autoFocus>10 YIL GEÇSİN</button>
        </section>
      </div>
    )
  }

  // ---------- Oyun ----------
  const kalan = s.sure === null ? null : Math.max(0, s.sure - s.t)
  const yolda = s.araba.durum !== 'depoda'
  return (
    <div className={`sezon-oyun ${hareketiAzalt ? '' : 'canli'}`} role="region" aria-label="Sezon">
      <div className="sezon-ust" onClick={(e) => e.stopPropagation()}>
        {kalan !== null ? (
          <div className="sezon-sure" role="timer" aria-label={`${Math.ceil(kalan)} saniye kaldı`}>
            <div className="dolu" style={{ width: `${(kalan / s.sure!) * 100}%` }} />
            <span className="baslik">{Math.ceil(kalan)} sn</span>
          </div>
        ) : (
          <span className="baslik sezon-sayac">{s.musteriNo} / {s.musteriSiniri} kişi</span>
        )}
        <span className="cip" style={{ background: 'var(--altin)', color: '#3A2205' }} title="Toplanan hasat ve kese">🪙 {s.hasatAlinan}</span>
        <span className="cip" style={{ background: 'var(--turkuaz)', color: '#fff' }} title="Ulaşılan kişi">🙂 {s.verilen}</span>
        {s.bugdayGerekli && <span className="cip" style={{ background: 'var(--parsomen-koyu)' }} title="Ambardaki buğday">🌾 {s.bugday}</span>}
        <button className="dugme krem kucuk-dugme" onClick={() => setS((o) => sezonuBitir(o))}>Bitir</button>
      </div>

      <div className="sezon-alt-panel" onClick={(e) => e.stopPropagation()}>
        <div className="sezon-sira" aria-live="polite">
          <span className="kucuk">{hayrat} önünde:</span>
          {s.musteriler.length === 0 ? (
            <span className="kucuk">kimse yok</span>
          ) : (
            s.musteriler.map((m) => (
              <span key={m.id} className={`sira-cip ${s.acik.includes(m.urun) ? '' : 'kilitli'}`} title={URUNLER[m.urun].ad}>
                {s.acik.includes(m.urun) ? URUN_SIMGESI[m.urun] : '❔'} <span className="gizli">{URUNLER[m.urun].ad}</span>
              </span>
            ))
          )}
        </div>

        <div className="sezon-sandik">
          <div className="urun-dugmeleri" style={{ gridTemplateColumns: `repeat(${s.menu.length}, 1fr)` }}>
            {s.menu.map((u) => {
              const acik = s.acik.includes(u)
              const mesgulKalan = Math.max(0, (s.mesgul[u] ?? 0) - s.t)
              const sure = URUNLER[u].hazirlik / (s.pullu.includes(u) ? 2 : 1)
              return (
                <button key={u} className={`urun-dugmesi baslik ${acik ? '' : 'kilitli'}`} onClick={() => yukle(u)} aria-label={`${URUNLER[u].ad} hazırla ve yükle${acik ? '' : ' (kilitli)'}`}>
                  <span className="urun-hazirlik" style={{ height: `${(mesgulKalan / sure) * 100}%` }} aria-hidden="true" />
                  <span className="urun-simge" aria-hidden="true">{acik ? URUN_SIMGESI[u] : '🔒'}</span>
                  <span>{URUNLER[u].ad}</span>
                  {s.pullu.includes(u) && <span className="kucuk">pul · 2×</span>}
                </button>
              )
            })}
          </div>

          <div className="araba-kutusu">
            <button className="yuk-yuvalari" onClick={() => setS((o) => yukIndir(o))} disabled={yolda || !s.yuk.length} aria-label={`Arabada ${s.yuk.length} ürün. Sonuncuyu indirmek için dokun.`}>
              {Array.from({ length: ARABA_KAPASITE }, (_, i) => (
                <span key={i} className={`yuva ${s.yuk[i] ? 'dolu' : ''}`}>{!yolda && s.yuk[i] ? URUN_SIMGESI[s.yuk[i]] : ''}</span>
              ))}
            </button>
            <button className="dugme yesil baslik yola-cik" onClick={() => setS((o) => yolaCik(o))} disabled={yolda || !s.yuk.length}>
              {yolda ? (s.araba.durum === 'gidiyor' ? 'Yolda…' : 'Dönüyor…') : 'Yola çık 🛒'}
            </button>
          </div>
        </div>
        <div className="sezon-uyari" role="status">{uyari ?? (s.t < 6 ? 'Haritadaki balonlara ve keselere dokun; bekleyenlerin istediğini yükleyip arabayı gönder.' : ' ')}</div>
      </div>
    </div>
  )
}
