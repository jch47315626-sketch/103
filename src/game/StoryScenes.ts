import Phaser from 'phaser';
import { answeringDoors, type NightState } from '../rules/night';
import { drawTaeri, drawZombie } from './art';
import { isMuted, sfx, toggleMute, unlockAudio } from './sfx';
import { button, C, H, HEX, text, title, W } from './theme';

const newSeed = () => Math.floor(Math.random() * 1e9);

export class TitleScene extends Phaser.Scene {
  constructor() { super('title'); }

  create() {
    const g = this.add.graphics();
    g.fillGradientStyle(0x0d1018, 0x0d1018, 0x1d222c, 0x1d222c).fillRect(0, 0, W, H);
    // 103동 실루엣
    g.fillStyle(0x07080b).fillRect(560, 70, 300, 470);
    for (let f = 0; f < 15; f++) for (let i = 0; i < 9; i++) {
      const lit = (f * 7 + i * 13) % 17 === 0;
      g.fillStyle(lit ? 0xffb35c : 0x15171c, lit ? 0.9 : 1).fillRect(578 + i * 31, 86 + f * 29, 18, 14);
    }
    g.fillStyle(C.paper).fillRect(690, 46, 40, 18);
    text(this, 710, 55, '103', 12, '#222', { fontStyle: '700' }).setOrigin(0.5);

    const z = drawZombie(this, 400, 528, 'normal', 0.9);
    z.body.setAlpha(0.18);
    drawTaeri(this, 250, 528, 0.9).root.setAlpha(0.95);

    title(this, 60, 60, '103동', 110, HEX(C.paper)).setStroke('#000', 6);
    text(this, 66, 186, '27살 여고생, 동대표 되다', 20, HEX(C.orange), { fontStyle: '700' });
    text(this, 66, 220, '문을 열 것인가, 소리를 낼 것인가.', 16, '#9aa0a6');
    const start = title(this, 66, 268, '▶ 클릭하거나 Enter로 시작', 24, HEX(C.paper));
    this.tweens.add({ targets: start, alpha: 0.35, duration: 700, yoyo: true, repeat: -1 });
    text(this, 66, 306, '체험판 · 프롤로그 + 15층의 첫 밤 (약 10분)', 13, '#777');

    const mute = button(this, W - 60, 28, 90, 30, isMuted() ? '소리 끔' : '소리 켬', () => {
      mute.label.setText(toggleMute() ? '소리 끔' : '소리 켬');
    });

    const go = () => {
      unlockAudio();
      sfx.bell();
      this.cameras.main.fadeOut(500);
      this.time.delayedCall(520, () => this.scene.start('intro'));
    };
    this.input.once('pointerdown', (_p: unknown, objs: unknown[]) => { if (!objs.length) go(); else this.input.once('pointerdown', go); });
    this.input.keyboard!.once('keydown-ENTER', go);
  }
}

const INTRO = [
  '3월 2일 아침. 103동 15층.',
  '엘리베이터는 멈췄고, 휴대폰은 터지지 않는다.',
  '복도 끝에서 누군가 "열어 줘"라고 했다. 태리는 열지 못했다.',
  '그리고 옆집 1501호 문이, 안쪽에서 열렸다.',
];

export class IntroScene extends Phaser.Scene {
  constructor() { super('intro'); }

  create() {
    this.cameras.main.setBackgroundColor('#08090b');
    let i = 0;
    const line = text(this, W / 2, H / 2 - 10, '', 22, HEX(C.paper), { align: 'center', wordWrap: { width: 760 } }).setOrigin(0.5);
    const hint = text(this, W / 2, H - 50, '클릭 / Enter', 13, '#555').setOrigin(0.5);
    const show = () => {
      if (i >= INTRO.length) {
        this.input.keyboard!.removeAllListeners();
        this.input.removeAllListeners();
        hint.destroy();
        this.cameras.main.fadeOut(300);
        this.time.delayedCall(320, () => {
          this.scene.launch('combat', {
            enemy: 'normal', seed: 1501, tutorial: true, forceIntent: 'bite', fromDoor: '1501',
            onDone: () => this.scene.start('corridor', { seed: newSeed() }),
          });
          this.scene.sleep();
        });
        return;
      }
      line.setText(INTRO[i++]).setAlpha(0);
      this.tweens.add({ targets: line, alpha: 1, duration: 500 });
      if (i === INTRO.length) { sfx.door(); this.cameras.main.shake(300, 0.006); }
    };
    show();
    this.input.on('pointerdown', show);
    this.input.keyboard!.on('keydown-ENTER', show);
    this.input.keyboard!.on('keydown-SPACE', show);
  }
}

interface DawnData { night: NightState; horde: boolean; fights: number; quiet: number }

