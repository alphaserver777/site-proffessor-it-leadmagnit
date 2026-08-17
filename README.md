# Продажник наставничества «Профессор IT»

Отдельный Astro-сайт основного продукта, опубликованный по адресу
`https://professorit.ru/mentorship/`. Это статический frontend-mirror
принадлежащего владельцу проекта `site.criminalit.ru`, поверх которого работает
фирменная визуальная оболочка и интерактивные улучшения «Профессор IT».

Сайт продаёт личное сопровождение Вадима до оффера и прохождения испытательного
срока. Основной CTA ведёт в Telegram: `https://t.me/proffessor_it`.

## Текущее состояние и ветки

- `main` — полная сохранённая версия. В ней видны статистика первого экрана,
  результаты с офферами и отзывы.
- `variant/no-results-reviews` — текущий временный вариант. В нём скрыты строка
  статистики первого экрана, секция результатов/офферов, отзывы и ссылки на них
  в навигации.
- Раздел «Материалы» скрыт в обеих версиях.

Контент скрывается только стилями: данные отзывов, офферов и статистики не
удалены из snapshot и возвращаются при переключении на `main`.

Сейчас production развёрнут из ветки `variant/no-results-reviews`.

Вернуть полную версию:

```bash
git switch main
./infra/ansible/deploy.sh
```

Вернуть временный вариант:

```bash
git switch variant/no-results-reviews
./infra/ansible/deploy.sh
```

## Состав страницы

В текущем временном варианте посетитель проходит последовательность:

1. Первый экран с позиционированием продукта, дефицитом мест и CTA.
2. Интерактивный роадмап из восьми этапов.
3. Блок «Как будет проходить обучение» с манифестом и фильтруемой матрицей
   возможностей.
4. Гарантии и договоры.
5. Тарифы: `70 000 + 50%` и `180 000` без процентов; отдельно показана
   рассрочка от 5 000 ₽ в месяц.
6. Финальная развилка «Сейчас твой выбор» с маршрутом до оффера.
7. FAQ в формате базы ответов с категориями и поиском.

Все обычные CTA подписаны «Хочу на обучение». Кнопка в конечной точке экрана
«Твой выбор» намеренно подписана «Оффер».

## Архитектура

Astro формирует минимальную статическую оболочку. Внутри неё запускается
локальная копия frontend референса:

- `public/assets/reference-app.js` — исходный production frontend;
- `public/assets/reference.css` — исходные стили и шрифты;
- `public/api/site.json` — локальный snapshot контента;
- `public/assets/brand-colors.css` — фирменная палитра, геометрия доработанных
  блоков и правила временных вариантов;
- `public/assets/ambient.js` — инженерный фон и типографическая обработка
  первого экрана;
- `public/assets/roadmap.js` — интерактивный роадмап;
- `public/assets/about.js` — манифест и матрица возможностей;
- `public/assets/faq.js` — категории, поиск и состояния FAQ;
- `public/assets/final-cta.js` — финальная развилка и анимация оффера.
- `public/assets/footer.js` — актуальные контакты Telegram/MAX и подпись MAX.

Дополнительные скрипты работают как progressive DOM enhancement и не изменяют
минифицированный frontend референса.

## Синхронизация контента

```bash
npm run snapshot
```

Команда `scripts/mirror-reference.mjs` при каждом запуске:

1. Получает актуальные данные и production-ассеты референса.
2. Заменяет бренд и формы имени Кирилл на Вадим.
3. Применяет согласованные заголовки, CTA, тарифы и ссылки.
4. Исправляет типографику первого экрана, включая неразрывные пробелы.
5. Сохраняет данные в `public/api/site.json`.
6. Загружает изображения офферов в `public/media/offers/`.

После публикации тексты и изображения офферов отдаются с нашего домена. Видео
пока используют исходный video endpoint. Если API, схема данных или загрузка
изображения недоступны, snapshot и deploy завершаются с ошибкой — предыдущий
immutable-релиз остаётся активным.

Не редактируйте `public/api/site.json` вручную без соответствующего изменения
`scripts/mirror-reference.mjs`: следующая сборка перезапишет snapshot.

## Локальная разработка

Требуется Node.js 22+.

```bash
npm install
npm run snapshot
npm run dev
```

`npm run dev` использует уже существующий snapshot. Production-сборка всегда
обновляет его автоматически:

```bash
npm run build
```

Команда выполняет `snapshot`, `astro check` и `astro build`. Результат находится
в `dist/` и рассчитан на path prefix `/mentorship/`.

Если Node.js на хосте отсутствует:

```bash
docker run --rm \
  --user "$(id -u):$(id -g)" \
  --env npm_config_cache=/tmp/npm-cache \
  --volume "$PWD:/workspace" \
  --workdir /workspace \
  node:22.20.0-alpine3.22 \
  sh -lc 'npm install && npm run build'
```

## Проверка перед публикацией

Минимальная проверка:

```bash
npm run build
git diff --check
```

В браузере необходимо проверить ширины `1440×900`, `1024×768` и `390×844`:

- отсутствие горизонтального скролла и наложений;
- шапку, якоря и все Telegram CTA;
- роадмап, фильтры обучения и FAQ;
- тарифы, гарантии и договоры;
- анимацию финального маршрута и `prefers-reduced-motion`;
- отсутствие висячих коротких предлогов и союзов на первом экране;
- состав секций, соответствующий активной ветке.

## Публикация

Из корня репозитория:

```bash
./infra/ansible/deploy.sh
```

Deploy выполняет production-сборку в Docker, создаёт release ID из текущего
Git SHA и времени, загружает `dist/` на сервер и атомарно переключает symlink
`current`.

Релизы хранятся в:

```text
/srv/professorit-mentorship/releases/<release-id>
/srv/professorit-mentorship/current
```

Сохраняются пять последних immutable-релизов. Основной Nginx проекта
`site-proffessor-it` монтирует `current` read-only и публикует его по пути
`/mentorship/`.

После deploy проверьте HTTP 200:

```bash
curl -I https://professorit.ru/mentorship/
curl -I https://professorit.ru/mentorship/api/site.json
```

## Публичные интерфейсы

- Страница: `https://professorit.ru/mentorship/`
- Snapshot: `https://professorit.ru/mentorship/api/site.json`
- Telegram CTA: `https://t.me/proffessor_it`
- MAX: `https://max.ru/u/f9LHodD0cOKSwTkPJdylbGaluZM4miWZqbpMcBD7uTVI8UGfJLvPabOTi08`
- Базовый URL сборки: переменная `PUBLIC_SITE_URL`
- Path prefix: `/mentorship` в `astro.config.mjs`

Оригинальный frontend может отправлять необязательные события в `/api/track`.
Отсутствие этого endpoint не влияет на работу статической страницы.
