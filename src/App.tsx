import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Album } from './arayuz/Album'
import { AnaMenu } from './arayuz/AnaMenu'
import { AyarlarSayfasi } from './arayuz/AyarlarSayfasi'
import { KararPenceresi } from './arayuz/KararPenceresi'
import { KoyHud } from './arayuz/Koy'
import { Kurulum } from './arayuz/Kurulum'
import { NasilOynanir } from './arayuz/NasilOynanir'
import { ParaninYolu } from './arayuz/ParaninYolu'
import { OGRETICI_ADIMLARI, Ogretici } from './arayuz/Ogretici'
import { Sonuc } from './arayuz/Sonuc'
import { Sezon } from './arayuz/Sezon'
import type { Sezon as SezonDurumu } from './sezon'
import { LevelSecimi } from './arayuz/LevelSecimi'
import { TarihKarti } from './arayuz/TarihKarti'
import { EsnafKarti } from './arayuz/EsnafKarti'
import { yerler as mudahaleYerleri } from './arayuz/Mudahale'
import { OlaySeridi } from './arayuz/OlaySeridi'
import { ESNAF_HIKAYELERI, ESNAF_ODULU, type EsnafHikayesi } from './esnaf'
import { SALGIN_BILGISI, type TarihiOlay } from './leveller'
import { ilAdi } from './arayuz/GercekEserler'
import { YER_KARTLARI, type YerId } from './arayuz/yerler'
import { buTurunTarihi, levelYildizi, levelAyarlari, levelBul, levelGecildi, LEVELLER, SERBEST, sezonZorlugu, type Level } from './leveller'
import { BILGI_ODULU, BilgiSorusu, type Soru } from './arayuz/BilgiSorusu'
import soruBankasi from './veri/sorular.json'
import { SITE_SORU_ESERLERI } from './veri/siteSoruEserleri'
import { ayarlariOku, ayarlariYaz, HIZ_MS, ilerlemeyiOku, ilerlemeyiYaz, sayfayaUygula, titret, type OyunAyarlari } from './ayarlar'
import { afetYardimi, bagisEkle, canBitti, iyiOlay, insaEt, kararVer, mudahaleEt, salginHafiflet, turOyna, varsayilanAyarlar, yeniOyun, type Ayarlar, type Durum, type Secim } from './motor/motor'
import { KoySahnesi, type Gorunum } from './sahne/KoySahnesi'
import { afetSorusuSec, type AfetSorusu, type AfetTuru } from './veri/afetSorulari'
import { BINA_ALANI } from './sahne/harita'
import { CAN_YENILEME_YIL, canEnCok, rutbe, USTA_BAGISI } from './rutbe'
import { meydanOku, meydanTemizle, type Meydan } from './meydan'
import { muzikAyarla, sesAyarla, sesCal } from './ses'
import { dilDinle, L } from './dil'

/** Olaylar arası en az 3 tur (30 yıl) sakin: şehri incelemeye vakit kalsın. */
const OLAY_ARASI_TUR = 3
/** Kuraklık ve savaşta soruyu bilince yedek fona gelen yardım (akçe). */
const AFET_YARDIMI = 6
import { KesifPaneli } from './arayuz/Sehir'
import { BOLGELER, bolgeAcik, type ArsaId, type BolgeId, type YapiId } from './motor/sehir'
import { ALBUM_TURLERI, kartHakki, kartlariSec } from './albumKartlari'
import { gercekEserler, ortam, type GercekEser } from './ortam'
import type { BinaId } from './sahne/koySvg'

type SezonHaritasi = { s: SezonDurumu; onTopla: (id: string) => void; onKese: (id: number) => void } | null
type Ekran = 'menu' | 'leveller' | 'kurulum' | 'oyun' | 'sonuc'
type Katman = 'ayarlar' | 'paraYolu' | 'nasil' | 'duraklat' | 'album' | 'kesif' | 'sezon' | 'soru' | 'tarih' | 'esnaf' | null

const SONUCA_GECIS_MS = 1100
/** Kaç sezonda bir bilgi sorusu gelir. */
const SORU_ARALIGI = 3

