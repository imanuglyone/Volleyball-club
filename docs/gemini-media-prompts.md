# Gemini media prompts — «Авангард»

## Общий визуальный контракт

Все четыре сцены принадлежат одному миру: вечерний волейбольный зал в Ангарске, кинематографичный холодный свет, глубокий graphite/cobalt фон и ледяные блики.

Зафиксированная палитра:

- background `#080B12`;
- deep surface `#0D1320`;
- off-white `#F3F1EA`;
- primary cobalt `#4D6BFF`;
- ice blue `#A7D8FF`;
- steel `#7F8998`.

Запрещено: лайм, зелёный или фиолетовый декоративный свет, текст, буквы, цифры, логотипы, водяные знаки, рекламные щиты, узнаваемые бренды формы, киберспортивная эстетика, лазеры, толпа на трибунах, деформированные руки и мячи. Люди могут быть только силуэтами или абстрактными фигурами без узнаваемых лиц.

Для каждого результата:

- 5–8 секунд, идеально бесшовная петля;
- 24 или 30 fps, без звука;
- естественный motion blur, стабильная камера, без резких монтажных склеек;
- первая композиционно значимая информация должна быть видна в первом кадре;
- отдельный чистый poster frame в WebP/AVIF без blur;
- оставлять negative space под интерфейс, не помещать текст внутрь изображения.

## 1. Hero loop — desktop

**Экспорт:** 1920×1080, WebM + MP4, 5–8 s, суммарный целевой размер каждого видео ≤5 MB. Poster 1920×1080 WebP/AVIF ≤300 KB.

```text
Cinematic premium sports film, a dark indoor volleyball court at night, seen from a low diagonal sideline camera. Deep graphite #080B12 and #0D1320 environment, one controlled cobalt #4D6BFF light source and subtle ice-blue #A7D8FF rim light. A matte off-white volleyball travels through a smooth high arc above the net, its trajectory suggested by a faint volumetric ice-blue ribbon, then returns seamlessly to the first position. Polished wooden court only catches narrow cold reflections. Fine atmospheric haze, restrained depth, realistic net movement, quiet anticipation before a match. No visible faces; at most two distant abstract player silhouettes. Camera makes a very slow 3–4% push-in. Compose the main court action in the right 55% and preserve dark high-contrast negative space in the left 45% for a large Russian headline. Photorealistic but art-directed, premium editorial sports campaign, subtle film grain, no text, no logo, no watermark, no lime, no green, no purple, no brand marks, no camera shake, no cuts. Perfect seamless 6-second loop.
```

Poster frame: use the moment when the ball is near the top-right third, net and court lines remain readable, left 45% is calm and dark.

## 2. Hero loop — mobile

**Экспорт:** 1080×1920, WebM + MP4, 5–8 s, each ≤2.5 MB. Poster 1080×1920 WebP/AVIF ≤300 KB.

```text
Vertical cinematic companion to the Avangard desktop volleyball scene. Dark indoor volleyball court at night, graphite #080B12 and #0D1320, controlled cobalt #4D6BFF light and ice-blue #A7D8FF rim highlights. A matte off-white volleyball rises from the lower-right edge, crosses above the net in the upper third, and loops back through a subtle hidden transition. Low camera near the sideline, slow stable push-in, gentle haze, realistic net and wooden floor, premium editorial sports film. Keep the central-left area behind the headline dark and uncluttered from 22% to 63% of frame height; place the brightest ball and court detail toward the upper-right. No visible faces, no text, no logos, no watermark, no lime, no green, no purple, no neon cyberpunk, no cuts, no camera shake. Seamless 6-second loop matching the desktop scene.
```

Poster frame: ball in upper-right, headline zone remains nearly uniform graphite with enough contrast for off-white text.

## 3. Secondary episode — команда

**Placement:** section “Формат клуба”. Export 1600×1000 WebM + MP4, 5–7 s, each ≤3 MB. Poster ≤250 KB. Lazy-loaded.

```text
Abstract cinematic volleyball team ritual before play: four anonymous player silhouettes step toward the center of a dark court and briefly bring their hands together above a cobalt-lit center line. No identifiable faces and no close-up anatomy; silhouettes and sleeves remain clean and natural. Deep graphite #080B12 hall, restrained cobalt #4D6BFF side light, ice-blue #A7D8FF edges, off-white ball resting near the frame edge. The hands meet, pause, separate, and the movement loops smoothly. Camera is overhead at a gentle diagonal with a slow orbital drift of less than five degrees. The feeling is inclusive and human, not professional arena spectacle. Premium editorial sports campaign, controlled haze, realistic shadows, no text, no logo, no watermark, no lime, no green, no purple, no branded clothing, no audience, no rapid movement. Seamless 6-second loop.
```

Poster frame: hands nearly meet over the center line; leave one calm dark corner for section copy.

## 4. Secondary episode — площадка готова

**Placement:** section “Площадка”. Export 1600×1000 WebM + MP4, 5–7 s, each ≤3 MB. Poster ≤250 KB. Lazy-loaded.

```text
An empty indoor volleyball court preparing for an evening game. The hall begins almost dark, then a single row of cold ceiling lights gently wakes from graphite to cobalt and ice-blue, revealing the net, clean court markings, and a matte off-white volleyball rolling slowly into the center circle before stopping. The light then settles back into the opening exposure through a seamless hidden loop. Low symmetrical camera, precise architecture, soft atmospheric haze, polished floor with restrained reflections, premium cinematic editorial mood. No people, no text, no logos, no watermark, no lime, no green, no purple, no colored advertising, no flicker, no hard cuts, no camera shake. 6-second seamless loop.
```

Poster frame: court fully readable, ball stopped close to center, deep surfaces remain dark enough for interface overlays.

## Delivery checklist

1. Export silent `webm` first and `mp4` fallback using the filenames from `public/brand/asset-manifest.json`.
2. Verify loop seam frame-by-frame; no luminance jump is allowed.
3. Check desktop and mobile posters at 1440×900, 390×844 and 375×812 with the actual headline overlay.
4. Re-encode to the stated budgets without changing dimensions.
5. Run a palette check: decorative pixels must not drift into lime/green/purple.
6. Video remains an enhancement: if it fails or reduced motion is requested, the poster must form a complete composition.
