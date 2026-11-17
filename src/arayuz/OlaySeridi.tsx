import { useState } from 'react'
import { rolBul } from '../roller'
import { rutbe, rutbeAtladi, USTA_BAGISI } from '../rutbe'
import type { AfetSorusu, AfetTuru } from '../veri/afetSorulari'
import { iki, L } from '../dil'
import { eserAc } from '../ortam'

type Props = {
  tur: AfetTuru
  takvimYili: number | null
  baslik: string
  /** Felaket sorusu. Ahi rütbesinde ilk yanlışta `yedek` sorulur. */
  soru: AfetSorusu | null
  yedek: AfetSorusu | null
  /** Bugüne kadarki doğru afet cevabı (rütbe için). */
  dogruSayisi: number
  can: number
  canEnCok: number
  onCevap: (soru: AfetSorusu, dogru: boolean, canGider: boolean) => void
  onDevam: () => void
}

/** Şıkların yeri soruya göre sabit ama karışık: doğru cevap hep ilk sırada durmasın. */
function sira(q: AfetSorusu): [0 | 1, 0 | 1] {
  let h = 0
  for (const c of q.id) h = (h * 31 + c.charCodeAt(0)) | 0
  return h & 1 ? [1, 0] : [0, 1]
}

const SONDU: Record<AfetTuru, string> = iki<Record<AfetTuru, string>>({
  yangin: 'Doğru! Kova zinciri yetişti, yangın söndü.',
  deprem: 'Doğru! Yardım ekibi yetişti, hasar azaldı.',
  salgin: 'Doğru! Darüşşifa hastaları kabul etti, salgın hafifliyor.',
  kuraklik: 'Doğru! Komşu vakıflar ve imaret yardım etti: yedek fona destek geldi.',
  savas: 'Doğru! Mahallenin avârız vakfı yetişti: yedek fona destek geldi.',
}, {
  yangin: 'Right! The bucket chain arrived and the fire is out.',
  deprem: 'Right! The rescue team arrived and the damage is reduced.',
  salgin: 'Right! The hospital took in the sick; the epidemic is easing.',
  kuraklik: 'Right! Neighbouring foundations and the imaret helped: support came to the reserve fund.',
  savas: 'Right! The neighbourhood’s avârız foundation came to help: support came to the reserve fund.',
})
const BITTI: Record<AfetTuru, string> = iki<Record<AfetTuru, string>>({ yangin: 'Yangın söndü!', deprem: 'Yardım yetişti!', salgin: 'Salgın hafifliyor!', kuraklik: 'Yardım geldi!', savas: 'Yardım geldi!' }, { yangin: 'The fire is out!', deprem: 'Help arrived!', salgin: 'The epidemic is easing!', kuraklik: 'Help came!', savas: 'Help came!' })
const VURDU: Record<AfetTuru, string> = iki<Record<AfetTuru, string>>({ yangin: 'Yangın yayıldı.', deprem: 'Enkaz ağır.', salgin: 'Salgın yayıldı.', kuraklik: 'Kuraklık tarlaları kavurdu.', savas: 'Savaş yolları kesti.' }, { yangin: 'The fire spread.', deprem: 'The rubble is heavy.', salgin: 'The epidemic spread.', kuraklik: 'The drought scorched the fields.', savas: 'The war cut the roads.' })

export function Canlar({ can, enCok, kayip = false }: { can: number; enCok: number; kayip?: boolean }) {
  return (
    <span className={`canlar ${kayip ? 'kayip' : ''}`} role="img" aria-label={L(`${can} / ${enCok} can`, `${can} / ${enCok} lives`)}>
      {Array.from({ length: enCok }, (_, i) => (
        <span key={i} className={i < can ? 'dolu' : 'bos'}>{i < can ? '❤️' : '🤍'}</span>
      ))}
    </span>
  )
}

