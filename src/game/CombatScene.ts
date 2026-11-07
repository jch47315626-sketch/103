// 리듬 복싱 전투 (1인칭).
// 감염자 위에 3×3 칸이 겹쳐 있고, 박자에 맞춰 노트가 온다. 칸에 링이 닿는 순간 그 칸의 키를 누른다.
//   Q W E 머리 · A S D 몸통 · Z X C 어퍼 / ← ↓ → 피하기
import Phaser from 'phaser';
import type { CombatSummary } from '../rules/night';
import {
  advance, ATTACK_INFO, GRID_KEYS, hit, KEY_GRID, msPerBeat, noiseNow, startRhythm, takeEvents,
  type Col, type Note, type RhythmEvent, type RhythmState, type Row,
} from '../rules/rhythm';
import { drawGloves, drawZombieFront, type Gloves, type ZombieFront } from './art';
import { audioLatency, audioRawNow, beat as drum, sfx } from './sfx';
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
const LANE = 150;
const colX = (c: number) => CX + (c - 1) * LANE;
const ROW_COLOR = [C.red, C.blue, C.orange];
const ROW_NAME = ['머리', '몸통', '어퍼'];
const BASS = [110, 87.31, 130.81, 98]; // A F C G — 마디마다 베이스

interface NoteView { note: Note; ring: Phaser.GameObjects.Graphics; label?: Phaser.GameObjects.Text }

export class CombatScene extends Phaser.Scene {
  private d!: CombatData;
  private s!: RhythmState;
  private spb = 0.6; // 초/박
  private start = 0; // 0박이 울리는 오디오 시각(ctx 기준)
  private scheduled = -1;
  private approach = 1.5;
  private finished = false;
  private lastBeatInt = -1;
  private world!: Phaser.GameObjects.Container;
  private zombie!: ZombieFront;
  private zRoot = { x: 0, y: 0 };
  private rootScale = 1;
  private rowY: number[] = [150, 265, 365];
  private gloves!: Gloves;
  private views = new Map<number, NoteView>();
  private headCol: Col = 1;
  private tips = new Set<string>();
  private ui!: {
    hp: Phaser.GameObjects.Graphics;
    poise: Phaser.GameObjects.Graphics;
    progress: Phaser.GameObjects.Graphics;
    noise: Phaser.GameObjects.Text;
    combo: Phaser.GameObjects.Text;
    counts: Phaser.GameObjects.Text;
    caption: Phaser.GameObjects.Text;
    warn: Phaser.GameObjects.Text;
    status: Phaser.GameObjects.Text;
    count: Phaser.GameObjects.Text;
    cells: Phaser.GameObjects.Graphics;
    pulse: Phaser.GameObjects.Arc;
    pad: Map<string, Phaser.GameObjects.Rectangle>;
    dodgeBtns: Map<string, Phaser.GameObjects.Container>;
  };

  constructor() { super('combat'); }

  init(d: CombatData) {
    this.d = d;
    this.finished = false;
    this.scheduled = -1;
    this.lastBeatInt = -1;
    this.views = new Map();
    this.headCol = 1;
    this.tips = new Set();
  }

