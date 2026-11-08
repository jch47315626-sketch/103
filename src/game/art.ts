// 캐릭터를 도형으로 그린다. 웹툰 그림이 준비되면 이 함수들만 스프라이트로 바꾸면 된다.
// 모든 캐릭터는 발끝 중앙이 (0,0).
import Phaser from 'phaser';
import { C } from './theme';

export interface Taeri { root: Phaser.GameObjects.Container; lead: Phaser.GameObjects.Container; rear: Phaser.GameObjects.Container }

function arm(scene: Phaser.Scene, x: number, y: number, len: number, lift: number, sleeve: number) {
  const a = scene.add.container(x, y);
  const g = scene.add.graphics();
  g.lineStyle(11, sleeve, 1);
  g.lineBetween(0, 0, len * 0.5, 10);
  g.lineBetween(len * 0.5, 10, len, lift);
  g.fillStyle(0xf4f4f2, 1).fillCircle(len, lift, 10);
  g.fillStyle(C.red, 1).fillRect(len - 9, lift - 2, 4, 6);
  a.add(g);
  return a;
}

export function drawTaeri(scene: Phaser.Scene, x: number, y: number, scale = 1): Taeri {
  const root = scene.add.container(x, y).setScale(scale);
  const g = scene.add.graphics();
  // 다리
  g.fillStyle(0x23262b, 1).fillRect(-14, -52, 10, 50).fillRect(4, -52, 10, 50);
  g.fillStyle(0xdedede, 1).fillRect(-16, -6, 15, 6).fillRect(3, -6, 15, 6);
  // 몸통 (남색 점퍼 + 빨간 TAERI 자수 줄)
  g.fillStyle(C.jacket, 1).fillRoundedRect(-18, -104, 36, 56, 6);
  g.fillStyle(C.red, 1).fillRect(-18, -80, 36, 4);
  // 머리, 포니테일
  g.fillStyle(0x15151a, 1).fillCircle(-2, -118, 16).fillEllipse(-20, -112, 12, 26);
  g.fillStyle(C.skin, 1).fillCircle(3, -115, 13);
  g.fillStyle(0x15151a, 1).fillRect(-12, -132, 24, 9);
  g.fillStyle(0x15151a, 1).fillCircle(10, -116, 2);
  g.lineStyle(2, 0x0a0a0a, 1).lineBetween(-12, -122, 14, -118); // 안대 끈 (왼쪽 눈은 반대편)
  const rear = arm(scene, -4, -94, 26, -18, 0x18213a);
  const lead = arm(scene, 6, -92, 30, -10, C.jacket);
  root.add([rear, g, lead]);
  return { root, lead, rear };
}

export interface Zombie { root: Phaser.GameObjects.Container; body: Phaser.GameObjects.Graphics; eyes: Phaser.GameObjects.Graphics }

export function drawZombie(scene: Phaser.Scene, x: number, y: number, kind: string, scale = 1): Zombie {
  const root = scene.add.container(x, y).setScale(scale);
  const g = scene.add.graphics();
  const eyes = scene.add.graphics();
  if (kind === 'crawler') {
    g.fillStyle(0x34382f, 1).fillRect(10, -16, 50, 12);
    g.fillStyle(C.zombieDark, 1).fillRoundedRect(-30, -30, 50, 24, 6);
    g.lineStyle(9, C.zombie, 1).lineBetween(-24, -24, -58, -4).lineBetween(-16, -20, -46, -2);
    g.fillStyle(C.zombie, 1).fillCircle(-40, -36, 13);
    eyes.fillStyle(0xfff3a0, 1).fillCircle(-48, -38, 2.4).fillCircle(-41, -39, 2.4);
  } else {
    const big = kind === 'horyong' ? 1.18 : 1;
    root.setScale(scale * big);
    g.fillStyle(0x34382f, 1).fillRect(-12, -54, 10, 52).fillRect(6, -54, 10, 52);
    g.fillStyle(C.zombieDark, 1);
    g.beginPath();
    g.moveTo(-12, -54).lineTo(18, -54).lineTo(10, -106).lineTo(-26, -100).closePath().fillPath();
    g.fillStyle(0x6b2a2a, 0.8).fillRect(-14, -84, 8, 14);
    g.lineStyle(10, C.zombie, 1).lineBetween(-14, -96, -52, -84).lineBetween(-4, -98, -46, -94);
    g.fillStyle(C.zombie, 1).fillCircle(-54, -84, 6).fillCircle(-48, -94, 6);
    g.fillStyle(C.zombie, 1).fillCircle(-18, -116, 14);
    g.fillStyle(0x2b2b26, 1).fillRect(-30, -130, 26, 7);
    if (kind === 'horyong') {
      eyes.fillStyle(0xfff3a0, 1).fillCircle(-27, -118, 2.8);
      eyes.lineStyle(3, 0x2b2b26, 1).lineBetween(-22, -124, -14, -112);
    } else {
      eyes.fillStyle(0xfff3a0, 1).fillCircle(-27, -118, 2.4).fillCircle(-19, -119, 2.4);
    }
  }
  root.add([g, eyes]);
  return { root, body: g, eyes };
}

