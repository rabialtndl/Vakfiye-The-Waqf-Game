// Vakfiye belgesi: oyunun sonunda oyuncunun seçimlerinden yazılan, parşömen görünümlü vakfiye.
// Metin src/vakfiye.ts'ten gelir (saf). Burada yalnız sayfa, ad girişi, kopyalama ve PNG indirme var.
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import type { Durum } from '../motor/motor'
import { L } from '../dil'
import { ortam } from '../ortam'
import { vakfiyeMetni, vakfiyeOlustur, type Vakfiye } from '../vakfiye'

const AD_ANAHTARI = 'vakfiye.paylasanAd' // PaylasPaneli ile aynı: ad bir kez girilir

function adOku(): string {
  try {
    const uye = ortam.araclar.uyeAdi?.()?.trim()
    if (uye) return uye // üyelik varsa ad site hesabından gelir
    return localStorage.getItem(AD_ANAHTARI) ?? ''
  } catch {
    return ''
  }
}
function adYaz(ad: string) {
  try {
    localStorage.setItem(AD_ANAHTARI, ad)
  } catch {
    /* gizli pencere vb. */
  }
}

function satirlara(c: CanvasRenderingContext2D, metin: string, genislik: number): string[] {
  const satirlar: string[] = []
  let s = ''
  for (const k of metin.split(/\s+/)) {
    const deneme = s ? `${s} ${k}` : k
    if (c.measureText(deneme).width > genislik && s) {
      satirlar.push(s)
      s = k
    } else s = deneme
  }
  if (s) satirlar.push(s)
  return satirlar
}

/** Harf aralıklı yazı (canvas.letterSpacing her tarayıcıda yok). Genişliği döndürür. */
function aralikli(c: CanvasRenderingContext2D, t: string, cx: number, y: number, aralik: number, ciz = true): number {
  const harfler = [...t]
  const w = harfler.reduce((a, h) => a + c.measureText(h).width, 0) + aralik * (harfler.length - 1)
  if (ciz) {
    const eski = c.textAlign
    c.textAlign = 'left'
    let x = cx - w / 2
    for (const h of harfler) {
      c.fillText(h, x, y)
      x += c.measureText(h).width + aralik
    }
    c.textAlign = eski
  }
  return w
}

/** Çizgi - elmas - çizgi ayracı. */
function ayrac(c: CanvasRenderingContext2D, cx: number, y: number, genislik: number) {
  c.strokeStyle = '#a77b3d'
  c.fillStyle = '#8a5a2b'
  c.lineWidth = 1.2
  c.beginPath()
  c.moveTo(cx - genislik / 2, y)
  c.lineTo(cx - 10, y)
  c.moveTo(cx + 10, y)
  c.lineTo(cx + genislik / 2, y)
  c.stroke()
  c.beginPath()
  c.moveTo(cx, y - 5)
  c.lineTo(cx + 5, y)
  c.lineTo(cx, y + 5)
  c.lineTo(cx - 5, y)
  c.closePath()
  c.fill()
}

const KAGIT = 'vakfiye-parsomen.webp'
const YAZI = '"EB Garamond", Georgia, "Times New Roman", serif'

function resimYukle(src: string): Promise<HTMLImageElement | null> {
  return new Promise((coz) => {
    const img = new Image()
    img.onload = () => coz(img)
    img.onerror = () => coz(null)
    img.src = src
  })
}

