// 제1화 「열지 못한 문」 — 원작 내용을 따라가되, 읽는 게 아니라 하는 장.
// 1502호에서 등교 준비 → 방송, 두드리는 문 → 열지 못한 문 → 복도의 1501호 남자 → 사원증, 붕대 → 방화문.
import Phaser from 'phaser';
import { C, text } from '../game/theme';
import type { Level } from './types';

export const FLOOR = 452;

const room = (g: Phaser.GameObjects.Graphics, x: number, w: number, wall: number) => {
  g.fillStyle(wall).fillRect(x, 60, w, FLOOR - 60);
  g.fillStyle(0x000000, 0.25).fillRect(x, 60, 6, FLOOR - 60);
};

function drawHome(scene: Phaser.Scene, layer: Phaser.GameObjects.Container) {
  const g = scene.add.graphics();
  layer.add(g);
  g.fillStyle(0x0d0e10).fillRect(0, 0, 1700, 540);
  room(g, 0, 320, 0x6f7a80); // 욕실
  room(g, 320, 380, 0x4a4f5a); // 방
  room(g, 700, 650, 0x55524c); // 거실
  room(g, 1350, 350, 0x3f4247); // 현관
  g.fillStyle(0x2b2d31).fillRect(0, FLOOR, 1700, 88);
  g.fillStyle(0x3a3d42).fillRect(0, FLOOR, 1700, 4);
  // 욕실: 김 서린 거울, 세면대
  g.fillStyle(0xbfc6cf, 0.5).fillRect(110, 180, 110, 130);
  g.lineStyle(4, 0x8a9099).strokeRect(110, 180, 110, 130);
  g.fillStyle(0xe8e8e8).fillRect(100, 330, 130, 24);
  // 방: 옷걸이에 걸린 교복
  g.lineStyle(3, 0x777777).lineBetween(470, 170, 570, 170);
  g.fillStyle(0x1f2a44).fillRoundedRect(492, 178, 56, 80, 6).fillRect(496, 258, 48, 40);
  g.fillStyle(0xf2f2f0).fillTriangle(500, 178, 540, 178, 520, 200);
  g.fillStyle(C.red).fillTriangle(512, 196, 528, 196, 520, 208);
  g.fillStyle(0x2a2c30).fillRect(360, 300, 90, FLOOR - 300); // 침대
  // 방 선반의 챔피언 벨트
  g.fillStyle(0x5a4632).fillRect(590, 250, 90, 8);
  g.fillStyle(0x7a1f1f).fillRoundedRect(596, 226, 78, 22, 6);
  g.fillStyle(0xd9b24a).fillCircle(635, 237, 13);
  // 거실: 식탁 위 휴대폰, 분홍 백팩, 베란다 창, 천장 스피커
  g.fillStyle(0x6b5238).fillRect(820, 360, 180, 14).fillRect(830, 374, 10, 78).fillRect(980, 374, 10, 78);
  g.fillStyle(0x111111).fillRoundedRect(880, 350, 26, 12, 3);
  g.fillStyle(0xe58aa8).fillRoundedRect(1030, 380, 48, 72, 10);
  // 쌓아 둔 배달 용기, 벽에 붙인 합격 통지서
  for (let i = 0; i < 5; i++) g.fillStyle(i % 2 ? 0xe8e4da : 0xd6d0c2).fillRect(748, 440 - i * 12, 44, 10);
  g.fillStyle(0xf4f1e6).fillRect(1122, 200, 40, 54);
  g.fillStyle(C.red).fillCircle(1150, 242, 6);
  g.fillStyle(0x2a3140).fillRect(1140, 120, 170, 230);
  g.lineStyle(3, 0x777777).strokeRect(1140, 120, 170, 230).lineBetween(1225, 120, 1225, 350);
  for (let i = 0; i < 4; i++) g.fillStyle(0xb8c2cc, 0.12).fillEllipse(1180 + i * 40, 300, 90, 30);
  g.fillStyle(0x2a2d32).fillCircle(1020, 82, 16);
  // 현관: 철문, 도어락, 외시경, 신발장
  g.fillStyle(0x4b5058).fillRect(1500, 150, 120, FLOOR - 150);
  g.fillStyle(0x5d636c).fillRect(1508, 158, 104, FLOOR - 158);
  g.fillStyle(0x1b1d20).fillCircle(1560, 230, 5);
  g.fillStyle(0x23262b).fillRoundedRect(1590, 290, 16, 50, 4);
  g.fillStyle(0x6b5238).fillRect(1380, 330, 80, FLOOR - 330);
  const labels: [number, string][] = [[160, '욕실'], [510, '방'], [1020, '거실'], [1520, '현관']];
  for (const [x, l] of labels) layer.add(text(scene, x, 76, l, 12, '#9aa0a6').setOrigin(0.5));
}

