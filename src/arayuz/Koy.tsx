import { useEffect, useState } from 'react'
import { levelBul, levelHedefleri } from '../leveller'
import { LevelHedefleri } from './LevelHedefleri'
import { cokusSiniri, hedefYili, iyiOlay, olaysizGelir, OLAY_AD, type Durum } from '../motor/motor'
import { SABITLER as S } from '../motor/sabitler'
import type { BinaId } from '../sahne/koySvg'
import { binaTurleri, EserSeridi, GercekEserler, IlhamKarti } from './GercekEserler'
import { ILHAM } from './ilham'
import { ArsaPaneli } from './Sehir'
import { ARSALAR, insaKontrol, type ArsaId, type YapiId } from '../motor/sehir'
import type { Gorunum } from '../sahne/KoySahnesi'
import { Ikon } from './Ikon'
import { Canlar } from './OlaySeridi'
import { BINA_ACIKLAMA, tam } from './metin'
import { L } from '../dil'

type Props = {
  durum: Durum
  oynatiliyor: boolean
  secili: BinaId | null
  etiketler: boolean
  onIlerle: () => void
  onTur: () => void
  onDur: () => void
  onMenu: () => void
  onEtiketler: () => void
  gorunum: Gorunum
  onGorunum: (g: Gorunum) => void
  pulSayisi: number
  seciliArsa: ArsaId | null
  onInsa: (a: ArsaId, y: YapiId) => void
  onKesif: () => void
  yeniBolge: string | null
  onYakinlik: (yon: 1 | -1) => void
  /** Afet sorusu canları (soru kapalıysa yok). */
  can?: { kalan: number; enCok: number }
  /** Bir katman (kart, ayar, keşif...) açıkken köşe panelleri kapanır. */
  katmanAcik?: boolean
  /** Hedef/günlük/renk paneli açılınca: bina ve arsa paneli kapansın (ekranda tek şey açık kalır). */
  onPanelAcildi?: () => void
  /** Karardan sonra: OYNA düğmesi "DEVAM" olur. */
  devam?: boolean
  ses?: boolean
  hiz?: 'yavas' | 'normal' | 'hizli'
  onSes?: () => void
  onHiz?: () => void
  onAyarlar?: () => void
  onNasil?: () => void
}

