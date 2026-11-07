// 실시간 1인칭 복싱 전투.
// Q W E / A S D / Z X C = 방향(열) × 공격 방법(행), ← ↓ → = 피하기.
import Phaser from 'phaser';
import type { CombatSummary } from '../rules/night';
import {
  ATTACK_INFO, headRow, isOpen, KEY_GRID, MOVE_NAMES, noiseNow, press, RT, startRt, takeEvents, tick,
  type Col, type Row, type RtEvent, type RtState, type ZAttack,
} from '../rules/realtime';
import { drawGloves, drawZombieFront, type Gloves, type ZombieFront } from './art';
import { sfx } from './sfx';
import { button, C, H, HEX, text, title, W } from './theme';

export interface CombatData {
  enemy: string;
  seed: number;
  tutorial?: boolean;
  fromDoor?: string;
  onDone: (r: CombatSummary) => void;
}

const PANEL = 420;
const CX = W / 2;
const LANE = 140; // 열 사이 간격(px)
const colX = (c: Col) => CX + (c - 1) * LANE;
const KEYS = [['Q', 'W', 'E'], ['A', 'S', 'D'], ['Z', 'X', 'C']];

export class CombatScene extends Phaser.Scene {
  private d!: CombatData;
  private s!: RtState;
  private started = false;
  private finished = false;
  private hitstop = 0;
  private world!: Phaser.GameObjects.Container;
  private zombie!: ZombieFront;
  private zRoot = { x: 0, y: 0 }; // world 좌표
  private rootScale = 1;
  private gloves!: Gloves;
  private tips = { windup: false, evaded: false, stagger: false, grab: false };
  private ui!: {
    hp: Phaser.GameObjects.Graphics;
    poise: Phaser.GameObjects.Graphics;
    stamina: Phaser.GameObjects.Graphics;
    timer: Phaser.GameObjects.Graphics;
    noise: Phaser.GameObjects.Text;
    caption: Phaser.GameObjects.Text;
    warn: Phaser.GameObjects.Text;
    open: Phaser.GameObjects.Text;
    lanes: Phaser.GameObjects.Text[];
    pad: Map<string, Phaser.GameObjects.Rectangle>;
    status: Phaser.GameObjects.Text;
  };

  constructor() { super('combat'); }

  init(d: CombatData) {
    this.d = d;
    this.started = false;
    this.finished = false;
    this.hitstop = 0;
    this.tips = { windup: false, evaded: false, stagger: false, grab: false };
  }