// ---------- 1인칭 전투용 ----------

export interface ZombieFront {
  root: Phaser.GameObjects.Container;
  head: Phaser.GameObjects.Container;
  eyes: Phaser.GameObjects.Graphics;
  /** 화면 왼쪽 팔 / 오른쪽 팔 — 어깨가 회전축 */
  armL: Phaser.GameObjects.Container;
  armR: Phaser.GameObjects.Container;
  /** 그림 파일 한 장으로 된 상대 (머리·팔을 따로 움직일 수 없다) */
  image?: Phaser.GameObjects.Image;
}

/** public/img 의 그림으로 만든 싸움 상대. 화면 아래 몸통 중심이 (0,0) */
export function imageZombie(scene: Phaser.Scene, x: number, y: number, key: string, low = false): ZombieFront {
  const root = scene.add.container(x, y);
  const image = scene.add.image(0, 70, key).setOrigin(0.5, 1);
  image.setScale((low ? 300 : 420) / image.height);
  const head = scene.add.container(0, low ? -40 : -200);
  const eyes = scene.add.graphics();
  head.add(eyes);
  const armL = scene.add.container(-110, -120);
  const armR = scene.add.container(110, -120);
  root.add([image, head, armL, armR]);
  return { root, head, eyes, armL, armR, image };
}

function zArm(scene: Phaser.Scene, x: number, y: number, side: -1 | 1, low: boolean) {
  const c = scene.add.container(x, y);
  const g = scene.add.graphics();
  if (low) {
    g.lineStyle(26, C.zombie).lineBetween(0, 0, side * 100, 70);
    g.fillStyle(C.zombie).fillCircle(side * 106, 76, 24);
  } else {
    g.lineStyle(30, C.zombie).lineBetween(0, 0, side * 65, 80);
    g.lineStyle(38, C.zombie).lineBetween(side * 65, 80, side * 95, 150);
    g.fillStyle(0x8f9b88).fillCircle(side * 98, 156, 30);
  }
  c.add(g);
  return c;
}

/** 원작 인물의 감염 후 모습. 눈은 핏빛, 동공은 바늘 끝처럼. */
export interface Look { shirt: number; skin: number; low?: boolean; tie?: number; apron?: number; glove?: number; lanyard?: number; blood?: number; hair?: number }
export const LOOKS: Record<string, Look> = {
  suit1501: { shirt: 0x1f2a44, skin: 0xa9a28f, tie: 0x8a8d92, blood: 0.5 },
  suitStairs: { shirt: 0x1f2a44, skin: 0xa9a28f, low: true, blood: 0.6 },
  apron: { shirt: 0x5c5f6e, skin: 0xb3a998, apron: 0xd8cfbb, glove: 0xf2c94c, hair: 0x3a2a22, blood: 0.3 },
  doyun: { shirt: 0xe8e6e1, skin: 0xb8ae9c, lanyard: 0x3b6fd1, blood: 1 },
  // 제5화 11층 복도
  hiker: { shirt: 0xb3412e, skin: 0xb0a690, hair: 0x2a2420, blood: 0.4 },
  pajama: { shirt: 0x7d8fb3, skin: 0xb5ab98, blood: 0.6 },
  worker: { shirt: 0x5a6148, skin: 0xa69c88, blood: 0.5 },
};