function drawHall(scene: Phaser.Scene, layer: Phaser.GameObjects.Container) {
  const g = scene.add.graphics();
  layer.add(g);
  g.fillStyle(0x0d0e10).fillRect(0, 0, 2300, 540);
  g.fillStyle(C.concrete).fillRect(0, 60, 2300, FLOOR - 60);
  g.fillStyle(C.floor).fillRect(0, FLOOR, 2300, 88);
  // 엘리베이터 두 대
  for (const x of [110, 230]) {
    g.fillStyle(0x6b7078).fillRect(x - 46, 170, 92, FLOOR - 170);
    g.lineStyle(2, 0x3a3e44).lineBetween(x, 170, x, FLOOR);
  }
  // 세대 문
  const doors: [number, string][] = [[420, '1501'], [660, '1502'], [900, '1503'], [1140, '1504'], [1380, '1505']];
  for (const [x, no] of doors) {
    g.fillStyle(C.doorDark).fillRect(x - 46, 190, 92, FLOOR - 190);
    g.fillStyle(C.door).fillRect(x - 40, 196, 80, FLOOR - 196);
    g.fillStyle(C.paper).fillRect(x - 26, 160, 52, 18);
    layer.add(text(scene, x, 169, no, 12, '#222', { fontStyle: '700' }).setOrigin(0.5));
  }
  g.fillStyle(0x0b0c0e).fillRect(380, 196, 34, FLOOR - 196); // 안쪽에서 열린 1501호
  g.fillStyle(0x5a0f0f, 0.85).fillEllipse(200, FLOOR - 4, 220, 18); // 피 웅덩이
  g.fillStyle(0x8a2b2b).fillRect(1680, 300, 60, 80); // 소화전함
  // 방화문 (동쪽 비상계단)
  g.fillStyle(0x6b6f76).fillRect(2000, 160, 120, FLOOR - 160);
  g.fillStyle(0x1d2a30).fillRect(2030, 200, 60, 70);
  g.fillStyle(0x1f9a4a).fillRect(2030, 128, 60, 20);
  layer.add(text(scene, 2060, 138, '비상구', 11, '#e8ffe8', { fontStyle: '700' }).setOrigin(0.5));
}

const ready = ['patch', 'uni', 'bag'];