export class DawnScene extends Phaser.Scene {
  constructor() { super('dawn'); }

  create(d: DawnData) {
    const s = d.night;
    const answered = answeringDoors(s);
    const g = this.add.graphics();
    if (d.horde) g.fillGradientStyle(0x1a0606, 0x1a0606, 0x3a0c0c, 0x3a0c0c).fillRect(0, 0, W, H);
    else g.fillGradientStyle(0x0e1626, 0x0e1626, 0x7a4a52, 0xd98a4a).fillRect(0, 0, W, H);

    // 103동 앞면: 맨 위가 15층
    const bx = 70, by = 96, cw = 54;
    g.fillStyle(0x0a0b0e).fillRect(bx - 20, by - 26, 15 * cw + 40, 300);
    title(this, bx - 10, by - 62, '103동 15층', 22, HEX(C.paper));
    const wins: Phaser.GameObjects.Rectangle[] = [];
    for (let i = 0; i < 15; i++) {
      const x = bx + i * cw + 8;
      wins.push(this.add.rectangle(x + 17, by + 14, 34, 26, 0x181a20));
      text(this, x + 17, by + 36, `15${String(i + 1).padStart(2, '0')}`, 10, '#777').setOrigin(0.5, 0);
      for (let f = 1; f < 6; f++) {
        const lit = !d.horde && (i * 5 + f * 3) % 23 === 0;
        g.fillStyle(lit ? 0xffb35c : 0x15171c, lit ? 0.22 : 1).fillRect(x, by + 20 + f * 44, 34, 22);
      }
    }

    const info = text(this, W / 2, 392, '', 17, HEX(C.paper), { align: 'center', wordWrap: { width: 820 }, lineSpacing: 6 }).setOrigin(0.5, 0);

    if (d.horde) {
      title(this, W / 2, 230, '무리', 96, HEX(C.red)).setOrigin(0.5).setStroke('#000', 8);
      info.setText('소리가 너무 컸다. 계단실이 감염자로 가득 찼다.\n소음 미터가 끝까지 차면 그 층의 밤은 끝난다.');
      this.again(d);
      return;
    }

    info.setText('06:00. 경광봉 대신 휴대폰 손전등으로 신호를 보낸다.\n하나, 둘, 기일게.');
    const home = wins[1];
    this.time.delayedCall(700, () => {
      this.tweens.add({ targets: home, fillColor: { from: 0x181a20, to: 0xfff6d8 }, duration: 160, yoyo: true, repeat: 1, hold: 120 });
      this.tweens.addCounter({
        from: 0, to: 1, delay: 760, duration: 900, onStart: () => home.setFillStyle(0xfff6d8),
        onComplete: () => home.setFillStyle(C.orange),
      });
      sfx.click();
      this.time.delayedCall(380, () => sfx.click());
      this.time.delayedCall(760, () => sfx.chime(0));
    });

    const start = 2400;
    answered.forEach((door, k) => {
      this.time.delayedCall(start + k * 650, () => {
        const w = wins[door.x - 1];
        w.setFillStyle(0xffb35c);
        this.add.rectangle(w.x, w.y, 60, 50, 0xffb35c, 0.25);
        sfx.chime(k + 1);
      });
    });
    this.time.delayedCall(start + answered.length * 650 + 600, () => {
      const got = answered.length;
      const extra = [
        s.specials.length ? `발견: ${s.specials.join(', ')}` : '',
        s.bites ? `물림 ${s.bites} — 감염 타이머가 시작됐다` : '',
        d.fights ? `전투 ${d.fights}번 중 소리 없이 끝낸 것 ${d.quiet}번` : '',
      ].filter(Boolean).join(' · ');
      info.setText(
        (got === 0
          ? '창문은 하나도 켜지지 않았다. 103동은 아직 대답하지 않는다.'
          : `대답한 집 ${got}. 이 집들이 선거 날의 숨은 표가 된다.`) +
          `\n물 ${s.water} · 식량 ${s.food} · 약 ${s.meds} · 남은 소음 ${s.noise}` +
          (extra ? `\n${extra}` : '') +
          '\n동대표 선거까지 8일.',
      );
      this.again(d);
    });
  }

  private again(d: DawnData) {
    const b = button(this, W / 2, H - 22, 220, 36, '다른 밤 다시 하기  Enter', () => go(), 'primary');
    b.setAlpha(0);
    this.tweens.add({ targets: b, alpha: 1, duration: 400 });
    const go = () => {
      this.input.keyboard!.removeAllListeners();
      this.scene.start('corridor', { seed: newSeed() });
    };
    this.input.keyboard!.once('keydown-ENTER', go);
    void d;
  }
}
