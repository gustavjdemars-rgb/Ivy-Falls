# Ivy Falls: outline and pitch (Phase 1)

Status: **awaiting author review.** No page code has been written. Nothing below changes `content/story.md`; every proposed text change is in the copy-edit list (§7) for approval.

---

## 0. Phase 0 findings

**Files present**

| Path | Notes |
|---|---|
| `CLAUDE.md` | Project brief |
| `content/story.md` | ~600 words, 14 paragraphs. Two `<!-- gap -->` comments mark where media sat in the original paste (after "Happy Hollow Falls" and after the 1917 sentence). |
| `.nojekyll` | For GitHub Pages |

**`assets/` does not exist.** No photos, video, clippings, map data, or fonts are in the repo yet, so every slot below is marked *need* (the author should have it from the 2023 reporting) or *make* (I build it from open data). Asset status is "have" for nothing.

**Live site:** https://gustavjdemars-rgb.github.io/Ivy-Falls/ (it returns 404 until `index.html` exists).

---

## 1. Editorial spine

The story has five beats. Each one gets **one** visual idea, and the text between them sits still.

| Beat | Feeling | Visual register |
|---|---|---|
| On no map | curiosity | The page opens as a survey sheet with a blank where the falls should be |
| Found by reading a map | small "aha" | Bank-to-bank map, then the contours reveal the ravine |
| Reached on foot | muddy walk | Route inks itself in, then field photos |
| Quiet payoff | wonder | Dark full-bleed video, the only time the page goes dark |
| Old newspapers → hidden again | wistful | Clippings, then the final map writes *Ivy Falls* onto the sheet |

**One structural recommendation:** do not show the falls before the payoff. The hero should be the map with a blank, not a photo of the waterfall. Holding back the image keeps the payoff earned, and it matches the lede ("isn't found on any maps").

---

## 2. Section-by-section table

Slot IDs: **M** = map, **D** = diagram, **P** = photo, **V** = video, **C** = clipping. Status: *need* = author supplies; *make* = I build from open data; *placeholder* = labeled box until supplied.

