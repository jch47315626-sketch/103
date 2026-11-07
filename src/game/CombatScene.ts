import Phaser from 'phaser';
import { canAppend, planCost, resolveRound, startCombat, validatePlan } from '../rules/combat';
import { CARD_ORDER, CARDS, DEFAULT_TUNING, ENEMIES, INTENTS } from '../rules/data';
import type { CardId, CombatState, Intent, RoundEvent } from '../rules/types';
import type { CombatSummary } from '../rules/night';
import { drawTaeri, drawZombie, type Taeri, type Zombie } from './art';
import { sfx } from './sfx';
import { button, C, H, HEX, text, title, W, type Button } from './theme';

export interface CombatData {
  enemy: string;
  seed: number;
  tutorial?: boolean;
  forceIntent?: Intent;
  fromDoor?: string;
  onDone: (r: CombatSummary) => void;
}

const FLOOR = 300;
const TX = 320;
const ZX = 600;
const T = DEFAULT_TUNING;

const SHORT: Record<CardId, string> = {
  jab: '자세 −1',
  step: '모든 공격 회피',
  weave: '물기 회피\n→ 카운터',
  clinch: '잡기 무력화\n이후 공격 불가',
  body: '자세 −2',
  upper: '머리 열림 → KO\n카운터: 자세3↓ KO',
  cork: '자세2↓ KO\n아니면 빗나감',
};

const INTENT_COLOR: Record<Intent, number> = { bite: C.red, grab: C.orange, push: C.blue, stagger: C.green };

const TUTOR: Record<Intent, string> = {
  bite: '물기 예고! 위빙(3)으로 피하면 카운터가 된다. 이어서 어퍼(6) — 카운터 어퍼는 한 방이다.',
  grab: '잡기 예고. 클린치(4)로 풀거나 스텝(2)으로 빠진 뒤, 남은 스태미나로 바디(5).',
  push: '밀기 예고. 맞으면 철문에 부딪혀 시끄럽다. 스텝(2)으로 피하고 바디(5).',
  stagger: '비틀거린다! 자세가 2 이하가 되면 코크스크류(7) 한 방으로 끝난다.',
};

export class CombatScene extends Phaser.Scene {
  private d!: CombatData;
  private s!: CombatState;
  private plan: CardId[] = [];
  private busy = false;
  private taeri!: Taeri;
  private zombie!: Zombie;
  private shownPoise = 0;
  private ui!: {
    round: Phaser.GameObjects.Text;
    noise: Phaser.GameObjects.Text;
    caption: Phaser.GameObjects.Text;
    bubble: Phaser.GameObjects.Container;
    pips: Phaser.GameObjects.Graphics;
    predict: Phaser.GameObjects.Text;
    status: Phaser.GameObjects.Text;
    stamina: Phaser.GameObjects.Graphics;
    queue: Phaser.GameObjects.Container;
    cards: { id: CardId; c: Phaser.GameObjects.Container; badge: Phaser.GameObjects.Text }[];
    go: Button;
  };

  constructor() { super('combat'); }

  init(d: CombatData) {
    this.d = d;
    this.plan = [];
    this.busy = false;
  }

  create() {
    const enemy = ENEMIES.find((e) => e.id === this.d.enemy)!;
    this.s = startCombat(enemy, T, this.d.seed);
    if (this.d.forceIntent) this.s = { ...this.s, intent: this.d.forceIntent };
    this.shownPoise = this.s.poise;

    this.drawStage();
    this.taeri = drawTaeri(this, TX, FLOOR, 1.25);
    this.zombie = drawZombie(this, ZX, FLOOR, enemy.id, 1.25);
    this.drawUi();
    this.refresh();

    // 등장 연출
    this.cameras.main.fadeIn(250);
    this.zombie.root.x += 80;
    this.tweens.add({ targets: this.zombie.root, x: ZX, duration: 380, ease: 'Back.Out' });
    sfx.bell();
    const ring = title(this, W / 2, 190, 'FIGHT', 64, HEX(C.orange)).setOrigin(0.5).setAlpha(0);
    this.tweens.add({ targets: ring, alpha: 1, scale: { from: 1.6, to: 1 }, duration: 220, yoyo: true, hold: 450, onComplete: () => ring.destroy() });

    this.input.keyboard!.on('keydown', (e: KeyboardEvent) => {
      if (this.busy) return;
      const n = Number(e.key);
      if (n >= 1 && n <= 7) this.addCard(CARD_ORDER[n - 1]);
      else if (e.key === 'Enter') this.commit();
      else if (e.key === 'Backspace') { this.plan.pop(); this.refresh(); }
    });
  }

