import Phaser from 'phaser';

export const W = 960;
export const H = 540;

export const C = {
  night: 0x14161a,
  concrete: 0x3a3e44,
  concreteDark: 0x2a2d32,
  floor: 0x24262a,
  door: 0x5b6068,
  doorDark: 0x41454b,
  paper: 0xefe9dc,
  ink: 0x1d1f22,
  orange: 0xff8a1f,
  red: 0xe5484d,
  blue: 0x5b9bd5,
  green: 0x4cc38a,
  skin: 0xf1c9a5,
  jacket: 0x1f2a44,
  zombie: 0x7f8c78,
  zombieDark: 0x4a5046,
};

export const HEX = (n: number) => '#' + n.toString(16).padStart(6, '0');

export const FONT = '"Noto Sans KR", "Apple SD Gothic Neo", "Malgun Gothic", sans-serif';
export const DISPLAY = '"Black Han Sans", ' + FONT;

export function text(
  scene: Phaser.Scene, x: number, y: number, str: string,
  size = 16, color = '#e8e6e1', opts: Partial<Phaser.Types.GameObjects.Text.TextStyle> = {},
) {
  return scene.add.text(x, y, str, { fontFamily: FONT, fontSize: `${size}px`, color, resolution: 2, ...opts });
}

export function title(scene: Phaser.Scene, x: number, y: number, str: string, size = 48, color = '#e8e6e1') {
  return scene.add.text(x, y, str, { fontFamily: DISPLAY, fontSize: `${size}px`, color, resolution: 2 });
}

export interface Button extends Phaser.GameObjects.Container {
  setEnabled(on: boolean): Button;
  label: Phaser.GameObjects.Text;
}

export function button(
  scene: Phaser.Scene, x: number, y: number, w: number, h: number, label: string,
  onClick: () => void, style: 'primary' | 'plain' = 'plain',
): Button {
  const bg = scene.add.rectangle(0, 0, w, h, style === 'primary' ? C.orange : 0x33373c)
    .setStrokeStyle(1, style === 'primary' ? C.orange : 0x5a5f66);
  const t = text(scene, 0, 0, label, 15, style === 'primary' ? '#1a1a1a' : '#e8e6e1', { fontStyle: '700' })
    .setOrigin(0.5);
  const c = scene.add.container(x, y, [bg, t]) as Button;
  c.label = t;
  c.setSize(w, h);
  let enabled = true;
  c.setInteractive({ useHandCursor: true });
  c.on('pointerover', () => enabled && bg.setStrokeStyle(2, C.orange));
  c.on('pointerout', () => bg.setStrokeStyle(1, style === 'primary' ? C.orange : 0x5a5f66));
  c.on('pointerdown', () => enabled && onClick());
  c.setEnabled = (on: boolean) => {
    enabled = on;
    c.setAlpha(on ? 1 : 0.35);
    return c;
  };
  return c;
}