  create() {
    this.s = startRt(this.d.enemy, this.d.seed, { slow: this.d.tutorial ? 1.7 : 1 });
    const e = this.s.enemy;

    this.world = this.add.container(CX, PANEL / 2);
    this.drawCorridor();
    this.rootScale = e.id === 'horyong' ? 1.15 : 1;
    this.zRoot = { x: 0, y: (e.id === 'horyong' ? 385 : 360) - PANEL / 2 };
    this.zombie = drawZombieFront(this, this.zRoot.x, this.zRoot.y, e.id);
    this.world.add(this.zombie.root);
    this.placeHead(true);

    this.gloves = drawGloves(this, CX, 384);
    this.gloves.lead.x = CX - 175; this.gloves.leadHome.x = CX - 175;
    this.gloves.rear.x = CX + 175; this.gloves.rearHome.x = CX + 175;
    this.idleGloves();
    this.tweens.add({ targets: this.zombie.head, angle: 4, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.InOut' });

    this.drawUi();
    this.cameras.main.fadeIn(250);

    // 등장 → 카운트다운 → 시작
    this.zombie.root.setScale(0.55 * this.rootScale).setAlpha(0.2);
    this.tweens.add({ targets: this.zombie.root, scale: this.rootScale, alpha: 1, duration: 420, ease: 'Back.Out' });
    sfx.groan();
    const big = title(this, CX, 190, '', 80, HEX(C.orange)).setOrigin(0.5).setStroke('#000', 8).setDepth(50);
    const steps = ['3', '2', '1', 'FIGHT'];
    steps.forEach((t, i) => this.time.delayedCall(350 + i * 380, () => {
      big.setText(t).setScale(1.5).setAlpha(1);
      this.tweens.add({ targets: big, scale: 1, duration: 200 });
      if (t === 'FIGHT') {
        sfx.bell();
        this.started = true;
        this.tweens.add({ targets: big, alpha: 0, delay: 350, duration: 250 });
      } else sfx.click();
    }));
    this.say(this.d.tutorial
      ? '머리가 있는 열을 쳐라 — 왼쪽 Q · 가운데 W · 오른쪽 E. 아래 키 표시에서 주황색 열이 머리 위치다.'
      : `${e.name} — ${e.desc}`);

    this.input.keyboard!.on('keydown', (ev: KeyboardEvent) => this.input2(ev.key));
  }

  private input2(key: string) {
    if (!this.started || this.finished) return;
    const k = key.length === 1 ? key.toLowerCase() : key;
    if (k in KEY_GRID) this.flashPad(k);
    press(this.s, k);
  }

  // ---------- 무대 ----------

  private drawCorridor() {
    const g = this.add.graphics();
    const ox = -CX, oy = -PANEL / 2;
    const vx = CX, vy = 170;
    const poly = (pts: [number, number][], color: number, alpha = 1) => {
      g.fillStyle(color, alpha).beginPath();
      const [f, ...rest] = pts;
      g.moveTo(f[0] + ox, f[1] + oy);
      rest.forEach(([x, y]) => g.lineTo(x + ox, y + oy));
      g.closePath().fillPath();
    };
    g.fillStyle(C.night).fillRect(ox - 300, oy - 300, W + 600, PANEL + 600);
    poly([[-300, -300], [W + 300, -300], [vx + 60, vy - 45], [vx - 60, vy - 45]], 0x2e3237);
    poly([[-300, -300], [vx - 60, vy - 45], [vx - 60, vy + 45], [-300, PANEL + 300]], C.concrete);
    poly([[W + 300, -300], [vx + 60, vy - 45], [vx + 60, vy + 45], [W + 300, PANEL + 300]], 0x15181e);
    poly([[-300, PANEL + 300], [vx - 60, vy + 45], [vx + 60, vy + 45], [W + 300, PANEL + 300]], C.floor);
    poly([[vx - 60, vy - 45], [vx + 60, vy - 45], [vx + 60, vy + 45], [vx - 60, vy + 45]], 0x050506);
    const wallTop = (x: number) => -300 + ((vy - 45 + 300) * (x + 300)) / (vx - 60 + 300);
    const wallBot = (x: number) => PANEL + 300 + ((vy + 45 - PANEL - 300) * (x + 300)) / (vx - 60 + 300);
    for (const [x1, x2] of [[-40, 100], [180, 255], [300, 340], [362, 386]]) {
      const h = (x: number) => wallBot(x) - wallTop(x);
      poly([[x1, wallBot(x1) - h(x1) * 0.6], [x2, wallBot(x2) - h(x2) * 0.6], [x2, wallBot(x2)], [x1, wallBot(x1)]], C.door, 0.9);
    }
    g.lineStyle(3, 0x3a3e44);
    for (const t of [0.1, 0.3, 0.5, 0.65, 0.78, 0.88]) {
      const x = W + 300 + (vx + 60 - (W + 300)) * t;
      const y1 = PANEL + 300 + (vy + 45 - (PANEL + 300)) * t;
      g.lineBetween(x + ox, y1 + oy, x + ox, y1 - 100 * (1 - t) + oy);
    }
    for (let i = 0; i < 18; i++) {
      const x = 640 + ((i * 53) % 310), y = 40 + ((i * 37) % 120);
      g.fillStyle(0xffb35c, 0.3).fillRect(x + ox, y + oy, 6, 4);
    }
    this.world.add(g);
    const glow = this.add.ellipse(0, -PANEL / 2 + 30, 640, 160, 0xfff6d8, 0.07);
    const lamp = this.add.rectangle(0, -PANEL / 2 + 24, 260, 8, 0xfff6d8);
    this.world.add([glow, lamp]);
    this.tweens.add({ targets: [lamp, glow], alpha: { from: 1, to: 0.45 }, duration: 70, yoyo: true, repeat: -1, repeatDelay: 2600, hold: 40 });
  }

  /** 머리의 화면 좌표 */
  private headPos(col: Col = this.s.headCol) {
    const low = this.s.enemy.low;
    return { x: colX(col), y: PANEL / 2 + this.zRoot.y + (low ? -40 : -200) * this.rootScale };
  }

  private placeHead(instant = false) {
    const col = this.s.headCol;
    const hx = ((col - 1) * LANE) / this.rootScale;
    const targets = { x: hx };
    if (instant) this.zombie.head.setX(hx);
    else this.tweens.add({ targets: this.zombie.head, ...targets, duration: 200, ease: 'Sine.Out' });
    this.tweens.add({ targets: this.zombie.root, angle: (col - 1) * 4, duration: instant ? 0 : 220 });
  }

  private idleGlove(g: Phaser.GameObjects.Container, homeY: number, delay = 0) {
    this.tweens.add({ targets: g, y: homeY + 6, duration: 600, yoyo: true, repeat: -1, ease: 'Sine.InOut', delay });
  }

  private idleGloves() {
    this.idleGlove(this.gloves.lead, this.gloves.leadHome.y);
    this.idleGlove(this.gloves.rear, this.gloves.rearHome.y, 300);
  }

  // ---------- UI ----------

  private drawUi() {
    const D = 10;
    const panel = this.add.graphics().setDepth(5);
    panel.fillStyle(0x0f1012).fillRect(0, PANEL, W, H - PANEL);
    panel.fillStyle(0x000000, 0.6).fillRect(0, PANEL, W, 3);

    // 위: 머리 체력, 자세 / 시간과 소음
    title(this, 16, 10, this.s.enemy.name, 20, HEX(C.paper)).setDepth(D).setStroke('#000', 4);
    text(this, 16, 40, '머리', 12, '#bbb').setDepth(D);
    const hp = this.add.graphics().setDepth(D);
    text(this, 16, 60, '자세', 12, '#bbb').setDepth(D);
    const poise = this.add.graphics().setDepth(D);
    text(this, W - 16, 10, '6초마다 소음 +1', 11, '#999').setOrigin(1, 0).setDepth(D);
    const timer = this.add.graphics().setDepth(D);
    const noise = text(this, W - 16, 44, '', 15, HEX(C.orange), { fontStyle: '700', stroke: '#000', strokeThickness: 3 }).setOrigin(1, 0).setDepth(D);
    const status = text(this, W - 16, 68, '', 13, '#fff', { fontStyle: '700', padding: { x: 6, y: 2 } }).setOrigin(1, 0).setDepth(D);

    const caption = text(this, CX, 92, '', 13, HEX(C.paper), {
      align: 'center', wordWrap: { width: 560 }, backgroundColor: '#000000aa', padding: { x: 10, y: 5 },
    }).setOrigin(0.5, 0).setDepth(D);
    const warn = title(this, CX, 60, '', 30, HEX(C.red)).setOrigin(0.5).setStroke('#000', 6).setDepth(D + 1);
    const open = title(this, CX, 150, '', 30, '#ffd23f').setOrigin(0.5).setStroke('#000', 6).setDepth(D + 1);

    // 열 표시 (머리가 있는 열이 주황)
    const lanes = ([0, 1, 2] as Col[]).map((c) =>
      text(this, colX(c), PANEL - 14, `${KEYS[0][c]} ${KEYS[1][c]} ${KEYS[2][c]}`, 13, '#777', { fontStyle: '700', backgroundColor: '#000000aa', padding: { x: 8, y: 2 } })
        .setOrigin(0.5).setDepth(D));

    // 아래: 스태미나 / 공격 키 3×3 / 피하기
    text(this, 20, PANEL + 12, '스태미나', 12, '#9aa0a6').setDepth(D);
    const stamina = this.add.graphics().setDepth(D);
    text(this, 20, PANEL + 52, '열 = 방향 (왼 · 정면 · 오른)\n행 = 머리 · 몸통 · 어퍼', 11, '#777', { lineSpacing: 3 }).setDepth(D);

    const pad = new Map<string, Phaser.GameObjects.Rectangle>();
    const pw = 112, ph = 34, px0 = 262, py0 = PANEL + 8;
    KEYS.forEach((row, r) => row.forEach((k, c) => {
      const x = px0 + c * (pw + 6) + pw / 2, y = py0 + r * (ph + 4) + ph / 2;
      const rect = this.add.rectangle(x, y, pw, ph, r === 0 ? 0x3a2326 : r === 1 ? 0x24303a : 0x3a3123)
        .setStrokeStyle(1, 0x555a60).setDepth(D).setInteractive({ useHandCursor: true });
      rect.on('pointerdown', () => this.input2(k));
      text(this, x - pw / 2 + 8, y, k, 15, HEX(C.orange), { fontStyle: '700' }).setOrigin(0, 0.5).setDepth(D);
      text(this, x + 8, y, MOVE_NAMES[r][c], 12, '#ddd').setOrigin(0.5).setDepth(D);
      pad.set(k.toLowerCase(), rect);
    }));
    const dodges: [string, string, string][] = [['ArrowLeft', '←', '왼쪽'], ['ArrowDown', '↓', '숙이기'], ['ArrowRight', '→', '오른쪽']];
    dodges.forEach(([key, arrow, label], i) => {
      const b = button(this, 662 + i * 98, PANEL + 64, 90, 64, '', () => this.input2(key));
      b.label.setText(`${arrow}\n${label}`).setAlign('center').setFontSize(16);
      b.setDepth(D);
    });
    text(this, 760, PANEL + 10, '피하기  ← ↓(Space) →', 11, '#777').setOrigin(0.5, 0).setDepth(D);

    this.ui = { hp, poise, stamina, timer, noise, caption, warn, open, lanes, pad, status };
  }

  private say(str: string) { this.ui.caption.setText(str); }

  private flashPad(k: string) {
    const r = this.ui.pad.get(k);
    if (!r) return;
    r.setStrokeStyle(3, C.orange);
    this.time.delayedCall(140, () => r.setStrokeStyle(1, 0x555a60));
  }

  private drawHud() {
    const s = this.s;
    const e = s.enemy;
    const g = this.ui.hp;
    g.clear();
    const cell = Math.min(22, 230 / e.headHp);
    for (let i = 0; i < e.headHp; i++) {
      g.fillStyle(i < s.headHp ? C.red : 0x2a2d31).fillRect(56 + i * cell, 42, cell - 3, 12);
    }
    const p = this.ui.poise;
    p.clear();
    if (e.poise < 50) {
      for (let i = 0; i < e.poise; i++) {
        p.fillStyle(s.z.phase === 'stagger' ? 0xffd23f : i < s.poise ? C.blue : 0x2a2d31).fillRect(56 + i * 26, 62, 22, 10);
      }
    } else p.fillStyle(0x2a2d31).fillRect(56, 66, 80, 2);

    // 시간 막대: 6초 구간마다 소음 +1
    const tl = e.timeLimit * Math.max(1, s.slow);
    const t = this.ui.timer;
    t.clear();
    const bw = 260, bx = W - 16 - bw, by = 28;
    t.fillStyle(0x2a2d31).fillRect(bx, by, bw, 10);
    const frac = Math.min(1, s.t / tl);
    t.fillStyle(s.t < RT.noisePerSegment ? C.green : s.t < RT.noisePerSegment * 2 ? C.orange : C.red).fillRect(bx, by, bw * frac, 10);
    for (let m = RT.noisePerSegment; m < tl; m += RT.noisePerSegment) t.fillStyle(0xffffff).fillRect(bx + (bw * m) / tl - 1, by - 3, 2, 16);
    this.ui.noise.setText(`전투 소음 +${noiseNow(s)}`);

    const st = this.ui.stamina;
    st.clear();
    st.fillStyle(0x2a2d31).fillRect(20, PANEL + 30, 220, 12);
    st.fillStyle(s.stamina < 1 ? C.red : C.orange).fillRect(20, PANEL + 30, (220 * s.stamina) / RT.staminaMax, 12);
    for (let i = 1; i < RT.staminaMax; i++) st.fillStyle(0x0f1012).fillRect(20 + (220 * i) / RT.staminaMax - 1, PANEL + 30, 2, 12);

    // 머리가 있는 열 강조
    this.ui.lanes.forEach((l, c) => {
      const on = c === s.headCol;
      l.setColor(on ? '#1a1a1a' : '#777').setBackgroundColor(on ? HEX(C.orange) : '#000000aa');
    });
    const open = isOpen(s) && s.outcome === 'ongoing';
    this.ui.open.setText(open ? (s.z.phase === 'stagger' ? '비틀! 피해 2배' : '빈틈! 피해 2배') : '');
    if (open) this.ui.open.setPosition(this.headPos().x, this.headPos().y - 95);
    const tags = [s.grabbed && '붙잡힘 — 어퍼로 끊어라', s.bites && `물림 ${s.bites} · 감염 타이머`].filter(Boolean).join('  ');
    this.ui.status.setText(tags).setBackgroundColor(tags ? HEX(C.red) : '#00000000');
  }

  // ---------- 매 프레임 ----------

  update(_time: number, delta: number) {
    if (!this.started || this.finished) return;
    const dt = Math.min(delta, 50);
    if (this.hitstop > 0) this.hitstop -= dt;
    else tick(this.s, dt);
    for (const ev of takeEvents(this.s)) this.onEvent(ev);
    this.drawHud();
    if (this.s.outcome !== 'ongoing' && !this.finished) {
      this.finished = true;
      this.time.delayedCall(this.s.outcome === 'ko' ? 1300 : 400, () => this.finish());
    }
  }

  private float(str: string, x: number, y: number, color: number | string, size = 28) {
    const t = title(this, x, y, str, size, typeof color === 'string' ? color : HEX(color)).setOrigin(0.5).setStroke('#000', 5).setDepth(20);
    this.tweens.add({ targets: t, y: y - 50, alpha: 0, duration: 800, ease: 'Cubic.Out', onComplete: () => t.destroy() });
  }

  private target(row: Row, col: Col) {
    const h = this.headPos(col);
    if (row === headRow(this.s.enemy) || row === 2) return { x: h.x, y: h.y + (row === 2 ? 30 : 10) };
    return { x: colX(col), y: PANEL / 2 + this.zRoot.y - 90 * this.rootScale };
  }

  private punchAnim(row: Row, col: Col) {
    const lead = col === 0 || (col === 1 && row === 0);
    const g = lead ? this.gloves.lead : this.gloves.rear;
    const home = lead ? this.gloves.leadHome : this.gloves.rearHome;
    const tg = this.target(row, col);
    const hook = row === 0 && col !== 1;
    const dur = RT.impact[row];
    this.tweens.killTweensOf(g);
    g.setPosition(home.x, home.y).setScale(1);
    const angle = row === 2 ? (lead ? 20 : -20) : hook ? (lead ? 50 : -50) : 0;
    const go = () => this.tweens.add({
      targets: g, x: tg.x, y: tg.y, scale: 0.55, angle, duration: row === 2 ? dur - 90 : dur, ease: 'Quad.Out',
      onComplete: () => this.tweens.add({
        targets: g, x: home.x, y: home.y, scale: 1, angle: lead ? 8 : -8, duration: 140, delay: 40, ease: 'Quad.Out',
        onComplete: () => this.idleGlove(g, home.y),
      }),
    });
    if (row === 2) this.tweens.add({ targets: g, y: home.y + 40, duration: 90, onComplete: go });
    else go();
  }

  private telegraph(a: ZAttack, ms: number) {
    const z = this.zombie;
    const info = ATTACK_INFO[a];
    this.ui.warn.setText(`${info.name}!  ${info.hint}`).setAlpha(1).setScale(1.3);
    this.tweens.add({ targets: this.ui.warn, scale: 1, duration: 160 });
    sfx.groan();
    const t = ms * 0.85;
    if (a === 'swingL') this.tweens.add({ targets: z.armL, angle: 70, x: z.armL.x - 30, duration: t, ease: 'Sine.In' });
    else if (a === 'swingR') this.tweens.add({ targets: z.armR, angle: -70, x: z.armR.x + 30, duration: t, ease: 'Sine.In' });
    else if (a === 'bite') this.tweens.add({ targets: z.head, scale: 0.85, y: z.head.y - 20, duration: t, ease: 'Sine.In' });
    else this.tweens.add({ targets: [z.armL, z.armR], angle: (_t: unknown, _k: string, _v: number, i: number) => (i === 0 ? 45 : -45), duration: t });
    // 화면 가장자리 경고
    const side = a === 'swingL' ? 0 : a === 'swingR' ? W - 60 : -1;
    if (side >= 0) {
      const glow = this.add.rectangle(side + 30, PANEL / 2, 60, PANEL, C.red, 0.0).setDepth(9);
      this.tweens.add({ targets: glow, fillAlpha: 0.35, duration: t, onComplete: () => glow.destroy() });
    }
    if (this.d.tutorial && !this.tips.windup) {
      this.tips.windup = true;
      this.say(`공격이 온다! 예비 동작이 끝나기 직전에 ${info.hint}로 피해라. 너무 일찍 피하면 맞는다.`);
    }
  }

  private resetZombiePose() {
    const z = this.zombie;
    const x0 = this.s.enemy.low ? 90 : 110;
    this.tweens.add({ targets: z.armL, angle: 0, x: -x0, duration: 220 });
    this.tweens.add({ targets: z.armR, angle: 0, x: x0, duration: 220 });
    this.tweens.add({ targets: z.head, scale: 1, y: this.s.enemy.low ? -40 : -200, duration: 220 });
    this.ui.warn.setText('');
  }

  private resetWorld() {
    this.tweens.killTweensOf(this.world);
    this.world.setPosition(CX, PANEL / 2).setAngle(0);
  }

  /** 두 주먹을 잠깐 아래로 내렸다가 제자리로 */
  private glovesDip(dy: number, hold: number, dur = 90) {
    const { lead, rear, leadHome, rearHome } = this.gloves;
    this.tweens.killTweensOf([lead, rear]);
    lead.setPosition(leadHome.x, leadHome.y).setScale(1).setAngle(8);
    rear.setPosition(rearHome.x, rearHome.y).setScale(1).setAngle(-8);
    this.tweens.add({ targets: [lead, rear], y: `+=${dy}`, duration: dur, yoyo: true, hold, onComplete: () => this.idleGloves() });
  }

  private lunge(scale: number, dy: number, dur = 110) {
    const r = this.zombie.root;
    this.tweens.add({ targets: r, scale: this.rootScale * scale, y: this.zRoot.y + dy, duration: dur, yoyo: true, hold: 70, ease: 'Quad.In',
      onComplete: () => r.setY(this.zRoot.y).setScale(this.rootScale) });
  }

  private onEvent(ev: RtEvent) {
    const cam = this.cameras.main;
    const w = this.world;
    switch (ev.t) {
      case 'punch':
        this.punchAnim(ev.row, ev.col);
        break;
      case 'hit': {
        const tg = this.target(ev.row, ev.col);
        const head = ev.dmg > 0;
        this.hitstop = head ? (ev.row === 2 ? 90 : 50) : 40;
        if (ev.row === 2) sfx.heavy(); else sfx.punch();
        cam.shake(90, ev.row === 2 ? 0.012 : 0.005);
        const z = this.zombie;
        if (head) {
          this.tweens.add({ targets: z.head, y: z.head.y + (ev.row === 2 ? -26 : 0), angle: ev.col === 0 ? 14 : ev.col === 2 ? -14 : 0, duration: 70, yoyo: true });
          this.float(`−${ev.dmg}`, tg.x + 60, tg.y - 10, ev.counter ? '#ffd23f' : C.orange, ev.counter ? 36 : 28);
          if (ev.counter) this.float('COUNTER', tg.x, tg.y - 60, C.red, 24);
        } else {
          this.tweens.add({ targets: z.root, scale: this.rootScale * 0.95, duration: 60, yoyo: true });
          this.float(ev.poise === 0 ? '자세 붕괴!' : '자세 −', tg.x + 50, tg.y, C.blue, 22);
        }
        this.tweens.add({ targets: z.root, alpha: 0.5, duration: 35, yoyo: true });
        break;
      }
      case 'whiff': {
        const tg = this.target(ev.row, ev.col);
        sfx.whoosh();
        this.float(this.s.enemy.low && ev.row === 0 ? '머리 위로 빗나감' : '빗나감', tg.x, tg.y - 20, '#aaa', 20);
        if (ev.noise) this.float(`휘청 · 소음 +${ev.noise}`, tg.x, tg.y + 20, C.orange, 18);
        break;
      }
      case 'tired':
        sfx.buzz();
        this.float('숨이 차다', 130, PANEL + 30, C.red, 18);
        break;
      case 'dodge': {
        const dx = ev.dir === 'left' ? 160 : ev.dir === 'right' ? -160 : 0;
        const dy = ev.dir === 'duck' ? -80 : -10;
        const ang = ev.dir === 'left' ? 5 : ev.dir === 'right' ? -5 : 0;
        this.resetWorld();
        this.tweens.add({ targets: w, x: CX + dx, y: PANEL / 2 + dy, angle: ang, duration: 90, yoyo: true, hold: RT.dodgeActive - 120, ease: 'Quad.Out' });
        this.glovesDip(ev.dir === 'duck' ? 50 : 20, RT.dodgeActive - 120);
        break;
      }
      case 'windup':
        this.telegraph(ev.attack, ev.ms);
        break;
      case 'evaded':
        sfx.whoosh();
        this.lunge(1.3, 30);
        this.resetZombiePose();
        this.float(ev.blind ? '사각! 놓쳤다' : '회피!', CX, 260, C.blue, 30);
        if (this.d.tutorial && !this.tips.evaded) {
          this.tips.evaded = true;
          this.say('빈틈! 지금 머리 열을 쳐라 — 피해 2배. 어퍼(Z X C)는 3, 2배면 6!');
        }
        break;
      case 'struck': {
        this.resetZombiePose();
        if (ev.attack === 'bite') {
          this.lunge(2.0, 100, 120);
          this.time.delayedCall(110, () => {
            sfx.bite(); this.marks('bite'); this.float('물렸다!', CX, 250, C.red, 34);
            cam.flash(200, 229, 72, 77); cam.shake(180, 0.012);
          });
        } else if (ev.attack === 'grab') {
          this.lunge(1.6, 60, 120);
          this.glovesDip(60, 300, 120);
          this.time.delayedCall(110, () => { sfx.punch(); this.float('잡혔다!', CX, 250, C.red, 32); cam.flash(150, 229, 72, 77); });
          if (!this.tips.grab) { this.tips.grab = true; this.say('잡혔다! 피할 수 없다. 곧 문다 — 머리 열의 어퍼(Z X C)로 끊어라!'); }
        } else {
          this.lunge(1.3, 30, 100);
          this.time.delayedCall(100, () => {
            sfx.heavy(); sfx.door(); this.marks('slash'); this.float(`쾅! 소음 +${ev.noise}`, CX, 250, C.orange, 30);
            this.resetWorld();
            this.tweens.add({ targets: w, x: CX + (ev.attack === 'swingL' ? 140 : -140), angle: ev.attack === 'swingL' ? 8 : -8, duration: 90, yoyo: true, hold: 160 });
            cam.shake(240, 0.016);
          });
        }
        break;
      }
      case 'stagger':
        sfx.punch();
        this.placeHead();
        this.tweens.add({ targets: this.zombie.root, angle: 10, duration: 180, yoyo: true, repeat: 2 });
        if (this.d.tutorial && !this.tips.stagger) { this.tips.stagger = true; this.say('자세가 무너졌다! 머리가 가운데에 멈췄다 — 턱 어퍼(X)!'); }
        break;
      case 'interrupt':
        this.resetZombiePose();
        this.float('끊었다!', CX, 240, '#ffd23f', 34);
        break;
      case 'sway':
        this.placeHead();
        break;
      case 'ko': {
        const z = this.zombie;
        sfx.heavy();
        this.time.delayedCall(60, () => sfx.heavy());
        cam.shake(300, 0.024);
        cam.flash(120, 255, 255, 255);
        this.tweens.killTweensOf([z.head, z.root]);
        this.tweens.add({ targets: z.head, y: z.head.y - 30, angle: 30, duration: 120 });
        this.tweens.add({ targets: z.root, y: this.zRoot.y + 280, scale: this.rootScale * 0.7, angle: 12, duration: 650, delay: 120, ease: 'Quad.In' });
        this.tweens.add({ targets: z.eyes, alpha: 0, duration: 500 });
        this.ui.warn.setText('');
        const ko = title(this, CX, 170, 'K.O.', 110, HEX(C.paper)).setOrigin(0.5).setStroke('#000', 10).setScale(2).setAlpha(0).setDepth(40);
        this.tweens.add({ targets: ko, scale: 1, alpha: 1, duration: 220, ease: 'Back.Out', delay: 200 });
        this.time.delayedCall(480, () => sfx.bell());
        break;
      }
      case 'timeout':
        sfx.groan();
        this.ui.warn.setText('');
        break;
    }
  }

  private marks(kind: 'bite' | 'slash') {
    const g = this.add.graphics().setDepth(30);
    g.lineStyle(12, C.red, 0.85);
    if (kind === 'bite') {
      g.beginPath(); g.arc(CX - 40, 260, 120, Math.PI * 1.1, Math.PI * 1.9); g.strokePath();
      g.beginPath(); g.arc(CX + 30, 130, 120, Math.PI * 0.1, Math.PI * 0.9); g.strokePath();
    } else {
      for (let i = 0; i < 3; i++) g.lineBetween(300 + i * 60, 80, 520 + i * 60, 330);
    }
    this.tweens.add({ targets: g, alpha: 0, delay: 350, duration: 700, onComplete: () => g.destroy() });
  }

  private finish() {
    const s = this.s;
    const noise = noiseNow(s);
    const quiet = s.outcome === 'ko' && noise === 0 && s.hitsTaken === 0;
    const secs = (s.t / 1000).toFixed(1);
    const lines =
      s.outcome === 'ko'
        ? quiet
          ? `${secs}초. 빠르게, 맞지 않고, 끝냈다. 소음 0.`
          : `${secs}초 KO · 소음 +${noise}${s.bites ? ` · 물림 ${s.bites}` : ''}`
        : `끝내지 못했다 · 소음 +${noise}. 밀쳐 내고 물러선다.`;
    const panel = this.add.container(CX, 290).setDepth(45);
    const bg = this.add.rectangle(0, 0, 540, 84, 0x000000, 0.82).setStrokeStyle(1, C.orange);
    const t = text(this, 0, -16, lines, 18, quiet ? HEX(C.green) : '#fff', { fontStyle: '700' }).setOrigin(0.5);
    const hint = text(this, 0, 20, 'Enter 또는 클릭 — 복도로 돌아간다', 13, '#aaa').setOrigin(0.5);
    panel.add([bg, t, hint]).setAlpha(0);
    this.tweens.add({ targets: panel, alpha: 1, duration: 300 });
    const leave = () => {
      this.input.keyboard!.removeAllListeners();
      this.cameras.main.fadeOut(250);
      this.time.delayedCall(260, () => {
        this.d.onDone({ outcome: s.outcome as 'ko' | 'timeout', noise, bites: s.bites });
        this.scene.stop();
      });
    };
    this.time.delayedCall(700, () => {
      this.input.keyboard!.once('keydown-ENTER', leave);
      this.input.once('pointerdown', leave);
    });
  }
}