export default function App() {
  const [oyunAyarlari, setOyunAyarlari] = useState<OyunAyarlari>(ayarlariOku)
  // Dil değişince bütün ekran yeniden çizilir (metinler L(...) ile her çizimde dile bakar).
  const [, setDilSurumu] = useState(0)
  useEffect(() => dilDinle(() => setDilSurumu((n) => n + 1)), [])
  const [ilerleme, setIlerleme] = useState(ilerlemeyiOku)
  const [ayarlar, setAyarlar] = useState<Ayarlar>(varsayilanAyarlar)
  const [durum, setDurum] = useState<Durum>(() => yeniOyun(varsayilanAyarlar()))
  const [ekran, setEkran] = useState<Ekran>('menu')
  const [katman, setKatman] = useState<Katman>(null)
  const [oynatiliyor, setOynatiliyor] = useState(false)
  const [secili, setSecili] = useState<BinaId | null>(null)
  const [ogretici, setOgretici] = useState<number | null>(null)
  const kaydedilenOyun = useRef<Durum | null>(null)
  const [yeniKartlar, setYeniKartlar] = useState<GercekEser[] | null>(null)
  const [gorunum, setGorunum] = useState<Gorunum>('koy')
  const [seciliArsa, setSeciliArsa] = useState<ArsaId | null>(null)
  const [yeniBolge, setYeniBolge] = useState<string | null>(null)
  const [yakinlik, setYakinlik] = useState<{ n: number; yon: 1 | -1 }>({ n: 0, yon: 1 })
  // Salgın turunda darüşşifa teklifi şeridi açıkken yıllar durur.
  // Kararsız olaylarda (salgın, kuraklık, savaş) gösterilen soru şeridi: olayın türü ya da kapalı.
  const [salginSeridi, setSalginSeridi] = useState<'salgin' | 'kuraklik' | 'savas' | false>(false)

  // Pasaport pulları (ev sahibi uygulama verirse). Sekmeye dönünce yeniden okunur: QR okutup gelen oyuncu hemen görsün.
  const pullariOku = () => {
    try {
      return ortam.araclar.pullar?.() ?? []
    } catch {
      return []
    }
  }
  const [pullar, setPullar] = useState<string[]>(pullariOku)
  // Ev sahibi pulları sonradan yüklerse (web: Supabase, giriş/çıkış) 'vakfiye:pullar' olayıyla haber verir.
  useEffect(() => {
    const yenile = () => document.visibilityState === 'visible' && setPullar(pullariOku())
    const olay = () => setPullar(pullariOku())
    document.addEventListener('visibilitychange', yenile)
    window.addEventListener('vakfiye:pullar', olay)
    return () => {
      document.removeEventListener('visibilitychange', yenile)
      window.removeEventListener('vakfiye:pullar', olay)
    }
  }, [])
  // Menüye ve level ekranına her girişte de yeniden oku: QR okutup dönen oyuncu kilidin açıldığını görsün.
  useEffect(() => {
    if (ekran === 'menu' || ekran === 'leveller') setPullar(pullariOku())
  }, [ekran])
  const pulSayisi = pullar.length

  useEffect(() => {
    sayfayaUygula(oyunAyarlari)
    ayarlariYaz(oyunAyarlari)
    sesAyarla({ ses: oyunAyarlari.ses })
  }, [oyunAyarlari])

  // Fon müziği yalnız oyun ekranında çalar; 🔊 düğmesi (ses) ya da Ayarlar'daki Müzik anahtarı susturur.
  useEffect(() => {
    muzikAyarla({ ses: oyunAyarlari.ses, muzik: oyunAyarlari.muzik, calsin: ekran === 'oyun' })
  }, [oyunAyarlari.ses, oyunAyarlari.muzik, ekran])

  // ---------- Akış ----------
  const oyna = () => {
    setKatman(null)
    if (!ilerleme.ogreticiBitti) return ogreticiyiBaslat()
    setEkran('leveller')
  }

  // Meydan okuma bağlantısıyla gelindiyse: menüde davet; kabul edince o level (kilitli olsa bile) açılır.
  const [meydan] = useState<Meydan | null>(() => (typeof window !== 'undefined' ? meydanOku(window.location.search) : null))
  const [meydanDaveti, setMeydanDaveti] = useState(() => meydan !== null)
  const meydanKabul = () => {
    if (!meydan) return
    setMeydanDaveti(false)
    meydanTemizle()
    levelSec(LEVELLER.find((l) => l.no === meydan.l) ?? SERBEST)
  }
  const levelSec = (l: Level) => {
    setAyarlar((a) => levelAyarlari(l, a))
    setEkran('kurulum')
  }

  const ogreticiyiBaslat = () => {
    setKatman(null)
    setAyarlar(levelAyarlari(LEVELLER[0], varsayilanAyarlar())) // Level 1 (tohum 192): ilk felaket 40. yılda, fon onarıma yeter
    setOgretici(0)
    setEkran('kurulum')
  }

  const ogreticiyiBitir = () => {
    setOgretici(null)
    const yeni = { ...ilerleme, ogreticiBitti: true }
    setIlerleme(yeni)
    ilerlemeyiYaz(yeni)
  }

  const kur = () => {
    setDevam(false)
    setTarih(null)
    setSoru(null)
    setOyunSorulan([])
    setCanTavan(canEnCok(ilerleme.afetDogru))
    setCan(canEnCok(ilerleme.afetDogru))
    setDurum(yeniOyun({ ...ayarlar, zorluk: oyunAyarlari.zorluk, kesifBagisi: Math.min(30, pulSayisi * 5), olayBirKez: true, olayArasi: oyunAyarlari.olayArasi ? OLAY_ARASI_TUR : 0 }))
    setSecili(null)
    setSeciliArsa(null)
    setGorunum('koy')
    setYeniBolge(null)
    sezonSayisi.current = 0
    gosterilenTarih.current = new Set()
    setGorulenEsnaf([])
    setSalginSeridi(false)
    setEkran('oyun')
    if (ogretici === 3) setOgretici(4)
  }

  const kuruluma = () => {
    setOynatiliyor(false)
    setKatman(null)
    setEkran('kurulum')
  }

  const anaMenuye = () => {
    setOynatiliyor(false)
    setKatman(null)
    setOgretici(null)
    setEkran('menu')
  }

  const tekTur = useCallback(() => setDurum((d) => turOyna(d)), [])

  // "+10 yıl": önce sezon mini oyunu (öğreticide ve ayarlarda kapalıysa doğrudan tur).
  const sezonSayisi = useRef(0)
  const [soru, setSoru] = useState<Soru | null>(null)
  // Sezon oynanırken haritanın çizdiği balonlar, keseler ve araba (Sezon bileşeni verir).
  const [sezonHarita, setSezonHarita] = useState<SezonHaritasi>(null)
  // "+10 yıl" doğrudan bir tur oynatır (sezon mini oyunu kaldırıldı).
  const elleTur = () => {
    setDevam(false)
    tekTur()
  }
  const sezonBitti = (bonus: number) => {
    setDurum((d) => turOyna(d, bonus))
    sezonSayisi.current++
    if (sezonSayisi.current % SORU_ARALIGI === 2) {
      // Soru kendiliğinden açılmaz: sandığın başında bir hayırsever belirir, oyuncu dokunursa sorar. Sorulan soru bir daha gelmez.
      const havuz = (soruBankasi as Soru[]).filter((q) => SITE_SORU_ESERLERI.has(q.id) && !ilerleme.sorulan.includes(q.id))
      if (havuz.length) setSoru(havuz[Math.floor(Math.random() * havuz.length)])
    }
    setKatman(null)
  }
  const ilerlemeGuncelle = (f: (i: typeof ilerleme) => typeof ilerleme) =>
    setIlerleme((o) => {
      const n = f(o)
      ilerlemeyiYaz(n)
      return n
    })
  const soruCevap = (dogru: boolean) => {
    if (!soru) return
    ilerlemeGuncelle((i) => ({ ...i, sorulan: [...i.sorulan.filter((x) => x !== soru.id), soru.id], dogruCevap: i.dogruCevap + (dogru ? 1 : 0) }))
    if (dogru) setDurum((d) => bagisEkle(d, BILGI_ODULU, L(`Bilgi sorusunu bildin: bir hayırsever yapı parasına ${BILGI_ODULU} akçe bağışladı.`, `You got the quiz question right: a benefactor gave ${BILGI_ODULU} akçe to building money.`)))
  }

  // "İlerle": karar ya da bitişe kadar turlar ayarlardaki hızla akar.
  const akiyor = oynatiliyor && !durum.bekleyenKarar && !durum.bitti && katman === null && !salginSeridi && secili === null && seciliArsa === null
  useEffect(() => {
    if (!akiyor) return
    const id = setTimeout(tekTur, HIZ_MS[oyunAyarlari.hiz])
    return () => clearTimeout(id)
  }, [akiyor, durum, tekTur, oyunAyarlari.hiz])

  // Yeni bir bölge açılınca kısa bir duyuru (oyun sırasında).
  const acikBolgeler = useRef<Set<BolgeId>>(new Set())
  useEffect(() => {
    const simdi = (Object.keys(BOLGELER) as BolgeId[]).filter((b) => bolgeAcik(b, durum.yil, pulSayisi))
    if (ekran === 'oyun' && durum.yil > 0) {
      const yeni = simdi.find((b) => !acikBolgeler.current.has(b))
      if (yeni) {
        setYeniBolge(BOLGELER[yeni].ad)
        titret(oyunAyarlari, 40)
      }
    }
    acikBolgeler.current = new Set(simdi)
  }, [durum.yil, pulSayisi, ekran, oyunAyarlari])
  useEffect(() => {
    if (!yeniBolge) return
    const id = setTimeout(() => setYeniBolge(null), 7000)
    return () => clearTimeout(id)
  }, [yeniBolge])

  const insa = (a: ArsaId, y: YapiId) => {
    setDurum((d) => insaEt(d, a, y, pulSayisi))
    titret(oyunAyarlari, 30)
    sesCal('kur')
  }
  // Envanter sorusu: her 50 yılda bir sandığın başında bir hayırsever belirir (oyuncu dokunursa sorar).
  useEffect(() => {
    if (ekran !== 'oyun' || durum.yil === 0 || durum.yil % 50 !== 0 || soru) return
    const havuz = (soruBankasi as Soru[]).filter((q) => SITE_SORU_ESERLERI.has(q.id) && !ilerleme.sorulan.includes(q.id))
    if (havuz.length) setSoru(havuz[(durum.rng >>> 0) % havuz.length])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [durum.yil, ekran])
  // Afet anı sesi
  useEffect(() => {
    if (durum.bekleyenKarar || salginSeridi) sesCal('afet')
  }, [durum.bekleyenKarar, salginSeridi])
  useEffect(() => {
    if (durum.sonTur?.olay && iyiOlay(durum.sonTur.olay)) sesCal('iyi')
  }, [durum.sonTur])

  // Tarihten: levelin şehrinde o yıl gerçekten yaşanmış bir olayın turu gelince oyun durur ve olayı kaynağıyla anlatır.
  // Rastgele ilk salgında da bir kez tarihi bilgi gösterilir. Kart kapanınca (karar yoksa) yıllar akmaya devam eder.
  const gosterilenTarih = useRef<Set<string>>(new Set())
  // Felaket anında önce olay şeridi: oyuncu koşar ya da hemen karar verir. Salgında şerit tur başına bir kez.
  const [kararAcik, setKararAcik] = useState(false)
  // Karardan ya da afet şeridinden sonra: oyun durur, OYNA düğmesi "DEVAM" olur.
  const [devam, setDevam] = useState(false)
  // Bu oyunda sorulmuş afet soruları: aynı soru bir oyunda iki kez gelmez; yeni oyunda liste sıfırlanır.
  const [oyunSorulan, setOyunSorulan] = useState<string[]>([])
  // Can: yanlış afet cevabı bir can götürür; her yüzyıl bir can geri gelir.
  const [can, setCan] = useState(() => canEnCok(ilerleme.afetDogru))
  const [canTavan, setCanTavan] = useState(() => canEnCok(ilerleme.afetDogru))
  const sonYuzyil = useRef(0)
  useEffect(() => {
    const yuzyil = Math.floor(durum.yil / CAN_YENILEME_YIL)
    if (durum.yil === 0) sonYuzyil.current = 0
    else if (yuzyil > sonYuzyil.current) {
      sonYuzyil.current = yuzyil
      setCan((c) => Math.min(canTavan, c + 1))
    }
  }, [durum.yil, canTavan])
  const [seritKilit, setSeritKilit] = useState(false)
  useEffect(() => {
    if (!durum.bekleyenKarar) setKararAcik(false)
    else {
      // Afet anı: açık bina/arsa paneli kapanır, ekranda tek şey olsun.
      setSecili(null)
      setSeciliArsa(null)
    }
  }, [durum.bekleyenKarar])
  useEffect(() => {
    if (salginSeridi) {
      setSecili(null)
      setSeciliArsa(null)
    }
  }, [salginSeridi])

  const [tarih, setTarih] = useState<TarihiOlay | null>(null)
  const [tarihYili, setTarihYili] = useState(0)
  // Not 40 yıl sonra kalkar.
  const tarihNotu = tarih && ekran === 'oyun' && durum.yil - tarihYili <= 40 ? tarih : null
  useEffect(() => {
    if (ekran !== 'oyun' || !durum.sonTur || ogretici !== null || katman !== null) return
    const tarihi = buTurunTarihi(durum)
    const ilkSalgin = !tarihi && durum.sonTur.olay === 'salgin' && !gosterilenTarih.current.has('salgin') ? SALGIN_BILGISI : null
    const t = tarihi ?? ilkSalgin
    const anahtar = tarihi ? `${durum.ayarlar.tohum}-${durum.sonTur.yil}` : 'salgin'
    // Tarihten not: kendiliğinden açılmaz, oyunu durdurmaz; üstte küçük bir levha olarak durur, dokununca okunur.
    if (t && !gosterilenTarih.current.has(anahtar)) {
      gosterilenTarih.current.add(anahtar)
      setTarih(t)
      setTarihYili(durum.yil)
    }
    // Tarih kartından sonra: salgın, kuraklık ve savaş turunda da soru şeridi (tur başına bir kez).
    const o = durum.sonTur.olay
    const anahtar2 = `serit-${durum.ayarlar.tohum}-${durum.sonTur.yil}`
    if (oyunAyarlari.afetSorusu && (o === 'salgin' || o === 'kuraklik' || o === 'savas') && !durum.bitti && !gosterilenTarih.current.has(anahtar2)) {
      gosterilenTarih.current.add(anahtar2)
      setSalginSeridi(o)
    }
  }, [durum, ekran, ogretici, katman, oyunAyarlari.afetSorusu])

  // Şehrin bilgi yerleri: haritada sabit; dokununca bilgi. Esnaf yerleri ilk okunuşta (oyun başına) +3 akçe.
  const [gorulenEsnaf, setGorulenEsnaf] = useState<string[]>([])
  const [esnaf, setEsnaf] = useState<{ h: EsnafHikayesi; odul: boolean } | null>(null)
  // Ekranda aynı anda tek şey açık: kart açılırken bina/arsa paneli kapanır (hedef paneli KoyHud'da katmanla kapanır).
  const panelleriKapat = () => {
    setSecili(null)
    setSeciliArsa(null)
  }
  // Vakfa ait olmayan yer (köprü, değirmen, başka vakfın camisi...): kümbet gibi kısa kart, ödülsüz.
  const yerSec = (y: YerId) => {
    panelleriKapat()
    setEsnaf({ h: YER_KARTLARI[y], odul: false })
    sesCal('sayfa')
    setOynatiliyor(false)
    setKatman('esnaf')
  }
  const bilgiYeriSec = (h: EsnafHikayesi) => {
    panelleriKapat()
    const odul = !!h.odul && !gorulenEsnaf.includes(h.id) && !durum.bitti
    if (!gorulenEsnaf.includes(h.id)) setGorulenEsnaf((g) => [...g, h.id])
    if (odul) setDurum((d) => bagisEkle(d, ESNAF_ODULU, L(`${h.kim} vakfa teşekkür etti: yapı parasına ${ESNAF_ODULU} akçe.`, `The ${h.kim.toLocaleLowerCase('en')} thanked the foundation: ${ESNAF_ODULU} akçe to building money.`)))
    setEsnaf({ h, odul })
    sesCal(odul ? 'para' : 'sayfa')
    setOynatiliyor(false)
    setKatman('esnaf')
  }
  const esnafKapat = () => {
    setEsnaf(null)
    setKatman(null)
  }

  // Karar anı ve çöküşte titreşim.
  useEffect(() => {
    if (durum.bekleyenKarar) titret(oyunAyarlari, [60, 40, 120])
  }, [durum.bekleyenKarar, oyunAyarlari])

  // Oyun bitince kısa bir bekleme, sonra sonuç; ilerleme bir kez kaydedilir.
  useEffect(() => {
    if (ekran !== 'oyun' || !durum.bitti) return
    if (kaydedilenOyun.current !== durum) {
      kaydedilenOyun.current = durum
      const y = levelYildizi(durum)
      const yeni = {
        ...ilerleme,
        toplamYildiz: ilerleme.toplamYildiz + y,
        oynananOyun: ilerleme.oynananOyun + 1,
        enIyiYil: Math.max(ilerleme.enIyiYil, durum.yil),
        sonOyun: { yil: durum.yil, ayakta: durum.sonuc === 'ayakta', yildiz: y },
      }
      // Level: geçildiyse yıldızı kaydet, levelin eserini albüme ekle.
      const no = durum.ayarlar.levelNo
      if (no && levelGecildi(durum)) {
        yeni.leveller = { ...yeni.leveller, [no]: Math.max(yeni.leveller[no] ?? 0, y) }
        const eser = levelBul(no).eser
        if (!yeni.album.includes(eser)) yeni.album = [...yeni.album, eser]
      }
      setIlerleme(yeni)
      ilerlemeyiYaz(yeni)
      // Eser albümü: her 100 yıl için bir gerçek eser kartı.
      setYeniKartlar(kartHakki(durum) > 0 ? null : [])
      if (kartHakki(durum) > 0) {
        gercekEserler(ALBUM_TURLERI).then((havuz) => {
          const kartlar = kartlariSec(durum, [...yeni.album, ...pullar], havuz, yeni.oynananOyun)
          setYeniKartlar(kartlar)
          setIlerleme((o) => {
            const n = { ...o, album: [...o.album, ...kartlar.map((k) => k.id).filter((id) => !o.album.includes(id))] }
            ilerlemeyiYaz(n)
            return n
          })
        })
      }
      if (durum.sonuc === 'coktu') titret(oyunAyarlari, [200, 80, 200])
    }
    const id = setTimeout(() => setEkran('sonuc'), SONUCA_GECIS_MS)
    return () => clearTimeout(id)
  }, [ekran, durum, ilerleme, oyunAyarlari])

  // Öğretici: oyuncu söyleneni yapınca bir sonraki adıma geçer.
  useEffect(() => {
    if (ogretici === 4 && durum.yil >= 10) setOgretici(5)
    if (ogretici === 6 && durum.bekleyenKarar) setOgretici(7)
  }, [ogretici, durum.yil, durum.bekleyenKarar])

  // Karar verilince yıllar kaldığı yerden akmaya devam eder ("▶ OYNA"ya yeniden basmak gerekmez).
  // Öğreticide durur: oyuncu son açıklamayı okuyabilsin.
  // Karardan sonra yıllar durur: oyuncu önce yapı kurabilir, sonra DEVAM'a basar.
  const karar = (s: Secim) => {
    setOynatiliyor(false)
    if (ogretici === null) setDevam(true)
    sesCal('tik')
    setDurum((d) => kararVer(d, s))
    if (ogretici === 7) setOgretici(8)
  }

  const ogreticiDevam = () => {
    if (ogretici === null) return
    if (ogretici >= OGRETICI_ADIMLARI.length - 1) return ogreticiyiBitir()
    setOgretici(ogretici + 1)
  }

  // ---------- Görünüm ----------
  const kk = durum.bekleyenKarar
  const seritKarar = ekran === 'oyun' && katman === null && !!kk && (!kk.mudahale || seritKilit) && !kararAcik && oyunAyarlari.afetSorusu && ogretici === null
  const seritSalgin = ekran === 'oyun' && katman === null && !!salginSeridi
  const olayOdagi = seritKarar ? (() => { const y = mudahaleYerleri(durum, kk!.olay); return [...y.alanlar, ...(y.kuyu ? [[y.kuyu]] : [])] })() : seritSalgin && salginSeridi === 'salgin' ? mudahaleYerleri(durum, 'salgin').alanlar : seritSalgin && salginSeridi === 'kuraklik' ? [BINA_ALANI.arazi] : null
  const takvimYili = durum.ayarlar.takvim ? durum.ayarlar.takvim + durum.yil : null
  // Felaket sorusu: bu olay için sorulmamış bir soru (Ahi rütbesinde yanlışa karşı bir yedek).
  const seritTuru: AfetTuru | null = seritKarar ? kk!.olay : seritSalgin && salginSeridi ? salginSeridi : null
  const afetSorulari = useMemo(() => {
    if (!seritTuru || !oyunAyarlari.afetSorusu) return { soru: null, yedek: null }
    const soru = afetSorusuSec(seritTuru, oyunSorulan, durum.rng ^ durum.yil, ilerleme.afetSorulan)
    const yedek = soru ? afetSorusuSec(seritTuru, [...oyunSorulan, soru.id], durum.rng ^ (durum.yil + 1), [...ilerleme.afetSorulan, soru.id]) : null
    return { soru, yedek: yedek && yedek.id !== soru?.id ? yedek : null }
    // Soru olay başında bir kez seçilir; cevaplanınca (afetSorulan değişince) değişmesin.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seritTuru, durum.yil, durum.ayarlar.tohum, oyunAyarlari.afetSorusu])
  const afetCevap = (q: AfetSorusu, dogru: boolean, canGider: boolean) => {
    sesCal(dogru ? 'dogru' : 'yanlis')
    if (canGider) {
      setCan((c) => Math.max(0, c - 1))
      // Son can da gittiyse vakıf çöker.
      if (can <= 1) setDurum((d) => canBitti(d))
    }
    const usta = rutbe(ilerleme.afetDogru).simdiki.no >= 2
    setOyunSorulan((l) => [...l, q.id])
    ilerlemeGuncelle((i) => ({ ...i, afetSorulan: [...i.afetSorulan.filter((x) => x !== q.id), q.id], afetDogru: i.afetDogru + (dogru ? 1 : 0) }))
    if (!dogru) return
    // Afet hemen söner (harita değişir); şerit DEVAM'a kadar açık kalır.
    if (q.tur === 'kuraklik' || q.tur === 'savas') setDurum((d) => afetYardimi(d, AFET_YARDIMI, q.tur === 'kuraklik' ? L(`Soruyu bildin: imaret ve komşu vakıflar yardım etti, yedek fona ${AFET_YARDIMI} akçe.`, `You got it right: the imaret and neighbouring foundations helped, ${AFET_YARDIMI} akçe to the reserve fund.`) : L(`Soruyu bildin: mahallenin avârız vakfı yetişti, yedek fona ${AFET_YARDIMI} akçe.`, `You got it right: the neighbourhood’s avârız foundation came to help, ${AFET_YARDIMI} akçe to the reserve fund.`)))
    else if (q.tur === 'salgin') setDurum((d) => salginHafiflet(d, 1, L('Soruyu bildin: darüşşifa hastaları kabul etti, salgının fazladan gideri yedek fona döndü.', 'You got it right: the hospital took in the sick, and the epidemic’s extra cost went back to the reserve fund.')))
    else {
      setSeritKilit(true)
      setDurum((d) => mudahaleEt(d, 1, q.tur === 'yangin' ? L('Soruyu bildin: kova zinciri yetişti, yangın büyümeden söndü.', 'You got it right: the bucket chain arrived and put out the fire before it grew.') : L('Soruyu bildin: yardım ekibi yetişti, hasar azaldı.', 'You got it right: the rescue team arrived and the damage was reduced.')))
    }
    if (usta) setDurum((d) => bagisEkle(d, USTA_BAGISI, L(`Usta ayrıcalığı: hayırseverler vakfa ${USTA_BAGISI} akçe bağışladı.`, `Master’s privilege: benefactors gave the foundation ${USTA_BAGISI} akçe.`)))
  }
  // Şerit kapanınca: yangın/depremde karar penceresi açılır, salgında yıllar akmaya devam eder.
  const afetDevam = () => {
    setSeritKilit(false)
    setSalginSeridi(false)
    // Yalnız karar bekleniyorsa (yangın/deprem); yoksa bir sonraki afetin şeridi atlanmasın.
    if (durum.bekleyenKarar) setKararAcik(true)
    else {
      setOynatiliyor(false)
      setDevam(true)
    }
  }
  const sonrakiLevel = durum.ayarlar.levelNo && levelGecildi(durum) ? LEVELLER.find((l) => l.no === durum.ayarlar.levelNo! + 1) ?? null : null
  const onizleme = ekran === 'oyun' || ekran === 'sonuc' ? durum : yeniOyun(ayarlar)
  const karartma = ekran !== 'oyun' || (!!durum.bekleyenKarar && !seritKarar) || (katman !== null && !(katman === 'sezon' && sezonHarita))

  return (
    <main
      className={`ekran ${karartma ? 'karartilmis' : ''} ${ekran === 'menu' ? 'menude' : ''} ${katman === 'sezon' ? 'sezonda' : ''} ${seritKarar || seritSalgin ? 'olayda' : ''}`}
      onClick={() => {
        setSecili(null)
        setSeciliArsa(null)
      }}
    >
      <KoySahnesi
        durum={onizleme}
        secili={ekran === 'oyun' ? secili : null}
        onSec={(b) => {
          // Bir yapıya dokununca zaman durur: inceleme ya da kurma sırasında olay gelmez.
          // Afet anında (karar ya da soru şeridi) panel açılmaz: ekranda tek şey olsun.
          if (b && (durum.bekleyenKarar || salginSeridi)) return
          if (b) setOynatiliyor(false)
          setSecili(b)
          setSeciliArsa(null)
        }}
        etiketler={ekran === 'oyun' && oyunAyarlari.paraEtiketleri}
        gorunum={ekran === 'oyun' ? gorunum : 'koy'}
        yakinlik={yakinlik}
        sezon={katman === 'sezon' ? sezonHarita : null}
        odak={olayOdagi}
        onYer={ekran === 'oyun' && katman === null && !durum.bekleyenKarar ? yerSec : undefined}
        bilgiYerleri={ekran === 'oyun' && ogretici === null && katman === null && !durum.bekleyenKarar && !salginSeridi ? { yerler: ESNAF_HIKAYELERI, okunan: gorulenEsnaf, onSec: bilgiYeriSec } : null}
        hayirsever={ekran === 'oyun' && katman === null && soru && !durum.bekleyenKarar ? () => setKatman('soru') : null}
        pulSayisi={pulSayisi}
        seciliArsa={ekran === 'oyun' ? seciliArsa : null}
        onArsaSec={(a) => {
          if (a && (durum.bekleyenKarar || salginSeridi)) return
          if (a) setOynatiliyor(false)
          setSeciliArsa(a)
          setSecili(null)
        }}
      />

      {ekran === 'menu' && katman === null && (
        <AnaMenu meydan={meydanDaveti ? meydan : null} onMeydan={meydanKabul} onMeydanReddet={() => setMeydanDaveti(false)} ilerleme={ilerleme} onOyna={oyna} onNasil={() => setKatman('nasil')} onAyarlar={() => setKatman('ayarlar')} onAlbum={() => setKatman('album')} />
      )}

      {ekran === 'leveller' && katman === null && (
        <LevelSecimi gecilen={ilerleme.leveller} pullar={pullar} onSec={levelSec} onGeri={anaMenuye} />
      )}

      {ekran === 'kurulum' && katman === null && (
        <Kurulum ayarlar={{ ...ayarlar, zorluk: oyunAyarlari.zorluk }} pulSayisi={pulSayisi} onDegis={setAyarlar} onKur={kur} onGeri={ogretici === null ? () => setEkran('leveller') : anaMenuye} />
      )}

      {ekran === 'oyun' && (
        <div onClick={(e) => e.stopPropagation()} style={{ display: 'contents' }}>
          <KoyHud
            can={oyunAyarlari.afetSorusu ? { kalan: can, enCok: canTavan } : undefined}
            durum={durum}
            oynatiliyor={akiyor}
            secili={secili}
            etiketler={oyunAyarlari.paraEtiketleri}
            onIlerle={() => {
              setDevam(false)
              setOynatiliyor(true)
            }}
            devam={devam}
            ses={oyunAyarlari.ses}
            hiz={oyunAyarlari.hiz}
            onSes={() => setOyunAyarlari((a) => ({ ...a, ses: !a.ses }))}
            onHiz={() => setOyunAyarlari((a) => ({ ...a, hiz: a.hiz === 'yavas' ? 'normal' : a.hiz === 'normal' ? 'hizli' : 'yavas' }))}
            onAyarlar={() => {
              setOynatiliyor(false)
              setKatman('ayarlar')
            }}
            onNasil={() => {
              setOynatiliyor(false)
              setKatman('nasil')
            }}
            onTur={elleTur}
            onDur={() => setOynatiliyor(false)}
            onMenu={() => {
              setOynatiliyor(false)
              setKatman('duraklat')
            }}
            onEtiketler={() => setOyunAyarlari((a) => ({ ...a, paraEtiketleri: !a.paraEtiketleri }))}
            gorunum={gorunum}
            onGorunum={(g) => {
              setGorunum(g)
              setYeniBolge(null)
            }}
            pulSayisi={pulSayisi}
            seciliArsa={seciliArsa}
            katmanAcik={katman !== null}
            onPanelAcildi={panelleriKapat}
            onInsa={insa}
            onKesif={() => {
              setOynatiliyor(false)
              setKatman('kesif')
            }}
            yeniBolge={katman === null && !durum.bekleyenKarar && !salginSeridi ? yeniBolge : null}
            onYakinlik={(yon) => setYakinlik((y) => ({ n: y.n + 1, yon }))}
          />
          {tarihNotu && katman === null && (
            <button className="tarih-notu" onClick={(e) => { e.stopPropagation(); setOynatiliyor(false); setKatman('tarih') }} aria-label={L(`Tarihten: ${tarihNotu.baslik}. Oku`, `From history: ${tarihNotu.baslik}. Read`)}>
              <span aria-hidden="true">📜</span>
              <span className="tarih-notu-metin"><b>{tarihNotu.yil > 0 ? `${L('Tarihten', 'From history')} · ${tarihNotu.yil}` : L('Tarihten', 'From history')}</b> {tarihNotu.baslik}</span>
            </button>
          )}
          {seritKarar && (
            <OlaySeridi key={`k${durum.yil}`} tur={kk!.olay} takvimYili={takvimYili} baslik={kk!.olay === 'yangin' ? L('Çarşıda yangın! Han yanıyor.', 'Fire in the bazaar! The inn is burning.') : L('Deprem! Binalar yıkıldı.', 'Earthquake! Buildings collapsed.')} {...afetSorulari} can={can} canEnCok={canTavan} dogruSayisi={ilerleme.afetDogru} onCevap={afetCevap} onDevam={afetDevam} />
          )}
          {seritSalgin && (
            <OlaySeridi key={`s${durum.yil}`} tur={salginSeridi || 'salgin'} takvimYili={takvimYili} baslik={salginSeridi === 'kuraklik' ? L('Kuraklık! Tarlalar kurudu.', 'Drought! The fields have dried up.') : salginSeridi === 'savas' ? L('Savaş! Yollar kesildi.', 'War! The roads are cut.') : L('Salgın! Darüşşifada hekim lazım.', 'Epidemic! The hospital needs physicians.')} {...afetSorulari} can={can} canEnCok={canTavan} dogruSayisi={ilerleme.afetDogru} onCevap={afetCevap} onDevam={afetDevam} />
          )}
          {durum.bekleyenKarar && katman === null && !seritKarar && (
            <KararPenceresi key={durum.yil} durum={durum} onSec={karar} ipucu={oyunAyarlari.ipuclari || oyunAyarlari.zorluk === 'kolay'} />
          )}
        </div>
      )}

      {ekran === 'sonuc' && katman === null && <Sonuc meydan={meydan} rutbeAd={`${rutbe(ilerleme.afetDogru).simdiki.simge} ${rutbe(ilerleme.afetDogru).simdiki.ad}`} durum={durum} yeniKartlar={yeniKartlar} onAlbum={() => setKatman('album')} onYeniden={kuruluma} onAnaMenu={anaMenuye} onLeveller={() => setEkran('leveller')} onSonraki={sonrakiLevel ? () => levelSec(sonrakiLevel) : null} />}

      {katman === 'duraklat' && (
        <div className="ortala" onClick={(e) => e.stopPropagation()}>
          <section className="ahsap-panel duraklat" aria-labelledby="duraklat-baslik">
            <h1 id="duraklat-baslik" className="kurdele yesil baslik golgeli">{L('DURAKLATILDI', 'PAUSED')}</h1>
            <button className="dugme yesil baslik buyuk-dugme" onClick={() => setKatman(null)}>{L('DEVAM ET', 'CONTINUE')}</button>
            <div className="ikili">
              <button className="dugme krem baslik" onClick={kuruluma}>{L('YENİDEN KUR', 'START OVER')}</button>
              <button className="dugme krem baslik" onClick={() => setKatman('nasil')}>{L('NASIL OYNANIR ?', 'HOW TO PLAY ?')}</button>
              <button className="dugme krem baslik" onClick={() => setKatman('ayarlar')}>{L('AYARLAR', 'SETTINGS')}</button>
              <button className="dugme krem baslik" onClick={anaMenuye}>{L('ANA MENÜ', 'MAIN MENU')}</button>
            </div>
          </section>
        </div>
      )}

      {katman === 'ayarlar' && (
        <AyarlarSayfasi
          ayarlar={oyunAyarlari}
          onDegis={setOyunAyarlari}
          onOgreticiyiSifirla={ogreticiyiBaslat}
          onKapat={() => setKatman(ekran === 'oyun' ? 'duraklat' : null)}
        />
      )}

      {katman === 'album' && <Album toplanan={[...ilerleme.album, ...pullar]} onKapat={() => setKatman(null)} />}

      {katman === 'sezon' && ekran === 'oyun' && (
        <Sezon
          key={durum.yil}
          durum={durum}
          okunan={ilerleme.okunan}
          pullar={pullar}
          sureli={!oyunAyarlari.sezonSuresiz}
          zorluk={sezonZorlugu(durum)}
          hareketiAzalt={oyunAyarlari.hareketiAzalt}
          onOku={(id) => ilerlemeGuncelle((i) => (i.okunan.includes(id) ? i : { ...i, okunan: [...i.okunan, id] }))}
          onBitir={sezonBitti}
          onHarita={setSezonHarita}
        />
      )}

      {katman === 'soru' && soru && <BilgiSorusu key={soru.id} soru={soru} onCevap={soruCevap} onKapat={() => { setSoru(null); setKatman(null) }} />}

      {katman === 'tarih' && tarih && (
        <TarihKarti olay={tarih} sehir={ilAdi(levelBul(durum.ayarlar.levelNo).il) || L('Vakıf', 'Foundation')} oyunYili={durum.yil} onDevam={() => setKatman(null)} />
      )}


      {katman === 'esnaf' && esnaf && <EsnafKarti h={esnaf.h} odulVerildi={esnaf.odul} onKapat={esnafKapat} />}

      {katman === 'kesif' && <KesifPaneli durum={durum} pulSayisi={pulSayisi} onKapat={() => setKatman(null)} />}

      {katman === 'paraYolu' && (
        <ParaninYolu onDevam={() => setKatman('nasil')} onKapat={() => setKatman(ekran === 'oyun' ? 'duraklat' : null)} />
      )}

      {katman === 'nasil' && (
        <NasilOynanir onKapat={() => setKatman(ekran === 'oyun' ? 'duraklat' : null)} onOgretici={ogreticiyiBaslat} />
      )}

      {ogretici !== null && katman === null && ekran !== 'menu' && <Ogretici adim={ogretici} onDevam={ogreticiDevam} onAtla={ogreticiyiBitir} />}
    </main>
  )
}
