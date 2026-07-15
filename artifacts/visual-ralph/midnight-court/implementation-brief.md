# Задание для Codex: редизайн «Авангард» — Midnight Court

## 0. Контекст

Ты работаешь в репозитории:

- GitHub: `imanuglyone/Volleyball-club`
- Production: `https://volleyball-club.vercel.app`
- Основной язык интерфейса: русский
- Город клуба: **Ангарск**
- Название клуба: **«Авангард»**
- Визуальный знак: `AV` в круге
- Технологии: Next.js 14 App Router, React 18, TypeScript, Tailwind CSS 3, Lucide React, Supabase, Telegram WebApp SDK
- Поверхности продукта:
  1. публичный сайт `/`;
  2. Telegram Mini App: `/app`, `/schedule`, `/trainings/[id]`, `/bookings`, `/profile`;
  3. адаптивная админ-панель `/admin`;
  4. Telegram-бот с нативными сообщениями и кнопками.

К задаче приложены два обязательных файла:

1. `MIDNIGHT_COURT_REFERENCE.png` — главный визуальный референс. Он показывает требуемую атмосферу, композицию, контраст, фиолетовый свет, карточки, мобильные экраны и admin control room.
2. `AVANGARD_ORIGINAL_DESIGN_BRIEF.md` — исходный продуктовый и технический бриф.

Референс не является пиксель-в-пиксель макетом каждого состояния, но является **source of truth для арт-дирекшена**. Результат должен визуально ощущаться как тот же продукт и та же дизайн-система.

---

# 1. Роль и конечная цель

Работай как senior product designer, frontend architect и motion designer.

Нужно полностью привести публичный сайт, Telegram Mini App и admin к единой дизайн-системе **Midnight Court**:

- кинематографичный почти чёрный фон;
- один яркий violet accent;
- спортивная атмосфера вечернего зала;
- крупная типографика;
- 3D-ощущение без тяжёлого WebGL;
- стеклянные панели;
- свет, дымка, траектории мяча и линии площадки;
- эмоциональный публичный сайт;
- быстрый и удобный Mini App;
- плотная, функциональная и премиальная админ-панель.

Главная цель: пользователь должен увидеть сайт и сразу подумать не «сервис бронирования», а **современный живой волейбольный клуб с сильным характером**.

При этом сценарий записи должен оставаться максимально простым и понятным.

---

# 2. Неприкосновенные ограничения

## 2.1. Не менять бизнес-логику

Не переписывай и не ломай:

- Supabase-схему;
- существующие RPC;
- атомарный контроль вместимости;
- серверную валидацию Telegram `initData`;
- API-контракты;
- маршруты;
- правила авторизации;
- админские server actions;
- способ создания и отмены одной конкретной записи;
- существующие типы данных без реальной необходимости.

Разрешены только изменения, необходимые для представления данных, UI-состояний и UX.

## 2.2. Безопасность

- Никогда не выноси `SUPABASE_SERVICE_ROLE_KEY` в клиент.
- Не показывай телефоны участников в публичной части.
- Не доверяй `initDataUnsafe` для авторизации.
- Не создавай обходных клиентских запросов к административным данным.
- Не ослабляй существующую проверку вместимости.

## 2.3. География

- Везде использовать только **Ангарск**.
- Удалить `IRK`.
- Не использовать Иркутск в тексте, метаданных, декоративных кодах или alt.
- Если нужен короткий декоративный код, использовать `ANG`.
- Предпочтительный вариант — не имитировать аэропортовый код вообще.

## 2.4. Производительность

Запрещено:

- Three.js;
- тяжёлый WebGL;
- Spline runtime;
- большие canvas-сцены;
- тяжёлые UI-kit зависимости;
- неоптимизированные GIF;
- видео с автозвуком;
- изображения без размеров;
- постоянные обработчики `mousemove`, вызывающие React render на каждый кадр.

Делай глубину средствами:

- CSS transforms;
- CSS perspective;
- SVG;
- mask-image;
- radial/conic gradients;
- псевдоэлементы;
- короткие WebM/MP4;
- `requestAnimationFrame`;
- CSS custom properties;
- лёгкий параллакс.

Не добавляй motion-библиотеку, если всё можно сделать CSS. Если без библиотеки действительно нельзя, сначала обоснуй это в отчёте, но по умолчанию не добавляй зависимость.

---

# 3. Визуальная концепция

## Название

**Midnight Court**

## Метафора

Вечерняя площадка за несколько минут до начала игры:

- зал почти тёмный;
- сетка и разметка читаются направленным светом;
- мяч находится в воздухе;
- траектория движения прорезает пространство;
- фиолетовый свет работает как сигнал действия;
- игроки и команда создают человеческую энергию;
- интерфейс напоминает премиальный спортивный editorial, а не киберспорт.

## Характер

- уверенный;
- современный;
- энергичный;
- дружелюбный;
- немного премиальный;
- кинематографичный;
- технологичный, но не «крипто»;
- спортивный, но не шаблонный фитнес.

## Запрещённые ассоциации

Дизайн не должен выглядеть как:

