import Phaser from 'phaser';
import { StoryScene } from '../story/StoryScene';
import { CombatScene } from './CombatScene';
import { TitleScene } from './TitleScene';
import { H, W } from './theme';

const start = () => {
  const game = new Phaser.Game({
    type: Phaser.AUTO,
    parent: 'game',
    width: W,
    height: H,
    backgroundColor: '#14161a',
    scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
    scene: [TitleScene, StoryScene, CombatScene],
  });
  (window as unknown as { __g: Phaser.Game }).__g = game; // 자동 플레이 테스트용
};

// 한글 웹폰트가 준비된 뒤에 시작해야 글자가 기본 글꼴로 그려지지 않는다
const fonts = (document as Document & { fonts?: FontFaceSet }).fonts;
Promise.race([
  fonts
    ? Promise.all([
        fonts.load('20px "Black Han Sans"'),
        fonts.load('16px "Noto Sans KR"'),
        fonts.load('700 16px "Noto Sans KR"'),
        fonts.load('18px "Noto Serif KR"'),
      ])
    : Promise.resolve(),
  new Promise((r) => setTimeout(r, 2500)),
]).finally(start);
