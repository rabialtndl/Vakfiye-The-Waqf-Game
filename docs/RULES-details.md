# Rules: full details (for the team)

## Your goal

Found a foundation (waqf) and keep it standing for **600 years**. Your foundation has a service: a soup kitchen, a madrasa, a mosque or a fountain. Never let that service stop.

## 1. Found your foundation

- You have **100 gold**. Split it four ways: **bathhouse**, **inn**, **farmland** and **cash**.
- The **bathhouse** earns a lot but collapses in earthquakes.
- The **inn** earns well but is hit by fire and war.
- **Farmland** earns little but never collapses.
- **Cash** earns nothing but pays for repairs on hard days.
- Set aside part of your income for the **reserve fund**. The reserve fund is the piggy bank for bad days.
- Choose a **trustee** (mütevelli, the manager). The honest one is safe. The skilled one earns a little more but sometimes steals from the piggy bank.

## 2. Move time forward

- **▶ PLAY** lets the years run by themselves. It stops when a hard moment comes and carries on once you decide. **+10 years** plays just one round.
- Every round the money follows the same path: **the properties earn → a share goes to the piggy bank → the buildings’ upkeep is paid → what is left goes to the service.**
- The strip at the bottom of the screen shows you this path every round.

## 3. Decide in hard times

When an **earthquake** or a **fire** strikes, the game stops and asks you:

| Choice | What happens |
| --- | --- |
| **Repair with the fund** | Everything goes back to how it was. The piggy bank shrinks. |
| **Repair with cash** | As much is repaired as your cash covers; the rest is lost. |
| **Cut back the service** | You spend no money. The buildings slowly come back, but part is lost. For a while the service runs at half. |

Other events just happen, with no decision:

| Event | What happens |
| --- | --- |
| **Drought** | The fields yield nothing that round. |
| **War** | The caravan road closes; the inn earns nothing that round. |
| **Inflation** | Cash and the fund melt away; the cost of the service rises for good. |
| **Epidemic** | No caravans come and the inn’s income falls; the need for charity grows and that round’s cost is 50% higher. |
| **Bountiful year** | The fields yield twice as much. |
| **Caravan season** | The inn earns 50% more. |
| **Benefactor’s gift** | A donation goes into the reserve fund. |

**Each event once** (always on): an event happens at most once in a game, historical ones included. An event the level will live through in history does not come early by dice; if there are several historical events of the same kind, one becomes an event in the game and the others appear only as “From history” notes (e.g. in Antakya the 1853 earthquake is an event, 1822 and 1872 are notes). **30 years apart** (Settings): at least 30 calm years pass between two dice-rolled events.

## 3a. The disaster moment: know the answer, put out the disaster

When a fire, an earthquake or an epidemic strikes, the camera moves in on the scene, a strip appears at the bottom and asks **a short two-choice question with a source** (e.g. “In which year was the Fire Pump Corps founded? 1720 / 1453”).

- **Right:** the disaster is put out at once. The damage and the repair cost are halved; in an epidemic the extra cost goes back to the reserve fund.
- **Wrong:** the right answer, a short explanation and its source are shown; **you lose a life** and the disaster hits in full.
- **Every level has questions; a question is never repeated.** Questions never asked before come first (remembered across games); the same question never comes up twice in one game. There are currently 34 questions with sources. If all the questions for a kind of disaster have been asked in that game, the disaster hits without a question and no life is lost.
- **Questions in droughts and wars too:** answer right and the imaret or the neighbourhood’s avârız foundation helps: 6 akçe to the reserve fund.
- **Lives:** each game starts with 3 ❤️ (4 at Journeyman rank). One life comes back every century. With no lives left, no question is asked and the disaster hits in full.
- Then the usual decision follows (repair with the fund / repair with cash / cut back the service).

The questions are in `src/veri/afetSorulari.ts` (TDV İslâm Ansiklopedisi, Wikipedia). If “Disaster question” is turned off in Settings, the decision window opens straight away when a disaster strikes.

**Rank (the Ahi order).** Right answers add up across games and unlock lasting privileges:

| Rank | Right answers | Privilege |
| --- | --- | --- |
| 🔰 Apprentice | 0 | Answer right and the disaster is put out |
| 🪣 Journeyman | 3 | You start each game with one extra life (4 ❤️) |
| 🛠️ Master | 6 | On a right answer, benefactors give the foundation +3 akçe |
| 🏅 Ahi | 10 | Your first wrong answer costs no life: one more question |

**Building events live on the map:**

