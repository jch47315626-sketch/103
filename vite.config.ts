import { defineConfig } from 'vite';

// base './' 로 두면 GitHub Pages 하위 경로(/103/)에서도 그대로 동작한다.
export default defineConfig({
  base: './',
});