  // ---------- 무대 ----------

  private drawStage() {
    const g = this.add.graphics();
    g.fillStyle(C.night).fillRect(0, 0, W, H);
    g.fillStyle(C.concrete).fillRect(0, 0, W, FLOOR);
    for (let x = 0; x < W; x += 120) g.fillStyle(C.concreteDark, 0.35).fillRect(x, 0, 2, FLOOR);
    // 뒤쪽 문
    g.fillStyle(C.doorDark).fillRect(720, 120, 96, 180);
    g.fillStyle(this.d.fromDoor ? 0x0b0c0e : C.door).fillRect(726, 126, 84, 174);
    g.fillStyle(C.paper).fillRect(748, 104, 40, 14);
    text(this, 768, 111, this.d.fromDoor ?? '15층', 10, '#222').setOrigin(0.5);
    // 소화전함
    g.fillStyle(0x8a2b2b).fillRect(110, 150, 70, 90);
    g.fillStyle(0xb94a4a).fillRect(116, 156, 58, 78);
    text(this, 145, 195, '소화전', 12, '#fff').setOrigin(0.5);
    // 바닥
    g.fillStyle(C.floor).fillRect(0, FLOOR, W, 40);
    g.fillStyle(0x000000, 0.35).fillRect(0, FLOOR, W, 3);
    // 아래쪽 패널
    g.fillStyle(0x111215).fillRect(0, FLOOR + 40, W, H - FLOOR - 40);
    // 형광등
    const lamp = this.add.rectangle(W / 2, 8, 220, 6, 0xfff6d8);
    const glow = this.add.ellipse(W / 2, 0, 700, 140, 0xfff6d8, 0.06);
    this.tweens.add({
      targets: [lamp, glow], alpha: { from: 1, to: 0.55 }, duration: 70, yoyo: true,
      repeat: -1, repeatDelay: 2600, hold: 40,
    });
    // 바닥 그림자
    this.add.ellipse(TX, FLOOR + 2, 90, 14, 0x000000, 0.4);
    this.add.ellipse(ZX - 20, FLOOR + 2, 100, 14, 0x000000, 0.4);
  }