- киберспортивная команда;
- игровой лаунчер;
- криптокошелёк;
- SaaS dashboard;
- банковское приложение;
- ночной клуб;
- стандартный шаблон фитнес-центра;
- сайт с неоновым градиентом на каждой карточке.

---

# 4. Дизайн-токены

Создай единый набор CSS variables. Не оставляй несколько конфликтующих `:root`.

Рекомендуемое расположение:

```text
styles/
  tokens.css
  base.css
  public-site.css
  mini-app.css
  admin.css
  motion.css
```

`app/globals.css` должен только импортировать Tailwind layers и эти файлы в понятном порядке.

## 4.1. Цвета

```css
:root {
  --color-canvas: #060608;
  --color-canvas-deep: #030305;
  --color-surface-1: #0d0d11;
  --color-surface-2: #131219;
  --color-surface-3: #1a1721;

  --color-text-primary: #f7f5f9;
  --color-text-secondary: #b0acb6;
  --color-text-muted: #817d88;
  --color-text-disabled: #5f5b65;

  --color-violet: #8d45ff;
  --color-violet-bright: #a95cff;
  --color-violet-soft: #d5b5ff;
  --color-violet-deep: #3c176e;

  --color-success: #75d7a1;
  --color-danger: #e78591;

  --color-border-subtle: rgba(255,255,255,.10);
  --color-border-default: rgba(255,255,255,.16);
  --color-border-strong: rgba(255,255,255,.26);

  --glass-bg: rgba(15,14,20,.72);
  --glass-bg-strong: rgba(18,16,24,.88);
  --glass-highlight: rgba(255,255,255,.06);

  --shadow-panel: 0 24px 80px rgba(0,0,0,.38);
  --shadow-violet: 0 18px 60px rgba(122,55,255,.25);
}
```

Допускается небольшая калибровка оттенков после проверки на OLED, но:

- фон остаётся почти чёрным;
- violet — единственный брендовый яркий цвет;
- success и danger используются только для функциональных состояний;
- не возвращать оранжевый `ember`;
- не возвращать голубой `ice`;
- не использовать радугу градиентов.

## 4.2. Градиенты

Разрешены только атмосферные градиенты:

```css
--gradient-hero:
  radial-gradient(circle at 72% 42%, rgba(151,72,255,.26), transparent 28%),
  radial-gradient(circle at 42% 110%, rgba(101,39,201,.22), transparent 42%),
  linear-gradient(120deg, #050507 0%, #090a10 55%, #090711 100%);

--gradient-panel:
  linear-gradient(145deg, rgba(255,255,255,.055), rgba(255,255,255,.012));

--gradient-button:
  linear-gradient(135deg, #7d36eb 0%, #a14fff 100%);
```

Не использовать видимые rainbow gradients.

## 4.3. Типографика

Основной шрифт: уже подключённый **Manrope** с кириллицей.

Дополнительный display-шрифт можно добавить только из Google Fonts и только с кириллицей. Предпочтение:

- `Unbounded` для логотипа, цифр и отдельных коротких заголовков;
- либо оставить Manrope для всего интерфейса.

Не использовать Unbounded для длинных абзацев.

Размеры:

```css
--text-display-xl: clamp(4rem, 10vw, 9.5rem);
--text-display-lg: clamp(3rem, 7vw, 6rem);
--text-display-mobile: clamp(2.5rem, 12vw, 4rem);
--text-h1: clamp(2.4rem, 6vw, 4.5rem);
--text-h2: clamp(2rem, 4vw, 3.6rem);
--text-h3: 1.5rem;
--text-body-lg: 1.125rem;
--text-body: 1rem;
--text-small: .875rem;
--text-micro: .625rem;
```

Правила:

- display-заголовки: weight 750–850;
- line-height display: `0.88–0.98`;
- отрицательный tracking у больших заголовков;
- micro labels: uppercase, mono или Manrope, tracking `0.16–0.24em`;
- мобильные ключевые заголовки — центрированные;
- информационные карточки — выравнивание по левому краю;
- не делать основной текст меньше 14px;
- важные данные тренировки — не меньше 16px.

## 4.4. Радиусы

```css
--radius-xs: 8px;
--radius-sm: 12px;
--radius-md: 16px;
--radius-lg: 22px;
--radius-xl: 30px;
--radius-pill: 999px;
```

Рекомендации:

- кнопки: 10–14px или pill на публичном сайте;
- cards Mini App: 18–22px;
- bottom nav: 20–24px;
- большие media panels: 28–32px;
- admin controls: 10–14px.

## 4.5. Отступы

Используй 4px базовую сетку.

```css
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-5: 20px;
--space-6: 24px;
--space-8: 32px;
--space-10: 40px;
--space-12: 48px;
--space-16: 64px;
--space-20: 80px;
--space-24: 96px;
```

Публичный desktop должен быть просторным. Mini App — компактным, но не тесным.

## 4.6. Контейнеры

```css
--container-site: 1440px;
--container-content: 1180px;
--container-app: 680px;
--container-admin: 1380px;
```

---

