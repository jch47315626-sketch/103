import Phaser from 'phaser';
import {
  act, afterCombat, ALL_WAKE_NOISE, clockText, createNight, doorAt, HORDE_NOISE, move, WAKE_NOISE,
  type DoorAction, type NightState, type StepResult,
} from '../rules/night';
import { drawTaeri, drawZombie, type Taeri, type Zombie } from './art';
import type { CombatData } from './CombatScene';
import { sfx } from './sfx';
import { button, C, H, HEX, text, title, W, type Button } from './theme';

const TILE = 150;
const FLOOR = 372;
const px = (x: number) => 110 + x * TILE;
const WORLD = px(16) + 110;

export class CorridorScene extends Phaser.Scene {
  private s!: NightState;
  private taeri!: Taeri;
  private walkers = new Map<number, Zombie>();
  private marks!: Phaser.GameObjects.Graphics;
  private dark!: Phaser.GameObjects.Image;
  private busy = false;
  private messages: string[] = [];
  private hud!: {
    clock: Phaser.GameObjects.Text;
    noise: Phaser.GameObjects.Graphics;
    noiseText: Phaser.GameObjects.Text;
    res: Phaser.GameObjects.Text;
    log: Phaser.GameObjects.Text;
    doorTitle: Phaser.GameObjects.Text;
    doorInfo: Phaser.GameObjects.Text;
    btns: Record<DoorAction | 'home', Button>;
  };
  private beat = 0;
  private fights = 0;
  private quietKOs = 0;

  constructor() { super('corridor'); }

  init(data: { seed: number }) {
    this.s = createNight(data.seed);
    this.walkers.clear();
    this.messages = [];
    this.busy = false;
    this.fights = 0;
    this.quietKOs = 0;
  }