  private drawUi() {
    const round = title(this, 20, 14, '', 26, HEX(C.paper));
    const noise = text(this, W - 20, 18, '', 16, HEX(C.orange), { fontStyle: '700' }).setOrigin(1, 0);
    text(this, W / 2, 20, this.s.enemy.name, 15, '#9aa0a6').setOrigin(0.5, 0);
    const caption = text(this, W / 2, 46, '', 15, HEX(C.paper), {
      align: 'center', wordWrap: { width: 760 }, backgroundColor: '#00000066', padding: { x: 10, y: 4 },
    }).setOrigin(0.5, 0);
    const bubble = this.add.container(ZX - 10, 100);
    const pips = this.add.graphics();
    const predict = title(this, ZX + 96, 100, '', 20).setOrigin(0, 0.5).setStroke('#000', 4);
    const status = text(this, TX, 132, '', 13, '#fff', { fontStyle: '700', padding: { x: 6, y: 2 } }).setOrigin(0.5);

    text(this, 20, FLOOR + 50, '스태미나', 12, '#9aa0a6');
    const stamina = this.add.graphics();
    const queue = this.add.container(0, 0);

    const cards: CombatScene['ui']['cards'] = [];
    const cw = 118, ch = 132, gap = 10;
    const x0 = (W - (7 * cw + 6 * gap)) / 2 + cw / 2;
    CARD_ORDER.forEach((id, i) => {
      const c = this.add.container(x0 + i * (cw + gap), 455);
      const bg = this.add.graphics();
      bg.fillStyle(C.paper).fillRoundedRect(-cw / 2, -ch / 2, cw, ch, 8);
      bg.lineStyle(2, CARDS[id].attack ? C.red : C.blue, 1).strokeRoundedRect(-cw / 2 + 3, -ch / 2 + 3, cw - 6, ch - 6, 6);
      bg.fillStyle(C.orange).fillCircle(-cw / 2 + 16, -ch / 2 + 16, 12);
      const cost = title(this, -cw / 2 + 16, -ch / 2 + 16, String(T.costs[id]), 16, '#1a1a1a').setOrigin(0.5);
      const name = title(this, 0, -ch / 2 + 40, CARDS[id].name, id === 'cork' ? 19 : 24, HEX(C.ink)).setOrigin(0.5);
      const desc = text(this, 0, 14, SHORT[id], 11, '#4a4a4a', { align: 'center', lineSpacing: 2 }).setOrigin(0.5, 0);
      const key = text(this, cw / 2 - 10, ch / 2 - 8, String(i + 1), 11, '#999').setOrigin(1, 1);
      const badge = title(this, cw / 2 - 14, -ch / 2 + 14, '', 18, HEX(C.red)).setOrigin(0.5);
      c.add([bg, cost, name, desc, key, badge]);
      c.setSize(cw, ch).setInteractive({ useHandCursor: true });
      c.on('pointerover', () => !this.busy && this.tweens.add({ targets: c, y: 445, duration: 90 }));
      c.on('pointerout', () => this.tweens.add({ targets: c, y: 455, duration: 90 }));
      c.on('pointerdown', () => this.addCard(id));
      cards.push({ id, c, badge });
    });

    const go = button(this, W - 90, FLOOR + 62, 150, 40, '공격 ▶  Enter', () => this.commit(), 'primary');
    this.ui = { round, noise, caption, bubble, pips, predict, status, stamina, queue, cards, go };
    if (this.d.tutorial) this.say(TUTOR[this.s.intent]);
    else this.say(`${INTENTS[this.s.intent].name} 예고. 카드를 순서대로 고르고 Enter.`);
  }

  private say(str: string) { this.ui.caption.setText(str); }

  // ---------- 갱신 ----------

