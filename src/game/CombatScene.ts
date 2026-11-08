// 리듬 복싱 전투 (1인칭, 태리의 눈).
// 감염자 위에 3×3 칸이 겹쳐 있고, 박자에 맞춰 노트가 온다. 칸에 링이 닿는 순간 그 칸의 키를 누른다.
//   Q W E 머리 · A S D 몸통 · Z X C 어퍼 / ← ↓ → 피하기
// 태리는 왼쪽 눈이 보이지 않는다: 화면 왼쪽은 어둡고, 왼쪽 노트는 왼쪽 귀로 들어야 한다.
import Phaser from 'phaser';
import {
  advance, ATTACK_INFO, GRID_KEYS, hit, KEY_GRID, msPerBeat, noiseNow, release, startRhythm, takeEvents,
  type Col, type Note, type RhythmEvent, type RhythmState, type Row,
} from '../rules/rhythm';
import { STORY_FIGHTS, startStoryFight, type StoryFight } from '../rules/storyFights';
import { drawGloves, drawZombieFront, imageZombie, type Gloves, type ZombieFront } from './art';
import { coverImage, slotKey } from './images';
import { audioLatency, audioRawNow, beat as drum, cueLeft, sfx } from './sfx';
import { button, C, H, HEX, text, title, W } from './theme';

export interface CombatSummary { outcome: 'ko' | 'timeout' | 'clear'; noise: number; bites: number }

export interface CombatData {
  /** 연습 전투의 적 (normal / crawler / horyong) */
  enemy?: string;
  /** 원작 장면 (STORY_FIGHTS) */
  story?: string;
  seed?: number;
  /** 태리의 옷 (주먹 그림): 1~3화는 교복, 연습은 트레이닝복 */
  outfit?: 'uni' | 'track';
  onDone: (r: CombatSummary) => void;
}

const PANEL = 420;
const CX = W / 2;
const LANE = 150;
const colX = (c: number) => CX + (c - 1) * LANE;
const ROW_COLOR = [C.red, C.blue, C.orange];
const ROW_NAME = ['머리', '몸통', '어퍼'];
const BASS = [110, 87.31, 130.81, 98];
/** 놓침 판정 유예(초) */
const MISS_GRACE = 0.15;
const BLIND_W = 330; // 안대 쪽 어둠의 폭
/** 피하기 원의 위치: 왼쪽에서만 오는 공격은 안 보이는 쪽에 뜬다 */
const dodgePos = (n: Note) => ((n.dodge?.length === 1 && n.dodge[0] === 'left') ? { x: 135, y: 250 } : { x: W - 135, y: 250 });

interface NoteView { note: Note; ring: Phaser.GameObjects.Graphics; label?: Phaser.GameObjects.Text }

