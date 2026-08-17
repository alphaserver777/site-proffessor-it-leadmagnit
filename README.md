# Продажник наставничества «Профессор IT»

Отдельный Astro-сайт основного продукта: индивидуального инженерного
наставничества по DevOps, информационной безопасности и этичному пентесту.
Он не заменяет `professorit.ru`: первый сайт ведёт холодного посетителя через
карту и тест-драйв, этот продаёт основной трек прогретому лиду.

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

- Основной CTA открывает Telegram с заготовленным первым сообщением.
- Клики CTA отправляются в `/api/public/events` как
  `mentorship_cta_clicked`.
- Nginx ожидает backend `professorit-api:8000` в общей Docker-сети. При
  отдельном размещении блок `/api/public/` нужно направить на доступный API.
- Фото временно загружается с `professorit.ru`, чтобы не дублировать бинарный
  исходник. Перед production желательно положить оригинал в `public/images/`.

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

## Что нельзя публиковать без подтверждения

- вымышленные отзывы, логотипы работодателей и суммы офферов;
- гарантии трудоустройства или дохода;
- неподтверждённые кейсы учеников;
- секреты API, Telegram или платёжной системы.
