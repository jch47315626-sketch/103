import Phaser from 'phaser';
import { loadProgress } from '../story/progress';
import { drawTaeri } from './art';
import { coverImage, preloadImages, slotKey } from './images';
import { isMuted, sfx, toggleMute, unlockAudio } from './sfx';
import { button, C, H, HEX, text, title, W } from './theme';

export class TitleScene extends Phaser.Scene {
  constructor() { super('title'); }

  preload() {
    preloadImages(this);
  }

  create() {
    const key = slotKey(this, 'title');
    if (key) {
      coverImage(this, key, 0, 0, W, H);
      this.add.rectangle(0, 0, W * 0.45, H, 0x000000, 0.45).setOrigin(0);
    } else this.drawPlaceholder();
    this.drawMenu();
  }

  private drawPlaceholder() {
    const g = this.add.graphics();
    g.fillGradientStyle(0x0b1220, 0x0b1220, 0x1d222c, 0x1d222c).fillRect(0, 0, W, H);
    // 해무 속의 103동
    g.fillStyle(0x07080b).fillRect(600, 60, 280, 480);
    for (let f = 0; f < 15; f++) for (let i = 0; i < 8; i++) {
      const lit = (f * 7 + i * 13) % 17 === 0;
      g.fillStyle(lit ? 0xffb35c : 0x15171c, lit ? 0.85 : 1).fillRect(618 + i * 32, 78 + f * 29, 18, 14);
    }
    g.fillStyle(C.paper).fillRect(720, 36, 40, 18);
    text(this, 740, 45, '103', 12, '#222', { fontStyle: '700' }).setOrigin(0.5);
    for (let i = 0; i < 4; i++) {
      const fog = this.add.ellipse(200 + i * 240, 470 + (i % 2) * 30, 560, 90, 0xb8c2cc, 0.08);
      this.tweens.add({ targets: fog, x: fog.x + 50, duration: 6000 + i * 800, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
    }
    const t = drawTaeri(this, 520, 530, 1.2);
    t.root.setAlpha(0.95);
  }

  private drawMenu() {

    title(this, 56, 40, '103동', 104, HEX(C.paper)).setStroke('#000', 6);
    text(this, 62, 160, '27살 여고생, 동대표 되다', 20, HEX(C.orange), { fontStyle: '700' });
    text(this, 62, 192, '“다시는, 문 앞에서 멈추지 않는다.”', 16, '#9aa0a6', { fontFamily: '"Noto Serif KR", serif' });

    const p = loadProgress();
    let leaving = false;
    const start = (chapter: number) => {
      if (leaving) return;
      leaving = true;
      unlockAudio();
      sfx.bell();
      this.cameras.main.fadeOut(500);
      // 제1화는 직접 돌아다니는 맵으로, 나머지는 아직 이야기 장면으로
      this.time.delayedCall(520, () => (chapter === 0 ? this.scene.start('map', { level: 'ch1' }) : this.scene.start('story', { chapter })));
    };
    // 화를 고르지 않는다: 처음부터 이어서 진행만 한다
    if (p.chapter > 0) {
      button(this, 190, 270, 260, 48, '이어하기', () => start(p.chapter), 'primary');
      button(this, 190, 330, 260, 40, '처음부터', () => start(0));
    } else {
      button(this, 190, 280, 260, 52, '시작', () => start(0), 'primary');
    }

    const mute = button(this, W - 60, 28, 90, 30, isMuted() ? '소리 끔' : '소리 켬', () => {
      mute.label.setText(toggleMute() ? '소리 끔' : '소리 켬');
    });
    text(this, 62, H - 30, '소리를 켜고 하세요. 싸움은 박자에 맞춰 Q W E · A S D · Z X C, 피하기 ← ↓ →.', 12, '#666');
    this.input.keyboard!.on('keydown', (e: KeyboardEvent) => { if (e.key === 'Enter') start(p.chapter); });
  }
}