  private refresh() {
    const s = this.s;
    const ui = this.ui;
    ui.round.setText(`ROUND ${Math.min(s.round, s.maxRounds)} / ${s.maxRounds}`);
    ui.noise.setText(`전투 소음 +${s.noise}`);

    // 예고 말풍선
    ui.bubble.removeAll(true);
    if (s.outcome === 'ongoing') {
      const it = INTENTS[s.intent];
      const g = this.add.graphics();
      g.fillStyle(0x111215, 0.92).fillRoundedRect(-95, -24, 190, 48, 8);
      g.fillStyle(INTENT_COLOR[s.intent]).fillRoundedRect(-95, -24, 8, 48, { tl: 8, bl: 8, tr: 0, br: 0 });
      g.fillStyle(0x111215, 0.92).fillTriangle(-6, 24, 6, 24, 0, 34);
      const head = title(this, -78, -20, `예고: ${it.name}`, 20, HEX(INTENT_COLOR[s.intent]));
      const sub = text(this, -78, 4, s.grabbed ? '붙잡힘 — 클린치로만 풀 수 있다' : it.text.split('·')[1]?.trim() ?? '', 11, '#bbb');
      ui.bubble.add([g, head, sub]);
    }

    // 미리보기
    let preview: CombatState | null = null;
    if (s.outcome === 'ongoing' && this.plan.length && !validatePlan(s, this.plan, T)) {
      preview = resolveRound(s, this.plan, T).state;
    }
    const after = preview ? preview.poise : s.poise;
    ui.pips.clear();
    const n = s.enemy.poise;
    const px0 = ZX - 10 - (n * 22) / 2;
    for (let i = 0; i < n; i++) {
      const x = px0 + i * 22;
      if (i < after) ui.pips.fillStyle(C.blue).fillRect(x, 122, 18, 9);
      else if (i < this.shownPoise) ui.pips.lineStyle(2, C.orange).strokeRect(x, 122, 18, 9);
      else ui.pips.lineStyle(1, 0x555a60).strokeRect(x, 122, 18, 9);
    }
    if (preview?.outcome === 'ko') ui.predict.setText('KO 예상!').setColor(HEX(C.green));
    else if (preview && s.intent !== 'stagger') {
      const hurt = preview.hitsTaken > s.hitsTaken;
      ui.predict.setText(hurt ? `${INTENTS[s.intent].name} 맞음` : `${INTENTS[s.intent].name} 피함`).setColor(HEX(hurt ? C.red : C.blue));
    } else if (s.poise === 0 && s.outcome === 'ongoing') ui.predict.setText('머리가 열렸다').setColor(HEX(C.red));
    else ui.predict.setText('');
    if (this.busy) ui.predict.setText('');

    ui.status.setText([s.grabbed && '붙잡힘', s.bites && `물림 ${s.bites}`].filter(Boolean).join(' · '))
      .setBackgroundColor(s.grabbed || s.bites ? HEX(C.red) : '#00000000');

    // 스태미나
    const left = T.stamina - planCost(this.plan, T);
    ui.stamina.clear();
    for (let i = 0; i < T.stamina; i++) {
      if (i < left) ui.stamina.fillStyle(C.orange).fillCircle(92 + i * 22, FLOOR + 58, 8);
      else ui.stamina.lineStyle(2, C.orange).strokeCircle(92 + i * 22, FLOOR + 58, 7);
    }

    // 낼 카드 순서
    ui.queue.removeAll(true);
    let qx = 170;
    this.plan.forEach((id, i) => {
      if (i > 0) { ui.queue.add(text(this, qx - 2, FLOOR + 58, '→', 16, '#888').setOrigin(0, 0.5)); qx += 18; }
      const label = `${CARDS[id].name} ✕`;
      const tmp = text(this, 0, 0, label, 15, '#000', { fontStyle: '700' });
      const w = tmp.width + 20;
      tmp.destroy();
      const chip = button(this, qx + w / 2, FLOOR + 58, w, 30, label, () => {
        if (this.busy) return;
        this.plan.splice(i, 1); sfx.click(); this.refresh();
      }, 'primary');
      ui.queue.add(chip);
      qx += w + 6;
    });
    if (!this.plan.length && s.outcome === 'ongoing') {
      ui.queue.add(text(this, qx, FLOOR + 58, '카드를 순서대로 고르세요 (아무것도 안 내도 됨)', 13, '#777').setOrigin(0, 0.5));
    }

    // 손패
    for (const { id, c, badge } of ui.cards) {
      const ok = s.outcome === 'ongoing' && !this.busy && canAppend(s, this.plan, id, T);
      const order = this.plan.map((p, i) => (p === id ? i + 1 : 0)).filter(Boolean);
      c.setAlpha(ok ? 1 : order.length ? 0.75 : 0.35);
      badge.setText(order.join(','));
    }
    ui.go.setEnabled(s.outcome === 'ongoing' && !this.busy && !validatePlan(s, this.plan, T));
  }

  private addCard(id: CardId) {
    if (this.busy || this.s.outcome !== 'ongoing') return;
    if (!canAppend(this.s, this.plan, id, T)) {
      sfx.buzz();
      const why = validatePlan(this.s, [...this.plan, id], T);
      if (why) this.say(why);
      return;
    }
    sfx.click();
    this.plan.push(id);
    this.refresh();
  }

  // ---------- 라운드 처리와 연출 ----------

  private commit() {
    if (this.busy || this.s.outcome !== 'ongoing' || validatePlan(this.s, this.plan, T)) return;
    const { state, events } = resolveRound(this.s, this.plan, T);
    this.busy = true;
    this.plan = [];
    const prev = this.s;
    this.s = { ...state, intent: prev.intent }; // 연출이 끝날 때까지 예고는 그대로 보여 준다
    this.refresh();
    this.drawPips(this.shownPoise);
    this.play(events, 0, () => {
      this.s = state;
      this.busy = false;
      this.shownPoise = state.poise;
      if (state.outcome === 'ongoing') {
        this.say(this.d.tutorial ? TUTOR[state.intent] : `다음 예고: ${INTENTS[state.intent].name}`);
        this.refresh();
      } else this.finish();
    });
  }

