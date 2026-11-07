// 1인칭 복싱 전투. 감염자가 정면에서 다가오고, 화면 아래에 태리의 두 주먹이 보인다.
import Phaser from 'phaser';
import { canAppend, planCost, resolveRound, startCombat, validatePlan } from '../rules/combat';
import { CARD_ORDER, CARDS, DEFAULT_TUNING, ENEMIES, INTENTS } from '../rules/data';
import type { CardId, CombatState, Intent, RoundEvent } from '../rules/types';
import type { CombatSummary } from '../rules/night';
import { drawGloves, drawZombieFront, type Gloves, type ZombieFront } from './art';
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

const PANEL = 340; // 이 아래는 카드 패널
const CX = W / 2;
const T = DEFAULT_TUNING;

const SHORT: Record<CardId, string> = {
  jab: '자세 −1',
  step: '모든 공격 회피',
  weave: '물기 회피\n→ 카운터',
  clinch: '잡기 무력화\n이후 공격 불가',
  body: '자세 −2',
  upper: '머리 열림 → KO\n카운터: 자세3↓ KO',
  cork: '자세2↓ 확정 KO\n느림: 예고 공격을\n먼저 맞음',
};

const INTENT_COLOR: Record<Intent, number> = { bite: C.red, grab: C.orange, push: C.blue, stagger: C.green };

const TUTOR: Record<Intent, string> = {
  bite: '물기 예고! 위빙(3)으로 피하면 카운터. 이어서 어퍼(6) — 카운터 어퍼는 한 방이다.',
  grab: '잡기 예고. 클린치(4)로 풀거나 스텝(2)으로 빠진 뒤, 남은 스태미나로 바디(5).',
  push: '밀기 예고. 맞으면 철문에 부딪혀 시끄럽다. 스텝(2)으로 피하고 바디(5).',
  stagger: '비틀거린다! 자세 2 이하면 코크스크류(7). 느린 펀치지만 지금은 맞을 공격이 없다.',
};

export class CombatScene extends Phaser.Scene {
  private d!: CombatData;
  private s!: CombatState;
  private plan: CardId[] = [];
  private busy = false;
  private world!: Phaser.GameObjects.Container;
  private zombie!: ZombieFront;
  private zHome = { x: CX, y: 300 };
  private gloves!: Gloves;
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

    // 회전·흔들림이 화면 중심 기준이 되도록 world 를 중앙에 두고 내용물을 반대로 민다
    this.world = this.add.container(CX, PANEL / 2);
    this.drawCorridor();
    this.zHome = { x: CX, y: enemy.id === 'horyong' ? 318 : enemy.id === 'crawler' ? 286 : 300 };
    this.zombie = drawZombieFront(this, this.zHome.x - CX, this.zHome.y - PANEL / 2, enemy.id);
    this.world.add(this.zombie.root);

    this.gloves = drawGloves(this, CX, 300);
    this.drawPanel();
    this.drawUi();
    this.refresh();
    this.idle();

    // 등장: 어둠 속에서 다가온다
    this.cameras.main.fadeIn(250);
    this.zombie.root.setScale(0.55).setAlpha(0.2);
    this.tweens.add({ targets: this.zombie.root, scale: this.zScale(), alpha: 1, duration: 420, ease: 'Back.Out' });
    sfx.groan();
    this.time.delayedCall(250, () => sfx.bell());
    const ring = title(this, CX, 170, 'FIGHT', 72, HEX(C.orange)).setOrigin(0.5).setAlpha(0).setStroke('#000', 8).setDepth(50);
    this.tweens.add({ targets: ring, alpha: 1, scale: { from: 1.6, to: 1 }, duration: 220, yoyo: true, hold: 450, onComplete: () => ring.destroy() });

