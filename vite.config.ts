import { defineConfig } from 'vite';

// base './' 로 두면 GitHub Pages 하위 경로(/103/)에서도 그대로 동작한다.
export default defineConfig({
  base: './',
  build: {
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      // SINGLE=1 이면 게임 하나만 한 파일로 묶는다 (공유 링크용)
      input: process.env.SINGLE ? { main: 'index.html' } : { main: 'index.html', lab: 'lab.html' },
    },
  },
});