  create() {
    this.s = startRhythm(this.d.enemy, this.d.seed, { easy: this.d.tutorial });
    const e = this.s.enemy;
    this.spb = msPerBeat(this.s.bpm) / 1000;
    this.approach = this.d.tutorial ? 2 : 1.5;

    this.world = this.add.container(CX, PANEL / 2);
    this.drawCorridor();
    this.rootScale = e.id === 'horyong' ? 1.15 : 1;
    const rootY = e.id === 'horyong' ? 385 : 360;
    this.zRoot = { x: 0, y: rootY - PANEL / 2 };
    this.rowY = e.low ? [190, 318, 392] : e.id === 'horyong' ? [152, 270, 372] : [160, 268, 372];
    this.zombie = drawZombieFront(this, 0, this.zRoot.y, e.id);
    this.world.add(this.zombie.root);

    this.gloves = drawGloves(this, CX, 392);
    for (const [g, x] of [[this.gloves.lead, CX - 250], [this.gloves.rear, CX + 250]] as const) g.x = x;
    this.gloves.leadHome.x = CX - 250;
    this.gloves.rearHome.x = CX + 250;

    this.drawUi();
    this.cameras.main.fadeIn(250);
    this.zombie.root.setScale(0.55 * this.rootScale).setAlpha(0.2);
    this.tweens.add({ targets: this.zombie.root, scale: this.rootScale, alpha: 1, duration: 420, ease: 'Back.Out' });

    this.start = audioRawNow() + 0.6;
    this.say(this.d.tutorial
      ? '박자에 맞춰라. 칸으로 줄어드는 테두리가 칸에 딱 닿을 때 그 칸의 키를 누른다. 첫 두 마디는 머리(Q W E)만 온다.'
      : `${e.name} — ${e.desc}`);

    this.input.keyboard!.on('keydown', (ev: KeyboardEvent) => this.onKey(ev.key));
  }

  /** 지금 귀에 들리는 박 (출력 지연 보정) */
  private beatNow() {
    return (audioRawNow() - audioLatency() - this.start) / this.spb;
  }

  private onKey(raw: string) {
    if (this.finished) return;
    const k = raw.toLowerCase();
    const b = this.beatNow();
    if (k in KEY_GRID) {
      this.flashPad(k);
      const [row, col] = KEY_GRID[k];
      this.punchAnim(row, col as Col);
    } else if (k === 'arrowleft' || k === 'arrowright' || k === 'arrowdown' || k === ' ') {
      this.dodgeAnim(k === 'arrowleft' ? 'left' : k === 'arrowright' ? 'right' : 'duck');
    } else return;
    hit(this.s, k, b);
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
  }

  private drawUi() {
    const D = 10;
    const panel = this.add.graphics().setDepth(5);
    panel.fillStyle(0x0f1012).fillRect(0, PANEL, W, H - PANEL);
    panel.fillStyle(0x000000, 0.6).fillRect(0, PANEL, W, 3);

    // 3×3 칸 (감염자 위)
    const cells = this.add.graphics().setDepth(7);
    for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) {
      const x = colX(c), y = this.rowY[r];
      text(this, x - 50, y - 34, GRID_KEYS[r][c], 13, HEX(ROW_COLOR[r]), { fontStyle: '700' }).setAlpha(0.55).setDepth(7);
    }

    title(this, 16, 10, this.s.enemy.name, 20, HEX(C.paper)).setDepth(D).setStroke('#000', 4);
    text(this, 16, 40, '머리', 12, '#bbb').setDepth(D);
    const hp = this.add.graphics().setDepth(D);
    text(this, 16, 60, '자세', 12, '#bbb').setDepth(D);
    const poise = this.add.graphics().setDepth(D);
    text(this, W - 16, 8, `♩=${this.s.bpm}`, 12, '#999').setOrigin(1, 0).setDepth(D);
    const progress = this.add.graphics().setDepth(D);
    const noise = text(this, W - 16, 40, '', 15, HEX(C.orange), { fontStyle: '700', stroke: '#000', strokeThickness: 3 }).setOrigin(1, 0).setDepth(D);
    const status = text(this, W - 16, 64, '', 13, '#fff', { fontStyle: '700', padding: { x: 6, y: 2 } }).setOrigin(1, 0).setDepth(D);

    const caption = text(this, CX, 80, '', 13, HEX(C.paper), {
      align: 'center', wordWrap: { width: 560 }, backgroundColor: '#000000aa', padding: { x: 10, y: 5 },
    }).setOrigin(0.5, 0).setDepth(D);
    const warn = title(this, CX, 46, '', 28, HEX(C.red)).setOrigin(0.5).setStroke('#000', 6).setDepth(D + 1);
    const combo = title(this, W - 90, 210, '', 40, '#ffd23f').setOrigin(0.5).setStroke('#000', 6).setDepth(D);
    const count = title(this, CX, 200, '', 90, HEX(C.orange)).setOrigin(0.5).setStroke('#000', 8).setDepth(50);