/** 900 px genişliğinde parşömen sayfası. Metin sığmazsa kâğıdın orta kısmı uzatılır (üst ve alt süsleme bozulmaz). */
async function belgeCiz(v: Vakfiye): Promise<HTMLCanvasElement> {
  const W = 900
  const SOL = 0.11 * W
  const GEN = W - 2 * SOL
  const SAT = 33
  try {
    await Promise.all([document.fonts?.load(`600 25px ${YAZI}`), document.fonts?.load(`700 28px ${YAZI}`), document.fonts?.load(`italic 600 40px ${YAZI}`)])
    await document.fonts?.ready
  } catch {
    /* sistem yazısı */
  }
  const kagit = await resimYukle(`${ortam.varlikKoku}${KAGIT}`)
  const kh = kagit ? Math.round((W / kagit.width) * kagit.height) : 1400
  const olc = document.createElement('canvas').getContext('2d')!
  olc.font = `600 25px ${YAZI}`
  olc.font = `700 28px ${YAZI}`
  let metinH = 30 + 26 + satirlara(olc, v.baslik, GEN).length * 34 + 6 + 36
  olc.font = `600 25px ${YAZI}`
  for (const [i, b] of v.bolumler.entries()) {
    if (i > 0) metinH += 8
    metinH += 46
    for (const s of b.satirlar) metinH += satirlara(olc, s, GEN).length * SAT + 6
    metinH += 14
  }
  if (v.bolumler.some((b) => b.oyunEki)) metinH += 40
  const BAS = Math.round(0.205 * kh)
  const ALT_BOS = Math.round(0.17 * kh)
  const H = Math.max(kh, BAS + metinH + ALT_BOS)
  const cv = document.createElement('canvas')
  cv.width = W
  cv.height = H
  const c = cv.getContext('2d')!
  if (kagit) {
    const ust = Math.round(0.4 * kh)
    const alt = Math.round(0.3 * kh)
    const kaynakOran = kagit.height / kh
    c.drawImage(kagit, 0, 0, kagit.width, ust * kaynakOran, 0, 0, W, ust)
    c.drawImage(kagit, 0, ust * kaynakOran, kagit.width, (kh - ust - alt) * kaynakOran, 0, ust, W, H - ust - alt)
    c.drawImage(kagit, 0, (kh - alt) * kaynakOran, kagit.width, alt * kaynakOran, 0, H - alt, W, alt)
  } else {
    c.fillStyle = '#f4e6c3'
    c.fillRect(0, 0, W, H)
  }
  c.textBaseline = 'middle'
  c.textAlign = 'center'
  c.fillStyle = '#3a2414'
  c.font = `700 54px ${YAZI}`
  c.fillStyle = '#4a2f18'
  aralikli(c, L('VAKFİYE', 'VAKFIYE'), W / 2, 0.109 * kh, 5)
  c.textBaseline = 'top'
  c.textAlign = 'left'
  let y = BAS
  c.font = `600 22px ${YAZI}`
  c.fillStyle = '#3a2414'
  const hw = aralikli(c, L('HAYIRLI OLSUN', 'MAY IT BE BLESSED'), W / 2, y, 7, false)
  aralikli(c, L('HAYIRLI OLSUN', 'MAY IT BE BLESSED'), W / 2, y, 7)
  const yan = (W - 2 * SOL - hw - 40) / 2
  ayrac(c, SOL + yan / 2, y + 13, yan)
  ayrac(c, W - SOL - yan / 2, y + 13, yan)
  y += 30
  ayrac(c, W / 2, y + 6, 0.5 * W)
  y += 26
  c.font = `700 28px ${YAZI}`
  c.fillStyle = '#7a2e1d'
  c.textAlign = 'center'
  for (const l of satirlara(c, v.baslik, GEN)) {
    c.fillText(l, W / 2, y)
    y += 34
  }
  y += 6
  c.font = `700 24px ${YAZI}`
  c.fillStyle = v.ayakta ? '#8a5a00' : '#9a2f1d'
  c.fillText(v.ayakta ? L('Vakıf ayakta kaldı', 'The foundation stood') : L('Vakıf çöktü', 'The foundation fell'), W / 2, y)
  c.textAlign = 'left'
  y += 36
  for (const [i, b] of v.bolumler.entries()) {
    if (i > 0) y += 8
    c.fillStyle = '#7a2e1d'
    c.font = `700 28px ${YAZI}`
    c.fillText(b.baslik + (b.oyunEki ? ' *' : ''), SOL, y)
    y += 46
    c.fillStyle = '#3a2414'
    c.font = `600 25px ${YAZI}`
    for (const s of b.satirlar) {
      for (const l of satirlara(c, s, GEN)) {
        c.fillText(l, SOL, y)
        y += SAT
      }
      y += 6
    }
    y += 14
  }
  if (v.bolumler.some((b) => b.oyunEki)) {
    c.font = `italic 600 20px ${YAZI}`
    c.fillStyle = '#6b4a2b'
    c.fillText(L('* Bu bölüm gerçek vakfiyelerde yoktur; oyun kendi kayıtlarından ekledi.', '* Real deeds have no such section; the game added it from its own records.'), SOL, y)
  }
  c.textBaseline = 'middle'
  c.textAlign = 'center'
  ayrac(c, W / 2, H - 0.135 * kh, 0.46 * W)
  c.fillStyle = '#4a2f18'
  c.font = `italic 600 40px ${YAZI}`
  c.fillText(L('Hayırlara Vesile Olsun', 'May It Bring Good'), W / 2, H - 0.098 * kh)
  return cv
}

type Props = { durum: Durum; onKapat: () => void }