/** 정면을 보고 다가오는 감염자. 화면 아래 몸통 중심이 (0,0). */
export function drawZombieFront(scene: Phaser.Scene, x: number, y: number, kind: string): ZombieFront {
  const look = LOOKS[kind];
  if (look) return drawLook(scene, x, y, look);
  const root = scene.add.container(x, y);
  const body = scene.add.graphics();
  const low = kind === 'crawler';
  const head = scene.add.container(0, low ? -40 : -200);
  const hg = scene.add.graphics();
  const eyes = scene.add.graphics();
  let armL: Phaser.GameObjects.Container, armR: Phaser.GameObjects.Container;

  if (low) {
    body.fillStyle(C.zombieDark).fillEllipse(0, 10, 260, 90);
    armL = zArm(scene, -90, -10, -1, true);
    armR = zArm(scene, 90, -10, 1, true);
  } else {
    if (kind === 'horyong') root.setScale(1.15);
    body.fillStyle(C.zombieDark);
    body.beginPath();
    body.moveTo(-120, -130).lineTo(120, -130).lineTo(150, 40).lineTo(-150, 40).closePath().fillPath();
    body.fillStyle(0x6b2a2a, 0.85).fillEllipse(-40, -80, 30, 46).fillEllipse(56, -40, 22, 30);
    body.fillStyle(C.zombie).fillRect(-26, -160, 52, 36);
    armL = zArm(scene, -110, -120, -1, false);
    armR = zArm(scene, 110, -120, 1, false);
  }

  hg.fillStyle(C.zombie).fillEllipse(0, 0, 104, 124);
  hg.fillStyle(0x2b2b26).fillEllipse(0, -46, 110, 46);
  hg.fillStyle(0x2b2b26).fillRect(-54, -50, 14, 50).fillRect(40, -50, 12, 44);
  hg.fillStyle(0x1a0d0d).fillEllipse(0, 34, 44, 30); // 벌린 입
  hg.fillStyle(0xd8d2b8);
  for (let i = -2; i <= 2; i++) hg.fillTriangle(i * 8 - 4, 21, i * 8 + 4, 21, i * 8, 29);
  hg.fillStyle(0x3a3f36).fillEllipse(-22, -4, 30, 20).fillEllipse(22, -4, 30, 20);
  if (kind === 'horyong') {
    eyes.fillStyle(0xfff3a0).fillCircle(22, -4, 7);
    hg.lineStyle(5, 0x2b2b26).lineBetween(-36, -22, -10, 14); // 감긴 왼눈의 흉터
  } else {
    eyes.fillStyle(0xfff3a0).fillCircle(-22, -4, 6).fillCircle(22, -4, 6);
  }
  head.add([hg, eyes]);
  root.add([body, head, armL, armR]);
  return { root, head, eyes, armL, armR };
}

