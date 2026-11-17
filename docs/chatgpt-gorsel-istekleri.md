# Vakfiye · ChatGPT görsel istekleri (yeni görsel dil)

Önceki görseller tek tek üretildiği için birbirine ve haritaya uymadı. Bu sefer **önce tek bir stil belirliyoruz, sonra her şeyi o stile göre** üretiyoruz.

## Nasıl çalışılır

1. ChatGPT'de **yeni bir sohbet** aç. Bütün görselleri **aynı sohbette, sırayla** iste.
2. **Adım 1**'de iki stilden birini seç (A ya da B). Beğendiğin görseli kaydet: bu senin **stil görselin**.
3. Sonraki her istekte stil görselini **ekle** ve isteği yapıştır. İsteklerdeki "the attached style image" ifadesi bu görseli kastediyor.
4. Beğenmediğin görseli "same thing, but …" diye düzelttir; baştan isteme, stil kayar.
5. Bitenleri adlarıyla bana gönder (bir zip de olur). Haritaya ben yerleştiririm.

Her görsel isteğinin sonuna şu satırı eklemen işe yarar:
```
Keep exactly the same art style, colors, lighting and camera angle as the attached style image.
```

---

## Adım 1 · Stil görseli (birini seç)

### A) Sıcak, boyalı mobil oyun stili
Hay Day / Township sıcaklığında, yuvarlak hatlı, oyuncak gibi.

```
Key art for a cozy mobile city-building game about an Ottoman charitable foundation (vakıf) in 15th-century Anatolia.
A small, lively town seen from a high three-quarter isometric angle: in the center a mosque complex with a soup kitchen (imaret) and a domed bathhouse; to the right a caravanserai and a covered market street with striped awnings; below a neighborhood of tiled-roof houses, a fountain and a small school; on the left a river with a stone bridge, a watermill and golden wheat fields; a caravan road with camels leaving toward hills in the top right.
Style: hand-painted, soft and warm, rounded chunky shapes, honey-colored cut stone, terracotta roofs, blue-grey lead domes, turquoise tile accents, lush greens, gentle afternoon light, soft shadows, no harsh outlines. Friendly and readable like a top-tier mobile game, but historically grounded (Seljuk and early Ottoman architecture, no Arabian-Nights clichés).
Small people going about their day: merchants, children, a cook at the soup kitchen door.
Landscape 1536x1024. No text, no UI, no logos.
```

### B) Osmanlı minyatürü stili (önerim: en özgün seçenek)
Matrakçı Nasuh'un 16. yüzyıl şehir haritalarından esinli: düz renkler, ince altın çizgiler, yukarıdan bakan harita. Jüride Vakıf Katılım ve Vakıflar Genel Müdürlüğü olacağı için tarihî bir dili olan bu stil öne çıkar.

```
Key art for a mobile strategy game about an Ottoman charitable foundation (vakıf), painted in the style of 16th-century Ottoman topographical miniatures (inspired by Matrakçı Nasuh's city maps), adapted for a modern game.
A bird's-eye map of a small Anatolian town: in the center a mosque complex with a domed soup kitchen and a domed bathhouse; to the right a caravanserai with an inner courtyard and a covered market street; below a neighborhood of houses with red-tiled roofs, a fountain and a small school; on the left a blue river with a stone bridge, a watermill and patterned fields; a road leaving to the top right through stylized hills and cypress trees.
Style: flat, luminous gouache colors on warm paper, delicate dark outlines, gold details, stylized trees and hills, buildings shown in a gentle oblique elevation so their domes and portals are readable, decorative but clean and easy to read on a phone screen. Muted cream, terracotta, lapis blue, turquoise, sage green and gold palette.
Landscape 1536x1024. No text, no calligraphy, no UI, no logos.
```

---

## Adım 2 · Boş harita (zemin)

Binaların üstüne oturacağı zemin. **Üzerinde hiç bina olmasın**; binaları ayrı görseller olarak koyacağız ki yıkılıp onarılabilsinler.

`harita.png`
```
Using the attached style image, paint the empty ground map of the same town, with NO buildings at all.
Bird's-eye/three-quarter view, landscape 1536x1024.
Layout (keep these areas as clear, flat, empty open ground so buildings can be placed on them later):
- Center: a large paved square with a few cypress trees around it (the mosque complex will stand here).
- Right of center: a long market street and an open bazaar square (shops and a covered market will stand here).
- Bottom center: a neighborhood with a few empty garden plots and narrow lanes (houses, a school, a fountain).
- Left: a river running from top to bottom; on its far (left) bank golden and green farm fields, with an empty spot by the riverbank (a watermill) and a crossing point (a bridge).
- Top right: a road winding toward hills, with an empty clearing beside it (a caravanserai).
Roads connect all areas to the center. Soft, calm colors so the buildings placed on top will stand out.
No buildings, no people, no text, no UI.
```

---

## Adım 3 · Binalar