- **Fire:** soot stains and glowing embers on the building, flickering flames on the roof, smoke and sparks. When the question is answered the flames go out and a blackened mark remains.
- **Earthquake:** the building slides as if broken, with cracks, a cloud of dust and heaps of rubble.
- **Epidemic:** the inn turns a pale grey-green; in a drought the fields are scorched.
- Damage that is not repaired stays on the map; repairing fixes it. Hand-drawn state images can be added to the `public/durumlar/` folder (see `docs/durum-gorselleri.md`).

**The people of the city:** 12 villagers in the town (a water carrier, a market seller, a porter, a scholar, a cook, a child, a villager with a loaded donkey...) walk the road network in real time: they turn at junctions, cross the bridge and stop at the fountain, the soup kitchen, in front of the mosque, the market and the inn; they never walk through buildings or the river. Nobody stops in front of a closed soup kitchen, nobody draws water from a dry fountain, and the square empties during an epidemic. Details: `docs/npc.md`.

## 3a. Challenge (Share)

**CHALLENGE** on the results screen prepares a share card (map, stars, years, lesson, rank) and a link. There are Share (your phone’s share menu), Copy link and Download card buttons; you can add your name if you like.

The friend who opens the link sees an invitation on their main menu: “X challenges you!”. **When they accept, they play the same level with the same disasters, even if the level is locked.** At the end the two results are shown side by side (stars first, then years if tied): you won / a draw / you lost. The winner can challenge back. The link carries only the level, stars, years and an optional name; no server is needed (`src/meydan.ts`).

## 3a. No windows pop up by themselves

- **From history:** an event that really happened that year does not stop the game; a small “📜 From history · 1413 The Karamanid siege” sign appears at the top left, you tap to read it, and it goes away after 40 years.
- **The people of the city (info spots):** people standing in place on the map with their names above them: Guild (head of the bazaar), Shopkeeper (the Şükran Masjid shops), Ahi (tanner’s shop), Cloth merchant (bedesten), Caravaneer (inn gate; caravanserai), Avârız foundation (neighbourhood square), Trustee (foundation chest; what a vakfiye is). A golden ring glows under their feet. Tap for information with a source; most give +3 akçe the first time you read them; the ones you have read get a ✓.
- **Colours button:** bright = your foundation’s buildings; faded = other foundations’ buildings or plots you have not built on; colourless and dry = areas not yet open; if your own building fades, the chest was empty.
- **Kümbet:** you tap the building itself (“What is a kümbet?”, real tomb examples); when the plot is open, “What is a kümbet?” also opens in the building panel.
- **The game stops after a decision:** the PLAY button becomes “▶ CONTINUE · build first if you like”; the years run when you press it. The years pass more slowly (a round ≈ 1 s; change it with ▶/▶▶/▶▶▶ in the corner).
- **Corner buttons:** 🔊 sound (short sounds made with Web Audio: disaster, right, wrong, money, building), ▶▶ speed, ⚙️ settings.
- **+10 years** plays a single round; the benefactor who asks the inventory question appears next to the chest every 50 years.
- **No events while you build:** tapping a building or a plot stops time; in a disaster, panels close and no new panel opens, so there is only one thing on screen.
- **Quiz question (inventory):** it does not open by itself; a benefactor (📜) appears at the head of the chest and asks if you tap. A question you have been asked never comes back.

## 3a. From history and from the bazaar

- Each level starts in a real year (for example Bursa 1340). The counter at the top shows the calendar year.
- When the year of an event that **really happened** in that city comes, a “From history” card appears: what happened, what it counts as in the game, and its source. For example the Karamanid siege of 1413 (Bursa), the Central Anatolian famine of 1873–75 (Konya), the destruction of the Habib-i Neccar Mosque in 1853 (Antakya).
- Places the foundation has not reached yet (locked) look almost colourless on the map, with dry, cracked ground. Zoomed out, the town is surrounded by steppe.
- You can tap places on the map that do not belong to the foundation: the bridge (real bridges, with sources), the water mill (the Reyhanlı Yenişehir Mill in the inventory), another foundation’s fountain, mosque, madrasa or soup kitchen (real examples in the inventory).

## 3b. Grow your foundation: from village to city

- After the service is paid for, **the money left over goes into building money**. This money is spent only on building new buildings.
- The foundation starts as a village. As time passes, its surroundings open up: the **Bazaar** (year 50), the **Neighbourhood** (year 150), the **Villages** (year 250), the **Caravan road** (year 350).
- The map is a city in the style of a miniature. **Your foundation’s buildings are in colour**; those not yet built or belonging to other foundations look faded. The city gains colour as your foundation grows.
- **“See the city”** shows the whole map. Tap a faded building with a yellow **+** sign and build it.

