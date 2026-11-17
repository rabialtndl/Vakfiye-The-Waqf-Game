import type { OyunAyarlari } from '../ayarlar'
import { L } from '../dil'
import { DilSecici } from './AnaMenu'

type Props = {
  ayarlar: OyunAyarlari
  onDegis: (a: OyunAyarlari) => void
  onOgreticiyiSifirla: () => void
  onKapat: () => void
}

type Secenek<T> = { deger: T; ad: string }

function Satir({ ad, aciklama, children }: { ad: string; aciklama: string; children: React.ReactNode }) {
  return (
    <div className="ayar-satiri">
      <div>
        <div className="baslik ayar-adi">{ad}</div>
        <div className="ayar-aciklama">{aciklama}</div>
      </div>
      {children}
    </div>
  )
}

function Dugmeler<T extends string>({ etiket, deger, secenekler, onSec }: { etiket: string; deger: T; secenekler: Secenek<T>[]; onSec: (d: T) => void }) {
  return (
    <div className="parcali" role="radiogroup" aria-label={etiket}>
      {secenekler.map((s) => (
        <button key={s.deger} role="radio" aria-checked={deger === s.deger} onClick={() => onSec(s.deger)}>
          {s.ad}
        </button>
      ))}
    </div>
  )
}

function Anahtar({ etiket, acik, onDegis }: { etiket: string; acik: boolean; onDegis: (v: boolean) => void }) {
  return (
    <button className="anahtar" role="switch" aria-checked={acik} aria-label={etiket} onClick={() => onDegis(!acik)}>
      <span />
    </button>
  )
}

