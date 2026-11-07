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
}

/** 정면을 보고 다가오는 감염자. 발이 아니라 화면 아래 몸통 중심이 (0,0). */
export function drawZombieFront(scene: Phaser.Scene, x: number, y: number, kind: string): ZombieFront {
  const root = scene.add.container(x, y);
  const body = scene.add.graphics();
  const head = scene.add.container(0, kind === 'crawler' ? -40 : -200);
  const hg = scene.add.graphics();
  const eyes = scene.add.graphics();

  if (kind === 'crawler') {
    // 바닥에 엎드려 기어 온다: 어깨와 머리가 낮고, 두 팔이 바닥을 짚고 앞으로 뻗는다
    body.fillStyle(C.zombieDark).fillEllipse(0, 10, 260, 90);
    body.lineStyle(26, C.zombie).lineBetween(-90, -10, -190, 60).lineBetween(90, -10, 190, 60);
    body.fillStyle(C.zombie).fillCircle(-196, 66, 24).fillCircle(196, 66, 24);
  } else {
    const big = kind === 'horyong' ? 1.15 : 1;
    root.setScale(big);
    body.fillStyle(C.zombieDark);
    body.beginPath();
    body.moveTo(-120, -130).lineTo(120, -130).lineTo(150, 40).lineTo(-150, 40).closePath().fillPath();
    body.fillStyle(0x6b2a2a, 0.85).fillEllipse(-40, -80, 30, 46).fillEllipse(56, -40, 22, 30);
    body.fillStyle(C.zombie).fillRect(-26, -160, 52, 36);
    // 카메라 쪽으로 뻗는 두 팔 (가까울수록 크다)
    body.lineStyle(30, C.zombie).lineBetween(-110, -120, -175, -40);
    body.lineStyle(38, C.zombie).lineBetween(-175, -40, -205, 30);
    body.lineStyle(30, C.zombie).lineBetween(110, -120, 170, -50);
    body.lineStyle(38, C.zombie).lineBetween(170, -50, 200, 20);
    body.fillStyle(0x8f9b88).fillCircle(-208, 36, 30).fillCircle(203, 26, 30);
  }

  // 머리
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
  root.add([body, head]);
  return { root, head, eyes };
}

export interface Gloves {
  lead: Phaser.GameObjects.Container;
  rear: Phaser.GameObjects.Container;
  leadHome: { x: number; y: number };
  rearHome: { x: number; y: number };
}

function glove(scene: Phaser.Scene, x: number, y: number, flip: number) {
  const c = scene.add.container(x, y);
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

export function drawGloves(scene: Phaser.Scene, cx: number, y: number): Gloves {
  const leadHome = { x: cx - 150, y };
  const rearHome = { x: cx + 170, y: y + 20 };
  const lead = glove(scene, leadHome.x, leadHome.y, 1).setAngle(8);
  const rear = glove(scene, rearHome.x, rearHome.y, -1).setAngle(-8);
  return { lead, rear, leadHome, rearHome };
}