/** Köy ekranının üstündeki arayüz (HUD). Sahne ayrı çizilir; bu katman yalnızca sayıları gösterir. */
export function KoyHud({ durum: d, oynatiliyor, secili, etiketler, onIlerle, onTur, onDur, onMenu, onEtiketler, gorunum, onGorunum, pulSayisi, seciliArsa, onInsa, onKesif, yeniBolge, onYakinlik, can, katmanAcik = false, onPanelAcildi, devam = false, ses = true, hiz = 'normal', onSes, onHiz, onAyarlar, onNasil }: Props) {
  const [gunlukAcik, setGunlukAcik] = useState(false)
  // Günlük, panelin dışında bir yere dokununca (ya da Esc'e basınca) kapanır; dokunuş yine de çalışır.
  useEffect(() => {
    if (!gunlukAcik) return
    const disinda = (e: PointerEvent) => {
      if (!(e.target as Element | null)?.closest?.('.gunluk-paneli, [data-gunluk-dugme]')) setGunlukAcik(false)
    }
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setGunlukAcik(false)
    document.addEventListener('pointerdown', disinda, true)
    window.addEventListener('keydown', esc)
    return () => {
      document.removeEventListener('pointerdown', disinda, true)
      window.removeEventListener('keydown', esc)
    }
  }, [gunlukAcik])
  const [renkAcik, setRenkAcik] = useState(false)
  // İlk oyunda "Renkler" düğmesi hafifçe dikkat çeker; bir kez açılınca durur.
  const [renklerGoruldu, setRenklerGoruldu] = useState(() => {
    try {
      return localStorage.getItem('vakfiye.renkler') === '1'
    } catch {
      return false
    }
  })
  useEffect(() => {
    if (!renklerGoruldu) return
    try {
      localStorage.setItem('vakfiye.renkler', '1')
    } catch {
      /* önemli değil */
    }
  }, [renklerGoruldu])
  // Level hedefleri: oyunun başında açık gelir, oyuncu kapatabilir.
  const level = d.ayarlar.levelNo ? levelBul(d.ayarlar.levelNo) : null
  const hedefler = level ? levelHedefleri(level, d, pulSayisi) : []
  const [hedefAcik, setHedefAcik] = useState(d.yil === 0)
  // Yıllar akmaya başlayınca panel yol açsın; oyuncu 🎯 ile yeniden açar.
  useEffect(() => {
    if (oynatiliyor) setHedefAcik(false)
  }, [oynatiliyor])
  // Hedef paneli de günlük gibi: dışına dokununca (ya da Esc) kapanır; dokunuş yine de çalışır.
  useEffect(() => {
    if (!hedefAcik) return
    const disinda = (e: PointerEvent) => {
      if (!(e.target as Element | null)?.closest?.('.hedef-paneli, [data-hedef-dugme]')) setHedefAcik(false)
    }
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setHedefAcik(false)
    document.addEventListener('pointerdown', disinda, true)
    window.addEventListener('keydown', esc)
    return () => {
      document.removeEventListener('pointerdown', disinda, true)
      window.removeEventListener('keydown', esc)
    }
  }, [hedefAcik])
  // Aynı anda tek şey açık: bina/arsa paneli ya da bir katman açılınca köşe panelleri kapanır.
  useEffect(() => {
    if (secili || seciliArsa || katmanAcik) {
      setHedefAcik(false)
      setGunlukAcik(false)
      setRenkAcik(false)
    }
  }, [secili, seciliArsa, katmanAcik])
  const yapiBekliyor = hedefler.some((h) => h.id === 'yapi' && !h.tamam && h.nasil.startsWith(L('Şimdi kurabilirsin', 'You can build now')))
  // Şimdi bir arsaya yapı kurulabiliyor mu (arsa açık, yapı parası yetiyor)? Varsa "Şehri gör" düğmesi bunu söyler.
  const kurulabilir = (Object.keys(ARSALAR) as ArsaId[]).filter((a) => ARSALAR[a].izin.some((y) => insaKontrol(d, a, y, pulSayisi).olur)).length
  const insaIpucu = kurulabilir > 0 && gorunum === 'koy' && !oynatiliyor
  const [gercekTurler, setGercekTurler] = useState<string[] | null>(null)
  const amac = S.AMACLAR[d.ayarlar.amac]
  const t = d.sonTur
  const gelir = t?.gelir ?? olaysizGelir(d.ayarlar)
  const kilitli = !!d.bekleyenKarar || d.bitti

  // Olay afişi: her yeni olayda bir kez görünür, animasyon bitince kapanır.
  const [kapananAfis, setKapananAfis] = useState<number | null>(null)
  const afisMetni = t?.olay ? OLAY_AD[t.olay] : t?.zimmet ? L('Zimmet', 'Embezzlement') : null
  const afis = t && afisMetni && kapananAfis !== t.yil ? { yil: t.yil, metin: afisMetni } : null

  return (
    <>
      <div className="hud sol-ust">
        <div className="kimlik">
          <div className="rozet" aria-hidden="true"><Ikon ad="vakif" boyut={24} renk="#fff" /></div>
          <div className="kimlik-metin">
            <div className="vakif-adi baslik">{d.ayarlar.levelNo ? <span className="level-etiket">Level {d.ayarlar.levelNo}</span> : null}{L(`${amac.ad} Vakfı`, `${amac.ad} Foundation`)}</div>
            <div className="sure">
              <span title={d.ayarlar.takvim ? L(`Oyunun ${d.yil}. yılı`, `Game year ${d.yil}`) : undefined}>{d.ayarlar.takvim ? d.ayarlar.takvim + d.yil : L(`${d.yil}. yıl`, `Year ${d.yil}`)}</span>
              <div className="cubuk" role="progressbar" aria-label={L('Geçen süre', 'Time passed')} aria-valuenow={d.yil} aria-valuemin={0} aria-valuemax={hedefYili(d.ayarlar)} aria-valuetext={L(`${d.yil}. yıl / ${hedefYili(d.ayarlar)}`, `Year ${d.yil} / ${hedefYili(d.ayarlar)}`)}>
                <div className="dolu" style={{ width: `${(100 * d.yil) / hedefYili(d.ayarlar)}%` }} />
              </div>
              <span className="hedef">{(d.ayarlar.takvim ?? 0) + hedefYili(d.ayarlar)}</span>
              {!!d.ayarlar.yapiHedefi && (
                <span className={`yapi-hedefi ${Object.keys(d.yapilar).length >= d.ayarlar.yapiHedefi ? 'tamam' : ''}`} title={L('Level hedefi: yeni yapı', 'Level goal: new buildings')}>
                  · {Object.keys(d.yapilar).length}/{d.ayarlar.yapiHedefi} {L('yapı', 'buildings')}
                </span>
              )}
            </div>
            {can && <Canlar can={can.kalan} enCok={can.enCok} />}
          </div>
        </div>
      </div>

      <div className="hud orta-ust">
        {d.artArdaBos > 0 && <div role="status" className="hap kirmizi">{L('Sandık boş', 'Chest empty')}: {d.artArdaBos} / {cokusSiniri(d.ayarlar)} {L('tur', 'rounds')}</div>}
        {d.kisilmisHizmetTur > 0 && <div className="hap turkuaz">{L(`Hizmet yarım: ${d.kisilmisHizmetTur} tur daha`, `Half service: ${d.kisilmisHizmetTur} more rounds`)}</div>}
      </div>

      <dl className="hud sag-ust hazine" data-ogretici="kaynaklar" aria-label={L('Vakfın parası', 'The foundation’s money')}>
        <Kaynak ad={L('Nakit', 'Cash')} alt={L('onarıma yedek', 'kept for repairs')} deger={tam(d.nakit)} ikon="nakit" zemin="var(--kursun)" ikonRenk="#2C3A48" />
        <Kaynak ad={L('Yedek fon', 'Reserve fund')} alt={L('kötü güne', 'for bad days')} deger={tam(d.fon)} ikon="fon" zemin="var(--turkuaz)" ikonRenk="#fff" />
        <Kaynak ad={L('Gelir', 'Income')} alt={L('her 10 yıl', 'every 10 years')} deger={`+${tam(gelir)}`} ikon="sikke" zemin="var(--altin)" ikonRenk="#5A3A00" />
        <Kaynak ad={L('Yapı parası', 'Building money')} alt={L('bina kurmaya', 'to build with')} deger={tam(d.artan)} ikon="insa" zemin="#E6D3AE" ikonRenk="#5A3A1E" />
      </dl>

      <div className="hud sol-kenar">
        {level && (
          <button className="yan-dugme" data-hedef-dugme aria-pressed={hedefAcik} onClick={() => { if (!hedefAcik) onPanelAcildi?.(); setHedefAcik((a) => !a); setGunlukAcik(false); setRenkAcik(false) }}>
            <span aria-hidden="true">🎯</span> <span>{L('Hedefler', 'Goals')} {hedefler.filter((h) => h.tamam).length}/{hedefler.length}</span>
          </button>
        )}
        <button className={`yan-dugme sehir-dugmesi ${(yapiBekliyor || insaIpucu) && gorunum === 'koy' ? 'dikkat' : ''}`} data-ogretici="sehir" onClick={() => onGorunum(gorunum === 'koy' ? 'sehir' : 'koy')}>
          <Ikon ad={gorunum === 'koy' ? 'harita' : 'koy'} boyut={20} renk="#3A2205" /> <span className="sehir-etiket">
            <span>{gorunum === 'koy' ? L('Şehri gör', 'See the city') : L('Köye dön', 'Back to village')}</span>
            {insaIpucu && <small>{L(`${kurulabilir} yapı kurabilirsin`, `You can build ${kurulabilir}`)}</small>}
          </span>
        </button>
        {gorunum === 'sehir' && (
          <div className="yakinlik">
            <button className="yan-dugme" aria-label={L('Yakınlaştır', 'Zoom in')} onClick={() => onYakinlik(1)}>+</button>
            <button className="yan-dugme" aria-label={L('Uzaklaştır', 'Zoom out')} onClick={() => onYakinlik(-1)}>−</button>
          </div>
        )}
        <button className="yan-dugme" onClick={onKesif}>
          <Ikon ad="kesif" boyut={20} renk="#5A3A1E" /> <span>{L('Keşif', 'Explore')}{pulSayisi > 0 ? L(` · ${pulSayisi} pul`, ` · ${pulSayisi} stamps`) : ''}</span>
        </button>
        <button className="yan-dugme" data-gunluk-dugme aria-pressed={gunlukAcik} onClick={() => { if (!gunlukAcik) onPanelAcildi?.(); setGunlukAcik((a) => !a); setHedefAcik(false); setRenkAcik(false) }}>
          <Ikon ad="gunluk" boyut={20} renk="#5A3A1E" /> <span>{L('Günlük', 'Log')}</span>
        </button>
        <button className={`yan-dugme ${renklerGoruldu ? '' : 'dikkat'}`} aria-pressed={renkAcik} onClick={() => { if (!renkAcik) onPanelAcildi?.(); setRenkAcik((a) => !a); setRenklerGoruldu(true); setHedefAcik(false); setGunlukAcik(false) }}>
          <span aria-hidden="true">🎨</span> <span>{L('Renkler', 'Colours')}</span>
        </button>
        <button className="yan-dugme" aria-pressed={etiketler} onClick={onEtiketler}>
          <Ikon ad="etiket" boyut={20} renk="#5A3A1E" /> <span>{L('Para yazıları', 'Money labels')}</span>
        </button>
      </div>

      {renkAcik && (
        <aside className="renk-paneli" aria-label={L('Haritadaki renkler ne demek', 'What the colours on the map mean')}>
          <h2 className="baslik">
            {L('Haritadaki renkler', 'Colours on the map')}
            <button className="bag" onClick={() => setRenkAcik(false)}>{L('Kapat', 'Close')}</button>
          </h2>
          {L(<ul>
            <li><span className="renk-ornek canli" /> <span><b>Canlı renkli:</b> senin vakfının yapıları (hizmet binan, hamam, han, tarla, sandık) ve kurduğun yeni yapılar.</span></li>
            <li><span className="renk-ornek soluk" /> <span><b>Soluk:</b> başka vakıfların binaları (ör. sen aşevi kurduysan cami, medrese, çeşme) ya da henüz kurmadığın arsalar. Dokun: başka vakfın binasında gerçek örnekler, arsada kurma paneli açılır.</span></li>
            <li><span className="renk-ornek kurak" /> <span><b>Renksiz ve kurak:</b> henüz açılmamış bölgeler. Üstündeki tabelada yazan yıla gelince ya da pulla açılır.</span></li>
            <li><span className="renk-ornek kapali" /> <span><b>Kendi binan soluklaşırsa:</b> sandık boş kaldı, hizmet o tur verilemedi.</span></li>
          </ul>, <ul>
            <li><span className="renk-ornek canli" /> <span><b>Bright colours:</b> your foundation’s buildings (your service building, bathhouse, inn, fields, chest) and the new buildings you build.</span></li>
            <li><span className="renk-ornek soluk" /> <span><b>Faded:</b> other foundations’ buildings (e.g. the mosque, madrasa and fountain if you founded a soup kitchen) or plots you have not built on yet. Tap: another foundation’s building shows real examples; a plot opens the building panel.</span></li>
            <li><span className="renk-ornek kurak" /> <span><b>Colourless and dry:</b> areas not yet open. They open in the year written on their sign, or with stamps.</span></li>
            <li><span className="renk-ornek kapali" /> <span><b>If your own building fades:</b> the chest was empty and the service could not be given that round.</span></li>
          </ul>)}
        </aside>
      )}

      {level && hedefAcik && !gunlukAcik && (
        <aside className="hedef-paneli gunluk-yeri" aria-label={L('Level hedefleri', 'Level goals')}>
          <h2 className="baslik">
            Level {level.no} · {level.ad}
            <button className="bag" onClick={() => setHedefAcik(false)} aria-label={L('Hedefleri kapat', 'Close goals')}>{L('Kapat', 'Close')}</button>
          </h2>
          <LevelHedefleri hedefler={hedefler} />
        </aside>
      )}

      {gunlukAcik && (
        <aside className="gunluk-paneli" aria-label={L('Olay günlüğü', 'Event log')}>
          <h2 className="baslik">{L('Günlük', 'Log')}</h2>
          <ol aria-live="polite">
            {[...d.gunluk].reverse().map((g, i) => (
              <li key={d.gunluk.length - i} className={g.tur}>
                <b>{L(`${g.yil}. yıl`, `Year ${g.yil}`)}</b> · {g.mesaj}
              </li>
            ))}
          </ol>
        </aside>
      )}

      {afis && (
        <div key={afis.yil} className={`olay-afisi hap ${iyiOlay(t?.olay ?? null) ? 'yesil' : 'kirmizi'} baslik`} style={{ fontSize: 20, height: 38 }} onAnimationEnd={() => setKapananAfis(afis.yil)}>
          {d.ayarlar.takvim ? d.ayarlar.takvim + afis.yil : L(`${afis.yil}. yıl`, `Year ${afis.yil}`)} · {afis.metin}
        </div>
      )}

      <div className="hud sol-alt">
        {oynatiliyor ? (
          <button className="oyna-dugmesi dur" onClick={onDur}>
            <span className="baslik buyuk">❚❚ {L('DURDUR', 'PAUSE')}</span>
            <span className="alt">{L('yıllar akıyor', 'years passing')}</span>
          </button>
        ) : (
          <button className={`oyna-dugmesi ${devam && !kilitli ? 'devam' : ''}`} data-ogretici="ilerle" onClick={onIlerle} disabled={kilitli}>
            <span className="baslik buyuk">▶ {devam ? L('DEVAM', 'CONTINUE') : L('OYNA', 'PLAY')}</span>
            <span className="alt">{devam && insaIpucu ? L('yapı için ↑ Şehri gör', 'to build: ↑ See the city') : L('karar anına kadar', 'until the next decision')}</span>
          </button>
        )}
        <button className="tur-dugmesi" data-ogretici="tur" onClick={onTur} disabled={kilitli || oynatiliyor}>
          <span className="baslik">{L('+10 yıl', '+10 years')}</span>
          <span className="alt">{L('tek tur', 'one round')}</span>
        </button>
      </div>

      <div className="hud sag-alt">
        <div className="kose-dugmeleri">
          <button className="kose-dugme" onClick={onSes} aria-pressed={ses} aria-label={ses ? L('Sesi kapat', 'Mute') : L('Sesi aç', 'Unmute')} title={ses ? L('Sesi kapat', 'Mute') : L('Sesi aç', 'Unmute')}>{ses ? '🔊' : '🔇'}</button>
          <button className="kose-dugme hiz" onClick={onHiz} aria-label={L(`Oyun hızı: ${hiz === 'yavas' ? 'yavaş' : hiz === 'normal' ? 'normal' : 'hızlı'}. Değiştir`, `Game speed: ${hiz === 'yavas' ? 'slow' : hiz === 'normal' ? 'normal' : 'fast'}. Change`)} title={L('Oyun hızı', 'Game speed')}>
            {hiz === 'yavas' ? '▶' : hiz === 'normal' ? '▶▶' : '▶▶▶'}
          </button>
          {onNasil && <button className="kose-dugme yardim" onClick={onNasil} aria-label={L('Nasıl oynanır', 'How to play')} title={L('Nasıl oynanır', 'How to play')}>?</button>}
          <button className="kose-dugme" onClick={onAyarlar} aria-label={L('Ayarlar', 'Settings')} title={L('Ayarlar', 'Settings')}>⚙️</button>
        </div>
        <button className="tur-dugmesi krem" onClick={onMenu} aria-label={L('Menü: devam, yeniden kur, kurallar, ayarlar', 'Menu: continue, start over, rules, settings')}>
          <span className="baslik">☰ {L('Menü', 'Menu')}</span>
        </button>
      </div>

      {yeniBolge && (
        <div className="yeni-bolge" role="status">
          <span><b className="baslik">{L(`${yeniBolge} açıldı!`, `${yeniBolge} is open!`)}</b> {L('Yeni arsalara yapı kurabilirsin.', 'You can build on the new plots.')}</span>
          {gorunum === 'koy' && <button className="dugme altin baslik" onClick={() => onGorunum('sehir')}>{L('Şehri gör', 'See the city')}</button>}
        </div>
      )}

      {seciliArsa ? (
        <ArsaPaneli durum={d} arsa={seciliArsa} pulSayisi={pulSayisi} onInsa={onInsa} />
      ) : secili ? (
        <BinaPaneli durum={d} bina={secili} onGercek={setGercekTurler} />
      ) : (
        <div className="hud alt-orta" data-ogretici="serit">
          {t ? (
            <TurSeridi durum={d} />
          ) : (
            <div className="yonerge" aria-live="polite">
              <b>{L('Ne yapmalıyım?', 'What should I do?')}</b> <span>{L("▶ OYNA'ya bas. Yıllar akar; bir felaket olunca senden karar istenir, seçince yıllar akmaya devam eder. Artan para yapı parasında birikir; vakıf büyüdükçe şehir açılır.", 'Press ▶ PLAY. The years go by; when a disaster strikes you are asked to decide, and once you choose, the years keep going. Surplus money collects in building money; as the foundation grows, the city opens up.')}</span>
            </div>
          )}
        </div>
      )}

      {gercekTurler && <GercekEserler turler={gercekTurler} onKapat={() => setGercekTurler(null)} />}
    </>
  )
}

