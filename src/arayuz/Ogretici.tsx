import { useLayoutEffect, useRef, useState } from 'react'
import { Ikon } from './Ikon'
import { iki, L } from '../dil'

// Rehberli ilk oyun: gerçek oyunun üstünde mütevellinin konuşma balonu.
// Her adım ya "Devam" ile ya da oyuncu söylenen şeyi yapınca ilerler (App adımı izler).

export type OgreticiAdim = {
  hedef?: string // data-ogretici değeri: parlayan öğe
  metin: string
  devam?: boolean // true: "Devam" düğmesiyle geçilir; false: oyuncunun eylemi bekleniyor
  konum?: 'ust' | 'alt'
  zorla?: boolean // true: konum kesin, hedefe göre hesaplanmaz
}

const EN = [
  'Welcome! I am your foundation’s trustee. Our job: keep the soup kitchen open for 200 years. I’ll show you how, step by step.',
  'You have 100 akçe. The bathhouse earns a lot but falls in earthquakes. Farmland earns little but never falls. I’ve split it evenly for now.',
  'This bar shows the chance that your foundation survives. It moves as you change the settings.',
  'All set. Press “FOUND IT”.',
  'Press “+10 years”: one round, ten years, passes.',
  'This line sums up the 10 years: the properties earned akçe, a share went to the piggy bank, upkeep was paid, and the rest kept the soup kitchen open.',
  'Now press “▶ PLAY”. The years flow by themselves and stop when something bad happens.',
  'Disaster! There is enough in the piggy bank. “Repair with fund” is the safest choice.',
  'Well done, the foundation is yours now! Money left after the service is saved for new buildings. In year 50 the bazaar opens: press “See the city” and build. If you get stuck, press the ? button in the corner.',
]

export const OGRETICI_ADIMLARI: OgreticiAdim[] = ([
  { metin: 'Hoş geldin! Ben vakfının mütevellisiyim. Görevimiz: aşevini 200 yıl açık tutmak. Nasıl yapılacağını adım adım göstereceğim.', devam: true, konum: 'alt' },
  { hedef: 'sermaye', metin: 'Elinde 100 akçe var. Hamam çok kazandırır ama depremde yıkılır. Arazi az kazandırır ama hiç yıkılmaz. Şimdilik dengeli dağıttım.', devam: true, konum: 'alt' },
  { hedef: 'sans', metin: 'Bu çubuk vakfının ayakta kalma şansını gösterir. Ayarları değiştirdikçe değişir.', devam: true, konum: 'alt' },
  { hedef: 'kur', metin: 'Her şey hazır. "VAKFI KUR"a bas.', konum: 'ust' },
  { hedef: 'tur', metin: '"+10 yıl"a bas: bir tur, yani 10 yıl geçer.', konum: 'ust' },
  { hedef: 'serit', metin: 'Bu yazı 10 yılı özetler: mülkler akçe kazandırdı, bir pay kumbaraya gitti, bakım ödendi, kalanıyla aşevi açık kaldı.', devam: true, konum: 'ust' },
  { hedef: 'ilerle', metin: 'Şimdi "▶ OYNA"ya bas. Yıllar kendi kendine akar, kötü bir şey olunca durur.', konum: 'ust' },
  { hedef: 'karar', metin: 'Felaket geldi! Kumbarada yeterince para var. "Fonla onar" en güvenlisi.', konum: 'ust', zorla: true },
  { metin: 'Harika, vakıf artık senin! Hizmetten artan para yeni yapılar için birikir. 50. yılda çarşı açılır: "Şehri gör"e basıp yapı kurarsın. Takılırsan köşedeki ? düğmesine bas.', devam: true, konum: 'alt' },
] as OgreticiAdim[]).map((a, i) => iki(a, { metin: EN[i] }))

type Props = { adim: number; onDevam: () => void; onAtla: () => void }

export function Ogretici({ adim, onDevam, onAtla }: Props) {
  const a = OGRETICI_ADIMLARI[adim]
  // Balon, parlayan öğenin karşı yarısına konur: hedefi hiçbir zaman örtmez.
  const [ustte, setUstte] = useState(false)
  const balon = useRef<HTMLDivElement>(null)
  useLayoutEffect(() => {
    // Gömülüyken oyun bir Shadow DOM içinde: hedefi kendi kökümüzde ara.
    const kok = (balon.current?.getRootNode() ?? document) as Document | ShadowRoot
    const hedef = a?.hedef ? kok.querySelector(`[data-ogretici="${a.hedef}"]`) : null
    if (!hedef || a?.zorla) return setUstte(a?.konum === 'ust')
    const r = hedef.getBoundingClientRect()
    setUstte(r.top + r.height / 2 > window.innerHeight / 2)
  }, [a])
  if (!a) return null
  return (
    <>
      {a.hedef && <style>{`[data-ogretici="${a.hedef}"]{z-index:60;animation:ogretici-nabiz 1.2s ease-in-out infinite!important;border-radius:16px}`}</style>}
      <div ref={balon} className={`ogretici-balon ${ustte ? 'ust' : 'alt'}`} role="dialog" aria-live="polite" aria-label={L('Rehber', 'Guide')}>
        <div className="ogretici-yuz" aria-hidden="true"><Ikon ad="mutevelli" boyut={30} renk="#7A5E34" /></div>
        <div className="ogretici-metin">
          <div className="kucuk">{L('Rehber', 'Guide')} · {adim + 1} / {OGRETICI_ADIMLARI.length}</div>
          <p>{a.metin}</p>
          <div className="ogretici-dugmeler">
            <button className="bag" onClick={onAtla}>{L('Rehberi atla', 'Skip the guide')}</button>
            {a.devam && (
              <button className="dugme yesil baslik" onClick={onDevam}>
                {adim === OGRETICI_ADIMLARI.length - 1 ? L('BAŞLA', 'START') : L('DEVAM', 'CONTINUE')}
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