  private float(str: string, x: number, y: number, color: number, size = 26) {
    const t = title(this, x, y, str, size, HEX(color)).setOrigin(0.5).setStroke('#000', 4);
    this.tweens.add({ targets: t, y: y - 50, alpha: 0, duration: 900, ease: 'Cubic.Out', onComplete: () => t.destroy() });
  }

  private lunge(dist: number, arm: Phaser.GameObjects.Container, reach: number, dur = 90) {
    const tr = this.taeri;
    this.tweens.add({ targets: tr.root, x: TX + dist, duration: dur, yoyo: true, ease: 'Quad.Out' });
    const ax = arm.x;
    this.tweens.add({ targets: arm, x: ax + reach, duration: dur, yoyo: true, ease: 'Quad.Out' });
  }

  private play(events: RoundEvent[], i: number, done: () => void) {
    if (i >= events.length) { this.time.delayedCall(250, done); return; }
    const ev = events[i];
    this.say(ev.text);
    const z = this.zombie.root;
    const cam = this.cameras.main;
    let wait = 620;
    const dmg = /자세 −(\d+)/.exec(ev.text);

    switch (ev.kind) {
      case 'hit': {
        const heavy = /바디|어퍼/.test(ev.text);
        this.lunge(heavy ? 50 : 34, heavy ? this.taeri.rear : this.taeri.lead, heavy ? 48 : 40);
        this.time.delayedCall(90, () => {
          sfx.punch();
          cam.shake(90, heavy ? 0.008 : 0.004);
          this.tweens.add({ targets: z, x: ZX + 16, duration: 70, yoyo: true });
          this.tweens.add({ targets: z, alpha: 0.4, duration: 40, yoyo: true });
          if (dmg) {
            this.shownPoise = Math.max(0, this.shownPoise - Number(dmg[1]));
            this.float(`−${dmg[1]}`, ZX - 10, 170, C.orange);
          }
          if (/카운터/.test(ev.text)) this.float('COUNTER', ZX - 10, 200, C.red, 22);
          this.drawPips(this.shownPoise);
        });
        break;
      }
      case 'ko': {
        wait = 1300;
        this.lunge(60, this.taeri.rear, 56, 110);
        this.time.delayedCall(110, () => {
          sfx.heavy();
          this.time.timeScale = 1;
          cam.shake(260, 0.02);
          cam.flash(120, 255, 255, 255);
          this.tweens.add({ targets: z, angle: 82, x: ZX + 70, y: FLOOR - 4, duration: 520, ease: 'Quad.In' });
          this.tweens.add({ targets: this.zombie.eyes, alpha: 0, duration: 600 });
          this.shownPoise = 0;
          this.drawPips(0);
          const ko = title(this, W / 2, 160, 'K.O.', 96, HEX(C.paper)).setOrigin(0.5).setStroke('#000', 8).setScale(2).setAlpha(0);
          this.tweens.add({ targets: ko, scale: 1, alpha: 1, duration: 220, ease: 'Back.Out', delay: 180 });
          this.time.delayedCall(450, () => sfx.bell());
        });
        break;
      }
      case 'evade': {
        if (/위빙/.test(ev.text)) {
          this.tweens.add({ targets: this.taeri.root, y: FLOOR + 18, angle: 12, duration: 120, yoyo: true, hold: 120 });
        } else if (/스텝/.test(ev.text)) {
          this.tweens.add({ targets: this.taeri.root, x: TX - 60, duration: 120, yoyo: true, hold: 160 });
        } else if (/클린치/.test(ev.text)) {
          this.tweens.add({ targets: this.taeri.root, x: TX + 120, duration: 140, yoyo: true, hold: 220 });
        } else {
          this.tweens.add({ targets: z, x: ZX - 140, duration: 130, yoyo: true, ease: 'Quad.In' });
          sfx.whoosh();
        }
        if (!/허공/.test(ev.text)) this.float(/클린치/.test(ev.text) ? '클린치' : '회피', TX, 150, C.blue, 22);
        break;
      }
      case 'miss': {
        this.lunge(60, this.taeri.rear, 56, 110);
        this.time.delayedCall(110, () => { sfx.whoosh(); this.float('빗나감', ZX, 170, C.orange, 22); });
        this.time.delayedCall(160, () => { cam.shake(80, 0.003); });
        break;
      }
      case 'hurt': {
        if (/끝내지 못했다/.test(ev.text)) { sfx.groan(); wait = 900; break; }
        this.tweens.add({ targets: z, x: TX + 90, duration: 120, yoyo: true, ease: 'Quad.In' });
        this.time.delayedCall(120, () => {
          if (/물렸다/.test(ev.text)) { sfx.bite(); this.float('물렸다!', TX, 150, C.red); }
          else if (/밀려서/.test(ev.text)) { sfx.heavy(); sfx.door(); this.float('쾅!', TX - 60, 170, C.orange, 36); }
          else { sfx.punch(); this.float('잡혔다!', TX, 150, C.red); }
          cam.flash(160, 229, 72, 77);
          cam.shake(140, 0.01);
          this.tweens.add({ targets: this.taeri.root, x: TX - 30, duration: 90, yoyo: true });
        });
        break;
      }
      default: {
        if (/비틀거린다/.test(ev.text)) {
          this.tweens.add({ targets: z, angle: 10, duration: 140, yoyo: true, repeat: 1 });
          this.shownPoise = Math.max(0, this.shownPoise - 1);
          this.drawPips(this.shownPoise);
        }
        wait = 900;
      }
    }
    this.time.delayedCall(wait, () => this.play(events, i + 1, done));
  }

