// public/img/ 에 넣은 그림을 찾아 게임의 그림 자리(imageSlots.json)에 끼운다.
// 그림이 없으면 null — 그 자리는 지금처럼 도형으로 그린다.
import Phaser from 'phaser';
import files from 'virtual:img-list';
import slots from './imageSlots.json';

const SLOT_FILES = new Map<string, string[]>();
for (const g of slots.groups) for (const s of g.slots) SLOT_FILES.set(s.slot, s.files);

/** 이름(확장자 뺀 것) → 파일 이름 */
const AVAILABLE = new Map<string, string>();
for (const f of files) AVAILABLE.set(f.replace(/\.[^.]+$/, ''), f);

export const hasAnyImage = AVAILABLE.size > 0;

/** 처음 화면의 preload 에서 한 번 부른다 */
export function preloadImages(scene: Phaser.Scene) {
  for (const [name, file] of AVAILABLE) {
    if (!scene.textures.exists(name)) scene.load.image(name, `img/${file}`);
  }
}

/** 그림 자리에 쓸 텍스처 이름. 없으면 null */
export function slotKey(scene: Phaser.Scene, slot: string): string | null {
  for (const name of SLOT_FILES.get(slot) ?? []) if (scene.textures.exists(name)) return name;
  return null;
}

/** 가로세로를 꽉 채우도록 키우고 가운데를 잘라 낸다 (CSS의 object-fit: cover) */
export function coverImage(scene: Phaser.Scene, key: string, x: number, y: number, w: number, h: number) {
  const img = scene.add.image(x + w / 2, y + h / 2, key);
  const s = Math.max(w / img.width, h / img.height);
  const cw = w / s, ch = h / s;
  img.setCrop((img.width - cw) / 2, (img.height - ch) / 2, cw, ch).setScale(s);
  return img;
}

/** 높이를 맞춰 세운다 (서 있는 그림, 싸움 상대) */
export function fitHeight(scene: Phaser.Scene, key: string, x: number, bottom: number, h: number) {
  const img = scene.add.image(x, bottom, key).setOrigin(0.5, 1);
  img.setScale(h / img.height);
  return img;
}