    this.input.keyboard!.on('keydown', (e: KeyboardEvent) => {
      if (this.busy) return;
      const n = Number(e.key);
      if (n >= 1 && n <= 7) this.addCard(CARD_ORDER[n - 1]);
      else if (e.key === 'Enter') this.commit();
      else if (e.key === 'Backspace') { this.plan.pop(); this.refresh(); }
    });
  }

  private zScale() { return this.s.enemy.id === 'horyong' ? 1.15 : 1; }

  // ---------- 무대: 복도를 정면으로 본 원근 ----------

  private drawCorridor() {
    const g = this.add.graphics();
    const ox = -CX, oy = -PANEL / 2;
    const vx = CX, vy = 150; // 소실점
    const poly = (pts: [number, number][], color: number, alpha = 1) => {
      g.fillStyle(color, alpha).beginPath();
      const [f, ...rest] = pts;
      g.moveTo(f[0] + ox, f[1] + oy);
      rest.forEach(([x, y]) => g.lineTo(x + ox, y + oy));
      g.closePath().fillPath();
    };
    g.fillStyle(C.night).fillRect(ox - 200, oy - 200, W + 400, PANEL + 400);
    poly([[-200, -200], [W + 200, -200], [vx + 60, vy - 40], [vx - 60, vy - 40]], 0x2e3237); // 천장
    poly([[-200, -200], [vx - 60, vy - 40], [vx - 60, vy + 40], [-200, PANEL + 200]], C.concrete); // 왼쪽 벽(세대 문 쪽)
    poly([[W + 200, -200], [vx + 60, vy - 40], [vx + 60, vy + 40], [W + 200, PANEL + 200]], 0x15181e); // 오른쪽: 난간 너머 밤
    poly([[-200, PANEL + 200], [vx - 60, vy + 40], [vx + 60, vy + 40], [W + 200, PANEL + 200]], C.floor); // 바닥
    poly([[vx - 60, vy - 40], [vx + 60, vy - 40], [vx + 60, vy + 40], [vx - 60, vy + 40]], 0x050506); // 복도 끝 어둠
    // 왼쪽 벽의 세대 문 (멀수록 작게)
    const wallTop = (x: number) => -200 + ((vy - 40 + 200) * (x + 200)) / (vx - 60 + 200);
    const wallBot = (x: number) => PANEL + 200 + ((vy + 40 - PANEL - 200) * (x + 200)) / (vx - 60 + 200);
    for (const [x1, x2] of [[-20, 110], [190, 260], [300, 340], [362, 384]]) {
      const h = (x: number) => wallBot(x) - wallTop(x);
      poly([[x1, wallBot(x1) - h(x1) * 0.62], [x2, wallBot(x2) - h(x2) * 0.62], [x2, wallBot(x2)], [x1, wallBot(x1)]], C.door, 0.9);
    }
    // 난간 쇠봉
    g.lineStyle(3, 0x3a3e44);
    for (const t of [0.1, 0.3, 0.5, 0.65, 0.78, 0.88]) {
      const x = W + 200 + (vx + 60 - (W + 200)) * t;
      const y1 = PANEL + 200 + (vy + 40 - (PANEL + 200)) * t;
      g.lineBetween(x + ox, y1 + oy, x + ox, y1 - 90 * (1 - t) + oy);
    }
    // 난간 너머 다른 동의 불빛
    for (let i = 0; i < 18; i++) {
      const x = 620 + ((i * 53) % 330), y = 30 + ((i * 37) % 110);
      g.fillStyle(0xffb35c, 0.3).fillRect(x + ox, y + oy, 6, 4);
    }
    this.world.add(g);
    const glow = this.add.ellipse(0, -PANEL / 2 + 30, 640, 160, 0xfff6d8, 0.07);
    const lamp = this.add.rectangle(0, -PANEL / 2 + 24, 260, 8, 0xfff6d8);
    this.world.add([glow, lamp]);
    this.tweens.add({ targets: [lamp, glow], alpha: { from: 1, to: 0.45 }, duration: 70, yoyo: true, repeat: -1, repeatDelay: 2600, hold: 40 });
  }

  private drawPanel() {
    const g = this.add.graphics().setDepth(5);
    g.fillStyle(0x111215).fillRect(0, PANEL, W, H - PANEL);
    g.fillStyle(0x000000, 0.6).fillRect(0, PANEL, W, 3);
  }

  private idleGlove(g: Phaser.GameObjects.Container, homeY: number, delay = 0) {
    this.tweens.add({ targets: g, y: homeY + 6, duration: 700, yoyo: true, repeat: -1, ease: 'Sine.InOut', delay });
  }

  private idle() {
    this.idleGlove(this.gloves.lead, this.gloves.leadHome.y);
    this.idleGlove(this.gloves.rear, this.gloves.rearHome.y, 350);
    this.tweens.add({ targets: this.zombie.head, angle: 4, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
  }

  private drawUi() {
    const D = 10;
    const round = title(this, 18, 12, '', 26, HEX(C.paper)).setDepth(D).setStroke('#000', 4);
    const noise = text(this, W - 18, 16, '', 16, HEX(C.orange), { fontStyle: '700', stroke: '#000', strokeThickness: 3 }).setOrigin(1, 0).setDepth(D);
    const caption = text(this, CX, 50, '', 14, HEX(C.paper), {
      align: 'center', wordWrap: { width: 600 }, backgroundColor: '#000000aa', padding: { x: 10, y: 5 },
    }).setOrigin(0.5, 0).setDepth(D);
    const bubble = this.add.container(122, 130).setDepth(D);
    const pips = this.add.graphics().setDepth(D);
    const predict = title(this, 24, 198, '', 20).setOrigin(0, 0.5).setStroke('#000', 5).setDepth(D);
    const status = text(this, W - 18, 46, '', 14, '#fff', { fontStyle: '700', padding: { x: 8, y: 3 } }).setOrigin(1, 0).setDepth(D);

    text(this, 20, PANEL + 16, '스태미나', 12, '#9aa0a6').setDepth(D);
    const stamina = this.add.graphics().setDepth(D);
    const queue = this.add.container(0, 0).setDepth(D);

    const cards: CombatScene['ui']['cards'] = [];
    const cw = 118, ch = 124, gap = 10;
    const x0 = (W - (7 * cw + 6 * gap)) / 2 + cw / 2;
    CARD_ORDER.forEach((id, i) => {
      const c = this.add.container(x0 + i * (cw + gap), 470).setDepth(D);
      const bg = this.add.graphics();
      bg.fillStyle(C.paper).fillRoundedRect(-cw / 2, -ch / 2, cw, ch, 8);
      bg.lineStyle(2, CARDS[id].attack ? C.red : C.blue, 1).strokeRoundedRect(-cw / 2 + 3, -ch / 2 + 3, cw - 6, ch - 6, 6);
      bg.fillStyle(C.orange).fillCircle(-cw / 2 + 16, -ch / 2 + 16, 12);
      const cost = title(this, -cw / 2 + 16, -ch / 2 + 16, String(T.costs[id]), 16, '#1a1a1a').setOrigin(0.5);
      const name = title(this, 0, -ch / 2 + 40, CARDS[id].name, id === 'cork' ? 19 : 24, HEX(C.ink)).setOrigin(0.5);
      const desc = text(this, 0, id === 'cork' ? 2 : 14, SHORT[id], 11, '#4a4a4a', { align: 'center', lineSpacing: 1 }).setOrigin(0.5, 0);
      const key = text(this, cw / 2 - 10, ch / 2 - 8, String(i + 1), 11, '#999').setOrigin(1, 1);
      const badge = title(this, cw / 2 - 14, -ch / 2 + 14, '', 18, HEX(C.red)).setOrigin(0.5);
      c.add([bg, cost, name, desc, key, badge]);
      c.setSize(cw, ch).setInteractive({ useHandCursor: true });
      c.on('pointerover', () => !this.busy && this.tweens.add({ targets: c, y: 462, duration: 90 }));
      c.on('pointerout', () => this.tweens.add({ targets: c, y: 470, duration: 90 }));
      c.on('pointerdown', () => this.addCard(id));
      cards.push({ id, c, badge });
    });

    const go = button(this, W - 90, PANEL + 24, 150, 36, '공격 ▶  Enter', () => this.commit(), 'primary');
    go.setDepth(D);
    this.ui = { round, noise, caption, bubble, pips, predict, status, stamina, queue, cards, go };
    if (this.d.tutorial) this.say(TUTOR[this.s.intent]);
    else this.say(`${this.s.enemy.name}. ${INTENTS[this.s.intent].name} 예고 — 카드를 순서대로 고르고 Enter.`);
  }

  private say(str: string) { this.ui.caption.setText(str); }

  // ---------- 갱신 ----------

  private refresh() {
    const s = this.s;
    const ui = this.ui;
    ui.round.setText(`ROUND ${Math.min(s.round, s.maxRounds)} / ${s.maxRounds}`);
    ui.noise.setText(`전투 소음 +${s.noise}`);

    ui.bubble.removeAll(true);
    if (s.outcome === 'ongoing') {
      const it = INTENTS[s.intent];
      const g = this.add.graphics();
      g.fillStyle(0x0d0e10, 0.9).fillRoundedRect(-104, -30, 208, 60, 8);
      g.fillStyle(INTENT_COLOR[s.intent]).fillRoundedRect(-104, -30, 8, 60, { tl: 8, bl: 8, tr: 0, br: 0 });
      g.fillStyle(0x0d0e10, 0.9).fillTriangle(104, -8, 104, 8, 118, 0);
      const head = title(this, -88, -24, `예고: ${it.name}`, 22, HEX(INTENT_COLOR[s.intent]));
      const sub = text(this, -88, 6, s.grabbed ? '붙잡힘 — 클린치로만 풀 수 있다' : it.text.split('·')[1]?.trim() ?? '', 11, '#bbb');
      ui.bubble.add([g, head, sub]);
    }

    let preview: CombatState | null = null;
    if (!this.busy && s.outcome === 'ongoing' && this.plan.length && !validatePlan(s, this.plan, T)) {
      preview = resolveRound(s, this.plan, T).state;
    }
    this.drawPips(this.busy ? this.shownPoise : s.poise, preview ? preview.poise : null);
    if (this.busy) ui.predict.setText('');
    else if (preview?.outcome === 'ko') {
      const hurt = preview.hitsTaken > s.hitsTaken;
      ui.predict.setText(hurt ? `KO 예상 · 단, ${INTENTS[s.intent].name} 먼저 맞음` : 'KO 예상!').setColor(HEX(hurt ? C.orange : C.green));
    } else if (preview && s.intent !== 'stagger') {
      const hurt = preview.hitsTaken > s.hitsTaken;
      ui.predict.setText(hurt ? `${INTENTS[s.intent].name} 맞음` : `${INTENTS[s.intent].name} 피함`).setColor(HEX(hurt ? C.red : C.blue));
    } else if (s.poise === 0 && s.outcome === 'ongoing') ui.predict.setText('머리가 열렸다').setColor(HEX(C.red));
    else ui.predict.setText('');

    const tags = [s.grabbed && '붙잡힘', s.bites && `물림 ${s.bites} · 감염 타이머`].filter(Boolean).join('  ');
    ui.status.setText(tags).setBackgroundColor(tags ? HEX(C.red) : '#00000000');

    const left = T.stamina - planCost(this.plan, T);
    ui.stamina.clear();
    for (let i = 0; i < T.stamina; i++) {
      if (i < left) ui.stamina.fillStyle(C.orange).fillCircle(92 + i * 22, PANEL + 24, 8);
      else ui.stamina.lineStyle(2, C.orange).strokeCircle(92 + i * 22, PANEL + 24, 7);
    }

    ui.queue.removeAll(true);
    let qx = 170;
    this.plan.forEach((id, i) => {
      if (i > 0) { ui.queue.add(text(this, qx - 2, PANEL + 24, '→', 16, '#888').setOrigin(0, 0.5)); qx += 18; }
      const label = `${CARDS[id].name} ✕`;
      const tmp = text(this, 0, 0, label, 15, '#000', { fontStyle: '700' });
      const w = tmp.width + 20;
      tmp.destroy();
      ui.queue.add(button(this, qx + w / 2, PANEL + 24, w, 30, label, () => {
        if (this.busy) return;
        this.plan.splice(i, 1); sfx.click(); this.refresh();
      }, 'primary'));
      qx += w + 6;
    });
    if (!this.plan.length && s.outcome === 'ongoing') {
      ui.queue.add(text(this, qx, PANEL + 24, '카드를 순서대로 고르세요 (아무것도 안 내도 됨)', 13, '#777').setOrigin(0, 0.5));
    }

    for (const { id, c, badge } of ui.cards) {
      const ok = s.outcome === 'ongoing' && !this.busy && canAppend(s, this.plan, id, T);
      const order = this.plan.map((p, i) => (p === id ? i + 1 : 0)).filter(Boolean);
      c.setAlpha(ok ? 1 : order.length ? 0.75 : 0.35);
      badge.setText(order.join(','));
    }
    ui.go.setEnabled(s.outcome === 'ongoing' && !this.busy && !validatePlan(s, this.plan, T));
  }

  /** 자세 칸. ghost 가 있으면 이번 계획으로 깎일 칸을 주황 테두리로 보여 준다 */
  private drawPips(n: number, ghost: number | null = null) {
    const g = this.ui.pips;
    g.clear();
    const max = this.s.enemy.poise;
    for (let i = 0; i < max; i++) {
      const x = 24 + i * 24, y = 168;
      if (ghost !== null && i >= ghost && i < n) g.lineStyle(2, C.orange).strokeRect(x, y, 20, 10);
      else if (i < n) g.fillStyle(C.blue).fillRect(x, y, 20, 10);
      else g.lineStyle(1, 0x555a60).strokeRect(x, y, 20, 10);
    }
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

  // ---------- 라운드 처리와 1인칭 연출 ----------

  private commit() {
    if (this.busy || this.s.outcome !== 'ongoing' || validatePlan(this.s, this.plan, T)) return;
    const { state, events } = resolveRound(this.s, this.plan, T);
    this.busy = true;
    this.plan = [];
    const prev = this.s;
    this.s = { ...state, intent: prev.intent, outcome: 'ongoing' };
    this.refresh();
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

  private float(str: string, x: number, y: number, color: number, size = 28) {
    const t = title(this, x, y, str, size, HEX(color)).setOrigin(0.5).setStroke('#000', 5).setDepth(20);
    this.tweens.add({ targets: t, y: y - 50, alpha: 0, duration: 900, ease: 'Cubic.Out', onComplete: () => t.destroy() });
  }

  /** 주먹을 화면 안쪽(감염자 쪽)으로 뻗었다가 돌아온다. 맞는 순간까지 걸리는 시간을 돌려준다 */
  private punch(hand: 'lead' | 'rear', tx: number, ty: number, opts: { angle?: number; dur?: number; dip?: boolean } = {}) {
    const g = hand === 'lead' ? this.gloves.lead : this.gloves.rear;
    const home = hand === 'lead' ? this.gloves.leadHome : this.gloves.rearHome;
    const rest = hand === 'lead' ? 8 : -8;
    const dur = opts.dur ?? 85;
    this.tweens.killTweensOf(g);
    if (!opts.dip) g.setPosition(home.x, home.y);
    const go = () => this.tweens.add({
      targets: g, x: tx, y: ty, scale: 0.55, angle: opts.angle ?? 0, duration: dur, ease: 'Quad.Out',
      onComplete: () => this.tweens.add({
        targets: g, x: home.x, y: home.y, scale: 1, angle: rest, duration: 160, delay: 60, ease: 'Quad.Out',
        onComplete: () => this.idleGlove(g, home.y),
      }),
    });
    if (opts.dip) this.tweens.add({ targets: g, y: home.y + 40, duration: 70, onComplete: go });
    else go();
    return dur + (opts.dip ? 70 : 0);
  }

  private zHit(dx: number, dy: number, strong = false) {
    const z = this.zombie;
    const hy = z.head.y;
    this.tweens.add({ targets: z.head, x: dx, y: hy + dy, duration: 70, yoyo: true, ease: 'Quad.Out' });
    this.tweens.add({ targets: z.root, alpha: 0.45, duration: 40, yoyo: true });
    this.tweens.add({ targets: z.root, scale: this.zScale() * (strong ? 0.9 : 0.95), duration: 80, yoyo: true });
  }

  /** 감염자가 카메라(태리) 쪽으로 덤벼든다 */
  private zLunge(scale: number, dy = 40, dur = 120) {
    const z = this.zombie.root;
    const y0 = this.zHome.y - PANEL / 2;
    this.tweens.add({ targets: z, scale, y: y0 + dy, duration: dur, yoyo: true, hold: 80, ease: 'Quad.In', onComplete: () => z.setY(y0) });
  }

  private biteMarks() {
    const g = this.add.graphics().setDepth(30);
    g.lineStyle(12, C.red, 0.85);
    g.beginPath(); g.arc(CX - 40, 230, 110, Math.PI * 1.1, Math.PI * 1.9); g.strokePath();
    g.beginPath(); g.arc(CX + 30, 110, 110, Math.PI * 0.1, Math.PI * 0.9); g.strokePath();
    this.tweens.add({ targets: g, alpha: 0, delay: 400, duration: 700, onComplete: () => g.destroy() });
  }

  private play(events: RoundEvent[], i: number, done: () => void) {
    if (i >= events.length) { this.time.delayedCall(250, done); return; }
    const ev = events[i];
    this.say(ev.text);
    const cam = this.cameras.main;
    const w = this.world;
    let wait = 640;
    const dmg = /자세 −(\d+)/.exec(ev.text);
    const card = ev.text.split(' ')[0];
    const headY = this.zHome.y - (this.s.enemy.id === 'crawler' ? 40 : 200 * this.zScale());
    const zx = this.zHome.x;

    switch (ev.kind) {
      case 'hit': {
        let t: number;
        if (card === '잽') t = this.punch('lead', zx - 20, headY + 10);
        else if (card === '바디') t = this.punch('rear', zx + 10, Math.max(headY + 40, this.zHome.y - 80), { dur: 100 });
        else t = this.punch('rear', zx + 10, headY + 20, { angle: -20, dip: true, dur: 100 }); // 머리가 닫힌 어퍼
        this.time.delayedCall(t, () => {
          sfx.punch();
          cam.shake(90, card === '잽' ? 0.004 : 0.008);
          this.zHit(card === '잽' ? 14 : 0, card === '바디' ? 10 : -14);
          if (dmg) {
            this.shownPoise = Math.max(0, this.shownPoise - Number(dmg[1]));
            this.float(`−${dmg[1]}`, zx + 100, headY, C.orange);
          }
          if (/카운터/.test(ev.text)) this.float('COUNTER', zx, headY - 80, C.red, 26);
          this.drawPips(this.shownPoise);
        });
        break;
      }
      case 'ko': {
        wait = 1400;
        const cork = card === '코크스크류';
        const t = this.punch('rear', zx, headY + 6, { angle: cork ? -95 : -25, dip: !cork, dur: 110 });
        this.time.delayedCall(t, () => {
          sfx.heavy();
          cam.shake(280, 0.022);
          cam.flash(120, 255, 255, 255);
          const z = this.zombie;
          this.tweens.killTweensOf(z.head);
          this.tweens.killTweensOf(z.root);
          this.tweens.add({ targets: z.head, y: z.head.y - 30, angle: cork ? 40 : -10, duration: 120 });
          this.tweens.add({ targets: z.root, y: z.root.y + 260, scale: 0.7, angle: cork ? 14 : -6, duration: 650, delay: 120, ease: 'Quad.In' });
          this.tweens.add({ targets: z.eyes, alpha: 0, duration: 500 });
          this.shownPoise = 0;
          this.drawPips(0);
          const ko = title(this, CX, 150, 'K.O.', 104, HEX(C.paper)).setOrigin(0.5).setStroke('#000', 10).setScale(2).setAlpha(0).setDepth(40);
          this.tweens.add({ targets: ko, scale: 1, alpha: 1, duration: 220, ease: 'Back.Out', delay: 200 });
          this.time.delayedCall(480, () => sfx.bell());
        });
        break;
      }
      case 'evade': {
        const hands = [this.gloves.lead, this.gloves.rear];
        if (card === '위빙') {
          // 머리를 숙여 피한다: 세상이 위로·옆으로 기운다
          this.tweens.add({ targets: w, y: w.y - 60, x: w.x + 50, angle: -7, duration: 120, yoyo: true, hold: 260, ease: 'Quad.Out' });
          this.tweens.add({ targets: hands, y: '+=40', duration: 120, yoyo: true, hold: 260 });
          this.zLunge(this.zScale() * 1.25, 30);
          this.time.delayedCall(140, () => sfx.whoosh());
        } else if (card === '스텝') {
          this.tweens.add({ targets: w, x: w.x - 150, duration: 140, yoyo: true, hold: 260, ease: 'Quad.Out' });
          this.tweens.add({ targets: hands, x: '+=30', duration: 140, yoyo: true, hold: 260 });
          this.zLunge(this.zScale() * 1.2, 20);
          this.time.delayedCall(150, () => sfx.whoosh());
        } else if (card === '클린치') {
          this.zLunge(this.zScale() * 1.45, 50, 140);
          this.tweens.killTweensOf(hands);
          this.tweens.add({ targets: this.gloves.lead, x: zx - 90, y: 250, duration: 140, yoyo: true, hold: 300 });
          this.tweens.add({ targets: this.gloves.rear, x: zx + 90, y: 250, duration: 140, yoyo: true, hold: 300,
            onComplete: () => { this.idleGlove(this.gloves.lead, this.gloves.leadHome.y); this.idleGlove(this.gloves.rear, this.gloves.rearHome.y, 350); } });
          this.time.delayedCall(140, () => sfx.punch());
        } else {
          wait = 420; // '허공을 가른다' — 피하는 연출은 이미 나갔다
        }
        if (card === '위빙' || card === '스텝' || card === '클린치') this.float(card === '클린치' ? '클린치' : '회피', CX, 250, C.blue, 26);
        break;
      }
      case 'miss': {
        const t = this.punch('rear', zx + 180, headY - 40, { angle: -95, dur: 120 });
        this.time.delayedCall(t, () => { sfx.whoosh(); this.float('빗나감', zx + 150, headY - 30, C.orange); cam.shake(80, 0.003); });
        break;
      }
      case 'hurt': {
        if (/끝내지 못했다/.test(ev.text)) { sfx.groan(); wait = 900; break; }
        if (/물렸다/.test(ev.text)) {
          this.zLunge(this.zScale() * 2.1, 120, 130);
          this.time.delayedCall(130, () => {
            sfx.bite(); this.biteMarks(); this.float('물렸다!', CX, 230, C.red, 34);
            cam.flash(200, 229, 72, 77); cam.shake(180, 0.012);
          });
        } else if (/밀려서/.test(ev.text)) {
          this.zLunge(this.zScale() * 1.5, 40, 110);
          this.time.delayedCall(110, () => {
            sfx.heavy(); sfx.door(); this.float('쾅!', CX - 120, 200, C.orange, 44);
            this.tweens.add({ targets: w, x: w.x + 120, angle: 9, duration: 90, yoyo: true, hold: 200 });
            cam.shake(260, 0.016);
          });
        } else {
          this.zLunge(this.zScale() * 1.6, 60, 120);
          this.tweens.add({ targets: [this.gloves.lead, this.gloves.rear], y: '+=70', duration: 140, yoyo: true, hold: 400 });
          this.time.delayedCall(120, () => { sfx.punch(); this.float('잡혔다!', CX, 230, C.red, 32); cam.flash(160, 229, 72, 77); cam.shake(140, 0.01); });
        }
        break;
      }
      default: {
        if (/비틀거린다/.test(ev.text)) {
          this.tweens.add({ targets: this.zombie.root, angle: 9, duration: 160, yoyo: true, repeat: 1 });
          this.shownPoise = Math.max(0, this.shownPoise - 1);
          this.drawPips(this.shownPoise);
          this.float('−1', zx + 100, headY, C.orange);
          wait = 900;
        } else if (/감아 치는/.test(ev.text)) {
          // 코크스크류 선딜레이: 오른손을 크게 뒤로 감는다
          const r = this.gloves.rear;
          this.tweens.killTweensOf(r);
          this.tweens.add({ targets: r, x: this.gloves.rearHome.x + 70, y: this.gloves.rearHome.y + 50, angle: 30, duration: 220 });
          wait = 380;
        } else wait = 900;
      }
    }
    this.time.delayedCall(wait, () => this.play(events, i + 1, done));
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
    const panel = this.add.container(CX, 262).setDepth(45);
    const bg = this.add.rectangle(0, 0, 520, 84, 0x000000, 0.8).setStrokeStyle(1, C.orange);
    const t = text(this, 0, -16, lines, 18, quiet ? HEX(C.green) : '#fff', { fontStyle: '700' }).setOrigin(0.5);
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