function Kaynak({ ad, alt, deger, ikon, zemin, ikonRenk }: { ad: string; alt: string; deger: string; ikon: 'sikke' | 'fon' | 'nakit' | 'insa'; zemin: string; ikonRenk: string }) {
  return (
    <div className="kaynak">
      <i style={{ background: zemin }} aria-hidden="true"><Ikon ad={ikon} boyut={16} renk={ikonRenk} /></i>
      <dt>{ad} <small>{alt}</small></dt>
      <dd className="baslik">{deger}</dd>
    </div>
  )
}

function BinaPaneli({ durum: d, bina, onGercek }: { durum: Durum; bina: BinaId; onGercek: (t: string[]) => void }) {
  const m = S.MULKLER
  const amac = S.AMACLAR[d.ayarlar.amac]
  const bilgi: Record<BinaId, { ad: string; miktar?: string; cipler: [string, string][] }> = {
    hamam: { ad: L('Hamam', 'Bathhouse'), miktar: L(`${d.mulk.hamam} birim`, `${d.mulk.hamam} units`), cipler: [[L(`Gelir ${tam(d.mulk.hamam * m.hamam.gelir)} / 10 yıl`, `Income ${tam(d.mulk.hamam * m.hamam.gelir)} / 10 yrs`), 'altin'], [L(`Bakım ${tam(d.mulk.hamam * m.hamam.bakim)}`, `Upkeep ${tam(d.mulk.hamam * m.hamam.bakim)}`), 'krem'], [L('Depremde %80', '80% in earthquakes'), 'kirmizi']] },
    han: { ad: L('Han ve dükkânlar', 'Inn and shops'), miktar: L(`${d.mulk.han} birim`, `${d.mulk.han} units`), cipler: [[L(`Gelir ${tam(d.mulk.han * m.han.gelir)} / 10 yıl`, `Income ${tam(d.mulk.han * m.han.gelir)} / 10 yrs`), 'altin'], [L(`Bakım ${tam(d.mulk.han * m.han.bakim)}`, `Upkeep ${tam(d.mulk.han * m.han.bakim)}`), 'krem'], [L('Yangında %60', '60% in fires'), 'kirmizi']] },
    arazi: { ad: L('Arazi', 'Farmland'), miktar: L(`${d.mulk.arazi} birim`, `${d.mulk.arazi} units`), cipler: [[L(`Gelir ${tam(d.mulk.arazi * m.arazi.gelir)} / 10 yıl`, `Income ${tam(d.mulk.arazi * m.arazi.gelir)} / 10 yrs`), 'altin'], [L('Yıkılmaz', 'Never collapses'), 'krem']] },
    sandik: { ad: L('Vakıf sandığı', 'Foundation chest'), cipler: [[L(`Yedek fon ${tam(d.fon)}`, `Reserve fund ${tam(d.fon)}`), 'turkuaz'], [L(`Nakit ${tam(d.nakit)}`, `Cash ${tam(d.nakit)}`), 'krem'], [L(`Gelirin %${d.ayarlar.yedekFonOrani}'i fona`, `${d.ayarlar.yedekFonOrani}% of income to the fund`), 'krem']] },
    hayrat: { ad: amac.ad, cipler: [[L(`Gider ${tam(d.hizmetGideri)} / 10 yıl`, `Cost ${tam(d.hizmetGideri)} / 10 yrs`), 'turkuaz'], [L(`Bina bakımı ${tam(d.hizmetGideri * S.HAYRAT_BAKIM_ORANI)}`, `Building upkeep ${tam(d.hizmetGideri * S.HAYRAT_BAKIM_ORANI)}`), 'krem']] },
  }
  const b = bilgi[bina]
  const turler = binaTurleri(bina, d.ayarlar.amac)
  const ilham = bina === 'hamam' || bina === 'han' ? ILHAM[bina] : bina === 'hayrat' ? ILHAM[d.ayarlar.amac] : null
  const renk: Record<string, [string, string]> = { altin: ['var(--altin)', '#3A2205'], krem: ['var(--parsomen-koyu)', 'inherit'], kirmizi: ['var(--tugla)', '#fff'], turkuaz: ['var(--turkuaz)', '#fff'] }
  const ikon = ({ hamam: 'hamam', han: 'han', arazi: 'arazi', sandik: 'sandik', hayrat: 'hayrat' } as const)[bina]
  return (
    <section className={`bina-paneli ${turler.length ? 'genis' : ''}`} aria-live="polite" aria-label={b.ad}>
      <div className="bina-ust">
      <div className="simge" aria-hidden="true"><Ikon ad={ikon} boyut={36} renk="#7A5E34" /></div>
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <h2 className="baslik">{b.ad}</h2>
          {b.miktar && <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--kahve)' }}>{b.miktar}</span>}
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {b.cipler.map(([metin, r]) => (
            <span key={metin} className="cip" style={{ background: renk[r][0], color: renk[r][1] }}>{metin}</span>
          ))}
        </div>
        <p>{BINA_ACIKLAMA[bina]}</p>
      </div>
      </div>
      {ilham && <IlhamKarti ilham={ilham} />}
      {turler.length > 0 && <EserSeridi turler={turler} haric={ilham?.id} onHepsi={() => onGercek(turler)} />}
    </section>
  )
}