export function AyarlarSayfasi({ ayarlar: a, onDegis, onOgreticiyiSifirla, onKapat }: Props) {
  const set = <K extends keyof OyunAyarlari>(k: K, v: OyunAyarlari[K]) => onDegis({ ...a, [k]: v })
  return (
    <div className="ortala">
      <section className="ahsap-panel bilgi-paneli" aria-labelledby="ayarlar-baslik">
        <h1 id="ayarlar-baslik" className="kurdele yesil baslik golgeli">{L('AYARLAR', 'SETTINGS')}</h1>
        <button className="kapat-dugmesi" aria-label={L('Kapat', 'Close')} onClick={onKapat}>✕</button>
        <div className="kaydirilir">
          <h2 className="baslik bolum">{L('Oyun', 'Game')}</h2>
          <Satir ad={L('Dil', 'Language')} aciklama={L('Oyunun bütün yazıları bu dilde görünür.', 'All of the game’s text appears in this language.')}>
            <DilSecici />
          </Satir>
          <Satir ad={L('Zorluk', 'Difficulty')} aciklama={L('Kolayda mülkler %10 fazla kazandırır, vakıf ancak 4 tur üst üste sandık boş kalırsa çöker ve karar anlarında ipucu çıkar. Olaylar aynı kalır.', 'On Easy, properties earn 10% more, the foundation only collapses if the chest is empty 4 rounds in a row, and hints appear at decisions. Events stay the same.')}>
            <Dugmeler etiket={L('Zorluk', 'Difficulty')} deger={a.zorluk} secenekler={[{ deger: 'kolay', ad: L('Kolay', 'Easy') }, { deger: 'normal', ad: 'Normal' }]} onSec={(v) => set('zorluk', v)} />
          </Satir>
          <Satir ad={L('Oyun hızı', 'Game speed')} aciklama={L("OYNA'ya basınca yılların ne kadar hızlı aktığı. Köşedeki ⏩ düğmesiyle de değişir.", 'How fast the years go by after you press PLAY. The ⏩ button in the corner changes it too.')}>
            <Dugmeler etiket={L('Oyun hızı', 'Game speed')} deger={a.hiz} secenekler={[{ deger: 'yavas', ad: L('Yavaş', 'Slow') }, { deger: 'normal', ad: 'Normal' }, { deger: 'hizli', ad: L('Hızlı', 'Fast') }]} onSec={(v) => set('hiz', v)} />
          </Satir>
          <Satir ad={L('Afetler', 'Disasters')} aciklama={L('Afet anında iki şıklı, kaynaklı bir soru: bilirsen afet söner, bilemezsen bir can gider. Olaylar arasında en az 30 yıl sakin geçer.', 'In a disaster you get a two-choice question with a source: answer right and the disaster is put out; answer wrong and you lose a life. At least 30 calm years pass between events.')}>
            <Anahtar etiket={L('Afet sorusu (bilirsen söner)', 'Disaster question (right answer puts it out)')} acik={a.afetSorusu} onDegis={(v) => set('afetSorusu', v)} />
            <Anahtar etiket={L('Olaylar arası 30 yıl sakin', '30 calm years between events')} acik={a.olayArasi} onDegis={(v) => set('olayArasi', v)} />
          </Satir>
          <Satir ad={L('Ses', 'Sound')} aciklama={L('Para, doğru ve yanlış cevap, afet ve yapı kurma sesleri.', 'Sounds for money, right and wrong answers, disasters and building.')}>
            <Anahtar etiket={L('Ses', 'Sound')} acik={a.ses} onDegis={(v) => set('ses', v)} />
          </Satir>
          <Satir ad={L('Para etiketleri', 'Money labels')} aciklama={L('Binaların üstünde kazandıkları paranın yazması.', 'Shows above each building how much money it earns.')}>
            <Anahtar etiket={L('Para etiketleri', 'Money labels')} acik={a.paraEtiketleri} onDegis={(v) => set('paraEtiketleri', v)} />
          </Satir>
          <Satir ad={L('İpuçları', 'Hints')} aciklama={L('Mütevellinin karar anlarında ve tur sonlarında küçük öneriler vermesi.', 'The trustee gives small tips at decisions and at the end of rounds.')}>
            <Anahtar etiket={L('İpuçları', 'Hints')} acik={a.ipuclari} onDegis={(v) => set('ipuclari', v)} />
          </Satir>
          <Satir ad={L('Titreşim', 'Vibration')} aciklama={L('Deprem ve karar anında telefon titrer (yalnız telefonda).', 'The phone vibrates in earthquakes and at decisions (phones only).')}>
            <Anahtar etiket={L('Titreşim', 'Vibration')} acik={a.titresim} onDegis={(v) => set('titresim', v)} />
          </Satir>

          <h2 className="baslik bolum">{L('Görünüm ve erişilebilirlik', 'Display and accessibility')}</h2>
          <Satir ad={L('Yazı boyutu', 'Text size')} aciklama={L('Bütün yazıları büyütür.', 'Makes all text bigger.')}>
            <Dugmeler etiket={L('Yazı boyutu', 'Text size')} deger={a.yaziBoyutu} secenekler={[{ deger: 'normal', ad: 'Normal' }, { deger: 'buyuk', ad: L('Büyük', 'Large') }, { deger: 'cokBuyuk', ad: L('Çok büyük', 'Extra large') }]} onSec={(v) => set('yaziBoyutu', v)} />
          </Satir>
          <Satir ad={L('Yüksek kontrast', 'High contrast')} aciklama={L('Renkleri koyulaştırır, yazıları daha belirgin yapar.', 'Darkens colours and makes text stand out more.')}>
            <Anahtar etiket={L('Yüksek kontrast', 'High contrast')} acik={a.yuksekKontrast} onDegis={(v) => set('yuksekKontrast', v)} />
          </Satir>
          <Satir ad={L('Hareketi azalt', 'Reduce motion')} aciklama={L('Sarsıntı, uçan sikke ve duman gibi animasyonları kapatır.', 'Turns off animations such as shaking, flying coins and smoke.')}>
            <Anahtar etiket={L('Hareketi azalt', 'Reduce motion')} acik={a.hareketiAzalt} onDegis={(v) => set('hareketiAzalt', v)} />
          </Satir>

          <h2 className="baslik bolum">{L('Diğer', 'Other')}</h2>
          <Satir ad={L('Öğretici', 'Tutorial')} aciklama={L('Rehberli ilk oyunu baştan oynatır.', 'Plays the guided first game again.')}>
            <button className="dugme turkuaz baslik" onClick={onOgreticiyiSifirla}>{L('YENİDEN BAŞLAT', 'RESTART')}</button>
          </Satir>
          <p className="ayar-aciklama" style={{ marginTop: 12 }}>
            {L('Ayarlar ve yıldızların yalnızca bu cihazda saklanır. Vakfiye bir tarihsel esinli simülasyondur; sayılar gerçek bir vakfın hesabı değildir.', 'Your settings and stars are stored only on this device. Vakfiye is a historically inspired simulation; the numbers are not the accounts of a real foundation.')}
          </p>
        </div>
      </section>
    </div>
  )
}