    // 아래 패널
    const pulse = this.add.circle(70, PANEL + 60, 22, C.red, 0.9).setDepth(D);
    text(this, 70, PANEL + 102, '박자', 11, '#777').setOrigin(0.5).setDepth(D);
    const counts = text(this, 112, PANEL + 30, '', 12, '#bbb', { lineSpacing: 4 }).setDepth(D);

    const pad = new Map<string, Phaser.GameObjects.Rectangle>();
    const pw = 108, ph = 34, px0 = 262, py0 = PANEL + 8;
    GRID_KEYS.forEach((row, r) => row.forEach((k, c) => {
      const x = px0 + c * (pw + 6) + pw / 2, y = py0 + r * (ph + 4) + ph / 2;
      const rect = this.add.rectangle(x, y, pw, ph, 0x1d2024).setStrokeStyle(1, 0x555a60).setDepth(D)
        .setInteractive({ useHandCursor: true });
      rect.on('pointerdown', () => this.onKey(k));
      text(this, x - pw / 2 + 8, y, k, 15, HEX(ROW_COLOR[r]), { fontStyle: '700' }).setOrigin(0, 0.5).setDepth(D);
      text(this, x + 10, y, `${['왼', '정면', '오른'][c]} ${ROW_NAME[r]}`, 11, '#ccc').setOrigin(0.5).setDepth(D);
      pad.set(k.toLowerCase(), rect);
    }));
    const dodgeBtns = new Map<string, Phaser.GameObjects.Container>();
    ([['ArrowLeft', '←', '왼쪽'], ['ArrowDown', '↓', '숙이기'], ['ArrowRight', '→', '오른쪽']] as const).forEach(([key, arrow, label], i) => {
      const b = button(this, 662 + i * 98, PANEL + 64, 90, 64, '', () => this.onKey(key));
      b.label.setText(`${arrow}\n${label}`).setAlign('center').setFontSize(16);
      b.setDepth(D);
      dodgeBtns.set(key.toLowerCase(), b);
    });
    text(this, 760, PANEL + 10, '피하기  ← ↓(Space) →', 11, '#777').setOrigin(0.5, 0).setDepth(D);

