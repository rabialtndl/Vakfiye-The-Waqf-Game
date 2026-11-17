# Vakfiye — Yollarda dolaşan köylüler / NPC entegrasyonu

## Görev
Mevcut Vakfiye oyununa, **B tarzı Osmanlı minyatürü ana haritasına** uyumlu, kasaba yolları üzerinde dolaşan küçük NPC'ler ekle. Bu paketteki `karakter_referans.png` B stiline tam uyan kesin sprite atlası değil, karakter/tavır/meslek referansıdır; çevresinde boyalı arka plan bulunduğu için bunu doğrudan şeffaf spritesheet olarak kullanma. `osmanli_minyatur_harita.png` harita perspektifinin stil/konum referansıdır; uygulamanın gerçek haritasını değiştirme.

## Dosyaları ve mevcut projeyi önce incele
- Haritanın sahne render kodunu, yerleşim/transforms ve ölçekleme mantığını, yol çizimlerini, koordinat sistemini, kamera zoom/pan ve animasyon döngüsünü bul.
- `src/sahne/` ve varsa `binaResimleri.ts` ile harita bileşenlerini incele; mevcut mimariye uyumlu uygula, yeni framework getirme.
- Gördüğün yol alanlarından bir `walkable` graph/waypoint ağı çıkar. Görselde yol var diye raster resmin üzerinde rastgele koordinatlarda NPC yürütme. El ile tanımlanan düğüm ve kenarlar da kabul edilebilir; devreye almadan önce koordinatları gerçek oyun haritasına göre doğrula.

## NPC listesi ve davranışlar
Başlangıçta 10–16 NPC: köylü kadın (su testisi), pazarcı (sepet), fırıncı, hamal (çuval), âlim (kitap), aşçı (kepçe), esnaf (kumaş), çocuk, gezgin (asa), yaşlı, çiftçi (buğday), tüccar. Seyrek olarak yüklü eşek ve deve kervanı eklenebilir; daha büyük oldukları için yavaş yürüsünler. Karakterler döneme uygun Selçuklu/erken Osmanlı kıyafetleriyle, minyatür dilinde, küçük okunaklı silüetlerle görünsün.

## Hareket sistemi
1. NPC'ler yalnızca **yol/çarşı/köprü/meydan için tanımlı yürünebilir ağ** üzerinde hareket etsin. Nehirden, binaların üstünden, tarlaların içinden geçmesinler. Köprü sadece gerçek ağ bağlantısıysa geçilebilir.
2. Her NPC için `id`, `type`, `path`, `pathProgress`, `speed`, `state`, `facing`, `depth` alanları olsun. Mevcut teknolojiye göre data modeli şekillendir.
3. Yol kavşaklarında ağırlıklı rastgele rota seç; varış noktalarına (çeşme, cami önü, pazar, aşevi, mahalle, han) kısa süre duraklama ekle. Her NPC sürekli hareket etmek zorunda değil.
4. Düzenli zaman adımı/delta time ile konum güncelle; sekme, teleport, çarpışan küme görüntüsünden kaçınmak için küçük spawn aralıkları ve basit separation/traffic logic kullan.
5. 2D/isometric çizimde ayak noktası (`feet anchor`) yol üstündeki gerçek koordinat olsun. Y sırasına göre depth sorting yap: arkada olan NPC yapı/nesnenin arkasında, önde olan önde çizilsin. Harita zaten katmanlı ise mevcut occlusion yaklaşımını kullan.
6. Boyutlar haritada çok küçük ve tutarlı olmalı; binanın yanındaki bir insan bina yüksekliğinin kabaca 1/5–1/8'i kadar görünebilir ama kesin ölçüyü gerçek sahnede test et. Ekran zoom'una doğal uyum sağlasın.
7. Animasyon: önce güvenilir yürüyüş hissi (2–4 frame veya hafif bacak/kol hareketi), idle animasyonu, 4 yön/facing. Sprite görselleri henüz hazır değilse dönemsel renklere uygun *geçici* küçük silüetlerle çalıştır; referans görseli arka planıyla kesip kullanma.
8. Performans: varsayılan 12 NPC, düşük performanslı cihazlarda azaltılabilir, requestAnimationFrame / mevcut oyun tick'i, ekran dışındakileri gerektiğinde çizme, temiz event/timer yönetimi.
9. Başlangıç/bitiş: NPC'ler görünür ev/sokak/han/pazar girişlerinde belirsin veya kaybolsun; bina içinden fırlayıp duvarlardan geçmesin.
10. Oyun mantığıyla uyum: aşevi kapalıysa önünde kuyruk durmasın, çeşme kuruysa su alma davranışı olmasın. Bu olay durumları oyunda henüz okunamıyorsa entegre edilebilir hook bırak.

## Teslim kriterleri
- Kasabada yollarda gezinen, köprüden geçen, kavşakta dönen, bazen duran köylüler.
- Nehre ya da bina içinden geçen NPC yok.
- 10–16 NPC ile 60 FPS hedefi (cihaza göre makul).
- Mevcut harita/oyun fonksiyonelliği ve bina etkileşimleri bozulmamış.
- Eklenen dosyaların kısa özeti; yolu/waypoint koordinatlarını, NPC adetlerini ve ölçekleri nereden değiştireceğimizi belirt.
- Sprite asset hazır olmadığında bunun geçici olduğunu net bildir.

## Stil / yeni sprite üretim brifi (gerekirse görsel üreticisine ver)
"A production-ready **transparent PNG** sprite atlas for a mobile game inspired by 16th-century Ottoman topographical miniature paintings; flat luminous gouache, fine dark outlines, muted cream, terracotta, lapis blue, turquoise, sage and gold. Small full-body Anatolian villagers and craftspeople viewed in high oblique / three-quarter perspective matching an isometric city map; simple readable shapes, 4 cardinal/isometric walk directions and 4 walking poses each, one person per frame; identical character proportions and foot anchor across frames; equal-sized cells, clear gutters; no ground, no background, no labels, no cast shadows extending outside cells. Output sprite atlas with explicit pixel grid, not a composed illustration. Characters include water carrier, baker, merchant, porter, scholar, cook, child, farmer, traveler and elder."

## Not
Bu isteğin amacı **karakterlerin oyun içinde gerçekten yürüyebilmesi**. Sadece statik şehir görseline insan eklemek görevi tamamlamaz. İşe mevcut kod tabanını ve yürünebilir koordinatları inceleyerek başla.