Her bina için ortak kural (her isteğe zaten yazılı):
- **1024x1024, şeffaf arka plan**, tek bina, hafif zemin gölgesi; zemin karesi, çimen, gökyüzü yok.
- Haritayla **aynı açı ve stil**.
- Görseldeki büyüklük, binanın gerçek büyüklüğünü yansıtsın: büyük binalar görselin genişliğinin %90'ını, küçükler %55–70'ini kaplasın (her istekte yazıyor).

Bir görseli şeffaf vermezse: `Make the background fully transparent, keep only the building and its soft shadow.`

### Vakfın ilk binaları

`asevi.png` · ilham: Orhan Bey Külliyesi, Bursa
```
Using the attached style image: a single early Ottoman soup kitchen (imaret), same art style and camera angle. Walls of alternating cut stone and red brick courses (Bursa style), a large lead dome, a small portico of three pointed arches, two tall brick kitchen chimneys with white cooking smoke, a big copper cauldron at the door, a short queue of townspeople with bowls.
Square 1024x1024, transparent background, only the building and its soft shadow; the building fills about 85% of the width. No ground tile, no text.
```

`medrese.png` · ilham: İnce Minareli Medrese, Konya
```
Using the attached style image: a single Seljuk madrasa, same art style and camera angle. Cut-stone walls, a large lead dome, a tall richly carved stone portal with interlaced bands and two round medallions, and right next to it a slender brick minaret with turquoise tile bands whose top is broken off short.
Square 1024x1024, transparent background, only the building and its soft shadow; the building fills about 80% of the width. No ground tile, no text.
```

`cami.png` · ilham: Sultan Alâeddin Camii, Konya
```
Using the attached style image: a single Seljuk mosque, same art style and camera angle. A long low prayer hall with cut-stone walls and a flat lead roof with one small dome; in front of it an octagonal stone tomb tower (kümbet) with a pointed conical roof; a cylindrical brick minaret with a stone balcony and a conical cap.
Square 1024x1024, transparent background, only the building and its soft shadow; the building fills about 85% of the width. No ground tile, no text.
```

`cesme.png` · ilham: Hoca Fakih Çeşmesi, Konya
```
Using the attached style image: a single Seljuk public fountain, same art style and camera angle. A freestanding wall of light and dark stone blocks arranged symmetrically, a pointed-arch niche with a brass spout pouring water into a long stone trough, a small tiled cap on top, a woman filling a jug and a child drinking.
Square 1024x1024, transparent background, only the fountain and its soft shadow; it fills about 55% of the width. No ground tile, no text.
```

`hamam.png` · ilham: Sahip Ata (Sultan) Hamamı, Konya
```
Using the attached style image: a single Seljuk bathhouse (hamam), same art style and camera angle. Low solid cut-stone walls, one large dome and two small domes, every dome dotted with small round glass skylights, a short brick furnace chimney with a wisp of steam, a small carved entrance portal.
Square 1024x1024, transparent background, only the building and its soft shadow; the building fills about 80% of the width. No ground tile, no text.
```

`han.png` · ilham: Zazadin (Sadeddin Köpek) Hanı, Konya
```
Using the attached style image: a single Seljuk caravanserai (han), same art style and camera angle. A fortress-like square building with thick stone walls and round buttress towers, an open inner courtyard with arcades visible from above, a monumental two-color stone portal with a pointed arch, two loaded camels at the gate.
Square 1024x1024, transparent background, only the building and its soft shadow; the building fills about 92% of the width. No ground tile, no text.
```

`sandik.png` (vakfın hazinesi)
```
Using the attached style image: a small stately foundation treasury building, same art style and camera angle. Cream stone walls, a single lead dome, arched windows, and in front of the door a large iron-bound wooden chest overflowing with gold coins, a scribe with a ledger sitting beside it.
Square 1024x1024, transparent background, only the building and its soft shadow; it fills about 65% of the width. No ground tile, no text.
```

`arazi.png` (tarla ambarı)
```
Using the attached style image: a small farm granary, same art style and camera angle. Stone walls, terracotta tile roof, a wooden door, stacked golden wheat sheaves and a wooden cart beside it.
Square 1024x1024, transparent background, only the building and its soft shadow; it fills about 55% of the width. No ground tile, no text.
```

### Şehir büyüdükçe açılan yapılar

`arasta.png` · ilham: Şükran Mescidi zemin kat dükkânları, Konya
```
Using the attached style image: a single row of market shops (arasta), same art style and camera angle. Four small shop fronts under one long terracotta roof, wooden shutters opened up, striped turquoise and cream awnings, a baker, a spice seller and a coppersmith with their goods in front.
Square 1024x1024, transparent background, only the building and its soft shadow; it fills about 85% of the width. No ground tile, no text.
```

`bedesten.png` · ilham: Cağalzade Bedesteni, Ereğli
```
Using the attached style image: a single covered market hall (bedesten), same art style and camera angle. A solid rectangular cut-stone building with a long barrel vault covered in lead, three arched doors with iron-bound gates, bolts of silk and a carpet displayed at the main door.
Square 1024x1024, transparent background, only the building and its soft shadow; it fills about 80% of the width. No ground tile, no text.
```