| Building | What it does | Watch out |
| --- | --- | --- |
| **Arasta** | Shops rented to tradesmen, rent every round | No rent that round in a fire |
| **Bedesten** | High rent, fire-resistant | No rent that round in a war |
| **Foundation houses** | Small but steady rent | No rent that round in an earthquake |
| **Primary school** | Foundation house rent +50% | Has upkeep |
| **Kümbet** | The tomb of the foundation’s founder; visitors leave a gift every round | Not affected by events |
| **Bridge** | Farmland income +20%, a mill can be built | Has upkeep |
| **Mill** | Grinds the villages’ wheat | Stops in a drought |
| **Caravan road** | Inn income +25%, arasta rent rises | No effect in a war |

**Explore the real world:** as you collect stamps in your Vakfiye passport, areas open without waiting (1 stamp the bazaar, 2 the neighbourhood, 3 the villages, 4 the caravan road). Each stamp gives your new foundation 5 akçe, up to 30. The “Explore” button shows when each area will open.

## Levels

Each level takes place in the city of a real foundation in the inventory. The rules are the same; what changes is the service, the goal and how often events happen.

| Level | City · service | Goal | Main challenge |
|---|---|---|---|
| 1 · The first soup kitchen | Bursa · soup kitchen | 200 years | Learning level |
| 2 · Dry years | Konya · fountain | 300 years, 1 new building | Frequent drought |
| 3 · A madrasa on the road | Hatay · madrasa | 400 years, 2 new buildings | Fire and war |
| 4 · City of earthquakes | Hatay · mosque | 500 years, 3 new buildings | Earthquakes very frequent and early |

- When you pass a level, the card of the monument it is based on goes into your **album** and the next level opens.
- If you have the **passport stamp** of a monument from that city, that city’s levels open without waiting.
- If you reach the target year standing but miss the building goal, the level is not passed (at most 1 star).
- **Free play** is always open: you choose the service, and the goal is 600 years.

## 4. Losing

If the service cannot be paid for **3 rounds in a row**, the foundation collapses.

**Easy mode** (chosen in Settings): properties earn 10% more, a collapse takes 4 rounds and hints appear at decisions. Recommended for your first games.

## 5. Winning and stars

| Stars | When |
| --- | --- |
| ⭐ | You reached year 300 |
| ⭐⭐ | You reached year 600 |
| ⭐⭐⭐ | You reached year 600 and the chest was never empty |

The stars you collect raise your level.

## Four golden rules

1. Do not put all your money in one place; spread it.
2. Always set aside a share for the piggy bank.
3. Choose your trustee for their honesty.
4. Keep the service as big as your income can carry.

## Words to know

| Word | Meaning |
| --- | --- |
| Vakıf (waqf) | Property set aside so that a good work goes on forever, and the institution that runs it |
| Vakfiye | The founding deed of a foundation; the setup screen is your vakfiye |
| Akar | Properties that earn income for the foundation: bathhouse, inn, farmland, arasta, bedesten, foundation houses, mill |
| Hayrat | A building that serves the public for free: soup kitchen, madrasa, mosque, fountain |
| Şart | A rule set by the founder; here, the share set aside for the piggy bank |
| Mütevelli | The trustee who runs the foundation |
| Zimmet | Embezzlement: the manager taking the foundation’s money for themselves |
| Seed | The number that sets the order of events; the same seed gives the same story |

## Where do the buildings come from?

Every building in the game was drawn after a real monument in the Vakıf Katılım inventory. Tap a building to see that monument on the “Inspired by” card:

| Building in the game | Inspired by |
|---|---|
| Bathhouse | Sahip Ata (Sultan) Hamam, Konya |
| Inn | Zazadin (Sadeddin Köpek) Han, Konya |
| Soup kitchen | Orhan Bey Külliye, Bursa |
| Madrasa | İnce Minareli Madrasa, Konya |
| Mosque | Sultan Alâeddin Mosque, Konya |
| Fountain | Hoca Fakih Fountain, Konya |
| Arasta | Şükran Masjid ground-floor shops, Konya |
| Bedesten | Cağalzade Bedesten, Ereğli (Konya) |
| Foundation houses | Foundation house in Vakıflı village, Samandağ, Hatay |
| Mill | Reyhanlı Yenişehir Mill, Hatay |
| Kümbet | Emir Nurettin (Sephevan) Kümbet, Konya |
| Caravan road | Suleiman the Magnificent Caravanserai, Belen (Hatay) |
| Primary school | Dolap Mektep Masjid, Konya |
