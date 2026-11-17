# Kasabanın köylüleri (NPC sistemi)

Köylüler haritadaki yollarda gerçek zamanlı yürür: kavşakta yön seçer, köprüden geçer, duraklarda
(çeşme, aşevi, cami önü, pazar, han, hamam, mahalle) bir süre durur, giriş noktalarında (köy yolu,
kervan yolu, han doğusu, mahalleler) kaybolup başka bir girişten yeniden belirir. Binaların ve nehrin
içinden geçmezler: yürüyebildikleri tek yer yol ağıdır.

## Dosyalar

| Dosya | Ne yapar |
|---|---|
| `scripts/yol_agi.py` | Yol ağını **haritadan üretir**. Kaldırım rengini maskeler; binaları (harita.ts çokgenleri + kiremit çatılar), nehri (su rengi) çıkarır; elle verilen düğümler arasındaki kenarları bu maske üzerinde en kısa yol ile çizer. Çıktı: `src/sahne/npc/yolAgi.json`. `python3 scripts/yol_agi.py kontrol.png` ağı haritanın üstüne çizer. |
| `src/sahne/npc/yolAgi.json` | Üretilmiş ağ: 25 düğüm, 24 kenar (harita pikseli, 1536×1024). Elle düzenlemeyin; betiği çalıştırın. |
| `src/sahne/npc/yolAgi.ts` | Ağı yükler, komşuluk listesi kurar; çizgi üstünde nokta bulma. |
| `src/sahne/npc/npc.ts` | Saf hareket mantığı: NPC verisi (`id, type, path, pathProgress, speed, state, facing, depth` + şerit, adım, görünürlük), kavşakta ağırlıklı rastgele yön, durak bekleme, giriş/çıkış, trafik (öndekine yaklaşınca yavaşlama, karşıdan gelenle şerit ayırma), delta time ile adım (en çok 0,1 sn). |
| `src/sahne/npc/gorunum.ts` | Görünümler: tür → resim(ler). Atlas, tek kare resim ya da geçici silüet. **Ölçek** (`NPC_OLCEGI`) burada. |
| `src/sahne/npc/NpcKatmani.tsx` | Çizim: requestAnimationFrame döngüsü, y'ye göre derinlik sıralaması, ayak noktası yolda, gölge. |
| `src/sahne/npc/npc.test.ts` | Ağ bağlı mı, kenarlar büyük binalardan geçiyor mu, NPC'ler ağdan çıkıyor mu, kapalı durakta duruyorlar mı. |

## Nereden değiştirilir

- **Yol ve duraklar:** `scripts/yol_agi.py` içindeki `DUGUMLER` (ad, x, y, etiketler: `giris`, `kopru`, `dur:<yer>`) ve `KENARLAR`. Betiği çalıştırın, `npm test` ile kontrol edin.
- **Sayı:** `npc.ts` → `VARSAYILAN_NPC` (12). 4 çekirdek ve altı cihazlarda 8; salgında 6; "hareketi azalt" açıksa yerinde dururlar. Kadronun sırası `KADRO`.
- **Hız, durak sevgisi, bekleme süresi:** `npc.ts` → `TURLER`.
- **Yol genişliği (şerit):** `npc.ts` → `SERIT_GENISLIGI` (yolun ortasından ±9 px).
- **Ölçek:** `gorunum.ts` → `NPC_OLCEGI` (yetişkin ≈ 31 px, bir ev ≈ 120 px).
- **Oyunla bağ:** `KoySahnesi.tsx` → `npcKosullari`: aşevi kapalıysa önünde durulmaz, çeşme kuruysa (çeşme vakfı kapalı ya da kuraklık) su alınmaz, salgında hamam ve pazarda toplanılmaz.

## Görseller (geçici)

Şu an her köylü **tek kare** bir resim: ChatGPT karakter sayfasından (şeffaf arka plan) kesildi,
`public/insanlar/sN.webp`. Yürüyüş kodla taklit ediliyor (adımla sekme ve hafif eğilme), sola giderken
resim aynalanıyor; arkadan görünüş yok. Resim yüklenemezse kodla çizilen geçici silüete düşer.

Animasyona hazır atlas gelince `gorunum.ts`'de o türün görünümünü şöyle tanımlayın; çizim kodu hazır:

```ts
esnaf: [{ tur: 'atlas', url: 'insanlar/esnaf-atlas.webp', boyut: [512, 512], hucre: [128, 128],
          satir: { asagi: 0, sol: 1, sag: 2, yukari: 3 }, kare: 4, bekleKaresi: 0, ayak: [64, 120], boy: 31 }],
```

Görsel üreticisine verilecek brif (`CLAUDE_KOYLULER_KURULUM.md`'den): şeffaf PNG atlas, her hücrede tek kişi,
4 yön × 4 yürüyüş karesi, eşit hücre ve aynı ayak noktası, zemin/gölge/yazı yok; minyatür üslubu.
