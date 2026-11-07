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