# 5. Фон Midnight Court

Создай переиспользуемый компонент:

```text
components/visuals/MidnightCourtBackground.tsx
```

Он должен поддерживать variants:

```ts
type BackgroundVariant = 'public' | 'app' | 'admin' | 'detail';
```

## Слои фона

1. Базовый почти чёрный canvas.
2. Два-три больших radial gradient пятна.
3. Очень мягкая дымка.
4. Тонкие дуги траектории мяча.
5. Крупная нерегулярная разметка площадки.
6. Одна-две световые полосы.
7. Едва заметный grain через маленький оптимизированный texture или CSS noise.
8. Затемнение под контентом.

Важно:

- никакой квадратной pixel-grid;
- никакой регулярной dot-grid;
- линии площадки не должны образовывать фон в стиле таблицы;
- opacity линий 4–10%;
- violet glow не должен ухудшать читаемость;
- фон не должен перерисовываться React-ом при движении курсора.

## Реализация

- SVG с `viewBox` для линий корта и траекторий;
- SVG поместить inline или в `/public/visuals`;
- движение только через `transform` и `opacity`;
- `will-change` использовать точечно;
- для reduced motion всё движение отключить;
- background должен иметь `pointer-events: none`;
- контент должен быть выше через нормальный stacking context.

---

# 6. 3D-мяч и объём

Создай компонент:

```text
components/visuals/HeroVolleyball.tsx
```

## Требуемый вид

- крупный мяч справа в desktop hero;
- на мобильном — уменьшенный мяч в верхней или центральной части;
- тёмные графитовые панели;
- светлые кремово-серые вставки;
- мягкий фиолетовый контровой свет;
- реалистичная сферическая форма;
- тонкие орбитальные окружности;
- небольшой parallax.

## Допустимые реализации

Предпочтение:

1. оптимизированный transparent WebP/AVIF asset;
2. несколько HTML-слоёв с CSS transform для глубины;
3. SVG/gradient fallback.

Не делай тяжёлую интерактивную 3D-модель.

## Motion

- idle float: 6–9 секунд;
- вращение орбит: 18–30 секунд;
- parallax: максимум 8–14px;
- tilt: максимум 3–5 градусов;
- не привязывать ключевой контент к движению;
- на touch-устройствах только idle animation;
- при reduced motion — полностью статично.

Используй `requestAnimationFrame` и CSS variables:

```css
--pointer-x
--pointer-y
```

Не меняй React state на каждый `pointermove`.

---

# 7. Медиа-ассеты

Создай структуру:

```text
public/
  visuals/
    hero/
    court/
    players/
    textures/
```

## Требования

- изображения: AVIF/WebP;
- fallback при необходимости;
- видео: muted, loop, playsInline;
- poster обязателен;
- не более одного autoplay-видео на странице;
- видео должно быть декоративным и иметь `aria-hidden="true"`;
- на мобильных и `prefers-reduced-motion` разрешено показывать poster вместо видео;
- public hero media желательно не больше 2–3 MB;
- изображения должны загружаться через `next/image`;
- LCP hero asset должен иметь корректный `priority`, остальные lazy.

Если реальных фотографий пока нет, используй атмосферные абстрактные placeholders, которые легко заменить. Не вставляй случайные стоковые фотографии разных залов и команд, создающие ощущение чужого клуба.

---

# 8. Архитектура компонентов

Создай или переработай компоненты:

```text
components/
  brand/
    AvangardMark.tsx
    AvangardWordmark.tsx

  ui/
    Button.tsx
    IconButton.tsx
    GlassPanel.tsx
    StatusPill.tsx
    CapacityMeter.tsx
    SectionLabel.tsx
    Field.tsx
    Dialog.tsx
    BottomSheet.tsx
    Skeleton.tsx
    EmptyState.tsx
    ErrorState.tsx

  visuals/
    MidnightCourtBackground.tsx
    HeroVolleyball.tsx
    CourtLines.tsx
    BallTrajectory.tsx
    AmbientLight.tsx

  app/
    AppShell.tsx
    BottomNavigation.tsx
    TrainingCard.tsx
    TrainingFeed.tsx
    ParticipantRoster.tsx
    BookingAction.tsx
    BookingSuccess.tsx
    CancelBookingDialog.tsx

  public/
    PublicHeader.tsx
    HeroSection.tsx
    NextTrainingPanel.tsx
    ManifestoSection.tsx
    ExperienceSection.tsx
    GallerySection.tsx
    SchedulePreview.tsx
    VenueSection.tsx
    FinalCtaSection.tsx

  admin/
    AdminShell.tsx
    AdminSidebar.tsx
    AdminMobileNav.tsx
    AdminTrainingCard.tsx
    AdminStats.tsx
```

Не создавай компоненты только ради компонентов. Выноси то, что:

- повторяется;
- имеет состояния;
- должно быть единообразным;
- будет использоваться на нескольких поверхностях.

---

# 9. Общие UI-компоненты

## 9.1. Button

Variants:

```ts
'primary' | 'secondary' | 'ghost' | 'danger'
```

Sizes:

```ts
'sm' | 'md' | 'lg'
```

States:

- default;
- hover;
- active;
- focus-visible;
- disabled;
- loading;
- success при необходимости.

Primary:

- violet gradient;
- белый текст;
- тонкий внутренний highlight;
- мягкая тень;
- без чрезмерного neon glow.

Loading:

- текст меняется на действие: `Записываем…`, `Сохраняем…`;
- кнопка disabled;
- иконка или небольшой spinner;
- размеры не прыгают.

## 9.2. GlassPanel

- border 1px;
- gradient surface;
- backdrop blur 16–24px;
- верхний внутренний highlight;
- тёмная тень;
- blur не должен быть единственным способом отделить panel от background.

## 9.3. StatusPill

Статусы:

- `available` — «Есть места»;
- `almost-full` — «Осталось 1–3 места»;
- `full` — «Мест нет»;
- `cancelled` — «Отменена»;
- `booked` — «Вы записаны»;
- `completed` — «Завершена».

Статус нельзя передавать только цветом. Всегда нужен текст и при необходимости иконка.

## 9.4. CapacityMeter

Показывает:

- `active_bookings / capacity`;
- свободные места;
- progress bar;
- почти заполненное состояние.

Violet — основной цвет progress. Не использовать красный для almost full.

## 9.5. Dialog / BottomSheet

Нужно заменить `window.confirm`.

Desktop/browser:

- centered dialog;
- backdrop;
- focus trap;
- Escape закрывает;
- возврат фокуса на trigger.

Telegram/mobile:

- bottom sheet;
- учёт safe area;
- drag handle только декоративный;
- две явные кнопки:
  - `Оставить запись`;
  - `Отменить запись`.

Опасное действие не должно срабатывать одним случайным касанием.

---

# 10. Публичный сайт `/`

Публичный сайт должен быть самостоятельным эмоциональным продуктом, а не растянутым Mini App.

## 10.1. Header

Desktop:

- слева знак AV и слово «Авангард»;
- по центру/справа: «О клубе», «Формат», «Расписание», «Контакты»;
- CTA: «Открыть приложение»;
- прозрачный поверх hero;
- после прокрутки — тёмный glass header.

Mobile:

- знак и название;
- CTA icon/button;
- burger или компактный sheet для навигации;
- touch targets минимум 44px.

## 10.2. Hero

Высота:

- desktop: `min-height: 900px` или около `100svh`;
- mobile: минимум `780px`, но адаптировать к реальному viewport.

Композиция desktop:

- текст слева;
- мяч справа;
- сетка и зал за мячом;
- фиолетовый свет снизу и справа;
- траектория мяча пересекает композицию;
- header сверху;
- небольшие trust signals снизу;
- ближайшая тренировка может быть встроена в glass panel.

Текст:

```text
АНГАРСК · 2026

ТВОЯ ИГРА.
ТВОЯ КОМАНДА.

Живой волейбол по вечерам для тех,
кто любит игру, движение и команду.
```

Кнопки:

- «Открыть приложение»;
- «Смотреть расписание».

Слово «КОМАНДА» или его часть может быть violet, как в референсе. Не окрашивать весь заголовок.

Trust signals внизу:

- «Живые тренировки каждую неделю»;
- «Реальные люди и атмосфера»;
- «Запись за минуту».

## 10.3. Манифест

Большой editorial блок:

```text
Мы создаём не просто расписание тренировок.

Место, где вечер становится игрой,
а люди — командой.
```

Использовать много воздуха, линию-разделитель, большой номер секции.

## 10.4. Следующая тренировка

Сделать интерактивную секцию с реальными данными:

- дата;
- время;
- зал;
- адрес;
- цена;
- занято;
- свободно;
- CTA.

На desktop — крупная горизонтальная карточка с media panel.
На mobile — вертикальная card.

## 10.5. Галерея

Показывать:

- вечерний зал;
- сетку крупным планом;
- мяч;
- силуэты игроков;
- командное взаимодействие.

Сетка должна быть editorial, не обычные одинаковые карточки.

Без реальных фото секцию можно оставить с 3–4 абстрактными media placeholders, но архитектура должна позволять легко заменить файлы.

## 10.6. Как это работает

Три шага:

1. Выбери тренировку.
2. Займи место.
3. Приходи на площадку.

Каждый шаг:

- большой номер;
- тонкая иконка;
- 1–2 предложения;
- лёгкий hover tilt desktop;
- статично на touch.

## 10.7. Preview расписания

Показывать 2–3 ближайшие тренировки из текущего API.

Важно:

- это не должен быть полный Mini App внутри сайта;
- card можно сделать шире;
- CTA ведёт в `/schedule` или `/app`;
- ошибки API не должны ломать главную.

## 10.8. Venue

Большая секция с изображением площадки и разметкой корта.

Контент:

- название зала;
- адрес;
- объяснение, что пользователь заранее видит все детали;
- CTA расписания.

## 10.9. Финальный CTA

Большая фраза:

```text
УВИДИМСЯ
НА ПЛОЩАДКЕ.
```

