// 이야기 장면의 배경. 웹툰 그림이 준비되면 같은 이름의 이미지로 바꾸면 된다.
import Phaser from 'phaser';
import { coverImage, slotKey } from '../game/images';
import { C, text, W } from '../game/theme';
import type { Bg } from './script';

const AREA_H = 380; // 아래 글상자 위까지

export function drawBg(scene: Phaser.Scene, layer: Phaser.GameObjects.Container, bg: Bg) {
  layer.removeAll(true);
  // public/img 에 그림이 있으면 그걸 쓴다
  const img = slotKey(scene, `bg:${bg}`);
  if (img) {
    layer.add(coverImage(scene, img, 0, 0, W, AREA_H));
    if (bg === 'gymNight') layer.add(scene.add.rectangle(0, 0, W, AREA_H, 0x05060a, 0.75).setOrigin(0)); // 새벽 세 시
    return;
  }
  const g = scene.add.graphics();
  layer.add(g);
  const add = (o: Phaser.GameObjects.GameObject) => layer.add(o);
  const pulse = (o: Phaser.GameObjects.GameObject & { alpha: number }, a = 0.3, d = 900) =>
    scene.tweens.add({ targets: o, alpha: a, duration: d, yoyo: true, repeat: -1 });

  switch (bg) {
    case 'black':
      g.fillStyle(0x050506).fillRect(0, 0, W, AREA_H);
      break;

    case 'dawn': {
      // 해무 덮인 한마음 아파트, 멀리 구급차 경광등
      g.fillGradientStyle(0x0b1220, 0x0b1220, 0x26303d, 0x26303d).fillRect(0, 0, W, AREA_H);
      for (let i = 0; i < 6; i++) {
        const x = 40 + i * 160, h = 180 + (i % 3) * 40;
        g.fillStyle(0x0e141c).fillRect(x, AREA_H - h, 110, h);
        for (let f = 0; f < 8; f++) for (let k = 0; k < 4; k++) {
          if ((i * 7 + f * 3 + k) % 11 === 0) g.fillStyle(0xffb35c, 0.5).fillRect(x + 10 + k * 24, AREA_H - h + 14 + f * 22, 10, 7);
        }
      }
      g.fillStyle(C.paper).fillRect(330, AREA_H - 236, 34, 14);
      add(text(scene, 347, AREA_H - 229, '103', 10, '#222', { fontStyle: '700' }).setOrigin(0.5));
      for (let i = 0; i < 5; i++) {
        const fog = scene.add.ellipse(100 + i * 220, AREA_H - 40 - (i % 2) * 30, 520, 90, 0xb8c2cc, 0.12);
        add(fog);
        scene.tweens.add({ targets: fog, x: fog.x + 60, duration: 7000 + i * 900, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
      }
      const siren = scene.add.ellipse(860, AREA_H - 30, 160, 60, 0xff3030, 0.0);
      add(siren);
      scene.tweens.add({ targets: siren, fillAlpha: 0.35, duration: 380, yoyo: true, repeat: -1 });
      break;
    }

    case 'mirror': {
      g.fillStyle(0x1d2128).fillRect(0, 0, W, AREA_H);
      g.fillStyle(0xbfc6cf, 0.25).fillRect(330, 30, 300, 330);
      g.lineStyle(6, 0x3a3f48).strokeRect(330, 30, 300, 330);
      // 거울 속: 교복, 안대
      g.fillStyle(0x1f2a44).fillRoundedRect(430, 190, 100, 170, 14);
      g.fillStyle(0xe8e6e1).fillTriangle(450, 190, 510, 190, 480, 240);
      g.fillStyle(C.red).fillTriangle(468, 232, 492, 232, 480, 252);
      g.fillStyle(C.skin).fillCircle(480, 150, 34);
      g.fillStyle(0x15151a).fillCircle(474, 128, 38).fillStyle(C.skin).fillCircle(482, 156, 30);
      g.fillStyle(0x111111).fillEllipse(468, 150, 22, 16).lineStyle(3, 0x111111).lineBetween(452, 146, 512, 140);
      g.fillStyle(0x15151a).fillCircle(496, 152, 3);
      break;
    }

    case 'door': {
      // 1502호 현관 안쪽: 철문, 도어락, 외시경
      g.fillStyle(0x2a2d32).fillRect(0, 0, W, AREA_H);
      g.fillStyle(0x4b5058).fillRect(300, 10, 360, 370);
      g.fillStyle(0x5d636c).fillRect(316, 26, 328, 354);
      g.fillStyle(0x1b1d20).fillCircle(480, 120, 9);
      g.lineStyle(2, 0x8a9099).strokeCircle(480, 120, 14);
      g.fillStyle(0x23262b).fillRoundedRect(560, 180, 60, 120, 8);
      g.fillStyle(0x8a9099).fillRoundedRect(540, 236, 90, 14, 6);
      g.fillStyle(0x7fd1ff, 0.6).fillRect(575, 196, 30, 8);
      g.fillStyle(0x1a1c20).fillRect(0, 340, W, 40);
      break;
    }

    case 'peep':
    case 'peep1501': {
      // 외시경: 볼록하게 휘어진 복도
      g.fillStyle(0x000000).fillRect(0, 0, W, AREA_H);
      const cx = W / 2, cy = 190, r = 170;
      const mask = scene.make.graphics({}, false).fillCircle(cx, cy, r);
      const view = scene.add.graphics();
      view.fillStyle(0x3b3428).fillCircle(cx, cy, r);
      view.fillStyle(0x2d2820).fillEllipse(cx, cy + 120, 380, 140);
      view.fillStyle(0x4a4236).fillEllipse(cx - 110, cy - 10, 120, 300).fillEllipse(cx + 120, cy - 10, 120, 300);
      if (bg === 'peep') {
        // 도윤: 하얀 와이셔츠, 왼쪽 목덜미의 피, 철문을 짚은 손
        view.fillStyle(0xe8e6e1).fillEllipse(cx, cy + 90, 170, 200);
        view.fillStyle(0x6b1d1d, 0.95).fillEllipse(cx - 30, cy + 50, 70, 130);
        view.fillStyle(0xc9b9a6).fillCircle(cx, cy - 30, 52);
        view.fillStyle(0x1e1e1e).fillEllipse(cx, cy - 64, 110, 46);
        view.fillStyle(0xb31b1b).fillEllipse(cx - 18, cy - 30, 18, 10).fillEllipse(cx + 18, cy - 30, 18, 10);
        view.fillStyle(0x2a0f0f).fillEllipse(cx - 40, cy + 18, 30, 26);
        view.fillStyle(0x8a2020, 0.8).fillCircle(cx + 40, cy + 100, 26); // 피 묻은 손바닥
        view.fillStyle(0x3a2a20).fillEllipse(cx + 120, cy + 140, 80, 26); // 1501호 남자
      } else {
        view.fillStyle(0x1f2a44).fillEllipse(cx + 40, cy + 120, 160, 50);
        view.fillStyle(0xa9a28f).fillCircle(cx - 40, cy + 110, 26);
        view.fillStyle(0x5a0f0f, 0.9).fillEllipse(cx - 70, cy + 140, 120, 30);
        view.fillStyle(0x3b6fd1).fillRect(cx - 140, cy + 128, 30, 6); // 끊어진 목줄의 사원증
      }
      view.setMask(mask.createGeometryMask());
      add(view);
      const ring = scene.add.graphics();
      ring.lineStyle(30, 0x000000, 0.7).strokeCircle(cx, cy, r - 10);
      add(ring);
      const tint = scene.add.circle(cx, cy, r, 0x8a0000, 0.0);
      add(tint);
      if (bg === 'peep') scene.tweens.add({ targets: tint, fillAlpha: 0.22, duration: 2200, yoyo: true, repeat: -1 });
      break;
    }

    case 'hall': {
      g.fillStyle(C.concrete).fillRect(0, 0, W, 300);
      g.fillStyle(C.floor).fillRect(0, 300, W, 80);
      for (let i = 0; i < 4; i++) {
        g.fillStyle(C.doorDark).fillRect(40 + i * 250, 120, 100, 180);
        g.fillStyle(C.door).fillRect(48 + i * 250, 128, 84, 172);
        g.fillStyle(C.paper).fillRect(64 + i * 250, 98, 52, 16);
        add(text(scene, 90 + i * 250, 106, `150${i + 1}`, 11, '#222', { fontStyle: '700' }).setOrigin(0.5));
      }
      g.fillStyle(0x8a2b2b).fillRect(860, 170, 60, 80);
      g.fillStyle(0x5a0f0f, 0.8).fillEllipse(200, 320, 220, 30);
      g.fillStyle(0x1f2a44).fillEllipse(170, 300, 140, 40); // 1501호 남자
      g.fillStyle(0x8a8d92).fillTriangle(210, 290, 222, 290, 216, 316);
      const lamp = scene.add.rectangle(W / 2, 6, 300, 6, 0xfff6d8);
      add(lamp);
      pulse(lamp, 0.5, 120);
      break;
    }

    case 'stairs':
    case 'stairsDown': {
      g.fillStyle(0x0c120f).fillRect(0, 0, W, AREA_H);
      for (let i = 0; i < 10; i++) {
        const w = 700 - i * 60, y = 360 - i * 30;
        const c = 46 - i * 3;
        g.fillStyle(Phaser.Display.Color.GetColor(c, c + 6, c + 4)).fillRect(W / 2 - w / 2, y, w, 26);
      }
      g.lineStyle(5, 0x5a605c).lineBetween(820, 360, 700, 80);
      g.fillStyle(0x1f9a4a).fillRect(120, 50, 90, 32);
      g.fillStyle(0xe8ffe8).fillCircle(140, 64, 5).fillRect(150, 62, 44, 5);
      const glow = scene.add.ellipse(165, 66, 420, 260, 0x2ecc71, 0.1);
      add(glow);
      if (bg === 'stairsDown') {
        // 난간 틈: 아래층마다 난간을 쥔 손
        g.fillStyle(0x000000).fillRect(W / 2 - 24, 60, 48, 300);
        for (let i = 0; i < 8; i++) g.fillStyle(0x7f8c78, 0.9 - i * 0.1).fillCircle(W / 2 + (i % 2 ? 18 : -18), 330 - i * 34, 9 - i * 0.6);
      }
      break;
    }

    case 'kitchen': {
      g.fillStyle(0x1b1d22).fillRect(0, 0, W, AREA_H);
      g.fillStyle(0xdfe6ea).fillRect(330, 30, 300, 340);
      g.fillStyle(0xf4fbff).fillRect(345, 45, 270, 310);
      for (let i = 1; i < 4; i++) g.lineStyle(3, 0xc8d2d8).lineBetween(345, 45 + i * 78, 615, 45 + i * 78);
      for (let i = 0; i < 6; i++) {
        g.fillStyle(0xbfe3ff, 0.85).fillRoundedRect(370 + i * 40, 270, 26, 70, 6);
        g.fillStyle(0x3b82c4).fillRect(374 + i * 40, 262, 18, 10);
      }
      g.fillStyle(0xd8d33a).fillEllipse(560, 210, 30, 22); // 쭈그러든 레몬
      add(scene.add.rectangle(480, 200, 300, 340, 0xffffff, 0.06));
      break;
    }

    case 'night': {
      g.fillStyle(0x07080b).fillRect(0, 0, W, AREA_H);
      g.fillStyle(0x121826).fillRect(560, 50, 280, 220);
      for (let i = 0; i < 9; i++) {
        const l = scene.add.rectangle(590 + (i % 3) * 80, 80 + Math.floor(i / 3) * 60, 18, 10, 0xffb35c, i % 4 === 0 ? 0.7 : 0.15);
        add(l);
        if (i % 4 === 0) pulse(l, 0.1, 400 + i * 130);
      }
      g.fillStyle(0x3b2f2a).fillRect(540, 40, 50, 240).fillRect(810, 40, 50, 240);
      g.fillStyle(0x1a1d22).fillRect(100, 300, 400, 60);
      for (let i = 0; i < 6; i++) g.fillStyle(0xbfe3ff, i < 5 ? 0.7 : 0.25).fillRoundedRect(140 + i * 50, 250, 22, 50, 5);
      break;
    }

    case 'firedoor': {
      // 방화문 철망 유리 너머, 하얀 마스크
      g.fillStyle(0x2a2d32).fillRect(0, 0, W, AREA_H);
      g.fillStyle(0x6b6f76).fillRect(300, 0, 360, AREA_H);
      g.fillStyle(0x1d2a30).fillRect(400, 60, 160, 150);
      g.fillStyle(0xd9cbb8).fillCircle(480, 135, 50);
      g.fillStyle(0x1e1e1e).fillEllipse(480, 98, 104, 40);
      g.fillStyle(0xf4f4f4).fillRoundedRect(446, 150, 68, 40, 10);
      g.fillStyle(0xffffff).fillEllipse(462, 128, 14, 8).fillEllipse(498, 128, 14, 8);
      g.fillStyle(0x111111).fillCircle(462, 128, 3).fillCircle(498, 128, 3);
      g.lineStyle(1, 0x9aa7ad, 0.6);
      for (let i = 0; i < 9; i++) { g.lineBetween(400 + i * 20, 60, 400 + i * 20, 210); g.lineBetween(400, 60 + i * 18, 560, 60 + i * 18); }
      g.lineStyle(4, 0x3a3e44).strokeRect(400, 60, 160, 150);
      g.fillStyle(0x8a8d92).fillRoundedRect(600, 210, 50, 12, 4);
      g.fillStyle(0x8a8d92).fillRect(610, 222, 10, 30); // 넥타이 매듭
      break;
    }

    case 'r1208': {
      g.fillStyle(0xd8d6cf).fillRect(0, 0, W, AREA_H);
      g.fillStyle(0xbdb9ae).fillRect(0, 280, W, 100);
      g.fillStyle(0x8a6d4a).fillRect(300, 230, 360, 20).fillRect(320, 250, 12, 90).fillRect(628, 250, 12, 90);
      g.fillStyle(0x2f6f9f).fillRect(380, 196, 130, 34); // 바다 퍼즐
      g.fillStyle(0x8fc3e6).fillRect(380, 196, 130, 14);
      g.fillStyle(0xd8d6cf).fillRect(430, 206, 40, 8); // 비어 있는 수평선
      g.fillStyle(0x5a5a5a).fillRect(540, 200, 50, 30).fillRect(548, 190, 40, 10);
      break;
    }

    case 'balcony': {
      g.fillStyle(0x2b3036).fillRect(0, 0, W, AREA_H);
      g.fillStyle(0x8fa3b8, 0.3).fillRect(40, 30, 300, 260);
      g.fillStyle(0xd6d2c6).fillRect(520, 20, 360, 340);
      g.fillStyle(0xe8d9a8).fillRect(600, 110, 200, 70);
      add(text(scene, 700, 145, '비상시 이 벽을 깨고\n옆 세대로 대피하십시오', 14, '#5a4a2a', { align: 'center', fontStyle: '700' }).setOrigin(0.5));
      g.lineStyle(3, 0x9aa0a6).lineBetween(380, 120, 500, 120).lineBetween(380, 160, 500, 160).lineBetween(400, 120, 390, 340).lineBetween(480, 120, 490, 340);
      break;
    }

    case 'b1503': {
      g.fillStyle(0x24302a).fillRect(0, 0, W, AREA_H);
      g.fillStyle(0xcfe3c8, 0.25).fillRect(0, 20, W, 240);
      for (let i = 0; i < 7; i++) {
        const x = 70 + i * 130;
        g.fillStyle(0x7a5a3a).fillRect(x - 26, 300, 52, 60);
        for (let k = 0; k < 5; k++) g.fillStyle(k % 2 ? 0x2f7a3a : 0x3d9a4a).fillEllipse(x + (k - 2) * 24, 250 - (k % 3) * 30, 70, 44);
        g.fillStyle(0xffffff).fillRect(x + 14, 286, 4, 26);
      }
      add(text(scene, 82, 316, '첫째', 10, '#fff'));
      break;
    }

    case 'r1503': {
      g.fillStyle(0xe6e0d4).fillRect(0, 0, W, AREA_H);
      g.fillStyle(0xcfc6b6).fillRect(0, 330, W, 50);
      for (let i = 0; i < 3; i++) for (let k = 0; k < 2; k++) g.fillStyle(i % 2 ? 0x3d9a4a : 0x2f7a3a).fillEllipse(80 + i * 50, 170 + k * 70, 70, 50);
      g.fillStyle(0x7a5a3a).fillRect(80, 300, 80, 40);
      g.fillStyle(0xb38a5a).fillRect(250, 80, 200, 150);
      for (let i = 0; i < 9; i++) g.fillStyle([0xffffff, 0xfff2a8, 0xbfe3ff][i % 3]).fillRect(262 + (i % 3) * 62, 92 + Math.floor(i / 3) * 44, 48, 34);
      g.fillStyle(0xf2f2f0).fillRect(490, 90, 120, 230);
      g.lineStyle(2, 0xbdbdbd).lineBetween(490, 170, 610, 170);
      g.fillStyle(0xa98b67).fillRect(640, 90, 130, 110);
      g.fillStyle(0x5a4632).fillRect(800, 130, 140, 200);
      g.fillStyle(0xf4f4f4).fillRect(840, 220, 60, 36);
      break;
    }

    case 'desk': {
      g.fillStyle(0x2b2620).fillRect(0, 0, W, AREA_H);
      g.fillStyle(0x6b5238).fillRect(120, 220, 720, 160);
      g.fillStyle(0xf6f3ea).fillRect(360, 150, 240, 170);
      for (let i = 0; i < 7; i++) g.lineStyle(1, 0xc9c2b0).lineBetween(380, 180 + i * 18, 580, 180 + i * 18);
      g.fillStyle(0x1f2a44).fillRoundedRect(640, 250, 90, 26, 4);
      add(text(scene, 685, 263, '1-3 강태리', 11, '#ffffff', { fontStyle: '700' }).setOrigin(0.5));
      for (let i = 0; i < 6; i++) g.fillStyle([0x4a6a8a, 0x8a4a4a, 0x6a8a4a][i % 3]).fillRect(150 + i * 26, 60, 22, 150);
      break;
    }

    case 'closet': {
      g.fillStyle(0x1c1d21).fillRect(0, 0, W, AREA_H);
      g.fillStyle(0x0d0e10).fillRoundedRect(380, 50, 200, 300, 16);
      g.fillStyle(0x0d0e10).fillRect(330, 70, 60, 180).fillRect(570, 70, 60, 180);
      add(text(scene, 480, 120, 'TAERI', 18, '#e5484d', { fontStyle: '700' }).setOrigin(0.5));
      g.lineStyle(3, 0x777777).lineBetween(400, 50, 560, 50).lineBetween(480, 30, 480, 50);
      break;
    }

    case 'hall11': {
      // 11층 복도: 문 아래 괴어 둔 원판, 한 덩어리로 꿈틀거리는 것들, 맨 끝의 거인
      g.fillStyle(C.concrete).fillRect(0, 0, W, 300);
      g.fillStyle(C.floor).fillRect(0, 300, W, 80);
      g.fillStyle(C.doorDark).fillRect(20, 110, 110, 190);
      g.fillStyle(0x0b0c0e).fillRect(30, 120, 90, 180);
      g.fillStyle(0x111111).fillCircle(120, 300, 26);
      g.fillStyle(0x333333).fillCircle(120, 300, 8);
      for (let i = 0; i < 16; i++) {
        const x = 300 + (i % 8) * 52 + (i > 7 ? 26 : 0), y = i > 7 ? 175 : 160;
        g.fillStyle(0x2a2e2a, 0.95).fillRoundedRect(x - 18, y, 36, 140, 12);
        g.fillStyle(0x3a3f38).fillCircle(x, y - 12, 15);
        g.fillStyle(0xb31b1b).fillCircle(x - 5, y - 13, 2).fillCircle(x + 5, y - 13, 2);
      }
      // 호룡: 민소매, 산 같은 어깨, 가로로 든 바벨 봉
      g.fillStyle(0x5a5f66).fillRoundedRect(790, 90, 110, 160, 20);
      g.fillStyle(0xc8a68a).fillCircle(845, 66, 26).fillRoundedRect(760, 100, 30, 110, 14).fillRoundedRect(900, 100, 30, 110, 14);
      g.fillStyle(0x22252b).fillRect(800, 250, 40, 60).fillRect(850, 250, 40, 60);
      g.fillStyle(0x9aa0a6).fillRect(700, 196, 300, 10);
      g.fillStyle(0x8a1f1f, 0.8).fillCircle(770, 200, 10).fillCircle(905, 260, 9);
      const lamp = scene.add.rectangle(W / 2, 6, 300, 6, 0xfff6d8);
      add(lamp);
      pulse(lamp, 0.5, 140);
      break;
    }

    case 'gym1114':
    case 'gymNight': {
      // 1114호: 소파 대신 파워랙, 벽 하나가 전부 거울, 무게별로 꽂힌 원판, 벤치 위의 1113호 할머니
      g.fillStyle(0x3a3d42).fillRect(0, 0, W, AREA_H);
      g.fillStyle(0x1e2024).fillRect(0, 300, W, 80);
      for (let i = 0; i < 8; i++) g.lineStyle(1, 0x2a2c30).lineBetween(i * 120, 300, i * 120 + 60, AREA_H);
      g.fillStyle(0x9fb0bd, 0.35).fillRect(520, 30, 420, 270);
      g.lineStyle(3, 0x55595f).strokeRect(520, 30, 420, 270);
      g.fillStyle(0x6b6f76).fillRect(140, 40, 12, 260).fillRect(320, 40, 12, 260).fillRect(140, 40, 192, 10);
      g.fillStyle(0x9aa0a6).fillRect(100, 140, 270, 8);
      for (const [x, r] of [[60, 34], [60, 26], [450, 30], [470, 22]] as const) g.fillStyle(0x111111).fillCircle(x, 300 - r, r);
      g.fillStyle(0x2b2b2b).fillRect(600, 250, 180, 16).fillRect(610, 266, 10, 34).fillRect(760, 266, 10, 34);
      g.fillStyle(0xc96b8a).fillRoundedRect(660, 196, 50, 56, 10);
      g.fillStyle(0xe8c8a8).fillCircle(685, 186, 15);
      g.fillStyle(0xd8d8d8).fillEllipse(685, 176, 30, 12);
      g.lineStyle(3, 0x6b4a2a).lineBetween(715, 210, 728, 268);
      g.fillStyle(0x8fa38f).fillRect(650, 236, 70, 22);
      if (bg === 'gymNight') {
        g.fillStyle(0x05060a, 0.78).fillRect(0, 0, W, AREA_H);
        const doorGlow = scene.add.rectangle(30, 190, 60, 260, 0x3a4a6a, 0.12);
        add(doorGlow);
        pulse(doorGlow, 0.02, 1400);
      }
      break;
    }

    case 'horyongBody': {
      // 호룡의 몸에 남은 피 묻은 손자국 넷 (보는 쪽에서는 그의 왼쪽이 오른편)
      g.fillStyle(0x3a3d42).fillRect(0, 0, W, AREA_H);
      g.fillStyle(0x9fb0bd, 0.2).fillRect(80, 20, 800, 340);
      g.fillStyle(0xc8a68a).fillCircle(480, 46, 36).fillRect(462, 76, 36, 20);
      g.fillStyle(0x1e1e1e).fillEllipse(480, 20, 70, 22);
      g.fillStyle(0x5a5f66);
      g.beginPath(); g.moveTo(310, 92).lineTo(650, 92).lineTo(575, 255).lineTo(385, 255).closePath(); g.fillPath();
      g.fillStyle(0xc8a68a).fillRoundedRect(270, 96, 54, 170, 24).fillRoundedRect(636, 96, 54, 170, 24);
      g.fillStyle(0x22252b).fillRect(392, 255, 82, 130).fillRect(486, 255, 82, 130);
      const hand = (x: number, y: number, a: number) => {
        g.fillStyle(0x6b1414, 0.85).fillEllipse(x, y, 34, 26);
        for (let k = -2; k <= 2; k++) {
          const dx = Math.cos(a + k * 0.28) * 26, dy = Math.sin(a + k * 0.28) * 26;
          g.lineStyle(6, 0x6b1414, 0.85).lineBetween(x, y, x + dx, y + dy);
        }
      };
      hand(664, 250, -1.4); // 그의 왼쪽 손목
      hand(400, 236, 0.3); // 그의 오른쪽 허리
      hand(618, 104, -2.2); // 그의 왼쪽 어깨
      hand(432, 342, -0.6); // 그의 오른쪽 종아리
      break;
    }

    case 'dining': {
      g.fillStyle(0xd8d6cf).fillRect(0, 0, W, AREA_H);
      g.fillStyle(0x8a6d4a).fillRect(220, 230, 520, 24);
      g.fillStyle(0xffffff).fillEllipse(380, 222, 90, 26).fillEllipse(580, 222, 90, 26);
      g.fillStyle(0x7a4a2a).fillRoundedRect(450, 200, 60, 26, 6);
      g.fillStyle(0xf2f2f2).fillRect(456, 192, 48, 8);
      add(text(scene, 480, 196, '장조림 2/28', 8, '#333').setOrigin(0.5));
      break;
    }
  }
}
