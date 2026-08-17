# Продажник наставничества «Профессор IT»

Отдельный Astro-сайт основного продукта — точный frontend-mirror принадлежащего
владельцу проекта `site.criminalit.ru`. Переносятся production CSS/JS, шрифты,
темы, анимации, оффер, обучение, гарантии, видео, тарифы, отзывы, офферы,
договоры и FAQ. При сборке бренд меняется на «Профессор IT», а все формы имени
Кирилл — на соответствующие формы имени Вадим.

Команда `npm run snapshot` извлекает текущие production-ассеты и данные
референса. Данные фиксируются в `/mentorship/api/site.json`; production не
обращается к API за текстами после публикации. Изображения офферов и видео пока
загружаются с исходного домена.

## Локальный запуск

```bash
npm install
npm run dev
```

Проверка production-сборки:

```bash
npm run build
```

Если Node.js на хосте отсутствует:

```bash
docker build -t professorit-mentorship-site .
docker run --rm -p 8080:8080 professorit-mentorship-site
```

## Публичный адрес

Публичный адрес сайта: `https://professorit.ru/mentorship/`. Код и контейнер
остаются отдельными, а внешний Nginx направляет только этот путь в продажник.
Базовый домен при необходимости можно передать через `PUBLIC_SITE_URL` во
время сборки; path prefix `/mentorship` задаётся в `astro.config.mjs`.

## Интеграции

- Основной CTA и кнопки тарифов открывают `https://t.me/proffessor_it`.
- Тексты и настройки отдаются локальным snapshot-файлом.
- Контентные изображения и видео используют абсолютные URL исходного домена.
- Оригинальный frontend может отправлять необязательные события в `/api/track`;
  отсутствие этого endpoint не влияет на работу страницы.

## Публикация

Продажник хранит независимые immutable-релизы в
`/srv/professorit-mentorship/releases`, а `/srv/professorit-mentorship/current`
указывает на активную версию. Публикация:

```bash
cd infra/ansible
./deploy.sh
```

Основной Nginx проекта `site-proffessor-it` монтирует это дерево read-only и
отдаёт его по `/mentorship/`.