Фиолетовый свет, мяч/траектория, одна основная кнопка.

## 10.10. Footer

- AV;
- «Авангард»;
- «Волейбольный клуб · Ангарск»;
- год;
- ссылки;
- без лишнего текста.

---

# 11. Telegram Mini App

Mini App должен быть максимально близок по атмосфере к нижнему ряду мобильных экранов на референсе.

## 11.1. Общий shell

- max width 680px;
- canvas почти чёрный;
- safe top и safe bottom;
- bottom nav fixed;
- content не перекрывается nav;
- фон менее активный, чем на публичном сайте;
- один ambient violet glow;
- едва заметная разметка площадки;
- никаких тяжёлых hero-видео в Mini App.

## 11.2. Верхняя зона

На внутренних страницах:

- маленький знак AV;
- название/раздел;
- при необходимости action icon;
- заголовки 36–52px;
- на ключевых экранах центрирование;
- содержимое карточек по левому краю.

## 11.3. Bottom navigation

Сохраняются четыре пункта:

1. Главная;
2. Расписание;
3. Мои записи;
4. Профиль.

Вид:

- glass floating panel;
- отступ 8–12px от краёв на поддерживаемых устройствах;
- safe area;
- radius 20–24px;
- активный item — violet icon/text и мягкая violet подложка;
- не делать четыре большие яркие кнопки;
- label 10–11px;
- icon 19–21px;
- touch target минимум 48px.

На очень узких экранах nav может быть full-width у нижнего края, но сохраняет внутренний radius.

---

# 12. Главная Mini App `/app`

Удалить boarding pass как основной арт-объект.

Вместо него сделать **Next Game Card**.

## Структура

1. компактный brand header;
2. greeting:
   - `Игра начинается с тебя, {имя}`;
3. большая карточка ближайшей тренировки;
4. количество свободных мест;
5. цена;
6. CTA «Записаться» или «Подробнее»;
7. короткие ссылки на расписание и мои записи.

## Next Game Card

Визуально:

- фоновый media/силуэт игрока или абстрактная фигура;
- большой текст «Ближайшая тренировка»;
- дата и время violet;
- зал и адрес;
- крупное число свободных мест;
- progress;
- кнопка внизу;
- изображение затемнено под текстом;
- panel занимает большую часть первого viewport.

Пример порядка:

```text
БЛИЖАЙШАЯ
ТРЕНИРОВКА

СБ, 19 ИЮЛЯ · 20:00

Зал «Ермак»
ул. Фестивальная, 8

8 / 20
мест свободно

500 ₽

[ ЗАПИСАТЬСЯ ]
```

Не использовать искусственный `IRK`.

---

# 13. Расписание `/schedule`

## Header

- маленький label «Расписание»;
- крупный заголовок «Будущие тренировки»;
- короткое описание;
- при необходимости filter icon.

## Date selector

- горизонтальный scroll;
- `Все` + ближайшие даты;
- выбранная дата violet;
- кнопки 44–48px;
- scroll без видимого scrollbar;
- fade mask справа/слева при переполнении;
- выбранная дата не должна теряться при загрузке.

## Список

Mobile:

- одна колонка;
- gap 12–16px.

Desktop browser:

- Mini App всё равно остаётся узким;
- максимум две колонки только при ширине app container, если карточки сохраняют читаемость;
- не превращать в desktop dashboard.

---

# 14. TrainingCard

Переработай существующий компонент, сохранив API и props.

## Иерархия

Верх:

- дата;
- status pill;
- крупное время.

Середина:

- зал;
- адрес;
- небольшая иконка location.

Низ:

- вместимость;
- progress;
- свободные места;
- цена;
- CTA.

## Пример

```text
СУББОТА · 19 ИЮЛЯ          ● 8 МЕСТ

20:00 — 22:00

Зал «Ермак»
ул. Фестивальная, 8

12 игроков    ━━━━━━━━━░░    20
8 мест свободно

500 ₽              ЗАНЯТЬ МЕСТО →
```

## States

### available

- стандартная violet CTA;
- status «Есть места».

### almost full

- status «Осталось 3 места»;
- progress ярче;
- без красного аларма.

### full

- disabled CTA;
- label «Мест нет»;
- CTA «Посмотреть состав».

### cancelled

- opacity ниже;
- line or badge «Отменена»;
- кнопка только «Подробнее» при необходимости.

### booked

Если данные позволяют определить:

- status «Вы записаны»;
- CTA «Моя запись».

Карточка должна быть целиком кликабельной только если это не создаёт вложенные конфликтующие controls. Иначе CTA остаётся отдельной ссылкой.

---

# 15. Страница тренировки `/trainings/[id]`

## Hero details

Верх:

- back button;
- дата;
- очень крупное время;
- зал и адрес;
- media strip или фотография площадки;
- status.

## Stats

Три крупных показателя:

- всего мест;
- свободно;
- стоимость.

На 360px три колонки должны оставаться читаемыми. Если не помещаются, использовать горизонтальную compact layout без переноса важных значений.

## Participant roster

Заменить простой вертикальный список на **командный roster**.

