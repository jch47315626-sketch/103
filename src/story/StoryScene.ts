// 이야기 장면 진행기: 대본(script.ts)을 한 장면씩 보여 주고, 손잡이·붕대·전투 같은 순간은 직접 하게 한다.
import Phaser from 'phaser';
import { coverImage, fitHeight, slotKey, slotOverlay } from '../game/images';
import { sfx } from '../game/sfx';
import { button, C, H, HEX, text, title, W } from '../game/theme';
import { drawBg } from './backgrounds';
import { CHAPTERS, type Beat, type Spot } from './script';
import { saveProgress } from './progress';

const BOX_Y = 384;
const SERIF = '"Noto Serif KR", "Nanum Myeongjo", serif';

export class StoryScene extends Phaser.Scene {
  private chapter = 0;
  private queue: Beat[] = [];
  private bgLayer!: Phaser.GameObjects.Container;
  private fx!: Phaser.GameObjects.Container;
  private box!: Phaser.GameObjects.Container;
  private body!: Phaser.GameObjects.Text;
  private name!: Phaser.GameObjects.Text;
  private nameBg!: Phaser.GameObjects.Rectangle;
  private more!: Phaser.GameObjects.Text;
  private items!: Phaser.GameObjects.Text;
  private typing?: Phaser.Time.TimerEvent;
  private full = '';
  private waiting = false; // 클릭하면 다음으로
  private busy = false; // 직접 하는 순간: 클릭으로 넘기지 않는다
  private inventory: string[] = [];
  private portrait?: Phaser.GameObjects.Image;
  private boxBg!: Phaser.GameObjects.Rectangle;
  private explore?: { beat: Extract<Beat, { t: 'explore' }>; seen: Set<string> };
  /** 지금 진행 중인 장면 (자동 플레이 테스트가 읽는다) */
  current?: Beat;

  constructor() { super('story'); }

  init(d: { chapter: number; inventory?: string[] }) {
    this.chapter = d.chapter;
    this.queue = [...CHAPTERS[d.chapter].beats];
    this.inventory = d.inventory ?? [];
    this.waiting = false;
    this.busy = false;
    this.explore = undefined;
  }

  create() {
    saveProgress(this.chapter);
    this.cameras.main.setBackgroundColor('#050506');
    this.bgLayer = this.add.container(0, 0);
    this.fx = this.add.container(0, 0).setDepth(20);

    // 글상자
    this.box = this.add.container(0, 0).setDepth(30);
    const bgBox = this.add.rectangle(W / 2, BOX_Y + (H - BOX_Y) / 2, W, H - BOX_Y, 0x0b0c0e, 0.96).setStrokeStyle(1, 0x2a2d31);
    this.boxBg = bgBox;
    this.nameBg = this.add.rectangle(24, BOX_Y - 2, 120, 30, C.orange).setOrigin(0, 0.5);
    this.name = title(this, 36, BOX_Y - 2, '', 18, '#1a1a1a').setOrigin(0, 0.5);
    this.body = text(this, 36, BOX_Y + 26, '', 18, HEX(C.paper), { fontFamily: SERIF, wordWrap: { width: W - 90 }, lineSpacing: 9 });
    this.more = text(this, W - 30, H - 22, '▼', 14, HEX(C.orange)).setOrigin(1, 1);
    this.tweens.add({ targets: this.more, alpha: 0.2, duration: 500, yoyo: true, repeat: -1 });
    this.box.add([bgBox, this.nameBg, this.name, this.body, this.more]);
    this.items = text(this, W - 14, 10, '', 11, '#9aa0a6', { align: 'right' }).setOrigin(1, 0).setDepth(31);
    this.refreshItems();

    this.input.on('pointerdown', (_p: unknown, objs: unknown[]) => { if (!objs.length) this.advance(); });
    this.input.keyboard!.on('keydown', (e: KeyboardEvent) => {
      if (e.repeat) return;
      if (e.key === 'Enter' || (e.key === ' ' && !this.busy)) this.advance();
    });
    this.cameras.main.fadeIn(400);
    this.next();
  }

  private refreshItems() {
    this.items.setText(this.inventory.length ? `소지품\n${this.inventory.join('\n')}` : '');
  }