export class CombatScene extends Phaser.Scene {
  private d!: CombatData;
  private s!: RhythmState;
  private fight?: StoryFight;
  private spb = 0.6;
  private start = 0;
  private scheduled = -1;
  private cued = new Set<number>();
  private approach = 1.5;
  private finished = false;
  private lastBeatInt = -1;
  private lineIdx = 0;
  private world!: Phaser.GameObjects.Container;
  private zombie?: ZombieFront;
  private zRoot = { x: 0, y: 0 };
  private rootScale = 1;
  private rowY: number[] = [160, 268, 372];
  private gloves!: Gloves;
  private views = new Map<number, NoteView>();
  private headCol: Col = 1;
  private lookIdx = 0;
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
    blind: Phaser.GameObjects.Graphics;
    ally: Phaser.GameObjects.Text;
  };

  constructor() { super('combat'); }

  init(d: CombatData) {
    this.d = d;
    this.finished = false;
    this.scheduled = -1;
    this.lastBeatInt = -1;
    this.lineIdx = 0;
    this.views = new Map();
    this.cued = new Set();
    this.headCol = 1;
    this.lookIdx = 0;
    this.zombie = undefined;
  }

  create() {
    this.fight = this.d.story ? STORY_FIGHTS[this.d.story] : undefined;
    this.s = this.fight ? startStoryFight(this.fight.id) : startRhythm(this.d.enemy ?? 'normal', this.d.seed ?? 1);
    const e = this.s.enemy;
    this.spb = msPerBeat(this.s.bpm) / 1000;
    this.approach = this.fight ? 2 : 1.5;

    this.world = this.add.container(CX, PANEL / 2);
    const bg = this.fight?.bg ?? 'hall';
    const bgImg = slotKey(this, `fight:${bg}`);
    if (bgImg) this.world.add(coverImage(this, bgImg, -CX - 200, -PANEL / 2 - 100, W + 400, PANEL + 200)); // 피할 때 흔들려도 가장자리가 보이지 않게
    else if (bg === 'stairs') this.drawStairs();
    else if (bg === 'room') this.drawRoom();
    else if (bg === 'wall') this.drawWall();
    else this.drawCorridor();

    const kind = this.fight ? this.fight.look : e.id;
    this.rootScale = kind === 'horyong' ? 1.15 : 1;
    this.rowY = e.low ? [190, 318, 392] : kind === 'horyong' ? [152, 270, 372] : [160, 268, 372];
    if (kind) {
      const rootY = kind === 'horyong' ? 385 : 360;
      this.zRoot = { x: 0, y: rootY - PANEL / 2 };
      this.zombie = this.makeZombie(kind, !!e.low);
    }

    const outfit = this.d.outfit ?? (this.fight ? 'uni' : 'track');
    const fist = (side: 'left' | 'right') => slotKey(this, outfit === 'track' ? `fist:${side}_track` : `fist:${side}`) ?? slotKey(this, `fist:${side}`);
    this.gloves = drawGloves(this, CX, 392, { left: fist('left'), right: fist('right') });
    this.gloves.lead.x = this.gloves.leadHome.x = CX - 250;
    this.gloves.rear.x = this.gloves.rearHome.x = CX + 250;

    this.drawUi();
    this.cameras.main.fadeIn(250);
    if (this.zombie) {
      this.zombie.root.setScale(0.55 * this.rootScale).setAlpha(0.2);
      this.tweens.add({ targets: this.zombie.root, scale: this.rootScale, alpha: 1, duration: 420, ease: 'Back.Out' });
    }

    this.start = audioRawNow() + 0.6;
    this.say(this.fight ? this.fight.intro : `${e.name} — ${e.desc}`);

    // 판정은 키를 누른 순간(ev.timeStamp) 기준: 화면이 잠깐 멈춰 처리가 늦어도 손해 보지 않는다
    this.input.keyboard!.on('keydown', (ev: KeyboardEvent) => { if (!ev.repeat) this.onKey(ev.key, ev.timeStamp); });
    this.input.keyboard!.on('keyup', (ev: KeyboardEvent) => this.onKeyUp(ev.key, ev.timeStamp));
  }

  private makeZombie(kind: string, low: boolean): ZombieFront {
    const img = slotKey(this, `enemy:${kind}`);
    const z = img ? imageZombie(this, 0, this.zRoot.y, img, low) : drawZombieFront(this, 0, this.zRoot.y, kind);
    this.world.add(z.root);
    return z;
  }

  /** 여럿과 싸우는 장면: 지금 상대가 쓰러지고 다음 상대가 들어온다 */
  private nextEnemy() {
    const old = this.zombie;
    const looks = this.fight?.looks;
    if (!old || !looks?.length) return;
    sfx.heavy();
    this.cameras.main.shake(140, 0.01);
    this.tweens.killTweensOf([old.head, old.root]);
    this.tweens.add({ targets: old.root, y: old.root.y + 260, scale: 0.6, angle: (this.lookIdx % 2 ? -1 : 1) * 14, alpha: 0, duration: 420, ease: 'Quad.In', onComplete: () => old.root.destroy() });
    const kind = looks[this.lookIdx++ % looks.length];
    this.headCol = 1;
    const z = this.makeZombie(kind, kind === 'suitStairs');
    z.root.setScale(0.55 * this.rootScale).setAlpha(0);
    this.tweens.add({ targets: z.root, scale: this.rootScale, alpha: 1, duration: 260, delay: 140, ease: 'Back.Out' });
    this.zombie = z;
  }

  private beatNow() {
    return (audioRawNow() - audioLatency() - this.start) / this.spb;
  }

  /** 박 단위 시각. at = 키를 누른 순간(performance.now 기준 ms), 없으면 지금 */
  private beatAt(at?: number) {
    const late = at === undefined ? 0 : Math.max(0, performance.now() - at) / 1000;
    return this.beatNow() - late / this.spb;
  }

  private onKey(raw: string, at?: number) {
    if (this.finished) return;
    const k = raw.toLowerCase();
    const b = this.beatAt(at);
    if (k in KEY_GRID) {
      this.flashPad(k);
      const [row, col] = KEY_GRID[k];
      this.punchAnim(row, col as Col);
    } else if (k === 'arrowleft' || k === 'arrowright' || k === 'arrowdown' || k === ' ') {
      this.dodgeAnim(k === 'arrowleft' ? 'left' : k === 'arrowright' ? 'right' : 'duck');
    } else return;
    hit(this.s, k, b);
  }

  private onKeyUp(raw: string, at?: number) {
    if (this.finished) return;
    release(this.s, raw, this.beatAt(at));
  }

  // ---------- 배경 ----------

  private poly(g: Phaser.GameObjects.Graphics, pts: [number, number][], color: number, alpha = 1) {
    const ox = -CX, oy = -PANEL / 2;
    g.fillStyle(color, alpha).beginPath();
    const [f, ...rest] = pts;
    g.moveTo(f[0] + ox, f[1] + oy);
    rest.forEach(([x, y]) => g.lineTo(x + ox, y + oy));
    g.closePath().fillPath();
  }

  private drawCorridor() {
    const g = this.add.graphics();
    const vx = CX, vy = 170;
    g.fillStyle(C.night).fillRect(-CX - 300, -PANEL / 2 - 300, W + 600, PANEL + 600);
    this.poly(g, [[-300, -300], [W + 300, -300], [vx + 60, vy - 45], [vx - 60, vy - 45]], 0x2e3237);
    this.poly(g, [[-300, -300], [vx - 60, vy - 45], [vx - 60, vy + 45], [-300, PANEL + 300]], C.concrete);
    this.poly(g, [[W + 300, -300], [vx + 60, vy - 45], [vx + 60, vy + 45], [W + 300, PANEL + 300]], 0x15181e);
    this.poly(g, [[-300, PANEL + 300], [vx - 60, vy + 45], [vx + 60, vy + 45], [W + 300, PANEL + 300]], C.floor);
    this.poly(g, [[vx - 60, vy - 45], [vx + 60, vy - 45], [vx + 60, vy + 45], [vx - 60, vy + 45]], 0x050506);
    const wallTop = (x: number) => -300 + ((vy - 45 + 300) * (x + 300)) / (vx - 60 + 300);
    const wallBot = (x: number) => PANEL + 300 + ((vy + 45 - PANEL - 300) * (x + 300)) / (vx - 60 + 300);
    for (const [x1, x2] of [[-40, 100], [180, 255], [300, 340], [362, 386]]) {
      const h = (x: number) => wallBot(x) - wallTop(x);
      this.poly(g, [[x1, wallBot(x1) - h(x1) * 0.6], [x2, wallBot(x2) - h(x2) * 0.6], [x2, wallBot(x2)], [x1, wallBot(x1)]], C.door, 0.9);
    }
    g.lineStyle(3, 0x3a3e44);
    for (const t of [0.1, 0.3, 0.5, 0.65, 0.78, 0.88]) {
      const x = W + 300 + (vx + 60 - (W + 300)) * t;
      const y1 = PANEL + 300 + (vy + 45 - (PANEL + 300)) * t;
      g.lineBetween(x - CX, y1 - PANEL / 2, x - CX, y1 - 100 * (1 - t) - PANEL / 2);
    }
    this.world.add(g);
    this.world.add([this.add.ellipse(0, -PANEL / 2 + 30, 640, 160, 0xfff6d8, 0.07), this.add.rectangle(0, -PANEL / 2 + 24, 260, 8, 0xfff6d8)]);
  }

  /** 계단실: 비상유도등의 초록빛, 네모난 소용돌이 */
  private drawStairs() {
    const g = this.add.graphics();
    const ox = -CX, oy = -PANEL / 2;
    g.fillStyle(0x0c120f).fillRect(ox - 300, oy - 300, W + 600, PANEL + 600);
    // 아래로 감겨 내려가는 계단 (원근)
    for (let i = 0; i < 9; i++) {
      const t = i / 9;
      const y = 470 - i * 34, w = 760 - i * 70;
      this.poly(g, [[CX - w / 2, y], [CX + w / 2, y], [CX + w / 2 - 30, y - 30], [CX - w / 2 + 30, y - 30]], Phaser.Display.Color.GetColor(50 - t * 30, 56 - t * 30, 54 - t * 30));
    }
    this.poly(g, [[-300, -300], [210, 40], [210, 470], [-300, PANEL + 300]], 0x2b302d); // 왼쪽 벽
    this.poly(g, [[W + 300, -300], [750, 40], [750, 470], [W + 300, PANEL + 300]], 0x252a27);
    g.lineStyle(5, 0x5a605c); // 난간
    g.lineBetween(760 + ox, 330 + oy, 640 + ox, 120 + oy).lineBetween(640 + ox, 120 + oy, 330 + ox, 120 + oy);
    for (let i = 0; i < 6; i++) g.lineBetween(745 - i * 22 + ox, 305 - i * 37 + oy, 745 - i * 22 + ox, 345 - i * 37 + oy);
    // 비상유도등
    g.fillStyle(0x1f9a4a).fillRect(250 + ox, 70 + oy, 70, 26);
    g.fillStyle(0xe8ffe8).fillCircle(266 + ox, 80 + oy, 4).fillRect(272 + ox, 78 + oy, 30, 4);
    this.world.add(g);
    this.world.add(this.add.ellipse(285 - CX, 85 - PANEL / 2, 420, 260, 0x2ecc71, 0.08));
  }

  /** 불 끈 1502호 거실, 커튼 틈 */
  private drawRoom() {
    const g = this.add.graphics();
    const ox = -CX, oy = -PANEL / 2;
    g.fillStyle(0x101216).fillRect(ox - 300, oy - 300, W + 600, PANEL + 600);
    g.fillStyle(0x1a1d23).fillRect(ox + 120, oy + 40, 720, 300);
    g.fillStyle(0x2a3140).fillRect(ox + 560, oy + 70, 200, 200); // 창
    g.fillStyle(0x3b2f2a).fillRect(ox + 540, oy + 60, 70, 230).fillRect(ox + 710, oy + 60, 70, 230); // 커튼
    g.fillStyle(0xffb35c, 0.35).fillRect(ox + 640, oy + 120, 6, 4).fillRect(ox + 668, oy + 180, 6, 4);
    g.fillStyle(0x14161a).fillRect(ox - 300, oy + 340, W + 600, 400);
    this.world.add(g);
  }

  /** 1502호 베란다 끝, 경량 칸막이 */
  private drawWall() {
    const g = this.add.graphics();
    const ox = -CX, oy = -PANEL / 2;
    g.fillStyle(0x1a1c20).fillRect(ox - 300, oy - 300, W + 600, PANEL + 600);
    g.fillStyle(0xd6d2c6).fillRect(ox + 230, oy + 30, 500, 380);
    g.lineStyle(2, 0xb8b3a6).strokeRect(ox + 230, oy + 30, 500, 380);
    g.fillStyle(0xe8d9a8).fillRect(ox + 380, oy + 110, 200, 70);
    this.world.add(g);
    this.world.add(text(this, 0, 145 - PANEL / 2, '비상시 이 벽을 깨고\n옆 세대로 대피하십시오', 14, '#5a4a2a', { align: 'center', fontStyle: '700' }).setOrigin(0.5));
  }

  // ---------- UI ----------

  private drawUi() {
    const D = 10;
    const panel = this.add.graphics().setDepth(5);
    panel.fillStyle(0x0f1012).fillRect(0, PANEL, W, H - PANEL);
    panel.fillStyle(0x000000, 0.6).fillRect(0, PANEL, W, 3);

    const cells = this.add.graphics().setDepth(7);
    for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) {
      text(this, colX(c) - 50, this.rowY[r] - 34, GRID_KEYS[r][c], 13, HEX(ROW_COLOR[r]), { fontStyle: '700' }).setAlpha(0.55).setDepth(7);
    }

    // 안대 쪽: 화면 왼쪽이 어둡다
    const blind = this.add.graphics().setDepth(8.5);
    const ally = !!this.fight?.ally;
    for (let i = 0; i < 24; i++) {
      const w = BLIND_W * (1 - i / 24);
      blind.fillStyle(0x000000, (ally ? 0.04 : 0.075)).fillRect(0, 0, w, PANEL);
    }
    const allyText = text(this, 24, PANEL - 40, '', 14, '#9fe0ff', { fontStyle: '700', stroke: '#000', strokeThickness: 4 }).setDepth(12);

    const story = !!this.fight;
    title(this, 16, 10, this.s.enemy.name, 20, HEX(C.paper)).setDepth(D).setStroke('#000', 4);
    const hp = this.add.graphics().setDepth(D);
    const poise = this.add.graphics().setDepth(D);
    if (!story) {
      text(this, 16, 40, '머리', 12, '#bbb').setDepth(D);
      text(this, 16, 60, '자세', 12, '#bbb').setDepth(D);
    }
    text(this, W - 16, 8, `♩=${this.s.bpm}`, 12, '#999').setOrigin(1, 0).setDepth(D);
    const progress = this.add.graphics().setDepth(D);
    const noise = text(this, W - 16, 40, '', 15, HEX(C.orange), { fontStyle: '700', stroke: '#000', strokeThickness: 3 }).setOrigin(1, 0).setDepth(D);
    const status = text(this, W - 16, 64, '', 13, '#fff', { fontStyle: '700', padding: { x: 6, y: 2 } }).setOrigin(1, 0).setDepth(D);
    const caption = text(this, CX, 44, '', 14, HEX(C.paper), {
      fontFamily: '"Noto Serif KR", serif', align: 'center', wordWrap: { width: 640 }, backgroundColor: '#000000bb', padding: { x: 12, y: 7 }, lineSpacing: 4,
    }).setOrigin(0.5, 0).setDepth(D + 2);
    const warn = title(this, CX, 116, '', 26, HEX(C.red)).setOrigin(0.5).setStroke('#000', 6).setDepth(D + 1);
    const combo = title(this, W - 110, 120, '', 40, '#ffd23f').setOrigin(0.5).setStroke('#000', 6).setDepth(D);
    const count = title(this, CX, 220, '', 90, HEX(C.orange)).setOrigin(0.5).setStroke('#000', 8).setDepth(50);

    const pulse = this.add.circle(70, PANEL + 60, 22, C.red, 0.9).setDepth(D);
    text(this, 70, PANEL + 102, '박자', 11, '#777').setOrigin(0.5).setDepth(D);
    const counts = text(this, 112, PANEL + 30, '', 12, '#bbb', { lineSpacing: 4 }).setDepth(D);

    const pad = new Map<string, Phaser.GameObjects.Rectangle>();
    const pw = 108, ph = 34, px0 = 262, py0 = PANEL + 8;
    GRID_KEYS.forEach((row, r) => row.forEach((k, c) => {
      const x = px0 + c * (pw + 6) + pw / 2, y = py0 + r * (ph + 4) + ph / 2;
      const rect = this.add.rectangle(x, y, pw, ph, 0x1d2024).setStrokeStyle(1, 0x555a60).setDepth(D).setInteractive({ useHandCursor: true });
      rect.on('pointerdown', () => this.onKey(k));
      rect.on('pointerup', () => this.onKeyUp(k));
      rect.on('pointerout', () => this.onKeyUp(k));
      text(this, x - pw / 2 + 8, y, k, 15, HEX(ROW_COLOR[r]), { fontStyle: '700' }).setOrigin(0, 0.5).setDepth(D);
      text(this, x + 10, y, `${['왼', '정면', '오른'][c]} ${ROW_NAME[r]}`, 11, '#ccc').setOrigin(0.5).setDepth(D);
      pad.set(k.toLowerCase(), rect);
    }));
    ([['ArrowLeft', '←', '왼쪽'], ['ArrowDown', '↓', '숙이기'], ['ArrowRight', '→', '오른쪽']] as const).forEach(([key, arrow, label], i) => {
      const b = button(this, 662 + i * 98, PANEL + 64, 90, 64, '', () => this.onKey(key));
      b.label.setText(`${arrow}\n${label}`).setAlign('center').setFontSize(16);
      b.setDepth(D);
    });
    text(this, 760, PANEL + 10, '피하기  ← ↓(Space) →', 11, '#777').setOrigin(0.5, 0).setDepth(D);

    this.ui = { hp, poise, progress, noise, combo, counts, caption, warn, status, count, cells, pulse, pad, blind, ally: allyText };
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
    const story = !!this.fight;
    while (this.scheduled < total) {
      const next = this.scheduled + 1;
      const t0 = this.start + next * this.spb;
      if (t0 > ahead) break;
      this.scheduled = next;
      if (next < 4) { drum.stick(t0); continue; }
      const inBar = (next - 4) % 4;
      const bar = Math.floor((next - 4) / 4);
      drum.kick(t0);
      drum.kick(t0 + this.spb * 0.25, true); // 쿵-쿵
      if (!story || this.fight!.mode === 'practice') {
        drum.hat(t0 + this.spb * 0.5);
        if (inBar === 1 || inBar === 3) drum.snare(t0);
        if (inBar === 0) drum.bass(t0, BASS[bar % 4], this.spb * 1.8);
      }
    }
    // 안대 쪽(왼쪽) 노트는 한 박 먼저 왼쪽 귀로 알린다
    for (const n of this.s.notes) {
      if (this.cued.has(n.id)) continue;
      const left = n.col === 0 || (n.kind === 'dodge' && (n.dodge ?? []).includes('left') && n.dodge!.length === 1);
      if (!left) continue;
      const t = this.start + (n.beat - 1) * this.spb;
      if (t > ahead) break;
      this.cued.add(n.id);
      if (t > audioRawNow() - 0.05) cueLeft(t);
    }
  }

  // ---------- 매 프레임 ----------

  update() {
    if (this.finished) return;
    this.scheduleMusic();
    const b = this.beatNow();
    // 놓침 판정은 조금 늦게: 화면이 버벅여 키 처리가 늦게 와도, 누른 시각이 맞으면 맞은 걸로 친다
    advance(this.s, b - MISS_GRACE / this.spb);
    for (const ev of takeEvents(this.s)) this.onEvent(ev);

    const bi = Math.floor(b);
    if (bi !== this.lastBeatInt && b >= 0) {
      this.lastBeatInt = bi;
      if (bi < 4) {
        this.ui.count.setText(bi === 3 ? (this.fight ? '' : 'FIGHT') : String(bi + 1)).setScale(1.4).setAlpha(1);
        this.tweens.add({ targets: this.ui.count, scale: 1, alpha: bi === 3 ? 0 : 0.6, duration: this.spb * 900 });
      }
      this.ui.pulse.setScale(1.3).setAlpha(1);
      this.tweens.add({ targets: this.ui.pulse, scale: 1, alpha: 0.5, duration: this.spb * 700 });
    }
    // 원작 문장
    const lines = this.fight?.lines ?? [];
    while (this.lineIdx < lines.length && b >= lines[this.lineIdx].beat) this.say(lines[this.lineIdx++].text);

    this.drawNotes(b);
    this.drawHud(b);

    if (this.s.outcome !== 'ongoing' && !this.finished) {
      this.finished = true;
      const o = this.s.outcome;
      this.time.delayedCall(o === 'fail' ? 700 : o === 'timeout' ? 500 : 1300, () => this.finish());
    }
  }

  private drawNotes(b: number) {
    const s = this.s;
    for (const n of s.notes) {
      if (n.beat - b > this.approach) break;
      if (n.judge || this.views.has(n.id)) continue;
      const ring = this.add.graphics().setDepth(8);
      let label: Phaser.GameObjects.Text | undefined;
      if (n.kind === 'dodge') {
        const hint = n.label ?? ATTACK_INFO[n.attack!].hint;
        const dp = dodgePos(n);
        label = title(this, dp.x, dp.y + 78, hint, 20, HEX(C.red)).setOrigin(0.5).setStroke('#000', 6).setDepth(dp.x < CX ? 8 : 9);
        this.telegraph(n);
      } else {
        if (n.row !== 1 || s.enemy.low) this.moveHead(n.col!);
        const txt = n.label ?? (n.follow !== undefined ? (s.grabbed ? '탈출!' : 'COUNTER') : '');
        if (txt) label = text(this, colX(n.col!), this.rowY[n.row!] + 50, txt, 13, '#ffd23f', { fontStyle: '700', stroke: '#000', strokeThickness: 4 }).setOrigin(0.5).setDepth(9);
        if (n.col === 0 && this.fight?.ally) {
          this.ui.ally.setText('세훈: “왼쪽!”').setAlpha(1);
          this.tweens.add({ targets: this.ui.ally, alpha: 0, delay: 600, duration: 400 });
        }
      }
      this.views.set(n.id, { note: n, ring, label });
    }
    const g = this.ui.cells;
    g.clear();
    for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) g.lineStyle(1, 0xffffff, 0.12).strokeRoundedRect(colX(c) - 55, this.rowY[r] - 38, 110, 76, 10);
    const due = new Set<string>();
    for (const [id, v] of this.views) {
      const n = v.note;
      if (n.judge && !n.holding) { v.ring.destroy(); v.label?.destroy(); this.views.delete(id); continue; }
      const left = n.beat - b;
      const p = Phaser.Math.Clamp(1 - left / this.approach, 0, 1.15);
      v.ring.clear();
      if (n.kind === 'dodge') {
        const sc = 1 + Math.max(0, left / this.approach) * 1.6;
        const dp = dodgePos(n);
        v.ring.lineStyle(5, C.red, Math.min(1, p + 0.2)).strokeCircle(dp.x, dp.y, 46 * sc);
        v.ring.fillStyle(C.red, 0.25 * p).fillCircle(dp.x, dp.y, 46);
        for (const d of n.dodge ?? ATTACK_INFO[n.attack!].dodge) due.add(d === 'left' ? 'arrowleft' : d === 'right' ? 'arrowright' : 'arrowdown');
      } else {
        const x = colX(n.col!), y = this.rowY[n.row!];
        const color = n.kind === 'stop' ? 0xffffff : n.follow !== undefined ? 0xffd23f : ROW_COLOR[n.row!];
        const sc = 1 + Math.max(0, left / this.approach) * 1.2;
        if (n.holding && n.hold) {
          // 클린치: 버틴 만큼 차오른다
          const f = Phaser.Math.Clamp((b - n.beat) / n.hold, 0, 1);
          v.ring.fillStyle(color, 0.35).fillRoundedRect(x - 55, y - 38, 110, 76, 10);
          v.ring.fillStyle(color, 0.9).fillRect(x - 50, y + 26, 100 * f, 8);
          v.ring.lineStyle(4, 0xffffff, 1).strokeRoundedRect(x - 55, y - 38, 110, 76, 10);
        } else {
          v.ring.fillStyle(color, 0.15 + 0.45 * p).fillRoundedRect(x - 55, y - 38, 110, 76, 10);
          v.ring.lineStyle(4, color, 1).strokeRoundedRect(x - 55 * sc, y - 38 * sc, 110 * sc, 76 * sc, 10);
          if (n.hold) v.ring.lineStyle(2, color, 0.7).strokeRoundedRect(x - 60, y - 43, 120, 86, 12);
        }
        if (left < this.approach * 0.6 && n.kind !== 'stop') due.add(GRID_KEYS[n.row!][n.col!].toLowerCase());
      }
    }
    for (const [k, rect] of this.ui.pad) rect.setStrokeStyle(due.has(k) ? 3 : 1, due.has(k) ? C.orange : 0x555a60);
  }

  private drawHud(b: number) {
    const s = this.s, e = s.enemy;
    const pr = this.ui.progress;
    pr.clear();
    const bw = 220, bx = W - 16 - bw;
    pr.fillStyle(0x2a2d31).fillRect(bx, 26, bw, 8);
    pr.fillStyle(C.orange).fillRect(bx, 26, bw * Phaser.Math.Clamp(b / s.totalBeats, 0, 1), 8);
    if (this.fight) {
      const lives = this.fight.mode === 'story' ? `\n버틸 수 있음 ${'●'.repeat(Math.max(0, s.lives))}${'○'.repeat(Math.max(0, 3 - s.lives))}` : '';
      this.ui.counts.setText(`PERFECT ${s.perfects}  GOOD ${s.goods}  MISS ${s.misses}${lives}`);
      return;
    }
    const g = this.ui.hp;
    g.clear();
    g.fillStyle(0x2a2d31).fillRect(56, 42, 240, 12);
    g.fillStyle(C.red).fillRect(56, 42, (240 / e.headHp) * s.headHp, 12);
    const p = this.ui.poise;
    p.clear();
    const stag = b <= s.staggerUntil;
    if (e.poise < 50) for (let i = 0; i < e.poise; i++) p.fillStyle(stag ? 0xffd23f : i < s.poise ? C.blue : 0x2a2d31).fillRect(56 + i * 26, 62, 22, 10);
    this.ui.noise.setText(`소음 +${noiseNow(s)}`);
    this.ui.combo.setText(s.combo >= 5 ? `${s.combo}\nCOMBO` : '').setAlign('center');
    this.ui.counts.setText(`PERFECT ${s.perfects}\nGOOD ${s.goods}\nMISS ${s.misses}  (3번마다 소음 +1)`);
    const tags = [stag && '비틀! 피해 2배', s.grabbed && '붙잡힘 — 탈출 어퍼!', s.bites && `물림 ${s.bites} · 감염 타이머`].filter(Boolean).join('  ');
    this.ui.status.setText(tags).setBackgroundColor(tags ? HEX(C.red) : '#00000000');
  }

  // ---------- 연출 ----------

  private moveHead(col: Col) {
    if (!this.zombie || col === this.headCol) return;
    this.headCol = col;
    if (this.zombie.image) {
      // 그림 한 장: 몸 전체가 머리 쪽으로 기운다
      this.tweens.add({ targets: this.zombie.root, x: this.zRoot.x + (col - 1) * LANE * 0.8, duration: 180, ease: 'Sine.Out' });
      return;
    }
    this.tweens.add({ targets: this.zombie.head, x: ((col - 1) * LANE) / this.rootScale, duration: 160, ease: 'Sine.Out' });
    this.tweens.add({ targets: this.zombie.root, angle: (col - 1) * 4, duration: 180 });
  }

  private telegraph(n: Note) {
    const z = this.zombie;
    if (!z) return;
    const t = this.approach * this.spb * 1000 * 0.9;
    if (!this.fight) { this.ui.warn.setText(`${ATTACK_INFO[n.attack!].name}!`).setAlpha(1); sfx.groan(); }
    const dirs = n.dodge ?? ATTACK_INFO[n.attack!].dodge;
    if (dirs.length === 1 && dirs[0] === 'left') {
      // 안대 쪽에서 붙잡는다
      this.tweens.add({ targets: z.root, x: this.zRoot.x - 200, duration: t, ease: 'Sine.In' });
      this.tweens.add({ targets: z.armR, angle: -50, duration: t });
    } else if (n.attack === 'swingL') this.tweens.add({ targets: z.armL, angle: 70, duration: t, ease: 'Sine.In' });
    else if (n.attack === 'swingR') this.tweens.add({ targets: z.armR, angle: -70, duration: t, ease: 'Sine.In' });
    else if (n.attack === 'grab') { this.tweens.add({ targets: z.armL, angle: 45, duration: t }); this.tweens.add({ targets: z.armR, angle: -45, duration: t }); }
    else this.tweens.add({ targets: z.head, scale: 0.85, duration: t, ease: 'Sine.In' });
  }

  private resetPose() {
    const z = this.zombie;
    if (!z) return;
    this.tweens.add({ targets: [z.armL, z.armR], angle: 0, duration: 200 });
    this.tweens.add({ targets: z.head, scale: 1, duration: 200 });
    this.tweens.add({ targets: z.root, x: this.zRoot.x, duration: 200 });
    this.ui.warn.setText('');
  }

  private target(row: Row, col: Col) { return { x: colX(col), y: this.rowY[row] }; }

  private punchAnim(row: Row, col: Col, stopShort = false) {
    const lead = col === 0 || (col === 1 && row === 0 && !stopShort);
    const g = lead ? this.gloves.lead : this.gloves.rear;
    const home = lead ? this.gloves.leadHome : this.gloves.rearHome;
    const tg = this.target(row, col);
    this.tweens.killTweensOf(g);
    g.setPosition(home.x, home.y).setScale(1).setAngle(lead ? 8 : -8);
    const angle = row === 2 ? (lead ? 20 : -20) : row === 0 && col !== 1 ? (lead ? 50 : -50) : 0;
    const tx = stopShort ? home.x + (tg.x - home.x) * 0.8 : tg.x;
    const ty = stopShort ? home.y + (tg.y + 10 - home.y) * 0.8 : tg.y + 10;
    this.tweens.add({
      targets: g, x: tx, y: ty, scale: stopShort ? 0.62 : 0.55, angle, duration: 70, ease: 'Quad.Out',
      onComplete: () => this.tweens.add({ targets: g, x: home.x, y: home.y, scale: 1, angle: lead ? 8 : -8, duration: 130, delay: stopShort ? 900 : 30 }),
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
    this.tweens.add({ targets: t, y: y - 40, alpha: 0, duration: 800, ease: 'Cubic.Out', onComplete: () => t.destroy() });
  }

  private onEvent(ev: RhythmEvent) {
    const cam = this.cameras.main;
    const z = this.zombie;
    switch (ev.t) {
      case 'judge': {
        const n = ev.note;
        const pos = n.kind === 'dodge' ? dodgePos(n) : this.target(n.row!, n.col!);
        const label = ev.judge === 'perfect' ? 'PERFECT' : ev.judge === 'good' ? 'GOOD' : 'MISS';
        const col = ev.judge === 'perfect' ? '#ffd23f' : ev.judge === 'good' ? HEX(C.blue) : '#888';
        this.float(label, pos.x, pos.y - 20, col, ev.judge === 'perfect' ? 24 : 20);
        if (ev.judge === 'miss') {
          // 원작 장면에서 놓치면 한 번 맞는다 (기회 하나가 준다)
          if (this.fight?.mode === 'story' && this.s.outcome === 'ongoing') {
            if (n.kind === 'dodge') { sfx.punch(); cam.flash(160, 229, 72, 77); cam.shake(160, 0.01); }
            this.float(`기회 ${this.s.lives}`, CX, 330, '#ff9b9b', 20);
          }
          break;
        }
        if (n.kind === 'dodge') { sfx.whoosh(); this.resetPose(); break; }
        if (!z) { if (this.fight?.bg === 'wall') this.wallBreak(); else sfx.whoosh(); break; }
        if (n.row === 2) sfx.heavy(); else sfx.punch();
        cam.shake(70, n.row === 2 ? 0.01 : 0.004);
        this.tweens.add({ targets: z.head, y: z.head.y + (n.row === 2 ? -22 : 0), angle: n.col === 0 ? 12 : n.col === 2 ? -12 : 0, duration: 60, yoyo: true });
        this.tweens.add({ targets: z.root, alpha: 0.55, duration: 35, yoyo: true });
        if (!this.fight && ev.dmg > 0) this.float(`−${ev.dmg}`, pos.x + 62, pos.y + 6, ev.counter ? '#ffd23f' : C.orange, ev.counter ? 32 : 24);
        if (ev.counter) this.float('COUNTER', pos.x, pos.y - 56, C.red, 22);
        break;
      }
      case 'stopped': {
        // 주먹이 한 뼘 앞에서 멈춘다
        this.punchAnim(0, 1, true);
        this.time.timeScale = 1;
        cam.flash(260, 255, 255, 255);
        this.float('……', CX, this.rowY[0] - 40, '#ffffff', 40);
        break;
      }
      case 'holdStart':
        if (z) {
          this.tweens.add({ targets: z.root, scale: this.rootScale * 1.45, y: this.zRoot.y + 50, duration: 200 });
          this.tweens.add({ targets: z.head, angle: { from: -6, to: 6 }, duration: 120, yoyo: true, repeat: -1 });
        }
        this.tweens.killTweensOf([this.gloves.lead, this.gloves.rear]);
        this.tweens.add({ targets: this.gloves.lead, x: CX - 120, y: 300, angle: 30, duration: 200 });
        this.tweens.add({ targets: this.gloves.rear, x: CX + 120, y: 300, angle: -30, duration: 200 });
        cam.shake(400, 0.004);
        break;
      case 'holdDone':
        if (z) { this.tweens.killTweensOf(z.head); z.head.setAngle(0); }
        this.tweens.add({ targets: this.gloves.lead, x: this.gloves.leadHome.x, y: this.gloves.leadHome.y, angle: 8, duration: 160 });
        this.tweens.add({ targets: this.gloves.rear, x: this.gloves.rearHome.x, y: this.gloves.rearHome.y, angle: -8, duration: 160 });
        break;
      case 'down':
        this.nextEnemy();
        break;
      case 'noEffect':
        this.float(ev.text, CX, 300, '#ff9b9b', 22);
        break;
      case 'stray':
        sfx.whoosh();
        break;
      case 'evaded':
        sfx.whoosh();
        this.resetPose();
        if (z) this.tweens.add({ targets: z.root, scale: this.rootScale * 1.3, duration: 100, yoyo: true });
        this.float(ev.blind ? '사각! 카운터 3배' : '회피!', CX, 250, C.blue, 28);
        break;
      case 'struck': {
        this.resetPose();
        if (z) this.tweens.add({ targets: z.root, scale: this.rootScale * (ev.attack === 'bite' ? 2 : 1.5), duration: 100, yoyo: true, hold: 60, onComplete: () => z.root.setScale(this.rootScale) });
        this.time.delayedCall(90, () => {
          if (ev.attack === 'bite') { sfx.bite(); this.float('물렸다!', CX, 250, C.red, 34); }
          else if (ev.attack === 'grab') { sfx.punch(); this.float('잡혔다! 금색 어퍼로 탈출', CX, 250, C.red, 28); }
          else { sfx.heavy(); sfx.door(); this.float(`쾅! 소음 +${ev.noise}`, CX, 250, C.orange, 28); }
          cam.flash(180, 229, 72, 77);
          cam.shake(200, 0.014);
        });
        break;
      }
      case 'stagger':
        this.float('자세 붕괴! 4박 동안 피해 2배', CX, 300, '#ffd23f', 24);
        break;
      case 'escape':
        this.float('탈출!', CX, 250, '#ffd23f', 34);
        break;
      case 'fail': {
        // 원작 장면에서 놓쳤다: 감염자가 덮친다
        if (z) this.tweens.add({ targets: z.root, scale: this.rootScale * 2.2, y: this.zRoot.y + 120, duration: 160 });
        sfx.bite();
        cam.flash(300, 160, 20, 20);
        cam.shake(260, 0.016);
        break;
      }
      case 'ko': {
        for (const v of this.views.values()) { v.ring.destroy(); v.label?.destroy(); }
        this.views.clear();
        if (!z) break;
        const ending = this.fight?.ending ?? 'ko';
        this.tweens.killTweensOf([z.head, z.root]);
        if (ending === 'push') {
          // 주먹이 아니라 손바닥으로. 그의 몸이 계단 아래로 넘어간다
          sfx.whoosh();
          this.tweens.add({ targets: z.root, y: this.zRoot.y + 320, scale: 0.5, angle: -10, alpha: 0.6, duration: 900, ease: 'Quad.In' });
          break;
        }
        sfx.heavy();
        this.time.delayedCall(60, () => sfx.heavy());
        cam.shake(300, 0.024);
        cam.flash(120, 255, 255, 255);
        this.tweens.add({ targets: z.head, y: z.head.y - 30, angle: 30, duration: 120 });
        this.tweens.add({ targets: z.root, y: this.zRoot.y + 280, scale: this.rootScale * 0.7, angle: 12, duration: 650, delay: 120, ease: 'Quad.In' });
        this.tweens.add({ targets: z.eyes, alpha: 0, duration: 500 });
        if (!this.fight) {
          const ko = title(this, CX, 170, 'K.O.', 110, HEX(C.paper)).setOrigin(0.5).setStroke('#000', 10).setScale(2).setAlpha(0).setDepth(40);
          this.tweens.add({ targets: ko, scale: 1, alpha: 1, duration: 220, ease: 'Back.Out', delay: 200 });
          this.time.delayedCall(480, () => sfx.bell());
        }
        break;
      }
      case 'timeout':
        sfx.groan();
        break;
    }
  }

  private wallBreak() {
    sfx.heavy();
    this.cameras.main.shake(200, 0.012);
    const g = this.add.graphics().setDepth(6);
    g.fillStyle(0x0a0b0d).fillCircle(CX, 230, 46);
    for (let i = 0; i < 14; i++) {
      const p = this.add.circle(CX, 230, 4 + Math.random() * 8, 0xf2efe6, 0.9).setDepth(9);
      const a = Math.random() * Math.PI * 2;
      this.tweens.add({ targets: p, x: CX + Math.cos(a) * 160, y: 230 + Math.sin(a) * 120, alpha: 0, duration: 900, onComplete: () => p.destroy() });
    }
  }

  private finish() {
    const s = this.s;
    const story = !!this.fight;
    const panel = this.add.container(CX, 300).setDepth(45);
    const bg = this.add.rectangle(0, 0, 560, 96, 0x000000, 0.86).setStrokeStyle(1, s.outcome === 'fail' ? C.red : C.orange);
    let head: string;
    let sub: string;
    if (s.outcome === 'fail') {
      head = '놓쳤다.';
      sub = 'Enter 또는 클릭 — 그 순간으로 다시';
    } else if (story) {
      head = this.fight!.mode === 'practice' ? `한 라운드. PERFECT ${s.perfects} · GOOD ${s.goods} · MISS ${s.misses}` : `PERFECT ${s.perfects} · GOOD ${s.goods}`;
      sub = 'Enter 또는 클릭 — 계속';
    } else {
      const noise = noiseNow(s);
      head = s.outcome === 'ko' ? `KO · 소음 +${noise}` : `노래가 끝났다 · 소음 +${noise}`;
      sub = `PERFECT ${s.perfects} · GOOD ${s.goods} · MISS ${s.misses} · 최대 콤보 ${s.maxCombo} — Enter`;
    }
    panel.add([bg, text(this, 0, -18, head, 18, s.outcome === 'fail' ? '#ff9b9b' : '#fff', { fontStyle: '700' }).setOrigin(0.5),
      text(this, 0, 18, sub, 13, '#aaa').setOrigin(0.5)]).setAlpha(0);
    this.tweens.add({ targets: panel, alpha: 1, duration: 300 });
    const go = () => {
      this.input.keyboard!.removeAllListeners();
      this.input.removeAllListeners();
      this.cameras.main.fadeOut(250);
      this.time.delayedCall(260, () => {
        if (s.outcome === 'fail') { this.scene.restart(this.d); return; }
        this.d.onDone({ outcome: s.outcome === 'timeout' ? 'timeout' : s.outcome === 'ko' ? 'ko' : 'clear', noise: noiseNow(s), bites: s.bites });
        this.scene.stop();
      });
    };
    this.time.delayedCall(600, () => {
      let gone = false;
      const once = () => { if (!gone) { gone = true; go(); } };
      this.input.keyboard!.on('keydown', (e: KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') once(); });
      this.input.once('pointerdown', once);
    });
  }
}