function drawLook(scene: Phaser.Scene, x: number, y: number, L: Look): ZombieFront {
  const root = scene.add.container(x, y);
  const body = scene.add.graphics();
  const low = !!L.low;
  const head = scene.add.container(0, low ? -40 : -200);
  const hg = scene.add.graphics();
  const eyes = scene.add.graphics();
  const arm = (ax: number, ay: number, side: -1 | 1) => {
    const c = scene.add.container(ax, ay);
    const g = scene.add.graphics();
    if (low) {
      g.lineStyle(26, L.shirt).lineBetween(0, 0, side * 100, 70);
      g.fillStyle(L.skin).fillCircle(side * 106, 76, 22);
    } else {
      g.lineStyle(32, L.shirt).lineBetween(0, 0, side * 65, 80);
      g.lineStyle(36, L.shirt).lineBetween(side * 65, 80, side * 92, 140);
      const hand = L.glove && side < 0 ? L.glove : L.skin; // 고무장갑 한 짝
      g.fillStyle(hand).fillCircle(side * 96, 152, 28);
    }
    c.add(g);
    return c;
  };
  if (low) {
    body.fillStyle(L.shirt).fillEllipse(0, 10, 260, 90);
  } else {
    body.fillStyle(L.shirt);
    body.beginPath();
    body.moveTo(-120, -130).lineTo(120, -130).lineTo(150, 40).lineTo(-150, 40).closePath().fillPath();
    if (L.apron) { body.fillStyle(L.apron).fillRoundedRect(-80, -110, 160, 150, 14); body.lineStyle(4, L.apron).lineBetween(-60, -110, -30, -150).lineBetween(60, -110, 30, -150); }
    if (L.tie) body.fillStyle(L.tie).fillTriangle(-12, -130, 12, -130, 0, -40);
    if (L.blood) {
      // 왼쪽 목덜미에서 가슴까지 번진 얼룩
      body.fillStyle(0x6b1d1d, 0.85 * L.blood).fillEllipse(-40, -95, 70, 70 * (1 + L.blood));
      body.fillStyle(0x4a1414, 0.7 * L.blood).fillEllipse(-20, -40, 90 * L.blood, 60 * L.blood);
    }
    body.fillStyle(L.skin).fillRect(-26, -160, 52, 36);
    if (L.blood && L.blood >= 1) body.fillStyle(0x2a0f0f).fillEllipse(-18, -150, 24, 20); // 뜯긴 목
    if (L.lanyard) { body.lineStyle(5, L.lanyard).lineBetween(-22, -132, 6, -96).lineBetween(22, -132, 30, -112); } // 끊어진 파란 목줄
  }
  const armL = arm(low ? -90 : -110, low ? -10 : -120, -1);
  const armR = arm(low ? 90 : 110, low ? -10 : -120, 1);
  hg.fillStyle(L.skin).fillEllipse(0, 0, 100, 122);
  hg.fillStyle(L.hair ?? 0x1e1e1e).fillEllipse(0, -44, 108, 44);
  if (L.hair) hg.fillStyle(L.hair).fillRect(-54, -46, 16, 70).fillRect(38, -46, 16, 70);
  hg.fillStyle(0x1a0d0d).fillEllipse(0, 34, 40, 26);
  hg.fillStyle(0xd8d2b8);
  for (let i = -2; i <= 2; i++) hg.fillTriangle(i * 7 - 3, 23, i * 7 + 3, 23, i * 7, 30);
  hg.fillStyle(0xb31b1b).fillEllipse(-22, -4, 26, 16).fillEllipse(22, -4, 26, 16); // 흰자위가 전부 핏빛
  eyes.fillStyle(0x000000).fillCircle(-22, -4, 2).fillCircle(22, -4, 2); // 바늘 끝 동공
  head.add([hg, eyes]);
  root.add([body, head, armL, armR]);
  return { root, head, eyes, armL, armR };
}

export interface Gloves {
  lead: Phaser.GameObjects.Container;
  rear: Phaser.GameObjects.Container;
  leadHome: { x: number; y: number };
  rearHome: { x: number; y: number };
}

function glove(scene: Phaser.Scene, x: number, y: number, flip: number, imageKey?: string | null) {
  const c = scene.add.container(x, y);
  if (imageKey) {
    // 주먹 그림: 화면 아래 모서리에서 올라오는 구도
    const im = scene.add.image(0, 0, imageKey).setOrigin(0.5, 0.3);
    im.setScale(280 / im.height);
    c.add(im);
    return c;
  }
  const g = scene.add.graphics();
  // 팔뚝 (화면 아래로 이어짐)
  g.fillStyle(C.jacket).fillRoundedRect(-34, 30, 68, 140, 20);
  g.fillStyle(C.red).fillRect(-34, 52, 68, 6);
  // 붕대 감은 주먹
  g.fillStyle(0xf4f4f2).fillRoundedRect(-46, -40, 92, 86, 30);
  g.lineStyle(2, 0xcfcfca);
  for (let i = 0; i < 4; i++) g.lineBetween(-42, -20 + i * 16, 42, -26 + i * 16);
  g.fillStyle(0xe7e7e2).fillRoundedRect(flip > 0 ? 24 : -46, -10, 22, 34, 8); // 엄지 (안쪽)
  g.fillStyle(C.red).fillRect(-38, 34, 76, 10);
  c.add(g);
  return c;
}

export function drawGloves(scene: Phaser.Scene, cx: number, y: number, images: { left?: string | null; right?: string | null } = {}): Gloves {
  const leadHome = { x: cx - 150, y };
  const rearHome = { x: cx + 170, y: y + 20 };
  const lead = glove(scene, leadHome.x, leadHome.y, 1, images.left).setAngle(8);
  const rear = glove(scene, rearHome.x, rearHome.y, -1, images.right).setAngle(-8);
  return { lead, rear, leadHome, rearHome };
}