/** "Bu tur ne oldu?": paranın yolu düz bir cümleyle. Gelir → yedek fon → bakım → hizmet. */
function TurSeridi({ durum: d }: { durum: Durum }) {
  const t = d.sonTur!
  const hayrat = S.AMACLAR[d.ayarlar.amac].ad
  const olay = t.olay ? OLAY_AD[t.olay] : t.zimmet ? L('Zimmet', 'Embezzlement') : null
  return (
    <div className={`yonerge ${t.odendi ? '' : 'kotu'}`} aria-live="polite">
      <b>{d.ayarlar.takvim ? d.ayarlar.takvim + t.yil : L(`${t.yil}. yıl`, `Year ${t.yil}`)}{olay ? ` · ${olay}` : ''}</b>
      {L(
        <span>
          <em className="p-altin">{tam(t.gelir)} akçe</em> geldi. <em className="p-turkuaz">{tam(t.fonPayi)}</em> yedek fona, <em>{tam(t.bakim)}</em> bakıma gitti.{' '}
          {t.odendi ? <em className="p-yesil">{hayrat} açık ✓</em> : <em className="p-kirmizi">Sandık boş, {hayrat.toLocaleLowerCase('tr')} kapalı ✗</em>}
          {t.sezonBonusu > 0 && <> Sezon geliri <em className="p-altin">%{Math.round(t.sezonBonusu * 100)}</em> artırdı.</>}
          {t.artanEk >= 1 && <> Artan <em className="p-kahve">{tam(t.artanEk)}</em> yapı parasına.</>}
        </span>,
        <span>
          <em className="p-altin">{tam(t.gelir)} akçe</em> came in. <em className="p-turkuaz">{tam(t.fonPayi)}</em> went to the reserve fund, <em>{tam(t.bakim)}</em> to upkeep.{' '}
          {t.odendi ? <em className="p-yesil">{hayrat} open ✓</em> : <em className="p-kirmizi">Chest empty, {hayrat.toLowerCase()} closed ✗</em>}
          {t.sezonBonusu > 0 && <> The season raised income by <em className="p-altin">{Math.round(t.sezonBonusu * 100)}%</em>.</>}
          {t.artanEk >= 1 && <> Surplus <em className="p-kahve">{tam(t.artanEk)}</em> to building money.</>}
        </span>,
      )}
    </div>
  )
}
