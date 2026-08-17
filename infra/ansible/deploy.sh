#!/usr/bin/env bash
set -euo pipefail

script_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
repo_root="$(cd -- "${script_dir}/../.." && pwd)"
release_id="$(git -C "${repo_root}" rev-parse --short HEAD)-$(date +%Y%m%d%H%M%S)"

docker run --rm \
  --user "$(id -u):$(id -g)" \
  --env npm_config_cache=/tmp/npm-cache \
  --volume "${repo_root}:/workspace" \
  --workdir /workspace \
  node:22.20.0-alpine3.22 \
  sh -lc 'npm install && npm run build'

cd "${script_dir}"
ansible-playbook deploy.yml -e "release_id=${release_id}"

printf 'Published mentorship release %s\n' "${release_id}"