### Layout

- заголовок «На площадке»;
- счётчик `9 / 12`;
- grid 3 колонки на mobile;
- 4–6 колонок на более широкой app surface;
- каждый participant:
  - круглый avatar;
  - порядковый номер;
  - имя;
  - optional status dot;
- свободные места:
  - dotted circle;
  - label «Свободно»;
  - визуально вторичны.

### Avatar

Если фото нет:

- initial;
- индивидуальный gradient из ограниченной палитры тёмных violet/graphite;
- не использовать случайные яркие цвета.

Имя:

- максимум 2 строки;
- аккуратное truncation;
- полное имя доступно через `title` или screen-reader text, если обрезается.

Пустой roster:

- контур мяча/площадки;
- текст «Площадка ждёт первых игроков»;
- CTA записи остаётся рядом.

Телефоны никогда не показывать.

## Booking form

- поля name и phone;
- labels над полями;
- phone input 16px, чтобы iOS не zoom;
- autocomplete: `name`, `tel`;
- формат ошибок под конкретным полем или общим block;
- кнопка на всю ширину;
- loading state;
- disabled state.

## Success state

После записи показывать отдельную крупную card:

- check/volleyball icon;
- «Ты в игре»;
- дата;
- время;
- зал;
- адрес;
- кнопка «Мои записи»;
- optional «Добавить в календарь», только если реализовано корректно.

Не ограничиваться текстом «Вы записаны!».

---

# 16. Мои записи `/bookings`

## Верх

- крупный заголовок «Мои записи»;
- segmented control:
  - `Активные`;
  - `Прошедшие`.

## Active card

- дата;
- время;
- зал;
- адрес;
- status;
- кнопка «Отменить».

## Cancel flow

Полностью удалить `window.confirm`.

Использовать `CancelBookingDialog`:

```text
Отменить запись?

Суббота, 19 июля
20:00 — 22:00
Зал «Ермак»

Ты сможешь записаться снова,
если останутся свободные места.

[ ОСТАВИТЬ ЗАПИСЬ ]
[ ОТМЕНИТЬ ЗАПИСЬ ]
```

После отмены:

- haptic;
- inline toast или success panel;
- list обновляется;
- card перемещается в history;
- не перезагружать всю страницу без необходимости.

## Empty

- атмосферная иллюстрация мяча/корта;
- конкретный следующий шаг;
- CTA «Выбрать тренировку».

## Browser entry

Показывать спокойный экран:

- «Открой приложение из Telegram»;
- объяснение;
- кнопка открытия бота, если URL доступен;
- не показывать сломанный пустой экран.

---

# 17. Профиль `/profile`

Визуально близко к референсу:

- avatar;
- имя;
- username/Telegram status;
- settings list или edit form;
- сохранение;
- доступ в admin.

## Layout

1. profile hero card;
2. поля личных данных;
3. notification/settings placeholders только если они реально поддерживаются;
4. «Управление клубом»;
5. не создавать фальшивые работающие пункты.

Если уведомления пока не реализованы, не показывай toggle, который ничего не делает.

## Saved state

- inline icon + «Сохранено»;
- исчезает через разумное время;
- screen reader live region;
- haptic сохраняется.

---

# 18. Admin Control Room

Админ-панель должна выглядеть как нижний левый блок референса: тёмный control room, плотный, чистый, функциональный.

## 18.1. Desktop shell

- sidebar около 240–260px;
- logo;
- section navigation;
- bottom links;
- main content;
- max-width 1380px;
- background спокойнее, чем public hero;
- glass panels умеренно;
- таблицы и формы должны быть читаемыми.

## 18.2. Mobile shell

Сохранить:

- compact header;
- нижнюю admin nav;
- safe area;
- четыре действия.

Не пытаться уместить desktop table на 390px.

## 18.3. Dashboard

Header:

- eyebrow `ПАНЕЛЬ УПРАВЛЕНИЯ / АНГАРСК`;
- «Тренировки»;
- CTA «Создать тренировку».

Stats:

- будущих;
- активных;
- участников;
- крупные числа;
- маленькие пояснения.

Training list desktop:

Предпочтительно table-like rows:

- дата/время;
- зал;
- мест;
- записано;
- цена;
- статус;
- actions.

Каждая строка имеет:

- progress;
- status;
- participants;
- edit;
- delete.

Mobile:

- cards;
- actions вынести в menu или bottom action row;
- touch targets 44px.

## 18.4. Формы

- date/time/number inputs можно оставить native;
- оформить единообразно;
- labels;
- helper/error text;
- focus-visible;
- sticky submit bar на mobile при длинной форме;
- disabled/loading;
- destructive delete с confirmation dialog.

## 18.5. Участники

В admin телефоны разрешены.

Показывать:

- avatar/initial;
- имя;
- телефон как ссылка;
- дата записи;
- status;
- отмена конкретной записи.

Desktop — table/list.
Mobile — cards.

---

# 19. Telegram-бот

Не создавать HTML-интерфейс для бота.

Оставить нативные сообщения и клавиатуры.

Тон:

- короткий;
- человеческий;
- без технического жаргона;
- минимум emoji;
- один волейбольный marker допустим.

Пример `/start`:

```text
{Имя}, добро пожаловать в «Авангард».

Здесь можно посмотреть ближайшие тренировки,
занять место и управлять своими записями.
```

Кнопка:

```text
Открыть приложение
```

Админские ответы:

- дата;
- время;
- зал;
- занято/свободно;
- нумерованный список.

Не добавлять команду отмены всех записей.

---

# 20. Motion system

Создай `styles/motion.css`.

## Durations

```css
--motion-fast: 160ms;
--motion-base: 260ms;
--motion-slow: 600ms;
--motion-ambient: 8000ms;
```

## Easings

```css
--ease-standard: cubic-bezier(.2,.8,.2,1);
--ease-enter: cubic-bezier(.16,1,.3,1);
--ease-exit: cubic-bezier(.7,0,.84,0);
```

## Разрешённые движения

- fade + translateY 8–16px;
- scale 0.985 → 1;
- subtle tilt;
- orbit rotation;
- background drift;
- progress animation;
- dialog/sheet enter;
- button press 0.98.

## Запрещённые движения

- сильный bounce;
- постоянное быстрое движение;
- вращение текста;
- резкие glitch effects;
- частицы поверх формы;
- parallax больше 20px;
- обязательная анимация для понимания статуса.

## Reduced motion

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    scroll-behavior: auto !important;
    animation-duration: .01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: .01ms !important;
  }
}
```

Кроме CSS:

- не запускать autoplay-video или показывать poster;
- не запускать JS parallax;
- не анимировать scroll.

---

# 21. Responsive

Проверить минимум:

- 360 × 800;
- 390 × 844;
- 430 × 932;
- 768 × 1024;
- 1280 × 800;
- 1440 × 900;
- 1920 × 1080.

## Public

- mobile-first;
- headline не выходит за viewport;
- hero ball не перекрывает CTA;
- navigation работает;
- cards не имеют горизонтального overflow;
- media не создаёт layout shift.

## Mini App

- safe areas;
- bottom nav;
- keyboard не блокирует поля и submit;
- 360px не ломается;
- no horizontal scroll;
- sticky/fixed elements не конфликтуют с Telegram UI.

## Admin

- sidebar desktop;
- mobile header/nav;
- form buttons доступны;
- table заменяется cards/scroll только если это оправдано.

---

# 22. Accessibility

Цель — WCAG AA.

Обязательно:

- contrast;
- focus-visible;
- touch targets минимум 44×44;
- semantic headings;
- корректные buttons/links;
- `aria-current` в nav;
- `aria-live` для success/error;
- dialog focus trap;
- Escape;
- body scroll lock;
- alt для значимых фото;
- декоративные изображения `alt=""` или `aria-hidden`;
- статус не только цветом;
- inputs с labels;
- ошибки связаны через `aria-describedby`;
- disabled controls визуально и семантически disabled.

Проверь muted text на почти чёрном фоне. Не делай серый слишком тёмным.

---

# 23. Рефакторинг существующего CSS

Текущий `app/globals.css` содержит несколько последовательно наложенных итераций. Не добавляй новый override в конец.

Нужно:

1. определить реально используемые классы;
2. удалить устаревшие layers;
3. удалить старые `ember/ice` стили;
4. удалить дубли `:root`;
5. удалить неиспользуемые `spotlight`, старый `grain`, legacy badges и противоречащие card styles;
6. вынести новые стили по поверхностям;
7. сохранить Tailwind base/components/utilities;
8. не смешивать пять разных naming conventions.

Допускается оставить текущие class names на первом проходе, если это уменьшает риск. Но итоговый CSS должен быть структурирован и не зависеть от каскада случайных overrides.

---

# 24. Tailwind

Обновить `tailwind.config.ts`.

Удалить/не использовать:

- `ember`;
- `ice`;
- старый orange glow.

Добавить semantic colors или использовать CSS variables:

```ts
colors: {
  canvas: 'var(--color-canvas)',
  surface: {
    1: 'var(--color-surface-1)',
    2: 'var(--color-surface-2)',
    3: 'var(--color-surface-3)',
  },
  ink: {
    primary: 'var(--color-text-primary)',
    secondary: 'var(--color-text-secondary)',
    muted: 'var(--color-text-muted)',
  },
  signal: {
    DEFAULT: 'var(--color-violet)',
    bright: 'var(--color-violet-bright)',
    soft: 'var(--color-violet-soft)',
  }
}
```

Не нужно переписывать весь UI на utility classes, если это ухудшает читаемость. Разрешён разумный баланс компонентов, class names и utilities.

---

# 25. Последовательность внедрения

Работай по этапам, но доведи задачу до полностью работающего результата.

## Этап 1. Аудит

- изучить структуру repo;
- запустить проект;
- проверить public, Mini App browser mode, admin login;
- определить используемые классы;
- зафиксировать текущие screenshot baseline;
- не менять API.

## Этап 2. Foundation

- tokens;
- CSS layers;
- typography;
- buttons;
- panels;
- inputs;
- status;
- capacity meter;
- background;
- motion;
- responsive containers.

## Этап 3. Public site

- header;
- hero;
- ball;
- manifesto;
- next training;
- experience;
- gallery;
- schedule preview;
- venue;
- final CTA;
- footer.

## Этап 4. Mini App shell

- background;
- top spacing;
- bottom nav;
- safe area;
- page headers;
- common states.

## Этап 5. Mini App screens

- home;
- schedule;
- TrainingCard;
- details;
- roster;
- booking;
- success;
- bookings;
- cancel dialog;
- profile.

## Этап 6. Admin

- shell;
- sidebar/mobile nav;
- dashboard;
- list;
- forms;
- participants;
- dialogs.

## Этап 7. Polish

- loading;
- empty;
- error;
- full;
- almost full;
- booked;
- cancelled;
- completed;
- success;
- slow network;
- reduced motion;
- accessibility;
- performance.

## Этап 8. Verification

```bash
npm install
npm run lint
npm test
npm run build
```

Также провести визуальную проверку в браузере.

---

# 26. Визуальная проверка

После каждого крупного этапа снимай screenshots:

```text
artifacts/screenshots/
  public-desktop.png
  public-mobile.png
  app-home-mobile.png
  schedule-mobile.png
  training-detail-mobile.png
  bookings-mobile.png
  profile-mobile.png
  admin-desktop.png
  admin-mobile.png