`evler.png` · ilham: Samandağ Vakıflı Köyü vakıf evi, Hatay
```
Using the attached style image: two small two-story Anatolian houses in a little walled garden, same art style and camera angle. Rough stone ground floor, timber-framed upper floor, terracotta roofs, wooden shutters, a fig tree and a well.
Square 1024x1024, transparent background, only the houses and their soft shadow; they fill about 70% of the width. No ground tile, no text.
```

`mektep.png` · ilham: Dolap Mektep Mescidi, Konya
```
Using the attached style image: a small neighborhood primary school (sıbyan mektebi), same art style and camera angle. A single-room whitewashed stone building with a hipped tile roof, two arched windows, a small wooden porch, a teacher and a few children with writing boards at the door.
Square 1024x1024, transparent background, only the building and its soft shadow; it fills about 55% of the width. No ground tile, no text.
```

`sarnic.png` · ilham: Hocacihan Sarnıcı, Konya
```
Using the attached style image: a large underground water cistern seen from outside, same art style and camera angle. A low half-sunken cut-stone structure with a broad shallow dome, an arched opening with steps going down, a water trough beside it, a donkey carrying water jars.
Square 1024x1024, transparent background, only the structure and its soft shadow; it fills about 60% of the width. No ground tile, no text.
```

`degirmen.png` · ilham: Reyhanlı Yenişehir Değirmeni, Hatay
```
Using the attached style image: a stone watermill, same art style and camera angle. A long low stone building with a vaulted roof, a large wooden water wheel on its side in a small water channel, sacks of flour stacked by the door.
Square 1024x1024, transparent background, only the mill, its water channel and soft shadow; it fills about 70% of the width. No ground tile, no text.
```

`kopru.png`
```
Using the attached style image: a short Ottoman stone bridge with three pointed arches and a gently humped deck, same art style and camera angle, crossing from lower left to upper right, with a little river water under the arches.
Square 1024x1024, transparent background, only the bridge, the water beneath it and its soft shadow; it fills about 85% of the width. No text.
```

`kervansaray.png` · ilham: Kanuni Sultan Süleyman Kervansarayı, Belen
```
Using the attached style image: a large Ottoman roadside caravanserai, same art style and camera angle. A square stone building with an open courtyard surrounded by arcades, a row of small lead domes along the roof, a tall arched main portal, a camel caravan resting at the gate.
Square 1024x1024, transparent background, only the building and its soft shadow; it fills about 92% of the width. No ground tile, no text.
```

---

## Adım 4 · Olay sonrası hâller (temel görseller bitince)

Her birinde ilgili temel görseli de ekle ve şu kalıbı kullan:
```
Using the attached image, show the SAME building from the SAME angle, same size and style, but [AŞAĞIDAKİ DEĞİŞİKLİK]. Transparent background, no text.
```

| Dosya | Değişiklik (köşeli parantezin yerine yaz) |
|---|---|
| `hamam-hasarli.png` | after an earthquake: the big dome has a jagged hole, cracks run down the walls, fallen stones at its foot, a little dust in the air |
| `han-hasarli.png` | after a fire: blackened scorch marks around the portal and courtyard, a collapsed section of roof, thin grey smoke |
| `arazi-kurak.png` | during a drought: only a few pale brown sheaves, an empty cart, cracked dry earth around it |
| `sandik-bos.png` | when the money has run out: the chest stands open and empty, the door is shut, the scribe is gone |
| `asevi-kapali.png` | when it has run out of money: no smoke, the door barred with a plank, the cauldron turned upside down, no queue |
| `medrese-kapali.png` | when it has run out of money: the portal door chained shut, shutters closed, weeds at the base of the walls |
| `cami-kapali.png` | when the foundation has no money: lamps unlit, door closed, some roof lead missing, weeds by the walls |
| `cesme-kuru.png` | when it has run dry: no water from the spout, the trough empty with dry leaves, no people |

---

## Adım 5 (isteğe bağlı) · Haritaya hayat katanlar

`insanlar.png`
```
Using the attached style image: a sprite sheet of 8 small townspeople on a transparent background, same art style, each about 120 px tall, evenly spaced in a 4x2 grid: a baker carrying bread, a merchant with a bolt of cloth, a child running, a woman with a water jug, a scholar with books, a cook with a ladle, a porter with a sack, a traveler with a staff. No text.
```

`kervan.png`
```
Using the attached style image: a small camel caravan of three loaded camels and a guide walking from left to right, same art style, transparent background, fills about 80% of the width. No text.
```

---

## Teslim

- Dosya adları yukarıdaki gibi, küçük harf, PNG.
- Önce **stil görseli + harita + Adım 3**'ü gönder: oyunu bunlarla yeniden düzenlerim. Olay hâlleri sonra gelebilir.
- Harita geldiğinde bina yerlerini haritadaki boş alanlara göre ben ayarlarım; görselleri yeniden üretmene gerek kalmaz.