    this.ui = { hp, poise, progress, noise, combo, counts, caption, warn, status, count, cells, pulse, pad, dodgeBtns };
  }

  private say(str: string) { this.ui.caption.setText(str); }

  private flashPad(k: string) {
    const r = this.ui.pad.get(k);
    if (!r) return;
    r.setFillStyle(0x3a3f46);
    this.time.delayedCall(90, () => r.setFillStyle(0x1d2024));
  }

  // ---------- 음악 ----------

  private scheduleMusic() {
    const ahead = audioRawNow() + 0.25;
    const total = this.s.totalBeats + 2;
    while (this.scheduled < total) {
      const next = this.scheduled + 1;
      const t0 = this.start + next * this.spb;
      if (t0 > ahead) break;
      this.scheduled = next;
      if (next < 4) { drum.stick(t0); if (next === 0) drum.bell(t0); continue; }
      const inBar = (next - 4) % 4;
      const bar = Math.floor((next - 4) / 4);
      drum.kick(t0);
      drum.kick(t0 + this.spb * 0.25, true); // 쿵-쿵 (심장 박동)
      drum.hat(t0 + this.spb * 0.5);
      if (inBar === 1 || inBar === 3) drum.snare(t0);
      if (inBar === 0) drum.bass(t0, BASS[bar % 4], this.spb * 1.8);
      if (inBar === 2) drum.bass(t0, BASS[bar % 4] * 1.5, this.spb * 0.9);
    }
  }

  // ---------- 매 프레임 ----------

  update() {
    if (this.finished) return;
    this.scheduleMusic();
    const b = this.beatNow();
    advance(this.s, b);
    for (const ev of takeEvents(this.s)) this.onEvent(ev);

    // 카운트다운과 박자 맥박
    const bi = Math.floor(b);
    if (bi !== this.lastBeatInt && b >= 0) {
      this.lastBeatInt = bi;
      if (bi < 4) {
        this.ui.count.setText(bi === 3 ? 'FIGHT' : String(bi + 1)).setScale(1.4).setAlpha(1);
        this.tweens.add({ targets: this.ui.count, scale: 1, alpha: bi === 3 ? 0 : 0.6, duration: this.spb * 900 });
      }
      this.ui.pulse.setScale(1.3).setAlpha(1);
      this.tweens.add({ targets: this.ui.pulse, scale: 1, alpha: 0.5, duration: this.spb * 700 });
      if (bi >= 4) this.tweens.add({ targets: this.zombie.root, scaleY: this.rootScale * 1.02, duration: 80, yoyo: true });
    }

    this.drawNotes(b);
    this.drawHud(b);

    if (this.s.outcome !== 'ongoing' && !this.finished) {
      this.finished = true;
      this.time.delayedCall(this.s.outcome === 'ko' ? 1300 : 500, () => this.finish());
    }
  }

  private drawNotes(b: number) {
    const s = this.s;
    // 다가오는 노트 생성
    for (const n of s.notes) {
      if (n.beat - b > this.approach) break;
      if (n.judge || this.views.has(n.id)) continue;
      const ring = this.add.graphics().setDepth(8);
      let label: Phaser.GameObjects.Text | undefined;
      if (n.kind === 'dodge') {
        const info = ATTACK_INFO[n.attack!];
        label = title(this, CX, 132, info.hint, 34, HEX(C.red)).setOrigin(0.5).setStroke('#000', 6).setDepth(9);
        this.telegraph(n);
      } else {
        if (n.row !== 1 || s.enemy.low) this.moveHead(n.col!);
        if (n.follow !== undefined) {
          label = text(this, colX(n.col!), this.rowY[n.row!] + 30, s.grabbed ? '탈출!' : 'COUNTER', 12, '#ffd23f', { fontStyle: '700', stroke: '#000', strokeThickness: 3 }).setOrigin(0.5).setDepth(9);
        }
      }
      this.views.set(n.id, { note: n, ring, label });
    }
    // 링 그리기
    const g = this.ui.cells;
    g.clear();
    for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) g.lineStyle(1, 0xffffff, 0.12).strokeRoundedRect(colX(c) - 55, this.rowY[r] - 38, 110, 76, 10);
    const due = new Set<string>();
    for (const [id, v] of this.views) {
      const n = v.note;
      if (n.judge) { v.ring.destroy(); v.label?.destroy(); this.views.delete(id); continue; }
      const left = n.beat - b; // 박
      const p = Phaser.Math.Clamp(1 - left / this.approach, 0, 1.15);
      v.ring.clear();
      if (n.kind === 'dodge') {
        const sc = 1 + Math.max(0, left / this.approach) * 1.6;
        v.ring.lineStyle(5, C.red, Math.min(1, p + 0.2)).strokeCircle(CX, 132, 46 * sc);
        v.ring.fillStyle(C.red, 0.25 * p).fillCircle(CX, 132, 46);
        for (const d of ATTACK_INFO[n.attack!].dodge) due.add(d === 'left' ? 'arrowleft' : d === 'right' ? 'arrowright' : 'arrowdown');
      } else {
        const x = colX(n.col!), y = this.rowY[n.row!];
        const color = n.follow !== undefined ? 0xffd23f : ROW_COLOR[n.row!];
        const sc = 1 + Math.max(0, left / this.approach) * 1.2;
        v.ring.fillStyle(color, 0.15 + 0.45 * p).fillRoundedRect(x - 55, y - 38, 110, 76, 10);
        v.ring.lineStyle(4, color, 1).strokeRoundedRect(x - 55 * sc, y - 38 * sc, 110 * sc, 76 * sc, 10);
        if (left < this.approach * 0.6) due.add(GRID_KEYS[n.row!][n.col!].toLowerCase());
      }
    }
    // 아래 키패드: 곧 눌러야 할 키 강조
    for (const [k, rect] of this.ui.pad) rect.setStrokeStyle(due.has(k) ? 3 : 1, due.has(k) ? C.orange : 0x555a60);
  }

  private drawHud(b: number) {
    const s = this.s, e = s.enemy;
    const g = this.ui.hp;
    g.clear();
    const cell = 240 / e.headHp;
    g.fillStyle(0x2a2d31).fillRect(56, 42, 240, 12);
    g.fillStyle(C.red).fillRect(56, 42, cell * s.headHp, 12);
    const p = this.ui.poise;
    p.clear();
    const stag = b <= s.staggerUntil;
    if (e.poise < 50) for (let i = 0; i < e.poise; i++) p.fillStyle(stag ? 0xffd23f : i < s.poise ? C.blue : 0x2a2d31).fillRect(56 + i * 26, 62, 22, 10);
    const pr = this.ui.progress;
    pr.clear();
    const bw = 220, bx = W - 16 - bw;
    pr.fillStyle(0x2a2d31).fillRect(bx, 26, bw, 8);
    pr.fillStyle(C.orange).fillRect(bx, 26, bw * Phaser.Math.Clamp(b / s.totalBeats, 0, 1), 8);
    this.ui.noise.setText(`소음 +${noiseNow(s)}`);
    this.ui.combo.setText(s.combo >= 5 ? `${s.combo}\nCOMBO` : '').setAlign('center').setFontSize(s.combo >= 20 ? 46 : 38);
    this.ui.counts.setText(`PERFECT ${s.perfects}\nGOOD ${s.goods}\nMISS ${s.misses}  (3번마다 소음 +1)`);
    const tags = [stag && '비틀! 피해 2배', s.grabbed && '붙잡힘 — 탈출 어퍼!', s.bites && `물림 ${s.bites} · 감염 타이머`].filter(Boolean).join('  ');
    this.ui.status.setText(tags).setBackgroundColor(tags ? HEX(stag && !s.grabbed && !s.bites ? 0x8a6d00 : C.red) : '#00000000');
  }

  // ---------- 연출 ----------

  private moveHead(col: Col) {
    if (col === this.headCol) return;
    this.headCol = col;
    const hx = ((col - 1) * LANE) / this.rootScale;
    this.tweens.add({ targets: this.zombie.head, x: hx, duration: 160, ease: 'Sine.Out' });
    this.tweens.add({ targets: this.zombie.root, angle: (col - 1) * 4, duration: 180 });
  }

  private telegraph(n: Note) {
    const z = this.zombie;
    const a = n.attack!;
    const t = this.approach * this.spb * 1000 * 0.9;
    this.ui.warn.setText(`${ATTACK_INFO[a].name}!`).setAlpha(1);
    sfx.groan();
    if (a === 'swingL') this.tweens.add({ targets: z.armL, angle: 70, duration: t, ease: 'Sine.In' });
    else if (a === 'swingR') this.tweens.add({ targets: z.armR, angle: -70, duration: t, ease: 'Sine.In' });
    else if (a === 'bite') this.tweens.add({ targets: z.head, scale: 0.85, duration: t, ease: 'Sine.In' });
    else {
      this.tweens.add({ targets: z.armL, angle: 45, duration: t });
      this.tweens.add({ targets: z.armR, angle: -45, duration: t });
    }
    if (this.d.tutorial && !this.tips.has('dodge')) {
      this.tips.add('dodge');
      this.say(`공격이 온다! 빨간 원이 줄어들어 닿는 박자에 ${ATTACK_INFO[a].hint}. 피하면 바로 다음 박의 금색 어퍼가 카운터(2배)!`);
    }
  }

  private resetPose() {
    const z = this.zombie;
    this.tweens.add({ targets: [z.armL, z.armR], angle: 0, duration: 200 });
    this.tweens.add({ targets: z.head, scale: 1, duration: 200 });
    this.ui.warn.setText('');
  }

  private target(row: Row, col: Col) { return { x: colX(col), y: this.rowY[row] }; }

  private punchAnim(row: Row, col: Col) {
    const lead = col === 0 || (col === 1 && row === 0);
    const g = lead ? this.gloves.lead : this.gloves.rear;
    const home = lead ? this.gloves.leadHome : this.gloves.rearHome;
    const tg = this.target(row, col);
    this.tweens.killTweensOf(g);
    g.setPosition(home.x, home.y).setScale(1).setAngle(lead ? 8 : -8);
    const angle = row === 2 ? (lead ? 20 : -20) : row === 0 && col !== 1 ? (lead ? 50 : -50) : 0;
    this.tweens.add({
      targets: g, x: tg.x, y: tg.y + 10, scale: 0.55, angle, duration: 70, ease: 'Quad.Out',
      onComplete: () => this.tweens.add({ targets: g, x: home.x, y: home.y, scale: 1, angle: lead ? 8 : -8, duration: 130, delay: 30 }),
    });
  }

  private dodgeAnim(dir: 'left' | 'right' | 'duck') {
    const w = this.world;
    this.tweens.killTweensOf(w);
    w.setPosition(CX, PANEL / 2).setAngle(0);
    const dx = dir === 'left' ? 150 : dir === 'right' ? -150 : 0;
    this.tweens.add({ targets: w, x: CX + dx, y: PANEL / 2 + (dir === 'duck' ? -70 : -8), angle: dir === 'left' ? 5 : dir === 'right' ? -5 : 0, duration: 80, yoyo: true, hold: 160, ease: 'Quad.Out' });
  }

  private float(str: string, x: number, y: number, color: number | string, size = 26) {
    const t = title(this, x, y, str, size, typeof color === 'string' ? color : HEX(color)).setOrigin(0.5).setStroke('#000', 5).setDepth(20);
    this.tweens.add({ targets: t, y: y - 40, alpha: 0, duration: 650, ease: 'Cubic.Out', onComplete: () => t.destroy() });
  }

  private onEvent(ev: RhythmEvent) {
    const cam = this.cameras.main;
    switch (ev.t) {
      case 'judge': {
        const n = ev.note;
        const pos = n.kind === 'dodge' ? { x: CX, y: 132 } : this.target(n.row!, n.col!);
        const label = ev.judge === 'perfect' ? 'PERFECT' : ev.judge === 'good' ? 'GOOD' : 'MISS';
        const col = ev.judge === 'perfect' ? '#ffd23f' : ev.judge === 'good' ? HEX(C.blue) : '#888';
        this.float(label, pos.x, pos.y - 20, col, ev.judge === 'perfect' ? 24 : 20);
        if (ev.judge === 'miss' || n.kind === 'dodge') break;
        const z = this.zombie;
        if (ev.dmg > 0) {
          if (n.row === 2) sfx.heavy(); else sfx.punch();
          cam.shake(70, n.row === 2 ? 0.01 : 0.004);
          this.tweens.add({ targets: z.head, y: z.head.y + (n.row === 2 ? -22 : 0), angle: n.col === 0 ? 12 : n.col === 2 ? -12 : 0, duration: 60, yoyo: true });
          this.float(`−${ev.dmg}`, pos.x + 62, pos.y + 6, ev.counter ? '#ffd23f' : C.orange, ev.counter ? 32 : 24);
          if (ev.counter) this.float('COUNTER', pos.x, pos.y - 56, C.red, 22);
        } else {
          sfx.punch();
          this.tweens.add({ targets: z.root, scale: this.rootScale * 0.96, duration: 60, yoyo: true });
        }
        this.tweens.add({ targets: z.root, alpha: 0.55, duration: 35, yoyo: true });
        if (n.kind === 'punch' && this.d.tutorial && !this.tips.has('first') && ev.judge === 'perfect') {
          this.tips.add('first');
          this.say('좋다! 칸 색: 빨강 = 머리(Q W E), 파랑 = 몸통(A S D), 주황 = 어퍼(Z X C). 아래 키패드에서 눌러야 할 키가 빛난다.');
        }
        break;
      }
      case 'stray':
        sfx.whoosh();
        break;
      case 'evaded':
        sfx.whoosh();
        this.resetPose();
        this.tweens.add({ targets: this.zombie.root, scale: this.rootScale * 1.3, duration: 100, yoyo: true });
        this.float(ev.blind ? '사각! 카운터 3배' : '회피!', CX, 250, C.blue, 28);
        break;
      case 'struck': {
        this.resetPose();
        const r = this.zombie.root;
        this.tweens.add({ targets: r, scale: this.rootScale * (ev.attack === 'bite' ? 2 : 1.5), y: this.zRoot.y + 80, duration: 100, yoyo: true, hold: 60,
          onComplete: () => r.setY(this.zRoot.y).setScale(this.rootScale) });
        this.time.delayedCall(90, () => {
          if (ev.attack === 'bite') { sfx.bite(); this.marks('bite'); this.float('물렸다!', CX, 250, C.red, 34); }
          else if (ev.attack === 'grab') {
            sfx.punch(); this.float('잡혔다! 금색 어퍼로 탈출', CX, 250, C.red, 28);
          } else { sfx.heavy(); sfx.door(); this.marks('slash'); this.float(`쾅! 소음 +${ev.noise}`, CX, 250, C.orange, 28); }
          cam.flash(180, 229, 72, 77);
          cam.shake(200, 0.014);
        });
        break;
      }
      case 'stagger':
        this.float('자세 붕괴! 4박 동안 피해 2배', CX, 300, '#ffd23f', 24);
        this.tweens.add({ targets: this.zombie.root, angle: 9, duration: 120, yoyo: true, repeat: 2 });
        break;
      case 'escape':
        this.float('탈출!', CX, 250, '#ffd23f', 34);
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
        for (const v of this.views.values()) { v.ring.destroy(); v.label?.destroy(); }
        this.views.clear();
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
    } else for (let i = 0; i < 3; i++) g.lineBetween(300 + i * 60, 80, 520 + i * 60, 330);
    this.tweens.add({ targets: g, alpha: 0, delay: 350, duration: 700, onComplete: () => g.destroy() });
  }

  private finish() {
    const s = this.s;
    const noise = noiseNow(s);
    const quiet = s.outcome === 'ko' && noise === 0 && s.hitsTaken === 0;
    const head =
      s.outcome === 'ko'
        ? quiet ? '박자를 놓치지 않고, 맞지 않고, 끝냈다. 소음 0.' : `KO · 소음 +${noise}${s.bites ? ` · 물림 ${s.bites}` : ''}`
        : `노래가 끝났다. 끝내지 못했다 · 소음 +${noise}`;
    const panel = this.add.container(CX, 290).setDepth(45);
    const bg = this.add.rectangle(0, 0, 560, 104, 0x000000, 0.85).setStrokeStyle(1, C.orange);
    const t = text(this, 0, -28, head, 18, quiet ? HEX(C.green) : '#fff', { fontStyle: '700' }).setOrigin(0.5);
    const st = text(this, 0, 2, `PERFECT ${s.perfects} · GOOD ${s.goods} · MISS ${s.misses} · 최대 콤보 ${s.maxCombo}`, 13, '#ddd').setOrigin(0.5);
    const hint = text(this, 0, 30, 'Enter 또는 클릭 — 복도로 돌아간다', 12, '#aaa').setOrigin(0.5);
    panel.add([bg, t, st, hint]).setAlpha(0);
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
