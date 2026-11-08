import fs from 'node:fs';
import path from 'node:path';
import { defineConfig, type Plugin } from 'vite';

/** public/img/ 에 있는 그림 파일 목록을 'virtual:img-list' 로 내보낸다. 파일을 넣으면 개발 서버가 새로고침된다. */
function imgList(): Plugin {
  const id = 'virtual:img-list';
  const rid = '\0' + id;
  const dir = path.resolve('public/img');
  return {
    name: 'img-list',
    resolveId: (s) => (s === id ? rid : undefined),
    load(s) {
      if (s !== rid) return;
      let files: string[] = [];
      try { files = fs.readdirSync(dir).filter((f) => /\.(png|jpe?g|webp)$/i.test(f)); } catch { /* 폴더 없음 */ }
      return `export default ${JSON.stringify(files)};`;
    },
    configureServer(server) {
      server.watcher.add(dir);
      const refresh = (f: string) => {
        if (!f.startsWith(dir)) return;
        const m = server.moduleGraph.getModuleById(rid);
        if (m) server.moduleGraph.invalidateModule(m);
        server.ws.send({ type: 'full-reload' });
      };
      server.watcher.on('add', refresh);
      server.watcher.on('unlink', refresh);
    },
  };
}

// base './' 로 두면 GitHub Pages 하위 경로(/103/)에서도 그대로 동작한다.
export default defineConfig({
  base: './',
  plugins: [imgList()],
  build: { chunkSizeWarningLimit: 2000 },
});
