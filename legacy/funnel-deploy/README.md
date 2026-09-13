# Legacy production deployment

> Этот документ относится к выведенному немецкому контуру и сохранён только
> для истории. Текущий deploy выполняется через `infra/ansible/deploy.sh` в VM
> 201. См. корневой `README.md` и `infra/ansible/README.md`. Команды ниже не
> применять к production.

The public path is:

`professorit.ru → Traefik on robots-dev1 → TCP forwarder → site container in VM`.

The container listens only on the VM-private interface at
`192.168.122.10:18080`. Public TLS and domain routing are owned by Traefik on
the host. The TCP forwarder is a transport bridge to the VM; there is no
additional VM Nginx proxy between Traefik and the static site.

The running `professorit-site` container serves the host directory
`/srv/proffessor-it/site-preview-current`. Deploy the generated `dist/`
content to that directory. `/srv/proffessor-it/site` is a legacy checkout and
is not mounted into the production container.

Build and deploy from a checked-out working tree:

```bash
npm run build
rsync -az --delete --exclude='nginx-site.conf' dist/ \
  vm-robots-dev1:/srv/proffessor-it/site-preview-current/
ssh vm-robots-dev1 'docker exec professorit-site nginx -t && \
  docker exec professorit-site nginx -s reload'
```

If `deploy/nginx-site.conf` changed, deploy it separately and restart the
container. The file is bind-mounted directly; an atomic file replacement on
the host creates a new inode that an ordinary Nginx reload does not remount:

```bash
rsync -az deploy/nginx-site.conf \
  vm-robots-dev1:/srv/proffessor-it/site-preview-current/nginx-site.conf
ssh vm-robots-dev1 'docker restart professorit-site >/dev/null && \
  docker exec professorit-site nginx -t'
```

Verify the public response, not only the files on disk:

```bash
curl -fsS https://professorit.ru/payment/failed/
```