export function VakfiyeBelgesi({ durum, onKapat }: Props) {
  const [ad, setAd] = useState(adOku)
  const [mesaj, setMesaj] = useState<string | null>(null)
  const v = useMemo(() => vakfiyeOlustur(durum, ad), [durum, ad])
  const oyunEkiVar = v.bolumler.some((b) => b.oyunEki)
  // Yazı sığmazsa yazı boyutu adım adım küçülür (en az 10,5 px); yine sığmazsa kaydırılır.
  const icerik = useRef<HTMLDivElement>(null)
  useLayoutEffect(() => {
    const e = icerik.current
    if (!e) return
    const sigdir = () => {
      e.style.fontSize = ''
      let px = parseFloat(getComputedStyle(e).fontSize)
      while (e.scrollHeight > e.clientHeight + 1 && px > 10.5) {
        px = Math.max(10.5, px - 0.5)
        e.style.fontSize = `${px}px`
      }
    }
    sigdir()
    const ro = new ResizeObserver(sigdir)
    ro.observe(e)
    return () => ro.disconnect()
  }, [v])

  useEffect(() => {
    const kapat = (e: KeyboardEvent) => e.key === 'Escape' && onKapat()
    window.addEventListener('keydown', kapat)
    return () => window.removeEventListener('keydown', kapat)
  }, [onKapat])

  const indir = async () => {
    adYaz(ad.trim())
    try {
      const cv = await belgeCiz(v)
      const a = document.createElement('a')
      a.href = cv.toDataURL('image/png')
      a.download = 'vakfiye.png'
      a.click()
      setMesaj(L('Vakfiye resmi indirildi.', 'Vakfiye image downloaded.'))
    } catch {
      setMesaj(L('Resim hazırlanamadı. Metni kopyalayabilirsin.', 'The image could not be made. You can copy the text.'))
    }
  }
  const kopyala = async () => {
    adYaz(ad.trim())
    try {
      await navigator.clipboard.writeText(vakfiyeMetni(v))
      setMesaj(L('Vakfiye metni kopyalandı.', 'Vakfiye text copied.'))
    } catch {
      setMesaj(L('Kopyalanamadı: metni seçip kopyalayabilirsin.', 'Could not copy: select the text and copy it.'))
    }
  }

  return (
    <div className="ortala" onClick={onKapat}>
      <section className="ahsap-panel vakfiye-paneli" role="dialog" aria-labelledby="vakfiye-baslik" onClick={(e) => e.stopPropagation()}>
        <label className="paylas-ad">
          <span>{L('Adın (vâkıf olarak yazılır, isteğe bağlı)', 'Your name (written as the founder, optional)')}</span>
          <input value={ad} maxLength={24} onChange={(e) => setAd(e.target.value)} placeholder={L('Boş bırakırsan "Bir hayır sahibi" yazılır', 'Leave empty for "A benefactor"')} />
        </label>
        <article className="vakfiye-kagit" style={{ backgroundImage: `url(${ortam.varlikKoku}${KAGIT})` }}>
          <h1 id="vakfiye-baslik" className="vakfiye-baslik">{L('VAKFİYE', 'VAKFIYE')}</h1>
          <div className="vakfiye-icerik" tabIndex={0} ref={icerik}>
            <p className="vakfiye-hayir" aria-hidden="true"><span>{L('HAYIRLI OLSUN', 'MAY IT BE BLESSED')}</span></p>
            <p className="vakfiye-ayrac" aria-hidden="true" />
            <p className="vakfiye-ad">{v.baslik}</p>
            <p className={`vakfiye-durum ${v.ayakta ? 'ayakta' : 'coktu'}`}>{v.ayakta ? L('Vakıf ayakta kaldı', 'The foundation stood') : L('Vakıf çöktü', 'The foundation fell')}</p>
            {v.bolumler.map((b) => (
              <section key={b.id} className="vakfiye-bolum">
                {/* Başlık satır başında: "Davet. Hamd, âlemlerin…" (belge parşömene kaydırmadan sığsın). */}
                {b.satirlar.map((s, i) => (
                  <p key={i}>
                    {i === 0 && <b className="vakfiye-bolum-adi">{b.baslik}{b.oyunEki ? '*' : ''}. </b>}
                    {s}
                  </p>
                ))}
              </section>
            ))}
            {oyunEkiVar && <p className="vakfiye-dipnot">{L('* Bu bölüm gerçek vakfiyelerde yoktur; oyun kendi kayıtlarından ekledi.', '* Real deeds have no such section; the game added it from its own records.')}</p>}
          </div>
          <p className="vakfiye-kapanis">{L('Hayırlara Vesile Olsun', 'May It Bring Good')}</p>
        </article>
        <div className="paylas-dugmeler">
          <button className="dugme yesil baslik" onClick={indir}>{L('RESİM İNDİR', 'DOWNLOAD IMAGE')}</button>
          <button className="dugme krem baslik" onClick={kopyala}>{L('METNİ KOPYALA', 'COPY TEXT')}</button>
        </div>
        {mesaj && <div role="status" className="hap koyu paylas-durum">{mesaj}</div>}
        <button className="bag paylas-kapat" onClick={onKapat}>{L('Kapat', 'Close')}</button>
      </section>
    </div>
  )
}