  private drawPips(n: number) {
    const g = this.ui.pips;
    g.clear();
    const max = this.s.enemy.poise;
    const px0 = ZX - 10 - (max * 22) / 2;
    for (let i = 0; i < max; i++) {
      if (i < n) g.fillStyle(C.blue).fillRect(px0 + i * 22, 122, 18, 9);
      else g.lineStyle(1, 0x555a60).strokeRect(px0 + i * 22, 122, 18, 9);
    }
  }

  private finish() {
    const s = this.s;
    this.refresh();
    const quiet = s.outcome === 'ko' && s.round === 1 && s.hitsTaken === 0 && s.noise === 0;
    const lines =
      s.outcome === 'ko'
        ? quiet
          ? '빠르게, 맞지 않고, 끝냈다. 소음 0.'
          : `${s.round}라운드 KO · 소음 +${s.noise}${s.bites ? ` · 물림 ${s.bites}` : ''}`
        : `끝내지 못했다 · 소음 +${s.noise}. 밀쳐 내고 물러선다.`;
    const panel = this.add.container(W / 2, 262);
    panel.setDepth(10);
    const bg = this.add.rectangle(0, 0, 520, 90, 0x000000, 0.75).setStrokeStyle(1, C.orange);
    const t = text(this, 0, -18, lines, 18, quiet ? HEX(C.green) : '#fff', { fontStyle: '700' }).setOrigin(0.5);
    const hint = text(this, 0, 20, 'Enter 또는 클릭 — 복도로 돌아간다', 13, '#aaa').setOrigin(0.5);
    panel.add([bg, t, hint]).setAlpha(0);
    this.tweens.add({ targets: panel, alpha: 1, duration: 300, delay: s.outcome === 'ko' ? 700 : 0 });
    const leave = () => {
      this.input.keyboard!.removeAllListeners();
      this.cameras.main.fadeOut(250);
      this.time.delayedCall(260, () => {
        this.d.onDone({ outcome: s.outcome as 'ko' | 'timeout', noise: s.noise, bites: s.bites });
        this.scene.stop();
      });
    };
    this.time.delayedCall(800, () => {
      this.input.keyboard!.once('keydown-ENTER', leave);
      this.input.once('pointerdown', leave);
    });
  }
}