| # | Section | Opening words | Layout | Slot | Type | What it shows | Status | Interaction |
|---|---|---|---|---|---|---|---|---|
| 0 | Cover | Title + dek | Full-bleed paper "quad sheet" cover; title set in the sheet's collar | **M0** (16:9 desktop, 4:5 mobile crop) | map | Contour sheet of the bluff and river. Water is labeled in blue italic, and the ravine area has **no label**. A small state-outline locator inset sits in the corner, as on real USGS sheets. | make (needs DEM + OSM water) | Static. Neatline ticks appear here and act as the progress indicator for the rest of the page. |
| 1 | Lede | "There's a little-known waterfall…" | Single text column | none | n/a | n/a | n/a | None |
| 2 | Lede 2 | "The 25-foot spring-fed waterfall…" | Single text column | none | n/a | n/a | n/a | None |
| 3 | Procrastination | "If you're like me…" | Single text column + inline wide figure | **P1** (3:2) | photo | 2020 spring water sampling with Feinberg on the south bank, *if such a photo exists* | need / optional | None |
| 4 | Feinberg quote | "So before, there used to be sediment…" | Blockquote, then sidecar begins | none | n/a | n/a | n/a | None |
| 5 | Jointing | "Because of a geological pattern called jointing…" | **Inline stepped figure** (not pinned; see §3) | **D1** (4:3, 1:1 on mobile) | diagram | Gorge cross-section in three states: (a) intact layers spanning the river, (b) river cut partway, one fracture line crossing both banks, (c) river at today's level with a spring/waterfall on each side of the fracture | make (layer names need a source) | Three states advance as the figure scrolls through view. Static triptych under reduced motion. |
| 6 | Bank to bank | "Half-remembering what he told me…" | **Sidecar**: sticky map, 3 text cards | **M2** (sticky; full height desktop, top 50% mobile) | map | River corridor. Two known waterfalls, each with a dashed line to the point opposite, then the camera settles on the blank spot with a red survey mark and "?" | make (author picks the two falls) | Scrollama steps; the map pans between pairs. |
| 7 | The aha | "A quick look at a topographical map showed there was something there." | **Same sticky stage as M2 continues** | **M3** | map / 3D | The blank spot gains contours. The ravine's tightly packed V-shaped contours appear where the plan map showed nothing. Showpiece version: the sheet tilts and lifts into lidar terrain. | make | See §3 showpiece. Fallback: static hillshade + contours with a red annotation. |
| 8 | Getting there | "Reaching Ivy Falls takes about 45 minutes…" | **Sidecar**: sticky route map, 3 text cards (§8, §9, §10) | **M4** (sticky) | map | Lilydale flats, bluff, rail line, creek. A red route inks in from the trailhead toward the falls. | make (route geometry from author; see precision question) | Scrubbed line draw (GSAP). Stops: trailhead → planks → tracks → creek crossings → falls. |
| 9 | First leg | "The first leg of the journey involves…" | Card 2 of M4 | M4 | n/a | Route reaches the planks and the tracks; the floodplain is tinted as flooded | n/a | Continues line draw |
| 10 | Creek | "The next stretch of the hike…" | Card 3 of M4 | M4 | n/a | Route follows the creek, with small cross-ticks at each crossing | n/a | Continues line draw |
| 11 | Field notes | n/a (after sidecar) | 3-photo row, wider than the text column, captions in label type. Stacks on mobile. | **P2, P3, P4** (3:2 each) | photo | P2 planks across reeds; P3 tracks above the flooded flats; P4 fallen-tree crossing over the creek | need | None |
| 12 | The payoff | "The tiered waterfall has two drops…" | **Dark full-bleed section**: video, then the paragraph set on dark | **V1** (16:9 desktop; 9:16 or 4:5 crop on mobile) + **P5** poster | video | Locked-off shot of both tiers, 10–20 s seamless loop | need | Muted autoplay loop when in view, pause when out of view, visible play/pause and sound toggle. Poster only under reduced motion. |
| 13 | Subhead | "Happy Hollow Falls" | Benchmark section marker (§4 of brief) | none | n/a | n/a | n/a | None |
| 14 | 1917 | "The falls, which were once known as Happy Hollow Falls…" | Text + clipping figure, slightly wider than column | **C1** (aspect of scan) | clipping | 1917 St. Paul Pioneer Press clipping, slightly rotated on paper | need | Key sentence underlined in red as it enters view. Full transcription in `<details>`. |
| 15 | 1937 | "Despite the waterfall's lack of widespread exposure…" | Text + clipping | **C2** | clipping | 1937 South St. Paul Reporter clipping | need (rights unclear) | Same as C1 |
| 16 | Ending | "Ivy Falls now sits nestled…" | Full-width map, text below | **M5** (16:9 desktop, 4:5 mobile) | map | The M0 sheet again, pulled back to show the ravine between the river and the cul-de-sacs (OSM roads + building footprints). The label *Ivy Falls* is written in blue italic where the blank was. | make | One scrubbed move: zoom out, then the label writes on. Reduced motion: final state. |
| 17 | Collar | n/a | Map-collar credits block | none | n/a | Scale bar, north arrow, "Reported and photographed by…", data sources and licences, original reporting date, page build date | make | None |
| n/a | Social | n/a | Open Graph image | **OG** (1200×630) | image | M5 end state (sheet with *Ivy Falls* labeled) or a still of the falls | make / need | n/a |

**Optional slot:** **V2** (16:9, 6–10 s loop) of B-roll from the walk (flooded tracks or a creek crossing), as a quieter alternative to P3. Use it only if the footage is good. One video moment is enough.

---

## 3. Interaction pitches

Effort: S ≈ ½ day, M ≈ 1–2 days, L ≈ 3–5 days. Every item keeps native scroll; nothing hijacks it.