```

Сравнивай с `MIDNIGHT_COURT_REFERENCE.png`.

Проверяй:

- та же тёмная кинематографичная атмосфера;
- violet только как signal;
- крупная типографика;
- объёмный мяч;
- мягкий свет;
- стеклянные панели;
- карточки не плоские;
- мобильные экраны выглядят как единая premium-система;
- admin является частью того же бренда;
- данные читаются мгновенно.

Не считать задачу завершённой только потому, что компоненты работают технически.

---

# 27. Acceptance criteria

## Public site

- hero визуально близок к референсу;
- крупный мяч и траектория присутствуют;
- сайт выглядит кинематографично;
- реальная информация клуба остаётся читаемой;
- есть live/preview расписания;
- mobile version полноценна;
- нет Иркутска/IRK;
- нет pixel-grid;
- нет оранжевого/голубого legacy.

## Mini App

- 4 пункта nav сохранены;
- next training card соответствует референсу;
- расписание быстро сканируется;
- TrainingCard показывает все ключевые данные;
- roster выглядит как команда;
- booking success полноценный;
- `window.confirm` отсутствует;
- safe area корректна;
- browser mode не падает;
- no horizontal overflow.

## Admin

- desktop control room;
- mobile удобен;
- все текущие действия сохранены;
- формы доступны;
- управление участниками работает;
- destructive actions подтверждаются.

## Engineering

- lint проходит;
- tests проходят;
- build проходит;
- API не сломаны;
- business logic не переписана;
- secrets не утекли;
- reduced motion работает;
- accessibility не ухудшена;
- assets оптимизированы.

---

# 28. Что нельзя делать ради скорости

Не делай следующее:

- просто поменять цвета текущего сайта;
- добавить один фоновый gradient и назвать это редизайном;
- вставить референс как background image;
- нарисовать фальшивые данные вместо API;
- удалить состояния;
- заменить всё одной огромной компонентой;
- добавить глобальный `transition: all`;
- оставить старый CSS и дописать ещё 500 строк overrides;
- сделать весь интерфейс фиолетовым;
- использовать случайные фотографии;
- растянуть Mini App на весь desktop;
- скрыть функциональность ради красоты;
- заменить реальный dialog на `confirm`;
- показывать телефон в public roster;
- называть тренировку «слотом» или «мероприятием».

---

# 29. Требуемый отчёт Codex после реализации

В конце верни:

1. краткое резюме изменений;
2. список созданных и изменённых файлов;
3. описание новой компонентной системы;
4. список сохранённых API/бизнес-правил;
5. результаты:
   - lint;
   - tests;
   - build;
6. ссылки/пути на screenshots;
7. известные ограничения;
8. список media assets, которые владельцу желательно заменить реальными фотографиями;
9. отдельное подтверждение:
   - `IRK` удалён;
   - Ангарск указан корректно;
   - `window.confirm` удалён;
   - Three.js/WebGL не добавлены;
   - Supabase service role не попал в client.

---

# 30. Стартовая команда

Начни с полного аудита репозитория и текущего production UI. Затем реализуй выбранный дизайн **Midnight Court** по этому документу. Не предлагай другие визуальные направления: направление уже утверждено владельцем.

Не останавливайся после создания концепции или одного hero. Нужно последовательно привести к выбранной системе:

- публичный сайт;
- все пользовательские экраны Mini App;
- все важные состояния;
- admin;
- responsive;
- accessibility;
- motion;
- visual verification.

При неоднозначности выбирай решение, наиболее близкое к `MIDNIGHT_COURT_REFERENCE.png`, но не жертвуй читаемостью, безопасностью и существующей бизнес-логикой.