  private advance() {
    if (this.busy) return;
    if (this.typing) { this.typing.remove(); this.typing = undefined; this.body.setText(this.full); this.more.setVisible(true); return; }
    if (this.waiting) { this.waiting = false; this.next(); }
  }

  /** 말하는 사람의 서 있는 그림. 그림 파일이 있을 때만 */
  private setPortrait(who: string | null, pt?: string | null) {
    this.portrait?.destroy();
    this.portrait = undefined;
    if (!who || pt === null) return;
    const base: Record<string, string> = {
      태리: this.chapter >= 3 ? 'pt_taeri_track_neutral' : 'pt_taeri_uni_neutral',
      세훈: 'pt_sehun_neutral',
      아빠: 'pt_dad_stern',
      호룡: 'pt_horyong_shout',
    };
    const name = pt ?? base[who];
    const key = name ? slotKey(this, `pt:${name}`) : null;
    if (!key) return;
    this.portrait = fitHeight(this, key, W - 180, BOX_Y + 6, 340).setDepth(29);
    if (who === '아빠') this.portrait.setTint(0xd8c8a8).setAlpha(0.85); // 회상
  }

  private show(who: string | null, str: string, opts: { color?: string; italic?: boolean; pt?: string | null } = {}) {
    this.setPortrait(who, opts.pt);
    this.box.setVisible(true);
    this.nameBg.setVisible(!!who);
    this.name.setText(who ?? '');
    if (who) this.nameBg.width = this.name.width + 24;
    this.body.setColor(opts.color ?? HEX(C.paper)).setFontStyle(opts.italic ? 'italic' : 'normal');
    this.full = who ? `“${str}”` : str;
    this.body.setText('');
    this.more.setVisible(false);
    let i = 0;
    this.typing = this.time.addEvent({
      delay: 22, repeat: this.full.length - 1, callback: () => {
        i++;
        this.body.setText(this.full.slice(0, i));
        if (i >= this.full.length) { this.typing = undefined; this.more.setVisible(true); }
      },
    });
    this.waiting = true;
  }

  private clearFx() { this.fx.removeAll(true); this.portrait?.destroy(); this.portrait = undefined; }

  private next(): void {
    const beat = this.queue.shift();
    this.current = beat;
    if (!beat) {
      if (this.explore) { this.showExplore(); return; }
      this.chapterEnd();
      return;
    }
    this.clearFx();
    switch (beat.t) {
      case 'chapter': return this.chapterCard(beat.no, beat.name);
      case 'bg': drawBg(this, this.bgLayer, beat.bg); this.boxBg.setFillStyle(0x0b0c0e, 0.96); return this.next();
      case 'n': return this.show(null, beat.text);
      case 'say': return this.show(beat.who, beat.text, { color: beat.who === '아빠' ? '#c9c1b0' : undefined, italic: beat.who === '아빠', pt: beat.pt });
      case 'cg': {
        // 이벤트 그림: 있으면 화면 가득, 다음 배경이 올 때까지 남는다
        const key = slotKey(this, `cg:${beat.key}`);
        if (key) {
          this.bgLayer.removeAll(true);
          const img = coverImage(this, key, 0, 0, W, H).setAlpha(0);
          this.bgLayer.add(img);
          this.tweens.add({ targets: img, alpha: 1, duration: 600 });
          this.boxBg.setFillStyle(0x0b0c0e, 0.8);
        }
        return this.next();
      }
      case 'big': return this.big(beat);
      case 'phone': return this.phone(beat);
      case 'voicemail': return this.voicemail();
      case 'broadcast': return this.broadcast(beat);
      case 'hold': return this.hold(beat);
      case 'prompt': return this.prompt(beat);
      case 'bandage': return this.bandage();
      case 'fight': return this.fight(beat.id);
      case 'item': return this.item(beat);
      case 'explore': this.explore = { beat, seen: new Set() }; drawBg(this, this.bgLayer, beat.bg); return this.showExplore(true);
      case 'end': return this.endLine(beat.text);
    }
  }

  // ---------- 연출 ----------