### Showpiece: the contour reveal (M3)

| | |
|---|---|
| **What** | The bank-to-bank map lands on the blank. On the next step, contour lines draw in, then (3D tier) the sheet tilts and the contours lift into lidar terrain, and the ravine opens up. Camera on rails, scrubbed by scroll, no orbit. |
| **Effort** | L (3D tier). M for the 2D tier alone (contours draw in over the plan map, then a hillshade crossfades in). |
| **Risk** | (1) Data: the ravine has to read clearly at a zoom that still shows the river. Minnesota's 2nd-gen statewide lidar DEM (0.5 m) should resolve it, but this is unverified until clipped. (2) Weight: three.js adds ~150 KB gzipped plus the heightmap and texture, so it must lazy-load. (3) Pacing: the text beat is one sentence. A long pinned sequence would outweigh the sentence and compete with the video payoff. (4) Location: an exact 3D model of the ravine pinpoints the falls (see Q-LOC). |
| **Fallback** | The 2D tier itself, and below that a static hillshade + contour image with a red annotation. Used under reduced motion, without WebGL, or on low-power devices. |
| **Recommendation** | **Build the 2D tier first, in Phase 3, as part of the M2 sticky stage. Decide on the 3D tier only after seeing real data in 2D.** The *idea* earns its place: reading a topo map really is the aha, and it's the page's whole concept. Whether the *3D lift* adds anything beyond the 2D contours depends on how dramatic the ravine is in the lidar. If it goes ahead, keep it short (≈1.5 screens of scroll) so the video payoff stays the emotional peak. |

### Accents

| # | Accent | Effort | Risk | Fallback | Recommendation |
|---|---|---|---|---|---|
| 1 | **Jointing diagram (D1)** | M | Geology labels must come from a real source, not my guess. Scroll-scrubbed erosion right before two more pinned sections makes the middle of the page feel busy. | Static three-panel triptych | **Keep, but as a stepped inline figure** (3 states triggered as it scrolls through view), *not* a pinned scrub. That leaves the M2/M3 sticky stage as the only pinned moment in the middle of the page. |
| 2 | **Bank to bank (M2)** | M | Needs the author's choice of falls. The narrator used Google Maps, so our map must not copy Google's look or data. | Static map with both pairs and the blank, all at once | **Keep, merged with M3** into one sticky stage: pair 1 → pair 2 → blank → contours. One pin, one continuous idea. |
| 3 | **Inked route (M4)** | M | Location precision and the rail line (see Q-LOC, Q-RAIL). | Static map with the full route drawn | **Keep, with a generalized route.** Skip the elevation profile; it adds a chart without adding to the story. |
| 4 | **Clippings (C1, C2)** | S | Rights for 1937. Scan quality. | Plain figure, no rotation, sentence underlined | **Keep.** Cheap and on-theme. The underline is the only motion. |
| 5 | **The payoff (V1)** | S | File size; iOS autoplay rules (`muted playsinline` handles them). | Poster still | **Keep.** It's the page's one dark, full-bleed moment. |
| 6 | **Closing gesture (M5)** | S–M | Showing cul-de-sacs and footprints near private homes (see Q-LOC). | Static end state | **Keep.** It's the thesis of the design: the page ends by putting the falls on a map. |

**Better idea from the research: an archival layer.** USGS topoView offers the *St. Paul West* quadrangle in editions from 1951 onward, and earlier sheets may exist. If an old sheet shows the ravine with no falls label, M0/M5 can be built on the real historical sheet instead of a pastiche. That's more honest, and it fits "precise and archival". Effort S once the GeoTIFF is downloaded. Public domain. **Recommended** as the base layer for M0 and M5, with my own linework on top.

**Count after these recommendations:** two sticky sections (M2/M3 stage, M4 route), one dark media moment, three light-touch figures (D1, clippings, M5). The lede, the Feinberg passage, the hike description, and the ending stay plain reading text.