/**
 * Felaket anı: kamera olay yerine yaklaşır, alttaki şerit kısa bir soru sorar.
 * Doğru: afet söner (hasar azalır). Yanlış: doğrusu gösterilir, bir can gider, afet tam vurur.
 * Can kalmadıysa soru sorulmaz: afet tam vurur.
 */
export function OlaySeridi({ tur, takvimYili, baslik, soru, yedek, dogruSayisi, can, canEnCok, onCevap, onDevam }: Props) {
  const rol =
    tur === 'kuraklik'
      ? { ad: L('İmaret aşçısı', 'Imaret cook'), simge: '🌾', gorev: [L('Aç kalanlara imaretten çorba dağıt.', 'Hand out soup from the imaret to the hungry.')] }
      : tur === 'savas'
        ? { ad: L('Mahalle kethüdası', 'Neighbourhood steward'), simge: '🛡️', gorev: [L('Mahallenin avârız vakfıyla yaralılara ve göçenlere yardım et.', 'Help the wounded and the displaced through the neighbourhood’s avârız foundation.')] }
        : rolBul(tur, takvimYili)
  const [baslangic] = useState(dogruSayisi)
  const [q, setQ] = useState<AfetSorusu | null>(soru)
  const [secilen, setSecilen] = useState<number | null>(null)
  const [ahiHakki, setAhiHakki] = useState(rutbe(dogruSayisi).simdiki.no >= 3 && !!yedek)
  const [canGitti, setCanGitti] = useState(false)
  const r = rutbe(dogruSayisi)
  const canYok = can <= 0 && !canGitti
  const dogruMu = !!q && secilen === q.dogru

  const ust = (
    <div className="olay-seridi-ust">
      <span className="olay-seridi-simge" aria-hidden="true">{rol.simge}</span>
      <div>
        <h2 id="olay-seridi-baslik" className={`baslik ${dogruMu ? 'sondu' : ''}`}>{dogruMu ? BITTI[tur] : baslik}</h2>
        <Canlar can={can} enCok={canEnCok} kayip={canGitti} />
      </div>
      <span className="rutbe-cip" title={r.sonraki ? L(`${r.sonraki.ad} rütbesine ${r.kalan} doğru cevap`, `${r.kalan} right answers to ${r.sonraki.ad}`) : L('En yüksek rütbe', 'Highest rank')}>
        {r.simdiki.simge} {r.simdiki.ad}
      </span>
    </div>
  )

  if (!q || canYok) {
    return (
      <div className="olay-seridi" role="alertdialog" aria-labelledby="olay-seridi-baslik" onClick={(e) => e.stopPropagation()}>
        {ust}
        <div className="afet-sonuc yanlis" role="status">
          <b>{canYok ? L('Canın kalmadı: bu afete yetişemedin.', 'No lives left: you could not reach this disaster.') : VURDU[tur]}</b>
          {canYok && <span>{L('Her yüzyılda bir can geri gelir. Afet tam vurdu; şimdi ne yapacağına karar ver.', 'One life comes back every century. The disaster hit in full; now decide what to do.')}</span>}
          {!canYok && !q && <span>{L('Bu oyunda bu afetin bütün sorularını gördün; aynı soru tekrar sorulmaz. Can gitmedi.', 'You have seen all the questions for this disaster in this game; a question is never asked twice. No life lost.')}</span>}
        </div>
        <div className="olay-seridi-dugmeler tek">
          <button className="dugme yesil baslik" onClick={onDevam} autoFocus>{L('DEVAM', 'CONTINUE')}</button>
        </div>
      </div>
    )
  }

  const yeniRutbe = dogruMu ? rutbeAtladi(baslangic, baslangic + 1) : null
  const usta = rutbe(baslangic).simdiki.no >= 2
  const [a, b] = sira(q)
  const ahiKullanilabilir = secilen !== null && !dogruMu && ahiHakki

  return (
    <div className="olay-seridi soru-seridi" role="alertdialog" aria-labelledby="olay-seridi-baslik" onClick={(e) => e.stopPropagation()}>
      {ust}
      <p className="afet-soru baslik">
        {secilen === null && <span className="afet-soru-etiket">{L(`Bilirsen ${tur === 'yangin' ? 'yangın söner' : tur === 'deprem' ? 'hasar azalır' : tur === 'salgin' ? 'salgın hafifler' : 'yardım gelir'}, bilemezsen bir can gider: `, `Answer right and ${tur === 'yangin' ? 'the fire goes out' : tur === 'deprem' ? 'the damage is reduced' : tur === 'salgin' ? 'the epidemic eases' : 'help comes'}; answer wrong and you lose a life: `)}</span>}
        {q.soru}
      </p>
      <div className="afet-siklar">
        {[a, b].map((i) => {
          const durum = secilen === null ? '' : i === q.dogru ? 'dogru' : i === secilen ? 'yanlis' : 'soluk'
          return (
            <button
              key={i}
              className={`afet-sik ${durum}`}
              disabled={secilen !== null}
              onClick={() => {
                const d = i === q.dogru
                // Ahi: ilk yanlışta can gitmez, bir soru hakkı daha var.
                const canGider = !d && !ahiHakki
                setSecilen(i)
                if (canGider) setCanGitti(true)
                onCevap(q, d, canGider)
              }}
            >
              {secilen !== null && i === q.dogru && <span aria-hidden="true">✓ </span>}
              {secilen !== null && i === secilen && i !== q.dogru && <span aria-hidden="true">✗ </span>}
              {q.secenekler[i]}
            </button>
          )
        })}
      </div>

      {secilen !== null && (
        <div className={`afet-sonuc ${dogruMu ? 'dogru' : 'yanlis'}`} role="status">
          <b>{dogruMu ? SONDU[tur] : L(`Doğrusu: ${q.secenekler[q.dogru]}.`, `The answer: ${q.secenekler[q.dogru]}.`)}</b>
          <span>{q.aciklama}</span>
          <KaynakDugmesi k={q.kaynak} />
          {!dogruMu && canGitti && <span className="can-gitti">💔 {L('Bir can gitti.', 'You lost a life.')} {VURDU[tur]}</span>}
          {dogruMu && usta && <span className="kucuk">🛠️ {L(`Usta ayrıcalığı: hayırseverler vakfa +${USTA_BAGISI} akçe bağışladı.`, `Master’s privilege: benefactors gave the foundation +${USTA_BAGISI} akçe.`)}</span>}
          {yeniRutbe && (
            <span className="rutbe-atladi">
              {yeniRutbe.simge} {L('Rütbe atladın:', 'You ranked up:')} <b>{yeniRutbe.ad}</b>! {yeniRutbe.ayricalik}
            </span>
          )}
        </div>
      )}

      {ahiKullanilabilir ? (
        <button
          className="dugme turkuaz baslik ahi-hakki"
          onClick={() => {
            setAhiHakki(false)
            setQ(yedek)
            setSecilen(null)
          }}
          autoFocus
        >
          🏅 {L('Ahi hakkı: bir soru daha', 'Ahi’s right: one more question')}
        </button>
      ) : (
        secilen !== null && (
          <div className="olay-seridi-dugmeler tek">
            <button className="dugme yesil baslik" onClick={onDevam} autoFocus>{L('DEVAM', 'CONTINUE')}</button>
          </div>
        )
      )}
    </div>
  )
}

/** Sorunun kaynağı: oyuncuyu eserin sitedeki sayfasına götürür. */
function KaynakDugmesi({ k }: { k: AfetSorusu['kaynak'] }) {
  return (
    <button type="button" className="tarih-kaynak bag" onClick={() => eserAc(k.eser)}>
      {L('Kaynak', 'Source')}: {k.ad} →
    </button>
  )
}