  private chapterCard(no: number, name: string) {
    this.box.setVisible(false);
    this.busy = true;
    const dim = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 1);
    this.fx.add(dim);
    const cardKey = slotKey(this, 'chapter_card');
    if (cardKey) this.fx.add(coverImage(this, cardKey, 0, 0, W, H).setAlpha(0.7));
    const a = title(this, W / 2, H / 2 - 30, `제${no}화`, 30, HEX(C.orange)).setOrigin(0.5);
    const b = title(this, W / 2, H / 2 + 20, name, 46, HEX(C.paper)).setOrigin(0.5);
    this.fx.add([a, b]);
    [a, b].forEach((o) => o.setAlpha(0));
    this.tweens.add({ targets: [a, b], alpha: 1, duration: 700 });
    this.time.delayedCall(2200, () => {
      this.tweens.add({ targets: this.fx.list, alpha: 0, duration: 600, onComplete: () => { this.busy = false; this.next(); } });
    });
  }

  private big(beat: Extract<Beat, { t: 'big' }>) {
    const t = title(this, W / 2, 180, beat.text, 64, HEX(C.paper)).setOrigin(0.5).setStroke('#000', 8).setScale(1.5);
    this.fx.add(t);
    this.tweens.add({ targets: t, scale: 1, duration: 200, ease: 'Back.Out' });
    if (beat.shake) this.cameras.main.shake(300, beat.shake);
    if (beat.sound === 'bang') { sfx.heavy(); sfx.door(); }
    else if (beat.sound === 'scrape') sfx.bite();
    else if (beat.sound === 'door') sfx.door();
    else if (beat.sound === 'punch') sfx.punch();
    this.box.setVisible(false);
    this.waiting = true;
  }

  private phoneFrame(from: string, body: string, alert = false) {
    const g = this.add.graphics();
    g.fillStyle(0x000000, 0.5).fillRect(0, 0, W, BOX_Y);
    g.fillStyle(0x15171b).fillRoundedRect(W / 2 - 170, 30, 340, 330, 28);
    g.fillStyle(alert ? 0x3a1010 : 0x22252b).fillRoundedRect(W / 2 - 150, 90, 300, 150, 14);
    const f = text(this, W / 2 - 134, 102, from, 14, alert ? '#ff8a8a' : '#9fd0ff', { fontStyle: '700' });
    const b = text(this, W / 2 - 134, 128, body, 14, '#eee', { wordWrap: { width: 270 }, lineSpacing: 5 });
    this.fx.add([g, f, b]);
  }

  private phone(beat: Extract<Beat, { t: 'phone' }>) {
    if (beat.kind === 'alert') { sfx.buzz(); this.time.delayedCall(180, () => sfx.buzz()); } else sfx.click();
    this.phoneFrame(beat.from, beat.text, beat.kind === 'alert');
    this.box.setVisible(false);
    this.waiting = true;
  }

  /** 8시 12분, 아빠의 음성 메시지. 아직 열 수 없다. */
  private voicemail() {
    this.phoneFrame('아빠', '음성 메시지 1건\n수신 오전 8:12\n\n(방송이 끊기고 30분쯤 지난 시간)');
    this.busy = true;
    this.box.setVisible(false);
    const done = () => {
      this.clearFx();
      this.busy = false;
      this.queue.unshift(
        { t: 'n', text: '태리의 엄지가 알림 위에서 멈췄다. 차 가지고 오겠다고 했었지. 학교 앞까지만이라도. 설마 그 사람이.' },
        { t: 'n', text: '아니다. 자기가 하겠다고 한 걸 거절당하면 두 번 묻지 않는 사람이다. 그녀도 두 번 대답하지 않았다.' },
        { t: 'n', text: '엄지를 떼었다. 휴대폰을 다시 엎었다. 욕조에서 물이 넘치는 소리가 났다.' },
      );
      this.next();
    };
    const play = button(this, W / 2 - 70, 290, 120, 40, '▶ 재생', () => {
      // 손가락이 멈춘다
      this.tweens.add({ targets: play, x: play.x + 4, duration: 40, yoyo: true, repeat: 6 });
      play.setEnabled(false);
      this.time.delayedCall(700, done);
    }, 'primary');
    const flip = button(this, W / 2 + 70, 290, 120, 40, '휴대폰을 엎는다', done);
    this.fx.add([play, flip]);
  }

  private broadcast(beat: Extract<Beat, { t: 'broadcast' }>) {
    sfx.bell();
    const spk = this.add.graphics();
    spk.fillStyle(0x2a2d32).fillCircle(W / 2, 40, 26);
    spk.lineStyle(2, 0x777777);
    for (let i = 0; i < 5; i++) spk.strokeCircle(W / 2, 40, 6 + i * 4);
    this.fx.add(spk);
    if (beat.cut) {
      this.cameras.main.shake(400, 0.012);
      this.time.delayedCall(300, () => { sfx.heavy(); });
    }
    this.show('천장 스피커', beat.text, { color: '#cfe6ff' });
  }

  /** 열지 못한 문: 손잡이를 끝까지 내릴 수 없다 */
  private hold(beat: Extract<Beat, { t: 'hold' }>) {
    this.busy = true;
    this.box.setVisible(false);
    const label = title(this, W / 2, 330, beat.label, 20, HEX(C.paper)).setOrigin(0.5).setStroke('#000', 5);
    const barBg = this.add.rectangle(W / 2, 360, 400, 12, 0x2a2d31).setStrokeStyle(1, 0x555a60);
    const bar = this.add.rectangle(W / 2 - 200, 360, 0, 12, C.orange).setOrigin(0, 0.5);
    this.fx.add([label, barBg, bar]);
    let p = 0;
    let holding = false;
    let stuck = false;
    const kb = this.input.keyboard!;
    const down = (e: KeyboardEvent) => { if (e.key === ' ') holding = true; };
    const up = (e: KeyboardEvent) => { if (e.key === ' ') holding = false; };
    kb.on('keydown', down);
    kb.on('keyup', up);
    const zone = this.add.zone(W / 2, 200, W, 380).setInteractive();
    zone.on('pointerdown', () => { holding = true; });
    zone.on('pointerup', () => { holding = false; });
    this.fx.add(zone);
    const ev = this.time.addEvent({
      delay: 16, loop: true, callback: () => {
        if (stuck) return;
        if (holding) p = Math.min(beat.stopAt, p + 0.006); else p = Math.max(0, p - 0.004);
        bar.width = 400 * p;
        if (p >= beat.stopAt) {
          stuck = true;
          // 손이 떨린다. 더 내려가지 않는다.
          this.cameras.main.shake(900, 0.004);
          this.tweens.add({ targets: bar, x: bar.x + 3, duration: 40, yoyo: true, repeat: 12 });
          label.setText('……손이 떨린다.');
          this.time.delayedCall(1300, () => {
            ev.remove();
            kb.off('keydown', down);
            kb.off('keyup', up);
            this.clearFx();
            this.busy = false;
            this.next();
          });
        }
      },
    });
  }

  private prompt(beat: Extract<Beat, { t: 'prompt' }>) {
    this.busy = true;
    this.box.setVisible(false);
    const label = title(this, W / 2, 330, beat.label, 20, HEX(C.paper)).setOrigin(0.5).setStroke('#000', 5);
    this.fx.add(label);
    this.tweens.add({ targets: label, alpha: 0.4, duration: 600, yoyo: true, repeat: -1 });
    const finish = () => {
      this.input.keyboard!.off('keydown', onKey);
      if (beat.sound === 'door') sfx.door(); else if (beat.sound === 'punch') sfx.punch(); else sfx.paper();
      this.clearFx();
      this.time.delayedCall(250, () => { this.busy = false; this.next(); });
    };
    const onKey = (e: KeyboardEvent) => { if (e.key.toLowerCase() === beat.key) finish(); };
    this.input.keyboard!.on('keydown', onKey);
    const zone = this.add.zone(W / 2, 200, W, 380).setInteractive();
    zone.once('pointerdown', finish);
    this.fx.add(zone);
  }

  /** 붕대 감기: 아빠가 가르쳐 준 순서 */
  private bandage() {
    this.busy = true;
    this.box.setVisible(false);
    const steps = [
      ['s', '손목부터'], ['d', '엄지 사이를 지나'], ['w', '손등을 가로질러'], ['e', '너클 위를 두 번'], ['q', '세 번 감아 올리고'], ['a', '손가락 사이를 하나씩'], ['x', '다시 손목'],
    ];
    const seq = [...steps.map(([k, l]) => ['오른손', k, l]), ...steps.map(([k, l]) => ['왼손', k, l])];
    let i = 0;
    const g = this.add.graphics();
    const head = title(this, W / 2, 40, '', 22, HEX(C.paper)).setOrigin(0.5);
    const cue = title(this, W / 2, 330, '', 26, HEX(C.orange)).setOrigin(0.5).setStroke('#000', 5);
    const hint = text(this, W / 2, 360, '표시된 키를 누른다 (Q W E · A S D · Z X C — 싸울 때 쓰는 키다)', 12, '#888').setOrigin(0.5);
    this.fx.add([g, head, cue, hint]);
    const drawFist = () => {
      g.clear();
      g.fillStyle(0x000000, 0.55).fillRect(0, 0, W, BOX_Y);
      g.fillStyle(C.skin).fillRoundedRect(W / 2 - 90, 100, 180, 150, 40);
      g.fillStyle(C.skin).fillRoundedRect(W / 2 - 60, 240, 120, 70, 16);
      const done = i >= seq.length ? 7 : i % 7; // 지금 손에 감긴 바퀴 수
      for (let k = 0; k < done; k++) {
        g.lineStyle(14, 0xf4f4f2, 1).lineBetween(W / 2 - 92, 290 - k * 26, W / 2 + 92, 270 - k * 26);
      }
    };
    const show = () => {
      if (i >= seq.length) {
        this.input.keyboard!.off('keydown', onKey);
        cue.setText('천이 손에 맞게 조여들었다.');
        this.time.delayedCall(900, () => { this.clearFx(); this.busy = false; this.next(); });
        return;
      }
      const [hand, k, l] = seq[i];
      head.setText(`${hand} — 붕대를 감는다`);
      cue.setText(`[${k.toUpperCase()}] ${l}`);
      drawFist();
    };
    const onKey = (e: KeyboardEvent) => {
      if (i >= seq.length) return;
      if (e.key.toLowerCase() === seq[i][1]) { sfx.paper(); i++; show(); }
      else if (e.key.length === 1) sfx.buzz();
    };
    this.input.keyboard!.on('keydown', onKey);
    const zone = this.add.zone(W / 2, 200, W, 380).setInteractive();
    zone.on('pointerdown', () => { if (i < seq.length) { sfx.paper(); i++; show(); } });
    this.fx.add(zone);
    show();
  }

  private fight(id: string) {
    this.busy = true;
    this.box.setVisible(false);
    this.cameras.main.fadeOut(250);
    this.time.delayedCall(260, () => {
      this.scene.launch('combat', {
        story: id,
        onDone: () => {
          this.scene.resume();
          this.cameras.main.fadeIn(300);
          this.busy = false;
          this.next();
        },
      });
      this.scene.pause();
    });
  }

  private item(beat: Extract<Beat, { t: 'item' }>) {
    if (!this.inventory.includes(beat.name)) this.inventory.push(beat.name);
    this.refreshItems();
    sfx.chime(2);
    const card = this.add.container(W / 2, 170);
    const bg = this.add.rectangle(0, 0, 520, 110, 0x0b0c0e, 0.92).setStrokeStyle(2, C.orange);
    const a = text(this, 0, -30, '얻었다', 12, HEX(C.orange), { fontStyle: '700' }).setOrigin(0.5);
    const b = title(this, 0, -4, beat.name, 24, HEX(C.paper)).setOrigin(0.5);
    const c = text(this, 0, 30, beat.desc, 13, '#bbb', { fontFamily: SERIF, wordWrap: { width: 480 }, align: 'center' }).setOrigin(0.5);
    card.add([bg, a, b, c]).setScale(0.9).setAlpha(0);
    const icon = beat.icon ? slotKey(this, `item:${beat.icon}`) : null;
    if (icon) {
      const im = this.add.image(-200, 0, icon);
      im.setScale(90 / Math.max(im.width, im.height));
      card.add(im);
      const label = slotOverlay(`item:${beat.icon}`);
      if (label) card.add(text(this, -200, 0, label, 12, '#ffffff', { fontStyle: '700', stroke: '#000', strokeThickness: 3 }).setOrigin(0.5));
      [a, b, c].forEach((o) => o.setX(50));
      c.setWordWrapWidth(380);
    }
    this.fx.add(card);
    this.tweens.add({ targets: card, scale: 1, alpha: 1, duration: 250 });
    this.box.setVisible(false);
    this.waiting = true;
  }

  // ---------- 살펴보기 ----------

  private showExplore(first = false) {
    const ex = this.explore!;
    drawBg(this, this.bgLayer, ex.beat.bg);
    this.clearFx();
    this.busy = true;
    this.box.setVisible(true);
    this.nameBg.setVisible(false);
    this.name.setText('');
    this.more.setVisible(false);
    this.body.setColor(HEX(C.paper)).setText(first ? ex.beat.intro : '다른 곳도 살펴본다. (누를 수 있는 곳이 테두리로 보인다)');
    const ready = ex.beat.need.every((id) => ex.seen.has(id));
    for (const s of ex.beat.spots) this.fx.add(this.spot(s, ex.seen.has(s.id)));
    if (ready) {
      const go = button(this, W - 110, BOX_Y - 30, 190, 40, ex.beat.done ?? '계속 ▶', () => {
        this.explore = undefined;
        this.busy = false;
        this.clearFx();
        this.next();
      }, 'primary');
      this.fx.add(go);
    }
  }

  private spot(s: Spot, seen: boolean) {
    const c = this.add.container(s.x + s.w / 2, s.y + s.h / 2);
    const r = this.add.rectangle(0, 0, s.w, s.h, 0xffffff, 0.04).setStrokeStyle(2, seen ? 0x666666 : C.orange, seen ? 0.5 : 0.9);
    const l = text(this, 0, -s.h / 2 - 12, (seen ? '✓ ' : '') + s.label, 13, seen ? '#888' : '#fff', { fontStyle: '700', backgroundColor: '#000000aa', padding: { x: 6, y: 2 } }).setOrigin(0.5);
    c.add([r, l]);
    if (!seen) this.tweens.add({ targets: r, alpha: 0.5, duration: 700, yoyo: true, repeat: -1 });
    r.setInteractive({ useHandCursor: true });
    r.on('pointerdown', () => {
      this.explore!.seen.add(s.id);
      this.clearFx();
      this.busy = false;
      this.queue.unshift(...s.beats);
      this.next();
    });
    return c;
  }

  // ---------- 끝 ----------

  private endLine(str: string) {
    this.box.setVisible(false);
    this.busy = true;
    const dim = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0);
    const t = text(this, W / 2, H / 2 - 20, str, 22, HEX(C.paper), { fontFamily: SERIF }).setOrigin(0.5).setAlpha(0);
    this.fx.add([dim, t]);
    this.tweens.add({ targets: dim, fillAlpha: 1, duration: 900 });
    this.tweens.add({ targets: t, alpha: 1, duration: 900, delay: 600 });
    this.time.delayedCall(3000, () => { this.busy = false; this.next(); });
  }

  private chapterEnd() {
    this.busy = true;
    this.clearFx();
    this.box.setVisible(false);
    const no = CHAPTERS[this.chapter].no;
    const dim = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 1);
    const t = title(this, W / 2, H / 2 - 10, `〈제${no}화 끝〉`, 30, HEX(C.paper)).setOrigin(0.5);
    this.fx.add([dim, t]);
    const nextIdx = this.chapter + 1;
    saveProgress(Math.min(nextIdx, CHAPTERS.length - 1), nextIdx >= CHAPTERS.length);
    this.time.delayedCall(2000, () => {
      if (nextIdx < CHAPTERS.length) {
        this.scene.start('story', { chapter: nextIdx, inventory: this.inventory });
        return;
      }
      const a = text(this, W / 2, H / 2 + 40, '체험판은 여기까지입니다.\n다음 화 — 제6화 「버티지 마」: 1113호, 할머니의 약을 가지러 간다.', 16, '#bbb', { fontFamily: SERIF, align: 'center', lineSpacing: 8 }).setOrigin(0.5);
      const b = button(this, W / 2, H / 2 + 120, 200, 40, '처음 화면으로', () => this.scene.start('title'), 'primary');
      this.fx.add([a, b]);
    });
  }
}
