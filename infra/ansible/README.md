# Professor IT: воспроизводимый web-host

Контур разворачивает маркетинговый сайт и четырёхчастный лонгрид на чистой
Ubuntu 24.04 LTS. Единственная привязка к площадке — IP в inventory; playbook
одинаково работает в Proxmox и на обычном VPS.

## Первый запуск

```bash
cd infra/ansible
ansible-playbook provision.yml
```

## Публикация релиза

```bash
cd infra/ansible
./deploy.sh
```

Вход на узел Proxmox выполняется через настроенное имя SSH:

```bash
ssh Proxmox
```

Если рабочая машина не видит внутренний адрес `192.168.50.111` напрямую,
используйте Proxmox как промежуточный узел:

```bash
ssh -J Proxmox deploy@192.168.50.111
```

Для публикации через этот маршрут сначала соберите сайт, затем передайте
Ansible параметр подключения и явный идентификатор выпуска:

```bash
ansible-playbook deploy.yml \
  -e '{"ansible_ssh_common_args":"-o ProxyJump=Proxmox","release_id":"<git-sha>-<YYYYMMDDHHMMSS>"}'
```

Сборка выполняется в зафиксированном контейнере Node.js, поэтому Node/npm не
нужно устанавливать на рабочую машину или production-сервер.

Для установки Ansible на новой управляющей машине:

```bash
python3 -m venv .venv
. .venv/bin/activate
pip install -r requirements.txt
ansible-galaxy collection install -r requirements.yml
```

Релизы находятся в `/srv/professorit/releases`, активный релиз подключён через
атомарную ссылку `/srv/professorit/current`. Хранятся пять последних версий.

## Проверка без переключения DNS

```bash
curl -I -H 'Host: professorit.ru' http://192.168.50.111/
curl -I -H 'Host: professorit.ru' http://192.168.50.111/guide/kak-voiti-v-it/
```

TLS завершается на центральном Traefik LXC `192.168.50.112`; эта VM остаётся
внутренним HTTP backend. Маршрут `/api/public/*` и кабинет используют локальные
контейнеры API/frontend через закрытую сеть `professorit_runtime`.

## Standalone HTTPS fallback

`enable-tls.yml` сохранён только для случая, когда VM разворачивается как
самостоятельный VPS без центрального edge-proxy. В текущем Proxmox-контуре его
не запускать: сертификат выпускает Traefik LXC.

Для отдельного VPS сначала направьте публичные TCP-порты `80` и `443`
непосредственно на VM и измените A-записи. Затем:

```bash
cd infra/ansible
ansible-playbook enable-tls.yml
```

Certbot использует HTTP-01 webroot без остановки контейнера. Обновление
сертификата выполняет системный `certbot.timer`, deploy-hook перечитывает
сертификат внутри Nginx.
