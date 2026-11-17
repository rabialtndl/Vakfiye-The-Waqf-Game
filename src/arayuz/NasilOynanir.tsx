import { useState } from 'react'
import { ParaninYolu } from './ParaninYolu'
import { Yapilar } from './Yapilar'
import kurallarMetni from '../../docs/KURALLAR.md?raw'
import rulesText from '../../docs/RULES.md?raw'
import { SABITLER as S } from '../motor/sabitler'
import { L } from '../dil'

// "Nasıl oynanır": önce rehber, sonra oyunun dört adımı. Ayrıntı isteyen "Yapılar", "Paranın yolu" ve
// "Bütün kurallar" sekmelerine geçer. Bütün kurallar docs/KURALLAR.md dosyasından gelir.
// Yalnızca o dosyada geçen biçimler desteklenir: başlık, liste, numaralı liste, tablo, kalın yazı.

function satirIci(metin: string) {
  return metin.split(/(\*\*[^*]+\*\*)/g).map((p, i) => (p.startsWith('**') ? <b key={i}>{p.slice(2, -2)}</b> : p))
}

function cevir(md: string) {
  const bloklar: React.ReactNode[] = []
  const satirlar = md.split('\n')
  let i = 0
  while (i < satirlar.length) {
    const s = satirlar[i]
    if (s.startsWith('# ')) {
      i++
      continue // sayfa başlığı kurdelede
    }
    if (s.startsWith('## ')) {
      bloklar.push(<h2 key={i} className="baslik bolum">{s.slice(3)}</h2>)
      i++
    } else if (s.startsWith('- ')) {
      const ogeler: string[] = []
      while (i < satirlar.length && satirlar[i].startsWith('- ')) ogeler.push(satirlar[i++].slice(2))
      bloklar.push(<ul key={i}>{ogeler.map((o, j) => <li key={j}>{satirIci(o)}</li>)}</ul>)
    } else if (/^\d+\. /.test(s)) {
      const ogeler: string[] = []
      while (i < satirlar.length && /^\d+\. /.test(satirlar[i])) ogeler.push(satirlar[i++].replace(/^\d+\. /, ''))
      bloklar.push(<ol key={i}>{ogeler.map((o, j) => <li key={j}>{satirIci(o)}</li>)}</ol>)
    } else if (s.startsWith('|')) {
      const tablo: string[][] = []
      while (i < satirlar.length && satirlar[i].startsWith('|')) {
        const hucreler = satirlar[i++].split('|').slice(1, -1).map((h) => h.trim())
        if (!hucreler.every((h) => /^-+$/.test(h))) tablo.push(hucreler)
      }
      const [bas, ...govde] = tablo
      bloklar.push(
        <table key={i}>
          <thead><tr>{bas.map((h, j) => <th key={j}>{satirIci(h)}</th>)}</tr></thead>
          <tbody>{govde.map((r, j) => <tr key={j}>{r.map((h, k) => <td key={k}>{satirIci(h)}</td>)}</tr>)}</tbody>
        </table>,
      )
    } else if (s.trim()) {
      bloklar.push(<p key={i}>{satirIci(s)}</p>)
      i++
    } else i++
  }
  return bloklar
}

const ICERIK = cevir(kurallarMetni)
const CONTENT = cevir(rulesText)

type Sekme = 'kisaca' | 'yapilar' | 'para' | 'kurallar'

