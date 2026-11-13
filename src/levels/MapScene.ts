// 맵 장면: 태리를 직접 움직여 조사하고, 목표를 따라 이야기가 흘러간다.
// ← → (A D) 이동, E · Space · Enter 조사. 글은 말풍선과 한 줄 서술뿐.
import Phaser from 'phaser';
import { drawTaeri, drawZombie, type Taeri, type TaeriLook } from '../game/art';
import { coverImage, slotKey } from '../game/images';
import { horror, sfx, startDrone, stopDrone } from '../game/sfx';
import { button, C, H, HEX, text, title, W } from '../game/theme';
import { drawBg } from '../story/backgrounds';
import { saveProgress } from '../story/progress';
import { FLOOR, LEVELS } from './ch1';
import type { Action, Area, Level, Obj } from './types';

const SPEED = 260; // px/초
const NEAR = 70;
const SERIF = '"Noto Serif KR", serif';

export class MapScene extends Phaser.Scene {
  private level!: Level;
  private area!: Area;
  private flags = new Set<string>();
  private items: string[] = [];
  private look: TaeriLook = { outfit: 'casual', patch: false };
  private layer!: Phaser.GameObjects.Container;
  private taeri!: Taeri;
  private actors = new Map<string, Phaser.GameObjects.Container>();
  private busy = false;
  private facing = 1;
  private walkT = 0;
  private near?: Obj;
  private keys!: Record<'left' | 'right' | 'a' | 'd', Phaser.Input.Keyboard.Key>;
  private touchDir = 0;
  private hud!: {
    objective: Phaser.GameObjects.Text;
    items: Phaser.GameObjects.Text;
    prompt: Phaser.GameObjects.Text;
    marker: Phaser.GameObjects.Text;
    areaName: Phaser.GameObjects.Text;
  };
  private objective?: { text: string; target?: string; count?: string[] };
  private mood = 0;
  private vignette?: Phaser.GameObjects.Image;
  private dim?: Phaser.GameObjects.Rectangle;
  private memories = 0;
  private memoryTotal = 0;
  private dread = 0; // 다음 불길한 소리까지 남은 시간(ms)
  private pulse = 0;
  /** 말풍선·서술을 넘길 때 부르는 함수 */
  private advanceFn?: () => void;

  constructor() { super('map'); }

  init(d: { level: string }) {
    this.level = LEVELS[d.level];
    this.flags = new Set();
    this.items = [];
    this.look = { outfit: 'casual', patch: false };
    this.actors = new Map();
    this.busy = false;
    this.objective = undefined;
    this.mood = 0;
    this.vignette = undefined;
    this.dim = undefined;
    this.memories = 0;
    const count = (list: Action[]): number => list.reduce((n, a) => n + (a.a === 'memory' ? 1 : a.a === 'if' ? count(a.then) : 0), 0);
    this.memoryTotal = Object.values(this.level.areas).reduce((n, ar) => n + ar.objects.reduce((m, o) => m + count(o.do), 0), 0);
  }

  create() {
    saveProgress(this.level.no - 1);
    this.layer = this.add.container(0, 0);
    this.drawHud();
    const kb = this.input.keyboard!;
    this.keys = {
      left: kb.addKey('LEFT'), right: kb.addKey('RIGHT'), a: kb.addKey('A'), d: kb.addKey('D'),
    };
    kb.on('keydown', (e: KeyboardEvent) => {
      if (e.repeat) return;
      const k = e.key.toLowerCase();
      if (k === 'e' || k === ' ' || k === 'enter') {
        if (this.advanceFn) { const f = this.advanceFn; this.advanceFn = undefined; f(); }
        else this.interact();
      }
    });
    this.input.on('pointerdown', (_p: unknown, objs: unknown[]) => {
      if (objs.length) return;
      if (this.advanceFn) { const f = this.advanceFn; this.advanceFn = undefined; f(); }
    });

    // 시작: 짧은 도입 → 첫 장소
    this.busy = true;
    this.introCard(() => {
      this.loadArea(this.level.start.area, this.level.start.x);
      this.run(this.level.first, () => { this.busy = false; });
    });
  }