export const CH1: Level = {
  id: 'ch1', no: 1, name: '열지 못한 문',
  start: { area: 'home', x: 150 },
  intro: { bg: 'dawn', lines: ['3월 2일 새벽, 동구시 한마음 아파트.', '전 통합 챔피언 강태리, 스물일곱.', '오늘은 그녀의 첫 등교 날이다.'] },
  first: [
    { a: 'outfit', v: 'casual' },
    { a: 'objective', text: '등교 준비', count: ready, target: 'mirror' },
  ],
  areas: {
    home: {
      name: '1502호', width: 1700, draw: drawHome,
      objects: [
        {
          id: 'mirror', x: 165, label: '거울', when: (f) => !f.has('patch'),
          do: [
            { a: 'bark', text: '왼쪽 눈은 이제 아무것도 안 들어온다.' },
            { a: 'patch' }, { a: 'flag', set: 'patch' },
            { a: 'bark', text: '……이제는 익숙해.' },
            { a: 'objective', text: '등교 준비', count: ready, target: 'uniform' },
            { a: 'if', all: ready, then: [{ a: 'flag', set: 'alarm' }] },
          ],
        },
        {
          id: 'uniform', x: 520, label: '교복', when: (f) => !f.has('uni'),
          do: [
            { a: 'outfit', v: 'uni' }, { a: 'flag', set: 'uni' },
            { a: 'bark', text: '12년 만의 교복. 어젯밤 세 번 다림질했다.' },
            { a: 'objective', text: '등교 준비', count: ready, target: 'bag' },
            { a: 'if', all: ready, then: [{ a: 'flag', set: 'alarm' }] },
          ],
        },
        {
          id: 'phone', x: 893, label: '휴대폰', when: (f) => !f.has('phone'),
          do: [
            { a: 'phone', from: '아빠', text: '태리야, 오늘 입학식이지. 아빠가 차 가지고 갈까. 학교 앞까지만이라도' },
            { a: 'memory', text: '열다섯 살 봄, 교복을 입은 건 딱 한 달이었다.\n“학교 다닐 시간에 샌드백 쳐라.”\n자퇴서 보호자 서명란에, 아빠의 도장.' },
            { a: 'bark', text: '……혼자 가.' },
            { a: 'flag', set: 'phone' },
          ],
        },
        {
          id: 'bed', x: 405, label: '침대', when: (f) => !f.has('m_bed') && !f.has('alarmed'),
          do: [
            { a: 'flag', set: 'm_bed' },
            { a: 'memory', text: '새벽 네 시에 이불이 걷혔다. 여섯 시부터 미트를 쳤다.\n주먹 마디가 터져도 아빠는 미트를 내리지 않았다.\n“한 번만 더.” 그 한 번이 몇백 번이 되었다.' },
          ],
        },
        {
          id: 'belt', x: 635, label: '챔피언 벨트', when: (f) => !f.has('m_belt') && !f.has('alarmed'),
          do: [
            { a: 'flag', set: 'm_belt' },
            { a: 'memory', text: '28전 28승 25KO. 링네임 ‘외눈의 폭격기’.\n스물여섯, 버팅에 왼쪽 눈의 망막이 떨어져 나갔다.\n링 위에서는 이룰 수 있는 걸 다 이뤘다. 문제는 링 밖이었다.' },
          ],
        },
        {
          id: 'boxes', x: 770, label: '배달 용기', when: (f) => !f.has('m_boxes') && !f.has('alarmed'),
          do: [
            { a: 'flag', set: 'm_boxes' },
            { a: 'memory', text: '은퇴하고 2년, 이 집에서 밥을 지은 적이 없다.\n문을 열면 늘 같은 라이더가 서 있었다.\n“맛있게 드세요, 챔피언.”\n그 말이 처음엔 거슬렸다. 나중엔 그 말을 기다렸다.' },
          ],
        },
        {
          id: 'notice', x: 1142, label: '합격 통지서', when: (f) => !f.has('m_notice') && !f.has('alarmed'),
          do: [
            { a: 'flag', set: 'm_notice' },
            { a: 'memory', text: '열여덟 번째 불합격 문자를 받은 다음 날, 옆집 남자를 붙잡았다.\n“나 같은 사람도 고등학교 갈 수 있어요?”\n“서류는 같이 보자.” — 1503호 한도윤.\n합격. 벨트를 받던 날보다 손이 더 떨렸다.' },
          ],
        },
        {
          id: 'bag', x: 1054, label: '분홍 백팩', when: (f) => !f.has('bag'),
          do: [
            { a: 'flag', set: 'bag' }, { a: 'item', name: '압박 붕대' },
            { a: 'bark', text: '필통, 공책 두 권, 실내화. 체육 시간에 쓸 붕대.' },
            { a: 'objective', text: '등교 준비', count: ready, target: 'mirror' },
            { a: 'if', all: ready, then: [{ a: 'flag', set: 'alarm' }] },
          ],
        },
        {
          id: 'window', x: 1240, label: '베란다 창', when: (f) => !f.has('alarmed'),
          do: [{ a: 'sfx', name: 'groan' }, { a: 'bark', text: '해무 너머로 경광등이 번졌다가 사라진다. ……구급차가 벌써 세 대째.' }],
        },
        {
          id: 'window', x: 1240, label: '베란다 창', when: (f) => f.has('alarmed') && !f.has('door1'),
          do: [{ a: 'bark', text: '경적이 울린다. 길게. 너무 길게. 누가 핸들에 엎어진 것처럼.' }],
        },
        {
          id: 'door', x: 1560, label: '현관문', when: (f) => !f.has('alarm'),
          do: [{ a: 'bark', text: '일곱 시 사십 분. 준비부터.' }],
        },
        // 준비를 마치면: 방송 → 두드리는 문
        {
          id: 'alarmTrigger', x: -9999, label: '', auto: true, when: (f) => f.has('alarm') && !f.has('alarmed'),
          do: [
            { a: 'flag', set: 'alarmed' },
            { a: 'wait', ms: 500 },
            { a: 'broadcast', lines: ['103동 주민 여러분께 긴급히 알려드립니다. 절대 세대 밖으로 나오지 마시고, 누가 와도 현관문을 열지 마시고…', '……뭐, 뭐야. 놔! 이거 안 놔?! 으아아악!'] },
            { a: 'mood', v: 1 },
            { a: 'caption', text: '창밖에서 경적이 길게 울린다. 그다음은 비명이었다. 멀리서. 그리고 조금 더 가까이서.' },
            { a: 'shake', s: 0.012 }, { a: 'sfx', name: 'bang' },
            { a: 'bark', who: 'door', text: '쾅! 쾅쾅쾅!' },
            { a: 'bark', who: 'door', text: '태리야! 문 열어 줘! 살려 줘!' },
            { a: 'bark', text: '……오빠?' },
            { a: 'objective', text: '현관문을 연다', target: 'door' },
          ],
        },
        {
          id: 'door', x: 1560, label: '현관문을 연다', when: (f) => f.has('alarmed') && !f.has('door1'),
          do: [
            { a: 'bark', text: '기다려, 오빠. 지금 열게.' },
            { a: 'cg', key: 'cg_door_handle', ms: 1500 },
            { a: 'hold', label: '손잡이를 내린다 — Space를 누르고 있어라', stopAt: 0.55 },
            { a: 'peep', bg: 'peep', lines: ['외시경 너머에 오빠가 있었다. 목덜미가 뜯겨 나가 있었다.', '반달이 되던 눈에 실핏줄이 번지고 있었다.', '그 뒤에서, 1501호 남자가 네 발로 기고 있었다.'] },
            { a: 'bark', who: 'door', text: '문…… 열어…… 줘……' },
            { a: 'bark', text: '미안해…… 미안해, 오빠…… 미안해……' },
            { a: 'memory', text: '실명 판정을 받던 날에도 울지 않았다.\n세계를 제패한 두 주먹이,\n고작 손잡이 하나를 내리지 못해서.' },
            { a: 'dark', ms: 2600, text: '끼이이익―\n손톱이 철문을 긁는 소리.\n그리고, 계단 쪽으로 멀어지는 발소리.' },
            { a: 'flag', set: 'door1' },
            { a: 'objective', text: '외시경을 본다', target: 'door' },
          ],
        },
        {
          id: 'door', x: 1560, label: '외시경', when: (f) => f.has('door1') && !f.has('peeked'),
          do: [
            { a: 'peep', bg: 'peep1501', lines: ['오빠는 없었다.', '1501호 남자였던 것이 바닥의 피를 핥고 있었다. 그 옆에, 목줄이 끊어진 사원증.'] },
            { a: 'flag', set: 'peeked' },
            { a: 'bark', text: '……이번에는 떨리지 않는다.' },
            { a: 'objective', text: '문을 연다', target: 'door' },
          ],
        },
        {
          id: 'door', x: 1560, label: '문을 연다', when: (f) => f.has('peeked'),
          do: [{ a: 'sfx', name: 'door' }, { a: 'goto', area: 'hall', x: 660 }],
        },
      ],
    },

    hall: {
      name: '15층 복도', width: 2300, draw: drawHall,
      actors: [{ id: 'man1501', x: 250, kind: 'crawler', when: (f) => !f.has('won1501') }],
      onEnter: {
        when: (f) => !f.has('won1501'),
        do: [
          { a: 'mood', v: 2 },
          { a: 'caption', text: '철컥. 엘리베이터 앞, 바닥을 핥던 것이 고개를 들었다. 흰자위가 전부 핏빛이었다.' },
          { a: 'wait', ms: 500 },
          { a: 'charge', id: 'man1501' },
          { a: 'fight', id: 'm1501' },
          { a: 'flag', set: 'won1501' }, { a: 'remove', id: 'man1501' },
          { a: 'bark', text: '……' },
          { a: 'objective', text: '사원증을 줍는다', target: 'idcard' },
        ],
      },
      objects: [
        { id: 'elevator', x: 170, label: '엘리베이터', do: [{ a: 'bark', text: '멈춰 있다. 버튼을 눌러도 아무 반응이 없다.' }] },
        {
          id: 'idcard', x: 210, label: '사원증', when: (f) => f.has('won1501') && !f.has('idcard'),
          do: [
            { a: 'flag', set: 'idcard' }, { a: 'item', name: '도윤의 사원증' },
            { a: 'cg', key: 'cg_id_card', ms: 1800 },
            { a: 'bark', text: '백합여고 행정실 주무관 한도윤. ……반달 눈.' },
            { a: 'sfx', name: 'groan' },
            { a: 'caption', text: '비상계단 너머에서 수십 개의 발소리가 올라온다. 그 어딘가에 오빠도 있을 것이다.' },
            { a: 'objective', text: '붕대를 감는다' },
            { a: 'bandage' }, { a: 'flag', set: 'taped' },
            { a: 'memory', text: '“왼쪽은 벽에 맡겨라.”\n보이지 않는 왼쪽을 벽에 붙이는 것.\n그것도 아빠에게서 배운 것이었다.' },
            { a: 'objective', text: '방화문으로 간다', target: 'firedoor' },
          ],
        },
        { id: '1501', x: 420, label: '1501호', do: [{ a: 'bark', text: '안쪽에서 열려 있다. 매일 엘리베이터에서 목례만 하던 사람.' }] },
        { id: 'home', x: 660, label: '1502호', when: (f) => !f.has('taped'), do: [{ a: 'goto', area: 'home', x: 1540 }] },
        {
          id: '1503', x: 900, label: '1503호', when: (f) => !f.has('m_1503'),
          do: [
            { a: 'flag', set: 'm_1503' },
            { a: 'memory', text: '작년 11월 7일, 이 문고리에 걸려 있던 보온 용기.\n― 생일 축하해. 국은 데워 먹어. 1503.\n그 국을 먹지 않았다. 고맙다는 말도 하지 않았다.' },
            { a: 'bark', text: '……오빠네 집. 대답이 없다.' },
          ],
        },
        { id: 'hydrant', x: 1710, label: '소화전함', do: [{ a: 'bark', text: '소화전함. 손잡이가 단단하다.' }] },
        {
          id: 'firedoor', x: 2060, label: '방화문', when: (f) => f.has('taped'),
          do: [
            { a: 'cg', key: 'cg_wall_shoulder', ms: 1800 },
            { a: 'chapterEnd', line: '다시는, 문 앞에서 멈추지 않는다.', next: { story: 1 } },
          ],
        },
        { id: 'firedoor', x: 2060, label: '방화문', when: (f) => !f.has('taped'), do: [{ a: 'bark', text: '아직.' }] },
      ],
    },
  },
};

export const LEVELS: Record<string, Level> = { ch1: CH1 };
