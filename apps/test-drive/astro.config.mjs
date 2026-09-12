import {defineConfig} from 'astro/config';

export default defineConfig({
  site: 'https://professorit.ru',
  output: 'static',
  build: {assets: '_assets'},
});