---

## 4. Research references

Searches were done October 2026. Several outlets (Reuters, WaPo) block automated fetching, so I verified the write-ups and process notes rather than the interactives themselves.

| Reference | What to borrow |
|---|---|
| **NYT "Snow Fall" (2012)** | Long stretches of plain text between few, large media moments, and full-bleed video with tiny captions. The pacing model for this page. |
| **The Pudding, "Responsive scrollytelling best practices" (Samora)** ([link](https://pudding.cool/process/responsive-scrollytelling/)) | Simplify on mobile rather than shrink. Avoid `vh` for step sizing on mobile (toolbar resizing) and use `window.innerHeight`. Use `matchMedia` to keep CSS and JS in sync. Shorter pacing on mobile. |
| **Scrollama** ([intro](https://pudding.cool/process/introducing-scrollama/)) | IntersectionObserver step triggers plus the sticky-graphic pattern for M2/M3 and M4. |
| **National Geographic "Rewind the Red Planet" (Brian Jacobs, 2016)** ([how it was made](https://source.opennews.org/articles/how-we-made-rewind-red-planet/)) | Real elevation data driving three.js; GSAP treating scroll position as a timeline; one consolidated `requestAnimationFrame` loop; labels drawn as 2D/SVG projected from 3D instead of WebGL text. Also its warning that performance is "death from a thousand cuts". **Note:** the brief lists this as the "LA Times Gale Crater" piece. Rewind the Red Planet is National Geographic's, and I could not locate an LA Times Gale Crater write-up. Please send a link if you have one. |
| **SCMP Graphics** ([process explainer](https://multimedia.scmp.com/infographics/news/hong-kong/article/3253386/behindthescenes/index.html)) | Explanatory illustrations that build one step at a time, planned first on paper. The model for D1's three states. |
| **ArcGIS StoryMaps sidecar** ([Esri: six ways to use sidecar](https://www.esri.com/arcgis-blog/products/arcgis-storymaps/mapping/6-ways-to-use-sidecar-in-the-new-arcgis-storymaps)) | Sidecar for "touring a series of places" (M2) and "illustrating a process" with sequential graphics (M3), plus their clean cover and credits blocks. |
| **Mapbox scrollytelling template / "A Scrollytelling Climb of Mt Fuji"** ([link](https://googlemapsmania.blogspot.com/2021/08/a-scrollytelling-climb-of-mt-fuji.html?m=1)) | A camera that follows a real route as you scroll. The route should *lead*, but the camera should stay mostly still. In our M4 the line moves and the map barely does. |
| **NYT, "Inside Sednaya Prison" (2025)** | A recent example of a guided 3D model with a fixed camera path and no free exploration. Same discipline as the proposed M3 rails. |

**Data sources confirmed to exist:**
- Minnesota Geospatial Commons, *Statewide Seamless 0.5 m Lidar DEM, 2nd generation* ([link](https://gisdata.mn.gov/dataset/elev-lidar-statewide-gen2)), accessed by clipping via STAC/VRT rather than bulk download. Dakota County also has 1 m/3 m DEM and hillshade products.
- USGS topoView ([link](https://ngmdb.usgs.gov/topoview/)): *St. Paul West, MN* 1:24,000 editions from 1951, 1967 (revised 1969–1993), 2010, 2013 and 2016, plus *St. Paul SW* 1967. GeoTIFF, public domain.
- OpenStreetMap for water, rail, roads and footprints (ODbL; attribution goes in the collar).

---

## 5. Media slots summary

| Slot | Type | Aspect | Source | Notes |
|---|---|---|---|---|
| M0 | map | 16:9 / 4:5 mobile | make | Cover sheet, falls unlabeled, locator inset |
| P1 | photo | 3:2 | need (optional) | Feinberg sampling, 2020 |
| D1 | diagram | 4:3 / 1:1 mobile | make | Jointing cross-section, 3 states |
| M2/M3 | map stage | sticky, full height / top half mobile | make | Bank to bank → contours (→ 3D?) |
| M4 | map | sticky | make | Generalized route |
| P2 | photo | 3:2 | need | Planks over reeds |
| P3 | photo | 3:2 | need | Tracks above flooded flats |
| P4 | photo | 3:2 | need | Fallen-tree creek crossing |
| V1 | video | 16:9 + 9:16 or 4:5 crop | need | Falls loop, both tiers |
| P5 | photo | matches V1 | need (frame from V1 is fine) | Poster |
| V2 | video | 16:9 | need (optional) | Hike B-roll |
| C1 | clipping | as scanned | need | 1917 Pioneer Press |
| C2 | clipping | as scanned | need | 1937 South St. Paul Reporter |
| M5 | map | 16:9 / 4:5 mobile | make | Closing map, label written on |
| OG | image | 1200×630 | make | Social card |

---

## 6. Shot list (for the author)

**Video**
1. **V1, the falls (essential).** Tripod, locked off, 15–30 s. Both tiers in frame, plus a vertical-safe framing if possible (or shoot 4K so a 9:16 crop holds up). Record the water sound as well. The loop is muted by default, but the sound toggle should have real audio.
2. **V2, walk B-roll (optional).** One steady 6–10 s shot: water over the flats beside the tracks, or feet crossing a fallen-tree bridge.

**Photos** (originals at full resolution; I'll make 800/1600/2400 exports)
3. **P2** planks across the reeds.
4. **P3** tracks above the flooded flats (wide, shows the bluff).
5. **P4** a fallen-tree or rock-hop crossing.
6. **Falls stills:** one wide showing both drops, one detail of the shale shelves. Portrait (4:5) works best for a vertical subject.
7. **P1** Feinberg in the field, 2020, only if it exists and he's agreed to be pictured.
8. *Optional reshoot:* the ravine rim with houses visible from public land, for the ending. No house numbers or identifiable people.

**Archival**
9. **C1, C2** full-page or column scans at ≥ 300 dpi, with publication, date, page number and archive source (e.g. MNHS newspaper archive).

**Data, if you prefer to prepare it in QGIS** (otherwise I'll script it with GDAL)
10. Lidar DEM clip around the ravine and the river reach for M2, plus the route as a GPX if you have one.

---

## 7. Suggested copy edits (for approval, not yet applied)

**Formatting debris**
- E1. "Happy Hollow Falls" on its own line → treat as a section subhead (as in the table above).
- E2. Link brackets start one space early: `[ according to the National Parks Service.]` → link "according to the National Park Service"; `[ Minnesota's third snowiest winter on record.]` → same fix.
- E3. Title case: "The Twin Cities' Hidden waterfall" → "…Hidden Waterfall" (matches the brief).

**Wording** (from the brief, plus a few more)
- E4. "on the South banks of the Mississippi" → "on the south bank of the Mississippi".
- E5. "Lilydale Regional park" → "Lilydale Regional Park".
- E6. "I and a friend assisting in videography, found…" → "a friend assisting with videography and I found…" (this also drops the stray comma).
- E7. "million-dollar house laden cul-de-sacs" → "cul-de-sacs lined with million-dollar houses".
- E8. "the park was under consideration to become a state park" → "the land around the falls was under consideration…" (only if the 1937 clipping supports that wording).
- E9. "National Parks Service" → "National Park Service".
- E10. "Downtown Minneapolis" → "downtown Minneapolis".
- E11. "A locale once sought as a recreation area for many, now is seen by very few." → "A place once sought as a recreation area for many is now seen by very few."
- E12. "starting at the Lilydale Trailhead" / "Upon reaching the trailhead": consider "Upon reaching the trailhead parking lot," because as written the road "to the parking lot" was blocked *after* reaching the trailhead.

**Factual consistency** (questions, not edits)
- E13. ~~The lede says "25-foot waterfall"; later "two drops, of about 10 and 25 feet". Is 25 ft the total or the larger drop?~~ **Answered:** 25 ft is the larger, second drop. The lede is accurate as written. Optional: "two-tiered" or "35-foot" if you want the lede to cover both drops. The 10 ft drop is the first (upper) one, so the payoff diagram labels the tiers top to bottom as 10 ft, then 25 ft.
- E14. Both links use the same Wayback timestamp (`20240523142348`), but one points to nps.gov and the other to mprnews.org. Two different sites captured in the same second is unlikely, so the MPR link may be a copy-paste error. Please re-check.

---

## 8. Open questions

| ID | Question | Why it matters |
|---|---|---|
| Q-DATE | The reporting dates to spring 2023 (MPR link, April 2023). Should we use a dateline, or an "Originally reported spring 2023" note in the collar? Was it published somewhere first? | Credits; it also explains the flooding. |
| Q-BYLINE | Byline wording, and credit for the friend who shot video. | Collar and captions |
| Q-FEINBERG | Is Feinberg pictured anywhere? Has he seen the quote in this context? Can he (or a Minnesota Geological Survey source) confirm the layer names for D1? | I won't label rock layers without a source. |
| Q-LOC | **Location precision.** The falls sit beside private homes. Options: (a) exact route; (b) generalized route that ends at the creek mouth with "about 45 minutes on foot"; (c) no route line, stops only. **I recommend (b).** M3's 3D terrain also reveals the ravine's exact shape. Is that acceptable? | Privacy, trespass, liability |
| Q-RAIL | Is the rail line active, and whose right-of-way is it? Walking along active tracks is usually trespassing and is dangerous. I suggest a short access and safety note, and not drawing the route *on* the tracks. | Safety, legal |
| Q-LAND | Is the ravine itself public land (Lilydale Regional Park, a Mendota Heights park), private, or mixed? Is "Mendota Heights" correct, rather than Lilydale? | Accuracy, access note |
| Q-PAIRS | Which two "opposite" waterfalls should M2 show? Candidates to check: Minnehaha Falls, Bridal Veil Falls, Shadow Falls, Hidden Falls. I haven't verified which ones actually pair across the river, and I won't assert pairs without your confirmation. | M2 content |
| Q-RIGHTS | Reuse rights for both clippings. 1917 is US public domain. 1937 may be public domain if copyright wasn't renewed, but that needs checking. Where did the scans come from? | C1, C2 |
| Q-ZILLOW | When was the Zillow figure checked? Should the collar give an "as of" date? | Accuracy |
| Q-GAP | The paste has a gap after "Happy Hollow Falls". Was there a photo of the falls there in the original? If so, which one? | Slot planning |
| Q-3D | After the 2D contour reveal is built with real data, do you want the 3D tier evaluated? (See §3.) | Phase 4 scope |
| Q-REF | Do you have a link for the "LA Times Gale Crater" reference? | Research accuracy |
| Q-TICKS | The neatline ticks are labeled with the St. Paul West 7.5′ quadrangle bounds (45°00′ to 44°52′30″ N, 93°15′ to 93°07′30″ W), taken from the USGS cell index (44093-H2). I haven't checked them against the sheet, and I haven't confirmed the falls fall inside that quad. I'll do both in Phase 3. | Coordinates must not be invented |

---

## 10a. Phase 2 redesign (author feedback, 2026-10-01)

The survey-sheet skeleton was too stylized. It has been rebuilt as sleek and modern, Vox Atlas-inspired (see CLAUDE.md §4 revision):
- Dark full-screen cover with the title in bold Inter Tight, wrapped in a ring of blue (`#4CBBEC`) question marks.
- White reading page with a ~44rem column; photos and maps run wide or full bleed.
- Both sticky sections (M2→M3, M4) are now **full-bleed maps with text cards floating over them**, giving the media the whole screen.
- M4 now starts on the author's overview-map style (Minneapolis / St. Paul / Ivy Falls in blue label boxes) and zooms in. The separate cover map M0 is dropped.
- Paper appears only on the clippings (with a Vox-style yellow highlighter on the key sentence) and the old topo sheet overlaid in M3.
- "Happy Hollow Falls" is set as a blue label box, matching the map labels.
- A thin blue reading-progress bar replaces the neatline tick rail.
- Copy edits, media and the opposite-waterfall pairs are on hold at the author's request.

Superseded notes from the first skeleton follow.

## 10. Phase 2 build notes (decisions made while building the skeleton)

- **Text is verbatim** from `content/story.md`, typeset only: straight quotes became curly ("There's", "you're"), and the two link brackets moved to the word they belong on. **None of the copy edits in §7 are applied**, including E3 (the title still reads "Hidden waterfall").
- **Section markers** are benchmark glyphs (a red triangulation-station mark between brown rules) **with no text**, so I haven't added any subheads that aren't in the story. The only labeled marker is the existing "Happy Hollow Falls", set in blue italic caps because it's a water-feature name.
- **The ending puts the text before M5**, which reverses the order in the §2 table. The last thing on the page becomes the map writing *Ivy Falls* onto itself, right after "now is seen by very few."
- **The Feinberg quote** is styled as an indented italic passage with a contour-brown rule. The words are unchanged.
- **Contrast:** `#A5683A` contour brown measures 3.8:1 on paper, so it's only used for lines and rules. Small brown text uses `#8A5326` (5.2:1). The other palette colours pass AA as given.

---

## 9. Proposed build order (after approval)

- **Phase 2, skeleton.** Real text (with only the approved edits), type, palette, neatline, benchmarks, collar, and labeled placeholders for every slot. Screenshots at 360 / 768 / 1280 / 1920.
- **Phase 3, maps and accents.** Data pipeline (`data/SOURCES.md`), M0/M5 on the historical sheet, the M2/M3 stage in 2D, M4 route, D1, clippings.
- **Phase 4, showpiece.** Only if Q-3D is a yes after seeing Phase 3.
- **Phase 5, polish and ship.** Real media, accessibility and performance pass, OG image, deploy.

## 11. Dek options (author to choose)

Drawn only from facts in the story. Option 1 is on the page for now.

1. A 25-foot waterfall in Mendota Heights was once considered for a state park. Today it isn't on any map.
2. Once called Happy Hollow Falls, it was nearly a state park. Now it hides behind the cul-de-sacs.
3. How a half-remembered geology lesson and a topographical map led to a waterfall the maps forgot.
4. A spring-fed waterfall on the Mississippi bluffs, almost unknown to the cities around it.
5. It's 25 feet tall, fed by springs and 45 minutes' walk from a trailhead. Almost nobody goes.

### Dek options, round 2 (short, no spoilers)

Option 1 is on the page.

1. The maps say there's nothing here. They're wrong.
2. It isn't on any map. It's been there all along.
3. There's a waterfall in the Twin Cities almost no one has seen.
4. Somewhere off the Mississippi, the maps leave a blank.
5. Hiding in plain sight, a short walk from the city.
6. Some places you have to find for yourself.

### Round 3 changes (2026-10-02)

- Dek on the page: "You won’t find it on any maps." (author's wording).
- The three-photo row is now a **five-card carousel** with no captions: P2 planks over the reeds, P3 tracks above the flooded flats, P4 fallen-tree crossing, **P5 hopping the creek on rocks**, **P6 the small wooded valley below the falls**. Add P5 and P6 to the shot list (portrait 4:5).

### Round 4 changes (2026-10-02)

- Cover reworked: left-aligned three-line title in the left third, a simple dek and byline, and an interactive folded map (decorative artwork in `assets/foldmap.svg`, not a real survey) in the right third. The plank dek and byline and the falling, cracking board were retired in favour of this simpler layout.
- Carousel cards are now polaroids. Their bottom captions are the intended shot descriptions, placeholders until real photos and captions arrive.
