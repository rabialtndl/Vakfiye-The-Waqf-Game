"""Kaynaklı bilgi soruları: Tekinoglu-Firin/web envanter verisinden soru bankası üretir.

Kullanım:  python3 araclar/soru_bankasi.py <web-reposu>/veri  >  src/veri/sorular.json

Her soru envanterdeki "kaynakli" bir bilgidir (kitap + sayfa). Soru: "Bu bilgi hangi esere ait?"
Seçenekler aynı türden üç eser. Eserin adını ele veren bilgiler alınmaz.
"""
import json
import random
import re
import sys
from pathlib import Path

veri = Path(sys.argv[1])
kaynaklar = {k["id"]: k["baslik"] for k in json.loads((veri / "kaynaklar.json").read_text())}

eserler = []
for dosya in sorted((veri / "iller").glob("*.json")):
    d = json.loads(dosya.read_text())
    for e in d["eserler"] if isinstance(d, dict) else d:
        if e.get("taslak") or not e.get("gorseller"):
            continue
        e["il"] = dosya.stem
        eserler.append(e)

GENEL = {"camii", "cami", "hamamı", "hamam", "hanı", "han", "medresesi", "medrese", "külliyesi", "külliye", "türbesi", "türbe",
         "mescidi", "mescit", "çeşmesi", "çeşme", "kümbeti", "kervansarayı", "bedesteni", "ve", "zaviyesi", "konut", "haziresi"}


def ad(e):
    return e["ad"]["tr"] if isinstance(e["ad"], dict) else e["ad"]


def ele_verir(metin, e):
    kelimeler = [k for k in re.findall(r"[\wçğıöşüâîû]+", ad(e).lower()) if len(k) >= 4 and k not in GENEL]
    m = metin.lower()
    return any(k in m for k in kelimeler)


# Oyundaki binaların ilham kaynakları ve rotalardaki eserler önce gelsin.
ONCELIK = {
    "sahip-ata-sultan-hamami-konya", "zazadin-sadeddin-kopek-hani-konya", "orhan-gazi-kulliyesi",
    "ince-minareli-medrese-sahip-ata-darulhadis-konya", "sultan-alaeddin-ulu-camii-konya", "hoca-fakih-cesmesi-konya",
    "cagalzade-bedesteni-konya", "reyhanli-yenisehir-degirmeni-hatay", "hocacihan-sarnici-konya",
    "kanuni-sultan-suleyman-kervansarayi-hatay", "dolap-mektep-mescidi-konya", "emir-nurettin-sephevan-kumbeti-konya",
    "karatay-medresesi-konya", "sircali-medrese-konya", "habib-i-neccar-camii-ve-kulliyesi-hatay", "kursunlu-han-hatay",
    "sokullu-mehmet-pasa-kulliyesi-hatay", "mevlana-turbesi-muze-konya",
}

rnd = random.Random(1339)
sorular = []
for e in sorted(eserler, key=lambda e: (e["id"] not in ONCELIK, e["id"])):
    adaylar = []
    for o in e.get("olgular", []):
        metin = o["metin"]["tr"] if isinstance(o["metin"], dict) else o["metin"]
        if o.get("durum") != "kaynakli" or o.get("kategori") not in ("tarihce", "vakif", "mimari"):
            continue
        if not (60 <= len(metin) <= 190) or ele_verir(metin, e) or not o.get("kaynak_id") in kaynaklar:
            continue
        if "bulunmamaktadır" in metin or "bilinmemektedir" in metin or metin.endswith("..."):
            continue
        # somut bilgiler önce: tarih, vakıf, yaptıran, ilk/en
        puan = 2 * bool(re.search(r"\d", metin)) + 2 * (o["kategori"] == "vakif") + ("yaptır" in metin) + (" en " in metin or " ilk " in metin)
        adaylar.append((puan, o, metin))
    if not adaylar:
        continue
    adaylar.sort(key=lambda x: -x[0])
    _, o, metin = adaylar[0]
    ayni = [x for x in eserler if x["tur"] == e["tur"] and x["id"] != e["id"]]
    if len(ayni) < 2:
        continue
    secenekler = [e] + rnd.sample(ayni, 2)
    rnd.shuffle(secenekler)
    sorular.append({
        "id": e["id"],
        "bilgi": metin,
        "dogru": e["id"],
        "secenekler": [{"id": x["id"], "ad": ad(x), "il": x["il"]} for x in secenekler],
        "kaynak": kaynaklar[o["kaynak_id"]],
        "sayfa": o.get("sayfa"),
    })
    if len(sorular) >= 90:
        break

json.dump(sorular, sys.stdout, ensure_ascii=False, indent=0)