function DortAdim({ onParaYolu }: { onParaYolu?: () => void }) {
  const ADIMLAR = [
    {
      simge: '🏛️',
      baslik: L('Vakfını kur', 'Found your foundation'),
      metin: L(
        '100 akçeyi mülklere dağıt. Hamam çok kazandırır ama depremde yıkılır. Arazi az kazandırır ama hiç yıkılmaz. Gelirin bir kısmını kötü günler için yedek fona (kumbaraya) ayır.',
        'Split 100 akçe among your properties. The bathhouse earns a lot but falls in earthquakes. Farmland earns little but never falls. Set part of the income aside in the reserve fund (the piggy bank) for bad days.',
      ),
    },
    {
      simge: '⏳',
      baslik: L('Yılları akıt', 'Let the years pass'),
      metin: L(
        '“▶ OYNA”ya bas, yıllar kendiliğinden akar. Her tur 10 yıldır: mülkler para kazandırır, bir pay kumbaraya, bir pay bakıma gider, kalanı hizmete harcanır.',
        'Press “▶ PLAY” and the years pass by themselves. Each round is 10 years: the properties earn money, a share goes to the piggy bank, a share to upkeep, and the rest pays for the service.',
      ),
      ek: onParaYolu && (
        <button className="bag" onClick={onParaYolu}>{L('Paranın yolunu resimli gör ▶', 'See the money’s path in pictures ▶')}</button>
      ),
    },
    {
      simge: '🔥',
      baslik: L('Kötü günde karar ver', 'Decide on a bad day'),
      metin: L(
        'Deprem ya da yangın olunca oyun durur ve kısa bir soru sorar. Bilirsen hasar yarıya iner, bilemezsen bir can gider. Sonra seçersin: kumbarayla onar, nakitle onar ya da hizmeti bir süre kıs.',
        'When an earthquake or fire strikes, the game stops and asks a short question. Get it right and the damage is halved; get it wrong and you lose a life. Then you choose: repair from the piggy bank, repair with cash, or cut back the service for a while.',
      ),
    },
    {
      simge: '🏗️',
      baslik: L('Şehrini büyüt', 'Grow your city'),
      metin: L(
        'Hizmetten artan para yapı parasında birikir. “Şehri gör”e bas, sarı + işaretli yere yeni yapı kur. Yeni yapı da kira getirir, vakfın büyür.',
        'Money left after the service collects in building money. Press “See the city” and build on a plot with a yellow +. New buildings bring in rent too, and your foundation grows.',
      ),
    },
  ]

  return (
    <div className="no-kisaca">
      <div className="no-amac">
        <b className="baslik">{L('Amacın', 'Your goal')}</b>
        <p>{L(
          'Vakfının bir hizmeti var: aşevi, medrese, cami ya da çeşme. Bu hizmeti levelin hedef yılına kadar açık tut. İlk levelde hedef 200 yıl.',
          'Your foundation runs a service: a soup kitchen, a madrasa, a mosque or a fountain. Keep it open until the level’s target year. In the first level the target is 200 years.',
        )}</p>
      </div>

      <ol className="no-adimlar">
        {ADIMLAR.map((a, i) => (
          <li key={i} className="no-adim">
            <span className="no-simge" aria-hidden="true">{a.simge}<span className="no-numara baslik">{i + 1}</span></span>
            <div>
              <h2 className="baslik">{a.baslik}</h2>
              <p>{a.metin}</p>
              {a.ek}
            </div>
          </li>
        ))}
      </ol>

      <div className="no-uyari">
        <span aria-hidden="true">⚠️</span>
        <p>{L(
          `Hizmetin parası ${S.COKUS_ART_ARDA_BOS} tur üst üste ödenemezse vakıf çöker. En iyi koruma: paranı tek yere yatırma ve kumbaraya mutlaka pay ayır.`,
          `If the service cannot be paid for ${S.COKUS_ART_ARDA_BOS} rounds in a row, the foundation collapses. The best protection: don’t put all your money in one place, and always save a share in the piggy bank.`,
        )}</p>
      </div>
    </div>
  )
}

type Props = { onKapat: () => void; onOgretici: () => void }

export function NasilOynanir({ onKapat, onOgretici }: Props) {
  const [sekme, setSekme] = useState<Sekme>('kisaca')
  return (
    <div className="ortala">
      <section className={`ahsap-panel bilgi-paneli ${sekme === 'para' ? 'genis' : ''}`} aria-labelledby="nasil-baslik">
        <h1 id="nasil-baslik" className="kurdele yesil baslik golgeli">{L('NASIL OYNANIR ?', 'HOW TO PLAY ?')}</h1>
        <button className="kapat-dugmesi" aria-label={L('Kapat', 'Close')} onClick={onKapat}>✕</button>

        <div className="no-rehber">
          <span className="no-rehber-yuz" aria-hidden="true">🧭</span>
          <div>
            <b className="baslik">{L('Okumak yerine oynayarak öğren', 'Learn by playing instead of reading')}</b>
            <p>{L('Mütevelli ilk oyunda seni adım adım götürür. Yaklaşık 3 dakika.', 'The trustee walks you through your first game step by step. About 3 minutes.')}</p>
          </div>
          <button className="dugme yesil baslik" onClick={onOgretici}>{L('REHBERLİ OYNA', 'PLAY WITH THE GUIDE')}</button>
        </div>

        <div className="parcali nasil-sekmeleri" role="tablist" aria-label={L('Nasıl oynanır', 'How to play')}>
          <button role="tab" aria-selected={sekme === 'kisaca'} onClick={() => setSekme('kisaca')}>{L('Kısaca', 'In short')}</button>
          <button role="tab" aria-selected={sekme === 'yapilar'} onClick={() => setSekme('yapilar')}>{L('Yapılar', 'Buildings')}</button>
          <button role="tab" aria-selected={sekme === 'para'} onClick={() => setSekme('para')}>{L('Paranın yolu', 'Money path')}</button>
          <button role="tab" aria-selected={sekme === 'kurallar'} onClick={() => setSekme('kurallar')}>{L('Kurallar', 'Rules')}</button>
        </div>
        <div className="kaydirilir kurallar" role="tabpanel">
          {sekme === 'kisaca' ? <DortAdim onParaYolu={() => setSekme('para')} /> : sekme === 'yapilar' ? <Yapilar /> : sekme === 'para' ? <ParaninYolu gomulu /> : L(ICERIK, CONTENT)}
        </div>
      </section>
    </div>
  )
}
