#!/usr/bin/env bash
set -euo pipefail

script_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
repo_root="$(cd -- "${script_dir}/../.." && pwd)"
branch="$(git -C "${repo_root}" branch --show-current)"

if [[ "${branch}" != "main" ]]; then
  printf 'Публикация разрешена только из main, текущая ветка: %s\n' "${branch}" >&2
  exit 1
fi

if [[ -n "$(git -C "${repo_root}" status --porcelain --untracked-files=normal)" ]]; then
  printf 'Публикация остановлена: в рабочем дереве есть незакоммиченные файлы.\n' >&2
  exit 1
fi

release_id="$(git -C "${repo_root}" rev-parse --short HEAD)-$(date +%Y%m%d%H%M%S)"
asset_version="$(git -C "${repo_root}" rev-parse HEAD)"

docker run --rm \
  --user "$(id -u):$(id -g)" \
  --env npm_config_cache=/tmp/npm-cache \
  --env ASSET_VERSION="${asset_version}" \
  --volume "${repo_root}:/workspace" \
  --workdir /workspace \
  node:22.20.0-alpine3.22 \
  sh -lc 'npm ci && npm run build'

cd "${script_dir}"
ansible-playbook deploy.yml -e "release_id=${release_id}"

printf 'Published release %s\n' "${release_id}"