  create() {
    this.cameras.main.setBounds(0, 0, WORLD, H);
    this.drawCorridor();
    this.marks = this.add.graphics().setDepth(5);
    this.taeri = drawTaeri(this, px(this.s.taeriX), FLOOR, 0.72);
    this.taeri.root.setDepth(20);
    this.cameras.main.startFollow(this.taeri.root, true, 0.12, 0.12, 0, 60);

    if (!this.textures.exists('dark')) {
      const tex = this.textures.createCanvas('dark', 2600, 1400)!;
      const ctx = tex.getContext();
      const grad = ctx.createRadialGradient(1300, 700, 90, 1300, 700, 520);
      grad.addColorStop(0, 'rgba(6,7,9,0)');
      grad.addColorStop(0.6, 'rgba(6,7,9,0.6)');
      grad.addColorStop(1, 'rgba(6,7,9,0.94)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 2600, 1400);
      tex.refresh();
    }
    this.dark = this.add.image(px(this.s.taeriX), 300, 'dark').setDepth(40);
    this.tweens.add({ targets: this.dark, alpha: 0.93, duration: 90, yoyo: true, repeat: -1, repeatDelay: 3400 });

    this.drawHud();
    this.sync(true);

    const kb = this.input.keyboard!;
    kb.on('keydown', (e: KeyboardEvent) => {
      if (this.busy) return;
      if (e.key === 'ArrowLeft' || e.key === 'a') this.step(-1);
      else if (e.key === 'ArrowRight' || e.key === 'd') this.step(1);
      else if (e.key === '1') this.doAct('note');
      else if (e.key === '2') this.doAct('open');
      else if (e.key === '3') this.doAct('rest');
      else if (e.key === 'h' || e.key === 'H') this.goHome();
    });

    this.time.addEvent({
      delay: 300, loop: true, callback: () => {
        const near = [...this.s.walkers].some((w) => w.active && Math.abs(w.x - this.s.taeriX) <= 3);
        const tense = this.s.noise >= WAKE_NOISE || near;
        if (!tense) return;
        this.beat += 300;
        const every = near ? 700 : 1200;
        if (this.beat >= every) { this.beat = 0; sfx.heartbeat(); }
      },
    });

    this.cameras.main.fadeIn(600);
    this.log('그날 밤 0시. 15층 복도. 소리를 내면 계단실에 있는 것들이 깬다.');
    this.log('← → 로 걷고, 문 앞에서 쪽지를 넣거나 문을 연다. 새벽 6시에 신호를 보낸다.');
  }

  // ---------- 무대 ----------

  private drawCorridor() {
    const g = this.add.graphics();
    g.fillStyle(C.night).fillRect(0, 0, WORLD, H);
    g.fillStyle(0x2e3237).fillRect(0, 0, WORLD, 70);
    g.fillStyle(C.concrete).fillRect(0, 70, WORLD, FLOOR - 70);
    g.fillStyle(0x000000, 0.25).fillRect(0, 70, WORLD, 6);
    for (let x = 0; x < WORLD; x += 75) g.fillStyle(C.concreteDark, 0.3).fillRect(x, 76, 2, FLOOR - 76);
    g.fillStyle(C.floor).fillRect(0, FLOOR, WORLD, 60);
    g.fillStyle(0x000000, 0.3).fillRect(0, FLOOR, WORLD, 3);

    // 형광등 (몇 개는 나갔다)
    for (let x = 1; x <= 15; x += 2) {
      const on = x % 6 !== 5;
      g.fillStyle(on ? 0xfff6d8 : 0x55565a, on ? 0.9 : 1).fillRect(px(x) - 50, 64, 100, 5);
      if (on) this.add.ellipse(px(x), 70, 340, 120, 0xfff6d8, 0.05);
    }

    // 세대 문
    for (let x = 1; x <= 15; x++) {
      const cx = px(x);
      g.fillStyle(C.doorDark).fillRect(cx - 44, FLOOR - 160, 88, 160);
      g.fillStyle(C.door).fillRect(cx - 38, FLOOR - 154, 76, 154);
      g.fillStyle(0x2a2c30).fillRect(cx + 22, FLOOR - 80, 8, 14);
      g.fillStyle(0x9aa0a6).fillRect(cx - 14, FLOOR - 120, 28, 4);
      g.fillStyle(C.paper).fillRect(cx - 26, FLOOR - 186, 52, 18);
      text(this, cx, FLOOR - 177, `15${String(x).padStart(2, '0')}`, 12, '#222', { fontStyle: '700' }).setOrigin(0.5);
      // 복도식 창문 (문 옆 작은 창)
      g.fillStyle(0x1b1d21).fillRect(cx + 50, FLOOR - 140, 40, 44);
      g.lineStyle(2, 0x5b6068).strokeRect(cx + 50, FLOOR - 140, 40, 44);
    }
    // 소화전함 07~08 사이
    g.fillStyle(0x8a2b2b).fillRect(px(7.5) - 26, FLOOR - 130, 52, 70);
    g.fillStyle(0xb94a4a).fillRect(px(7.5) - 21, FLOOR - 125, 42, 60);

    // 계단실
    for (const [x, label] of [[0, '동쪽 계단 · 엘리베이터'], [16, '서쪽 계단']] as const) {
      const cx = px(x);
      g.fillStyle(0x050506).fillRect(cx - 55, FLOOR - 190, 110, 190);
      g.lineStyle(4, 0x5b6068).strokeRect(cx - 55, FLOOR - 190, 110, 190);
      g.fillStyle(0x1f7a3a).fillRect(cx - 30, FLOOR - 220, 60, 20);
      text(this, cx, FLOOR - 210, '비상구', 12, '#e8ffe8', { fontStyle: '700' }).setOrigin(0.5);
      text(this, cx, FLOOR + 18, label, 12, '#9aa0a6').setOrigin(0.5);
    }

    // 앞쪽 난간 (복도식 아파트의 바깥쪽 벽)
    const f = this.add.graphics().setDepth(30).setScrollFactor(1.06, 1);
    f.fillStyle(0x1a1c20).fillRect(-200, FLOOR + 52, WORLD + 400, H);
    f.fillStyle(0x2a2d31).fillRect(-200, FLOOR + 52, WORLD + 400, 8);
  }

  private drawHud() {
    const fixed = <T extends Phaser.GameObjects.GameObject & { setScrollFactor(x: number): T; setDepth(d: number): T }>(o: T) =>
      o.setScrollFactor(0).setDepth(100);
    fixed(this.add.rectangle(W / 2, 24, W, 48, 0x000000, 0.7));
    fixed(title(this, 16, 10, '3/2 밤 · 15층', 22, HEX(C.paper)));
    const clock = fixed(title(this, 196, 8, '00:00', 26, HEX(C.orange)));
    fixed(text(this, 300, 6, '소음', 12, '#9aa0a6'));
    const noise = fixed(this.add.graphics());
    const noiseText = fixed(text(this, 300, 24, '', 11, '#9aa0a6'));
    const res = fixed(text(this, W - 16, 14, '', 15, HEX(C.paper), { fontStyle: '700' }).setOrigin(1, 0));
    const log = fixed(text(this, W / 2, 56, '', 14, HEX(C.paper), {
      align: 'center', wordWrap: { width: 820 }, lineSpacing: 4, backgroundColor: '#000000aa', padding: { x: 10, y: 6 },
    }).setOrigin(0.5, 0));

    fixed(this.add.rectangle(W / 2, H - 50, W, 100, 0x0d0e10, 0.92).setStrokeStyle(1, 0x2a2d31));
    const doorTitle = fixed(title(this, 20, H - 94, '', 22, HEX(C.paper)));
    const doorInfo = fixed(text(this, 20, H - 62, '', 12, '#9aa0a6', { wordWrap: { width: 270 }, maxLines: 3 }));
    const mk = (x: number, w: number, label: string, fn: () => void, style: 'primary' | 'plain' = 'plain') =>
      fixed(button(this, x, H - 70, w, 40, label, fn, style));
    const btns = {
      note: mk(370, 150, '1  쪽지 넣기', () => this.doAct('note'), 'primary'),
      open: mk(530, 150, '2  문 열기', () => this.doAct('open')),
      rest: mk(690, 150, '3  기다리기', () => this.doAct('rest')),
      home: mk(850, 150, 'H  새벽까지 쉬기', () => this.goHome()),
    };
    fixed(text(this, 370, H - 38, '소음 0 · 30분', 11, '#777').setOrigin(0.5, 0));
    fixed(text(this, 530, H - 38, '소음 1 · 30분', 11, '#777').setOrigin(0.5, 0));
    fixed(text(this, 690, H - 38, '30분', 11, '#777').setOrigin(0.5, 0));
    fixed(text(this, 850, H - 38, '1502호에서만', 11, '#777').setOrigin(0.5, 0));
    fixed(button(this, 196, H - 80, 44, 28, '◀', () => this.step(-1)));
    fixed(button(this, 246, H - 80, 44, 28, '▶', () => this.step(1)));
    this.hud = { clock, noise, noiseText, res, log, doorTitle, doorInfo, btns };
  }

  private log(msg: string) {
    this.messages.push(msg);
    this.messages = this.messages.slice(-2);
    this.hud.log.setText(this.messages.join('\n'));
    this.hud.log.setAlpha(0.4);
    this.tweens.add({ targets: this.hud.log, alpha: 1, duration: 200 });
  }

  // ---------- 상태를 화면에 반영 ----------

  private sync(instant = false) {
    const s = this.s;
    const hud = this.hud;
    hud.clock.setText(clockText(s.tick));
    hud.res.setText(`물 ${s.water}   식량 ${s.food}   약 ${s.meds}${s.bites ? `   물림 ${s.bites}` : ''}`);

    // 소음 미터
    hud.noise.clear();
    for (let i = 0; i < HORDE_NOISE; i++) {
      const on = i < s.noise;
      const col = i >= ALL_WAKE_NOISE ? C.red : i >= WAKE_NOISE ? C.orange : 0xd9c9a3;
      hud.noise.fillStyle(on ? col : 0x2a2d31).fillRect(334 + i * 26, 8, 22, 12);
      if (i === WAKE_NOISE || i === ALL_WAKE_NOISE) hud.noise.fillStyle(0xffffff).fillRect(334 + i * 26 - 3, 4, 2, 20);
    }
    hud.noiseText.setText(`${s.noise} / ${HORDE_NOISE}      ${WAKE_NOISE}부터 깸 · ${ALL_WAKE_NOISE} 전부 · ${HORDE_NOISE} 무리`);
    hud.noiseText.setX(334);

    // 문 표시
    this.marks.clear();
    for (const d of s.doors) {
      const cx = px(d.x);
      const y = FLOOR - 212;
      const m = this.marks;
      if (d.mark === 'person') m.lineStyle(3, C.red).strokeCircle(cx, y, 13).strokeCircle(cx + 1, y - 1, 12);
      else if (d.mark === 'sound') m.lineStyle(3, C.blue).strokeTriangle(cx, y - 14, cx - 14, y + 10, cx + 14, y + 10);
      else if (d.mark === 'blood') m.lineStyle(4, C.red).lineBetween(cx - 12, y - 12, cx + 12, y + 12).lineBetween(cx + 12, y - 12, cx - 12, y + 12);
      else if (d.mark === 'looted') m.lineStyle(3, C.green).lineBetween(cx - 12, y, cx - 3, y + 9).lineBetween(cx - 3, y + 9, cx + 13, y - 10);
      else if (d.mark === 'home') m.fillStyle(C.orange).fillTriangle(cx, y - 14, cx - 14, y, cx + 14, y).fillRect(cx - 10, y, 20, 12);
      if (d.kind === 'survivor' || d.kind === 'hidden') {
        for (let i = 0; i < d.trust; i++) m.fillStyle(C.orange).fillCircle(cx - 12 + i * 12, FLOOR - 196, 4);
      }
      if (d.opened && d.kind !== 'survivor') {
        m.fillStyle(0x060708, 0.9).fillRect(cx - 38, FLOOR - 154, 30, 154);
      }
    }

    // 감염자
    for (const w of s.walkers) {
      let z = this.walkers.get(w.id);
      if (!z) {
        z = drawZombie(this, px(w.x), FLOOR, w.enemy, 0.68);
        z.root.setDepth(18);
        if (w.x === 16) z.root.setScale(-0.68, 0.68); // 서쪽에서 오는 감염자는 오른쪽에서 걸어온다
        this.walkers.set(w.id, z);
      }
      const facing = w.x > s.taeriX ? 1 : -1;
      z.root.setScale(0.68 * facing, 0.68);
      const tx = px(w.x) + (w.x === s.taeriX ? 0 : 0);
      z.body.setAlpha(w.active ? 1 : 0);
      z.eyes.setAlpha(1);
      if (instant) z.root.x = tx;
      else this.tweens.add({ targets: z.root, x: tx, duration: 420, ease: 'Sine.InOut' });
    }
    for (const [id, z] of this.walkers) {
      if (!s.walkers.some((w) => w.id === id)) { z.root.destroy(); this.walkers.delete(id); }
    }

    // 문 패널
    const d = doorAt(s, s.taeriX)!;
    hud.doorTitle.setText(`${d.no}호`);
    hud.doorInfo.setText(this.describe(d));
    const free = !this.busy && s.over === 'no';
    hud.btns.note.setEnabled(free && d.kind !== 'home');
    hud.btns.open.setEnabled(free && d.kind !== 'home' && !(d.opened && d.kind !== 'survivor'));
    hud.btns.rest.setEnabled(free);
    hud.btns.home.setEnabled(free && d.kind === 'home');
  }

  private describe(d: ReturnType<typeof doorAt> & object): string {
    if (d.kind === 'home') return '태리의 집. 여기서 새벽까지 버틸 수 있다.';
    if (d.no === '1501' && d.kind === 'cleared' && !d.enemy) return '아침에 원펀치로 끝낸 집. 다시 열 이유는 없다.';
    if (d.kind === 'cleared') return '정리한 집.';
    if (d.mark === 'person') return `${d.label}. 쪽지 ${d.trust}/2 — 2가 되면 새벽에 대답한다.`;
    if (d.mark === 'sound') {
      if (d.kind === 'infected') return '안에서 긁는 소리. 열면 싸워야 한다.';
      return `인기척이 있다. 쪽지 ${d.trust}/2 — 2가 되면 새벽에 대답한다.`;
    }
    if (d.mark === 'looted') return '빈집. 이미 털었다.';
    if (d.mark === 'blood') return '피 묻은 집. X.';
    return '모르는 집. 모르는 칸은 비어 있는 칸이 아니다.';
  }

  // ---------- 행동 ----------

  private step(dx: -1 | 1) {
    if (this.busy || this.s.over !== 'no') return;
    const r = move(this.s, dx);
    if (r.state.taeriX === this.s.taeriX) return;
    this.busy = true;
    this.s = r.state;
    sfx.step();
    this.time.delayedCall(140, () => sfx.step());
    this.taeri.root.setScale(0.72 * dx, 0.72);
    this.tweens.add({
      targets: this.taeri.root, x: px(this.s.taeriX), duration: 260, ease: 'Sine.InOut',
      onUpdate: () => this.dark.setX(this.taeri.root.x),
      onComplete: () => { this.busy = false; this.after(r); },
    });
    this.tweens.add({ targets: this.taeri.root, y: FLOOR - 4, duration: 65, yoyo: true, repeat: 1 });
  }

  private doAct(a: DoorAction) {
    if (this.busy || this.s.over !== 'no') return;
    const d = doorAt(this.s, this.s.taeriX)!;
    if (a !== 'rest' && d.kind === 'home') return;
    const r = act(this.s, a);
    this.s = r.state;
    if (a === 'note') sfx.paper();
    if (a === 'open') sfx.door();
    if (a === 'open' && r.combat) this.cameras.main.shake(200, 0.01);
    this.after(r);
  }

  private goHome() {
    if (this.busy || this.s.over !== 'no' || doorAt(this.s, this.s.taeriX)!.kind !== 'home') return;
    this.busy = true;
    this.log('문을 잠그고 새벽을 기다린다.');
    this.cameras.main.fadeOut(900);
    this.time.delayedCall(950, () => this.toDawn());
  }

  private after(r: StepResult) {
    r.messages.forEach((m) => this.log(m));
    if (r.woke.length) {
      sfx.groan();
      this.cameras.main.shake(300, 0.004);
    } else if (r.moved.length) this.time.delayedCall(200, () => sfx.step());
    this.sync();

    if (this.s.over === 'horde') { this.horde(); return; }
    if (r.combat) { this.fight(r.combat); return; }
    if (this.s.over === 'dawn') {
      this.busy = true;
      this.log('하늘이 밝아 온다.');
      this.cameras.main.fadeOut(1200);
      this.time.delayedCall(1250, () => this.toDawn());
    }
  }

  private fight(c: NonNullable<StepResult['combat']>) {
    this.busy = true;
    this.sync();
    const cam = this.cameras.main;
    this.time.delayedCall(350, () => {
      cam.flash(120, 255, 255, 255);
      cam.zoomTo(1.6, 300);
      this.time.delayedCall(320, () => {
        cam.zoomTo(1, 0);
        const data: CombatData = {
          enemy: c.enemy,
          seed: this.s.seed * 31 + this.s.tick * 7 + this.fights,
          fromDoor: c.doorX ? doorAt(this.s, c.doorX)!.no : undefined,
          onDone: (res) => {
            this.fights++;
            if (res.outcome === 'ko' && res.noise === 0 && res.bites === 0) this.quietKOs++;
            this.scene.resume();
            this.cameras.main.fadeIn(250);
            this.busy = false;
            const r = afterCombat(this.s, c, res);
            this.s = r.state;
            this.after(r);
          },
        };
        this.scene.pause();
        this.scene.launch('combat', data);
      });
    });
  }

  private horde() {
    this.busy = true;
    const cam = this.cameras.main;
    sfx.groan();
    this.time.delayedCall(300, () => sfx.groan());
    cam.shake(1200, 0.01);
    cam.flash(400, 120, 0, 0);
    for (let i = 0; i < 14; i++) {
      const side = i % 2 ? px(0) : px(16);
      const e = this.add.graphics().setDepth(45);
      e.fillStyle(0xfff3a0).fillCircle(0, 0, 2.5).fillCircle(8, -1, 2.5);
      e.setPosition(side - 40 + Math.random() * 80, FLOOR - 140 + Math.random() * 100).setAlpha(0);
      this.tweens.add({ targets: e, alpha: 1, delay: i * 90, duration: 200 });
    }
    this.time.delayedCall(2200, () => {
      cam.fadeOut(800);
      this.time.delayedCall(820, () => this.scene.start('dawn', { night: this.s, horde: true, fights: this.fights, quiet: this.quietKOs }));
    });
  }

  private toDawn() {
    this.scene.start('dawn', { night: this.s, horde: false, fights: this.fights, quiet: this.quietKOs });
  }
}
