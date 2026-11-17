// Paylaş: sonucun bir kart resmi ve bir "meydan okuma" bağlantısı. Bağlantıyı açan arkadaş aynı leveli
// aynı afetlerle oynar (kilitli olsa bile), sonunda iki vakıf karşılaştırılır.
import { useEffect, useState } from 'react'
import { L } from '../dil'
import { meydanBaglantisi, type Meydan } from '../meydan'
import { ortam } from '../ortam'

export type KartBilgisi = {
  ayakta: boolean
  levelAd: string
  yildiz: number
  yil: number
  hedefYil: number
  olay: number
  karar: number
  ders: string
  rutbe: string
  hayrat: string
}

const AD_ANAHTARI = 'vakfiye.paylasanAd'
function adOku(): string {
  try {
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
  const kelimeler = metin.split(/\s+/)
  const satirlar: string[] = []
  let s = ''
  for (const k of kelimeler) {
    const deneme = s ? `${s} ${k}` : k
    if (c.measureText(deneme).width > genislik && s) {
      satirlar.push(s)
      s = k
    } else s = deneme
  }
  if (s) satirlar.push(s)
  return satirlar
}

/** Yazıyı sığdırır: verilen genişliği aşarsa yazı boyutu küçülür (İngilizce satırlar daha uzun). */
function sigdir(c: CanvasRenderingContext2D, metin: string, x: number, y: number, genislik: number, boyut: number, govde: string) {
  let b = boyut
  c.font = govde.replace('{b}', String(b))
  while (b > 14 && c.measureText(metin).width > genislik) c.font = govde.replace('{b}', String(--b))
  c.fillText(metin, x, y)
}

function resimYukle(src: string): Promise<HTMLImageElement | null> {
  return new Promise((coz) => {
    const img = new Image()
    img.onload = () => coz(img)
    img.onerror = () => coz(null)
    img.src = src
  })
}

/** 1200×630 paylaşım kartı: solda şehir haritası, sağda sonuç. */
async function kartCiz(k: KartBilgisi, ad: string): Promise<HTMLCanvasElement> {
  const W = 1200
  const H = 630
  const cv = document.createElement('canvas')
  cv.width = W
  cv.height = H
  const c = cv.getContext('2d')!
  const baslikYazi = '"Lilita One", "Fredoka", "Nunito", system-ui, sans-serif'
  const govde = '"Nunito", system-ui, sans-serif'
  try {
    await document.fonts?.ready
  } catch {
    /* yazı tipleri yoksa sistem yazısı */
  }
  // zemin
  c.fillStyle = '#F6E7C1'
  c.fillRect(0, 0, W, H)
  // harita
  const harita = await resimYukle(`${ortam.varlikKoku}harita.webp`)
  if (harita) {
    c.save()
    c.beginPath()
    c.roundRect(28, 28, 500, H - 56, 26)
    c.clip()
    c.drawImage(harita, 470, 120, 640, 760, 28, 28, 500, H - 56)
    if (!k.ayakta) {
      c.fillStyle = 'rgba(60,30,20,0.35)'
      c.fillRect(28, 28, 500, H - 56)
    }
    c.restore()
    c.lineWidth = 6
    c.strokeStyle = '#5A3A1E'
    c.beginPath()
    c.roundRect(28, 28, 500, H - 56, 26)
    c.stroke()
  }
  const x0 = 570
  // kurdele
  c.fillStyle = k.ayakta ? '#E8A93A' : '#B8432F'
  c.beginPath()
  c.roundRect(x0, 48, 580, 92, 20)
  c.fill()
  c.fillStyle = '#fff'
  c.font = `64px ${baslikYazi}`
  c.textBaseline = 'middle'
  c.fillText(k.ayakta ? L('VAKIF AYAKTA!', 'STILL STANDING!') : L('VAKIF ÇÖKTÜ', 'COLLAPSED'), x0 + 26, 96)
  // level ve yıl
  c.fillStyle = '#3A2410'
  c.font = `34px ${baslikYazi}`
  c.fillText(k.levelAd, x0, 182)
  sigdir(c, L(`${k.hayrat} · ${k.yil} / ${k.hedefYil} yıl · ${k.olay} afet · ${k.karar} karar`, `${k.hayrat} · ${k.yil} / ${k.hedefYil} yrs · ${k.olay} disasters · ${k.karar} decisions`), x0, 224, 580, 26, `600 {b}px ${govde}`)
  // yıldızlar
  c.font = `72px ${govde}`
  for (let i = 0; i < 3; i++) {
    c.fillStyle = i < k.yildiz ? '#F2B33D' : '#D8C9A6'
    c.fillText('★', x0 + i * 78, 296)
  }
  c.fillStyle = '#5A3A1E'
  c.font = `700 26px ${govde}`
  c.fillText(k.rutbe, x0 + 260, 300)
  // ders
  c.font = `italic 600 25px ${govde}`
  c.fillStyle = '#3A2410'
  satirlara(c, `“${k.ders}”`, 580)
    .slice(0, 3)
    .forEach((s, i) => c.fillText(s, x0, 366 + i * 34))
  // meydan okuma
  c.fillStyle = '#13807D'
  c.beginPath()
  c.roundRect(x0, 482, 580, 100, 20)
  c.fill()
  c.fillStyle = '#fff'
  c.font = `32px ${baslikYazi}`
  c.fillText(ad ? L(`${ad} sana meydan okuyor!`, `${ad} challenges you!`) : L('Sana meydan okuyorum!', 'I challenge you!'), x0 + 24, 516)
  sigdir(c, L('Aynı afetler, aynı şehir. Sen daha uzun yaşatabilir misin?', 'Same disasters, same city. Can you keep it alive longer?'), x0 + 24, 554, 532, 22, `600 {b}px ${govde}`)
  c.fillStyle = '#7A5A3A'
  c.font = `700 20px ${govde}`
  c.fillText(L('Vakfiye · vakıf eserleri oyunu', 'Vakfiye · a game of foundation heritage'), x0, 606)
  return cv
}

type Props = { kart: KartBilgisi; meydan: Meydan; onKapat: () => void }

export function PaylasPaneli({ kart, meydan, onKapat }: Props) {
  const [ad, setAd] = useState(adOku)
  const [resim, setResim] = useState<{ url: string; blob: Blob | null } | null>(null)
  const [durum, setDurum] = useState<string | null>(null)
  const adres = typeof window !== 'undefined' ? window.location.href : 'https://example.org/'
  const baglanti = meydanBaglantisi({ ...meydan, ...(ad.trim() ? { ad: ad.trim() } : {}) }, adres)
  const yildizlar = `${'★'.repeat(kart.yildiz)}${'☆'.repeat(3 - kart.yildiz)}`
  const metin = L(`${kart.ayakta ? 'Vakfım ayakta kaldı' : 'Vakfım çöktü'}: ${kart.levelAd}, ${kart.yil} yıl, ${yildizlar}. Aynı afetlerle sen daha iyisini yapabilir misin?`, `${kart.ayakta ? 'My foundation stood' : 'My foundation fell'}: ${kart.levelAd}, ${kart.yil} years, ${yildizlar}. Can you do better with the same disasters?`)

  useEffect(() => {
    let iptal = false
    const t = setTimeout(async () => {
      try {
        const cv = await kartCiz(kart, ad.trim())
        const blob = await new Promise<Blob | null>((coz) => cv.toBlob(coz, 'image/png'))
        if (!iptal) setResim({ url: cv.toDataURL('image/png'), blob })
      } catch {
        if (!iptal) setResim(null)
      }
    }, 250)
    return () => {
      iptal = true
      clearTimeout(t)
    }
  }, [kart, ad])

  const paylas = async () => {
    adYaz(ad.trim())
    try {
      const dosya = resim?.blob ? new File([resim.blob], 'vakfiye-sonuc.png', { type: 'image/png' }) : null
      const veri: ShareData = { title: L('Vakfiye: meydan okuma', 'Vakfiye: a challenge'), text: metin, url: baglanti }
      if (dosya && navigator.canShare?.({ files: [dosya] })) veri.files = [dosya]
      await navigator.share(veri)
      setDurum(L('Paylaşıldı!', 'Shared!'))
    } catch (e) {
      if ((e as Error)?.name !== 'AbortError') kopyala()
    }
  }
  const kopyala = async () => {
    adYaz(ad.trim())
    try {
      await navigator.clipboard.writeText(`${metin} ${baglanti}`)
      setDurum(L('Bağlantı kopyalandı. Bir mesaja yapıştırıp gönder.', 'Link copied. Paste it into a message and send it.'))
    } catch {
      setDurum(L('Kopyalanamadı: aşağıdaki bağlantıyı seçip kopyala.', 'Could not copy: select the link below and copy it.'))
    }
  }
  const paylasilabilir = typeof navigator !== 'undefined' && !!navigator.share

  return (
    <div className="ortala" onClick={onKapat}>
      <section className="ahsap-panel paylas-paneli" role="dialog" aria-labelledby="paylas-baslik" onClick={(e) => e.stopPropagation()}>
        <h1 id="paylas-baslik" className="kurdele turkuaz baslik golgeli">{L('MEYDAN OKU', 'CHALLENGE')}</h1>
        <p className="paylas-aciklama">
          {L(<>Bağlantıyı açan arkadaşın <b>{kart.levelAd}</b> levelini <b>aynı afetlerle</b> oynar, kilitli olsa bile. Sonunda kimin vakfının daha iyi dayandığını görür.</>, <>The friend who opens the link plays <b>{kart.levelAd}</b> <b>with the same disasters</b>, even if it is locked. At the end they see whose foundation held up better.</>)}
        </p>
        <div className="paylas-kart">
          {resim ? <img src={resim.url} alt={metin} /> : <div className="paylas-yukleniyor">{L('Kart hazırlanıyor…', 'Preparing the card…')}</div>}
        </div>
        <label className="paylas-ad">
          <span>{L('Adın (kartta görünür, isteğe bağlı)', 'Your name (shown on the card, optional)')}</span>
          <input value={ad} maxLength={24} onChange={(e) => setAd(e.target.value)} placeholder={L('ör. Ayşe', 'e.g. Ayşe')} />
        </label>
        <div className="paylas-dugmeler">
          {paylasilabilir && (
            <button className="dugme yesil baslik" onClick={paylas}>{L('PAYLAŞ', 'SHARE')}</button>
          )}
          <button className={`dugme ${paylasilabilir ? 'krem' : 'yesil'} baslik`} onClick={kopyala}>{L('BAĞLANTIYI KOPYALA', 'COPY LINK')}</button>
          {resim && (
            <a className="dugme krem baslik" href={resim.url} download="vakfiye-sonuc.png">{L('KARTI İNDİR', 'DOWNLOAD CARD')}</a>
          )}
        </div>
        <input className="paylas-baglanti" readOnly value={baglanti} onFocus={(e) => e.currentTarget.select()} aria-label={L('Meydan okuma bağlantısı', 'Challenge link')} />
        {durum && <div role="status" className="hap koyu paylas-durum">{durum}</div>}
        <button className="bag paylas-kapat" onClick={onKapat}>{L('Kapat', 'Close')}</button>
      </section>
    </div>
  )
}