  // ---------- 장소 ----------

  private loadArea(id: string, x: number) {
    this.area = this.level.areas[id];
    this.layer.removeAll(true);
    this.actors.clear();
    this.area.draw(this, this.layer);
    for (const a of this.area.actors ?? []) {
      if (a.when && !a.when(this.flags)) continue;
      const z = drawZombie(this, a.x, FLOOR, a.kind, 0.9);
      z.root.setScale(-0.9, 0.9); // 태리 쪽(오른쪽)을 본다
      this.layer.add(z.root);
      this.actors.set(a.id, z.root);
      this.tweens.add({ targets: z.root, y: FLOOR + 3, duration: 380, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
    }
    this.makeTaeri(x);
    this.cameras.main.setBounds(0, 0, Math.max(W, this.area.width), H);
    this.cameras.main.startFollow(this.taeri.root, true, 0.15, 0.15, 0, 0);
    this.hud.areaName.setText(this.area.name);
    this.cameras.main.fadeIn(300);
  }

  private makeTaeri(x: number) {
    const old = this.taeri?.root;
    const px = old ? old.x : x;
    old?.destroy();
    this.taeri = drawTaeri(this, x ?? px, FLOOR, 1, this.look);
    this.taeri.root.setScale(this.facing, 1);
    this.layer.add(this.taeri.root);
    this.cameras.main.startFollow(this.taeri.root, true, 0.15, 0.15, 0, 0);
  }

  // ---------- HUD ----------

  private drawHud() {
    const fix = <T extends Phaser.GameObjects.Components.ScrollFactor & Phaser.GameObjects.Components.Depth>(o: T) => o.setScrollFactor(0).setDepth(100);
    fix(this.add.rectangle(0, 0, W, 44, 0x000000, 0.6).setOrigin(0));
    const areaName = fix(title(this, 16, 10, '', 20, HEX(C.paper)));
    const objective = fix(text(this, 200, 13, '', 15, HEX(C.orange), { fontStyle: '700' }));
    const items = fix(text(this, W - 14, 13, '', 12, '#9aa0a6').setOrigin(1, 0));
    const prompt = text(this, 0, 0, '', 14, '#1a1a1a', { fontStyle: '700', backgroundColor: HEX(C.paper), padding: { x: 8, y: 4 } }).setOrigin(0.5).setDepth(60).setVisible(false);
    const marker = title(this, 0, FLOOR - 230, '▼', 22, HEX(C.orange)).setOrigin(0.5).setDepth(59).setVisible(false);
    this.tweens.add({ targets: marker, y: '+=8', duration: 450, yoyo: true, repeat: -1 });
    // 손가락으로도: ◀ ▶ 조사
    const mk = (x: number, label: string, down: () => void, up?: () => void) => {
      const b = button(this, x, H - 34, 70, 48, label, down);
      b.setScrollFactor(0).setDepth(100).setAlpha(0.75);
      if (up) { b.on('pointerup', up); b.on('pointerout', up); }
    };
    mk(46, '◀', () => { this.touchDir = -1; }, () => { this.touchDir = 0; });
    mk(124, '▶', () => { this.touchDir = 1; }, () => { this.touchDir = 0; });
    mk(W - 50, '조사', () => { if (this.advanceFn) { const f = this.advanceFn; this.advanceFn = undefined; f(); } else this.interact(); });
    fix(text(this, W / 2, H - 16, '← → 이동 · E 조사', 11, '#666').setOrigin(0.5));
    this.hud = { objective, items, prompt, marker, areaName };
  }

  private refreshItems() {
    const mem = this.memoryTotal ? `기억 ${this.memories}/${this.memoryTotal}` : '';
    this.hud.items.setText([mem, ...this.items].filter(Boolean).join(' · '));
  }

  /** 분위기: 어둠이 태리 주변만 남기고 조여 온다 */
  private setMood(v: number) {
    this.mood = v;
    if (!this.textures.exists('vig')) {
      const tex = this.textures.createCanvas('vig', 2400, 1200)!;
      const ctx = tex.getContext();
      const grad = ctx.createRadialGradient(1200, 600, 110, 1200, 600, 520);
      grad.addColorStop(0, 'rgba(4,5,8,0)');
      grad.addColorStop(0.55, 'rgba(4,5,8,0.62)');
      grad.addColorStop(1, 'rgba(4,5,8,0.96)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 2400, 1200);
      tex.refresh();
    }
    if (!this.vignette) this.vignette = this.add.image(0, FLOOR - 110, 'vig').setDepth(45).setAlpha(0);
    if (!this.dim) this.dim = this.add.rectangle(0, 0, W, H, 0x101830, 0).setOrigin(0).setScrollFactor(0).setDepth(44);
    this.tweens.add({ targets: this.vignette, alpha: v === 0 ? 0 : v === 1 ? 0.7 : 1, duration: 1200 });
    this.tweens.add({ targets: this.dim, fillAlpha: v === 0 ? 0 : v === 1 ? 0.3 : 0.18, duration: 1200 });
    if (v > 0) startDrone(); else stopDrone();
    this.dread = 5000;
  }

  /** 가끔 들려오는 것들. 무엇인지는 보여 주지 않는다 */
  private ambient(dms: number) {
    if (this.mood === 0) return;
    this.dread -= dms;
    if (this.dread <= 0 && !this.busy) {
      this.dread = 7000 + Math.random() * 7000;
      const r = Math.random();
      if (r < 0.35) horror.distant();
      else if (r < 0.6) horror.scratch();
      else if (r < 0.75) horror.cry();
      else {
        // 형광등이 나갔다 들어온다
        if (this.vignette) this.tweens.add({ targets: this.vignette, alpha: 0.5, duration: 60, yoyo: true, repeat: 2 });
        if (this.dim) this.tweens.add({ targets: this.dim, fillAlpha: 0.6, duration: 60, yoyo: true, repeat: 2 });
      }
    }
    // 가까이에 그것이 있으면 심장이 빨라진다
    const near = [...this.actors.values()].reduce((d, a) => Math.min(d, Math.abs(a.x - this.taeri.root.x)), Infinity);
    if (near < 900) {
      this.pulse -= dms;
      if (this.pulse <= 0) { this.pulse = 450 + near; sfx.heartbeat(); }
    }
  }

  private refreshObjective() {
    const o = this.objective;
    if (!o) { this.hud.objective.setText(''); return; }
    const n = o.count ? ` (${o.count.filter((f) => this.flags.has(f)).length}/${o.count.length})` : '';
    this.hud.objective.setText(`목표 · ${o.text}${n}`);
  }

  // ---------- 매 프레임 ----------

  update(_t: number, dms: number) {
    if (!this.taeri || !this.area) return;
    const dt = dms / 1000;
    let dir = 0;
    if (!this.busy) {
      if (this.keys.left.isDown || this.keys.a.isDown) dir -= 1;
      if (this.keys.right.isDown || this.keys.d.isDown) dir += 1;
      dir = dir || this.touchDir;
    }
    const r = this.taeri.root;
    this.vignette?.setX(r.x);
    this.ambient(dms);
    if (dir) {
      this.facing = dir;
      r.setScale(dir, 1);
      r.x = Phaser.Math.Clamp(r.x + dir * SPEED * dt, 40, this.area.width - 40);
      this.walkT += dt * 10;
      r.y = FLOOR - Math.abs(Math.sin(this.walkT)) * 4;
      if (Math.floor(this.walkT / Math.PI) !== Math.floor((this.walkT - dt * 10) / Math.PI)) sfx.step();
    } else r.y = FLOOR;

    // 가까운 조사 대상
    const avail = this.area.objects.filter((o) => !o.when || o.when(this.flags));
    this.near = this.busy ? undefined : avail.filter((o) => !o.auto && Math.abs(o.x - r.x) < NEAR).sort((a, b) => Math.abs(a.x - r.x) - Math.abs(b.x - r.x))[0];
    if (this.near) this.hud.prompt.setText(`E  ${this.near.label}`).setPosition(this.near.x, FLOOR - 190).setVisible(true);
    else this.hud.prompt.setVisible(false);

    // 목표 표시
    const tgt = this.objective?.target ? avail.find((o) => o.id === this.objective!.target) : undefined;
    this.hud.marker.setVisible(!!tgt && !this.busy && this.near?.id !== tgt.id);
    if (tgt) this.hud.marker.setX(tgt.x);

    // 저절로 일어나는 일
    if (!this.busy) {
      const auto = avail.find((o) => o.auto && (o.x < -1000 || Math.abs(o.x - r.x) < NEAR));
      if (auto) this.start(auto.do);
    }
  }

  private interact() {
    if (this.busy || !this.near) return;
    this.start(this.near.do);
  }

  private start(list: Action[]) {
    this.busy = true;
    this.hud.prompt.setVisible(false);
    this.run(list, () => { this.busy = false; });
  }

  // ---------- 행동 실행 ----------

  private run(list: Action[], done: () => void, i = 0) {
    if (i >= list.length) { done(); return; }
    this.act(list[i], () => this.run(list, done, i + 1));
  }

  private act(a: Action, next: () => void) {
    switch (a.a) {
      case 'bark': return this.bark(a.text, a.who, next);
      case 'caption': return this.caption(a.text, next);
      case 'objective':
        this.objective = { text: a.text, target: a.target, count: a.count };
        this.refreshObjective();
        this.tweens.add({ targets: this.hud.objective, alpha: { from: 0.2, to: 1 }, duration: 400 });
        return next();
      case 'flag': this.flags.add(a.set); this.refreshObjective(); return next();
      case 'memory': return this.memory(a.text, next);
      case 'mood': this.setMood(a.v); return next();
      case 'charge': {
        const z = this.actors.get(a.id);
        if (!z) return next();
        horror.growl();
        this.cameras.main.shake(700, 0.006);
        this.tweens.killTweensOf(z);
        this.tweens.add({ targets: z, x: this.taeri.root.x - 70, duration: 650, ease: 'Quad.In', onComplete: next });
        return;
      }
      case 'item':
        if (!this.items.includes(a.name)) this.items.push(a.name);
        this.refreshItems();
        sfx.chime(2);
        this.toast(`얻었다 — ${a.name}`);
        return next();
      case 'phone': return this.phone(a.from, a.text, next);
      case 'broadcast': return this.broadcast(a.lines, next);
      case 'shake': this.cameras.main.shake(400, a.s ?? 0.01); return next();
      case 'sfx':
        if (a.name === 'bang') { sfx.heavy(); sfx.door(); } else if (a.name === 'scrape') sfx.bite();
        else (sfx as Record<string, () => void>)[a.name]?.();
        return next();
      case 'wait': this.time.delayedCall(a.ms, next); return;
      case 'hold': return this.hold(a.label, a.stopAt, next);
      case 'peep': return this.peep(a.bg, a.lines, next);
      case 'fight': return this.fight(a.id, next);
      case 'bandage': return this.bandage(next);
      case 'goto':
        this.cameras.main.fadeOut(250);
        this.time.delayedCall(260, () => {
          this.loadArea(a.area, a.x);
          const enter = this.area.onEnter;
          if (enter && (!enter.when || enter.when(this.flags))) this.run(enter.do, next);
          else next();
        });
        return;
      case 'outfit': this.look = { ...this.look, outfit: a.v }; this.makeTaeri(this.taeri?.root.x); return next();
      case 'patch': this.look = { ...this.look, patch: true }; this.makeTaeri(this.taeri.root.x); return next();
      case 'remove': this.actors.get(a.id)?.destroy(); this.actors.delete(a.id); return next();
      case 'dark': return this.dark(a.ms, a.text, next);
      case 'cg': return this.cg(a.key, a.ms ?? 1500, next);
      case 'if': return a.all.every((f) => this.flags.has(f)) ? this.run(a.then, next) : next();
      case 'chapterEnd': return this.chapterEnd(a.line, a.next);
    }
  }

  /** 다음으로 넘어가기를 기다린다 (키·클릭, 또는 시간이 지나면) */
  private waitAdvance(ms: number, then: () => void) {
    let done = false;
    const go = () => { if (done) return; done = true; this.advanceFn = undefined; then(); };
    this.time.delayedCall(250, () => { if (!done) this.advanceFn = go; });
    this.time.delayedCall(ms, go);
  }

  private bark(str: string, who: string | undefined, next: () => void) {
    const obj = who ? this.area.objects.find((o) => o.id === who) : undefined;
    const x = obj ? obj.x : this.taeri.root.x;
    const y = FLOOR - (obj ? 230 : 165);
    const t = text(this, 0, 0, str, 15, obj ? '#ffd0d0' : '#1a1a1a', { fontStyle: '700', wordWrap: { width: 300 }, align: 'center' }).setOrigin(0.5);
    const w = t.width + 24, h = t.height + 16;
    const g = this.add.graphics();
    g.fillStyle(obj ? 0x3a1010 : 0xf2efe6, 0.95).fillRoundedRect(-w / 2, -h / 2, w, h, 10);
    g.fillTriangle(-8, h / 2 - 1, 8, h / 2 - 1, obj ? 10 : 0, h / 2 + 12);
    const c = this.add.container(Phaser.Math.Clamp(x, w / 2 + 10, this.area.width - w / 2 - 10), y - h / 2, [g, t]).setDepth(70).setScale(0.8);
    this.tweens.add({ targets: c, scale: 1, duration: 120, ease: 'Back.Out' });
    if (obj) { this.cameras.main.shake(120, 0.004); }
    this.waitAdvance(Math.max(1600, str.length * 75), () => { c.destroy(); next(); });
  }

  /** 기억 조각: 원작의 문장이 화면을 스쳐 간다 */
  private memory(str: string, next: () => void) {
    const o = this.overlay();
    const bg = this.add.rectangle(0, 0, W, H, 0x120d06, 0).setOrigin(0);
    const tag = text(this, W / 2, 150, '— 기억 —', 12, HEX(C.orange), { fontStyle: '700' }).setOrigin(0.5).setAlpha(0);
    const t = text(this, W / 2, H / 2 - 10, str, 19, '#ead9b4', { fontFamily: SERIF, fontStyle: 'italic', align: 'center', lineSpacing: 12, wordWrap: { width: 700 } }).setOrigin(0.5).setAlpha(0);
    o.add([bg, tag, t]);
    this.tweens.add({ targets: bg, fillAlpha: 0.86, duration: 500 });
    this.tweens.add({ targets: [tag, t], alpha: 1, duration: 700, delay: 250 });
    sfx.chime(0);
    this.memories += 1;
    this.refreshItems();
    this.waitAdvance(Math.max(4200, str.length * 95), () => {
      this.tweens.add({ targets: o.list, alpha: 0, duration: 400, onComplete: () => { o.destroy(); next(); } });
    });
  }

  private caption(str: string, next: () => void) {
    const t = text(this, W / 2, 74, str, 15, HEX(C.paper), { fontFamily: SERIF, align: 'center', wordWrap: { width: 720 }, backgroundColor: '#000000cc', padding: { x: 14, y: 8 } })
      .setOrigin(0.5, 0).setScrollFactor(0).setDepth(90).setAlpha(0);
    this.tweens.add({ targets: t, alpha: 1, duration: 300 });
    this.waitAdvance(Math.max(2200, str.length * 70), () => { t.destroy(); next(); });
  }

  private toast(str: string) {
    const t = text(this, W - 16, 52, str, 13, '#1a1a1a', { fontStyle: '700', backgroundColor: HEX(C.orange), padding: { x: 10, y: 5 } })
      .setOrigin(1, 0).setScrollFactor(0).setDepth(100);
    this.tweens.add({ targets: t, alpha: 0, delay: 1800, duration: 500, onComplete: () => t.destroy() });
  }

  private overlay() {
    return this.add.container(0, 0).setScrollFactor(0).setDepth(80);
  }

  private phone(from: string, body: string, next: () => void) {
    sfx.click();
    const o = this.overlay();
    const g = this.add.graphics();
    g.fillStyle(0x000000, 0.55).fillRect(0, 0, W, H);
    g.fillStyle(0x15171b).fillRoundedRect(W / 2 - 160, 70, 320, 300, 26);
    g.fillStyle(0x22252b).fillRoundedRect(W / 2 - 140, 120, 280, 130, 14);
    o.add([g, text(this, W / 2 - 124, 132, from, 14, '#9fd0ff', { fontStyle: '700' }), text(this, W / 2 - 124, 158, body, 14, '#eee', { wordWrap: { width: 250 }, lineSpacing: 5 })]);
    this.waitAdvance(4000, () => { o.destroy(); next(); });
  }

  private broadcast(lines: string[], next: () => void, i = 0) {
    if (i >= lines.length) { next(); return; }
    if (i === 0) sfx.bell();
    if (i === lines.length - 1) { this.cameras.main.shake(300, 0.01); sfx.heavy(); }
    const t = text(this, W / 2, 74, `📢  ${lines[i]}`, 14, '#cfe6ff', { align: 'center', wordWrap: { width: 760 }, backgroundColor: '#0b1420dd', padding: { x: 14, y: 8 } })
      .setOrigin(0.5, 0).setScrollFactor(0).setDepth(90);
    this.waitAdvance(Math.max(2400, lines[i].length * 60), () => { t.destroy(); this.broadcast(lines, next, i + 1); });
  }

  private hold(label: string, stopAt: number, next: () => void) {
    const o = this.overlay();
    const l = title(this, W / 2, H - 120, label, 20, HEX(C.paper)).setOrigin(0.5).setStroke('#000', 5);
    const bg = this.add.rectangle(W / 2, H - 88, 400, 12, 0x2a2d31).setStrokeStyle(1, 0x555a60);
    const bar = this.add.rectangle(W / 2 - 200, H - 88, 0, 12, C.orange).setOrigin(0, 0.5);
    o.add([l, bg, bar]);
    let p = 0, holding = false, stuck = false;
    const kb = this.input.keyboard!;
    const down = (e: KeyboardEvent) => { if (e.key === ' ' || e.key.toLowerCase() === 'e') holding = true; };
    const up = (e: KeyboardEvent) => { if (e.key === ' ' || e.key.toLowerCase() === 'e') holding = false; };
    const pd = () => { holding = true; }, pu = () => { holding = false; };
    kb.on('keydown', down); kb.on('keyup', up);
    this.input.on('pointerdown', pd); this.input.on('pointerup', pu);
    const ev = this.time.addEvent({
      delay: 16, loop: true, callback: () => {
        if (stuck) return;
        p = holding ? Math.min(stopAt, p + 0.006) : Math.max(0, p - 0.004);
        bar.width = 400 * p;
        if (p >= stopAt) {
          stuck = true;
          this.cameras.main.shake(900, 0.004);
          l.setText('……손이 떨린다.');
          this.time.delayedCall(1300, () => {
            ev.remove(); kb.off('keydown', down); kb.off('keyup', up);
            this.input.off('pointerdown', pd); this.input.off('pointerup', pu);
            o.destroy(); next();
          });
        }
      },
    });
  }

  private peep(bg: Parameters<typeof drawBg>[2], lines: string[], next: () => void) {
    const o = this.overlay();
    o.add(this.add.rectangle(0, 0, W, H, 0x000000).setOrigin(0));
    const layer = this.add.container(0, 60);
    o.add(layer);
    drawBg(this, layer, bg);
    const show = (i: number) => {
      if (i >= lines.length) { o.destroy(); next(); return; }
      const t = text(this, W / 2, 462, lines[i], 16, HEX(C.paper), { fontFamily: SERIF, align: 'center', wordWrap: { width: 760 } }).setOrigin(0.5, 0);
      o.add(t);
      this.waitAdvance(Math.max(2400, lines[i].length * 70), () => { t.destroy(); show(i + 1); });
    };
    show(0);
  }

  private dark(ms: number, str: string | undefined, next: () => void) {
    const o = this.overlay();
    const r = this.add.rectangle(0, 0, W, H, 0x000000).setOrigin(0).setAlpha(0);
    o.add(r);
    this.tweens.add({ targets: r, alpha: 1, duration: 500 });
    if (str) {
      const t = text(this, W / 2, H / 2, str, 17, HEX(C.paper), { fontFamily: SERIF, align: 'center', lineSpacing: 10 }).setOrigin(0.5).setAlpha(0);
      o.add(t);
      this.tweens.add({ targets: t, alpha: 1, delay: 500, duration: 500 });
    }
    sfx.bite();
    this.time.delayedCall(ms, () => this.tweens.add({ targets: o.list, alpha: 0, duration: 500, onComplete: () => { o.destroy(); next(); } }));
  }

  private cg(key: string, ms: number, next: () => void) {
    const k = slotKey(this, `cg:${key}`);
    if (!k) { next(); return; }
    const o = this.overlay();
    const img = coverImage(this, k, 0, 0, W, H).setAlpha(0);
    o.add(img);
    this.tweens.add({ targets: img, alpha: 1, duration: 400 });
    this.waitAdvance(ms + 800, () => { o.destroy(); next(); });
  }

  private bandage(next: () => void) {
    const o = this.overlay();
    const steps: [string, string][] = [['s', '손목부터'], ['d', '엄지 사이'], ['w', '손등'], ['e', '너클 두 번'], ['q', '세 번'], ['a', '손가락 사이'], ['x', '다시 손목']];
    const seq = [...steps.map((x) => ['오른손', ...x]), ...steps.map((x) => ['왼손', ...x])];
    let i = 0;
    const g = this.add.graphics();
    const head = title(this, W / 2, 70, '', 22, HEX(C.paper)).setOrigin(0.5);
    const cue = title(this, W / 2, 400, '', 26, HEX(C.orange)).setOrigin(0.5).setStroke('#000', 5);
    const hint = text(this, W / 2, 436, '아빠가 가르쳐 준 순서 — 표시된 키 (싸울 때 쓰는 키다)', 12, '#999').setOrigin(0.5);
    o.add([g, head, cue, hint]);
    const draw = () => {
      g.clear();
      g.fillStyle(0x000000, 0.7).fillRect(0, 0, W, H);
      g.fillStyle(C.skin).fillRoundedRect(W / 2 - 90, 120, 180, 150, 40).fillRoundedRect(W / 2 - 60, 260, 120, 70, 16);
      const n = i >= seq.length ? 7 : i % 7;
      for (let k = 0; k < n; k++) g.lineStyle(14, 0xf4f4f2).lineBetween(W / 2 - 92, 310 - k * 26, W / 2 + 92, 290 - k * 26);
    };
    const show = () => {
      if (i >= seq.length) {
        kb.off('keydown', onKey);
        cue.setText('천이 손에 맞게 조여들었다.');
        draw();
        this.time.delayedCall(900, () => { o.destroy(); next(); });
        return;
      }
      head.setText(`${seq[i][0]} — 붕대를 감는다`);
      cue.setText(`[${seq[i][1].toUpperCase()}] ${seq[i][2]}`);
      draw();
    };
    const kb = this.input.keyboard!;
    const onKey = (e: KeyboardEvent) => {
      if (i >= seq.length) return;
      if (e.key.toLowerCase() === seq[i][1]) { sfx.paper(); i++; show(); } else if (e.key.length === 1) sfx.buzz();
    };
    kb.on('keydown', onKey);
    this.advanceFn = undefined;
    const tap = () => { if (i < seq.length) { sfx.paper(); i++; show(); } };
    const zone = this.add.zone(W / 2, H / 2, W, H).setInteractive();
    zone.on('pointerdown', tap);
    o.add(zone);
    show();
  }

  private fight(id: string, next: () => void) {
    this.cameras.main.flash(150, 255, 255, 255);
    this.time.delayedCall(200, () => {
      this.scene.launch('combat', {
        story: id,
        onDone: () => {
          this.scene.resume();
          this.cameras.main.fadeIn(300);
          next();
        },
      });
      this.scene.pause();
    });
  }

  private introCard(done: () => void) {
    const o = this.overlay();
    o.add(this.add.rectangle(0, 0, W, H, 0x000000).setOrigin(0));
    const layer = this.add.container(0, 0);
    o.add(layer);
    drawBg(this, layer, this.level.intro.bg);
    const no = title(this, W / 2, 140, `제${this.level.no}화`, 26, HEX(C.orange)).setOrigin(0.5).setStroke('#000', 6);
    const nm = title(this, W / 2, 186, this.level.name, 44, HEX(C.paper)).setOrigin(0.5).setStroke('#000', 8);
    o.add([no, nm]);
    const lines = this.level.intro.lines;
    const show = (i: number) => {
      if (i >= lines.length) { this.tweens.add({ targets: o.list, alpha: 0, duration: 500, onComplete: () => { o.destroy(); done(); } }); return; }
      const t = text(this, W / 2, 420 + i * 30, lines[i], 17, HEX(C.paper), { fontFamily: SERIF, stroke: '#000', strokeThickness: 4 }).setOrigin(0.5).setAlpha(0);
      o.add(t);
      this.tweens.add({ targets: t, alpha: 1, duration: 500 });
      this.waitAdvance(1900, () => show(i + 1));
    };
    this.time.delayedCall(600, () => show(0));
  }

  private chapterEnd(line: string, nextTo: { story?: number; level?: string }) {
    const o = this.overlay();
    const r = this.add.rectangle(0, 0, W, H, 0x000000).setOrigin(0).setAlpha(0);
    const t = text(this, W / 2, H / 2 - 20, line, 22, HEX(C.paper), { fontFamily: SERIF }).setOrigin(0.5).setAlpha(0);
    const mem = this.memoryTotal ? `   기억 ${this.memories}/${this.memoryTotal}` : '';
    const e = title(this, W / 2, H / 2 + 40, `〈제${this.level.no}화 끝〉${mem}`, 20, '#888').setOrigin(0.5).setAlpha(0);
    stopDrone();
    o.add([r, t, e]);
    this.tweens.add({ targets: r, alpha: 1, duration: 800 });
    this.tweens.add({ targets: t, alpha: 1, delay: 700, duration: 800 });
    this.tweens.add({ targets: e, alpha: 1, delay: 1800, duration: 600 });
    saveProgress(this.level.no);
    this.time.delayedCall(3800, () => {
      if (nextTo.level) this.scene.start('map', { level: nextTo.level });
      else if (nextTo.story !== undefined) this.scene.start('story', { chapter: nextTo.story, inventory: this.items });
      else this.scene.start('title');
    });
  }
}
