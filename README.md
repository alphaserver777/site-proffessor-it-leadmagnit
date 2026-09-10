# Маркетинговый сайт «Профессор IT»

Актуально на 17 августа 2026 года.

Astro-сайт продукта: продажник тест-драйва, четырёхчастный лонгрид, публичная
форма и страницы результата Prodamus. Рабочий backend и CRM находятся в
соседнем репозитории
`/home/admsys/work/professor_it/bot_service_appointment`; стратегия и
операционные инструкции — в
`/home/admsys/work/professor_it/marketing_professorit`.

## Локальный запуск

```bash
npm ci
npm run dev
```

Production build:

```bash
npm run build
```

Основные маршруты:

- `/` — тест-драйв профессии за 1 000 ₽;
- `/guide/kak-voiti-v-it/`, `/2/`, `/3/`, `/4/` — лид-магнит;
- `/payment/success/`, `/payment/failed/` — Prodamus;
- `/resume.html`, `/business.html` — сохранённые legacy-страницы.

## Production

Сайт работает в VM 201 `192.168.50.111` российского Proxmox. TLS завершает
Traefik CT 202. Публикация выполняется immutable-релизом:

```bash
cd infra/ansible
./deploy.sh
```

Не использовать старые rsync-команды на `vm-robots-dev1` и каталог
`site-preview-current`: они относятся к выведенному контуру.

После deploy проверять минимум:

```bash
curl -fsS https://professorit.ru/ >/dev/null
curl -fsS https://professorit.ru/guide/kak-voiti-v-it/ >/dev/null
curl -fsS https://professorit.ru/payment/failed/ >/dev/null
```

Подробности: `infra/ansible/README.md` и
`../marketing_professorit/PLAN/14-production-infrastructure.md`.

## Аналитика

`src/scripts/article-series.ts` сохраняет first-touch UTM/campaign ID и
отправляет события глубины, активного чтения, переходов и CTA в
`POST /api/public/events`. Операционный runbook:
`../marketing_professorit/PLAN/26-site-analytics-runbook.md`.

Непрозрачный `lead_magnet_token`, полученный из персональной ссылки лид-бота,
сохраняется в браузере и переносится по внутренним страницам до формы. Он нужен
CRM для доставки оплаченного доступа через исходный бот и не отправляется во
внешние ссылки или в события аналитики.

## Правила

- секретов и админских токенов во frontend нет;
- CTA и внутренние ссылки сохраняют UTM и `campaign_id`;
- success redirect не подтверждает платёж — это делает webhook;
- изменения выкладываются только из чистого закоммиченного состояния;
- после визуального изменения проверить desktop, 390 px, reduced motion и
  отсутствие CLS/невидимого первого экрана.
