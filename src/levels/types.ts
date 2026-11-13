// 맵 레벨: 태리가 직접 돌아다니며 조사하고, 목표를 따라가는 장. 글은 짧은 혼잣말·말풍선으로만.
import type Phaser from 'phaser';
import type { Bg } from '../story/script';

export type Flags = Set<string>;

export type Action =
  /** 말풍선. who 없으면 태리, 'door' 등 물건 id면 그 물건 위에 */
  | { a: 'bark'; text: string; who?: string }
  /** 화면 위쪽에 짧은 서술 한 줄 */
  | { a: 'caption'; text: string }
  /** 목표. count 가 있으면 (n/개수)를 붙인다. target 위에 ▼ 표시 */
  | { a: 'objective'; text: string; target?: string; count?: string[] }
  | { a: 'flag'; set: string }
  /** 기억 조각: 원작의 문장이 스쳐 간다. 찾을수록 태리가 누구인지 드러난다 */
  | { a: 'memory'; text: string }
  /** 분위기: 0 평범한 아침, 1 불이 죽은 집, 2 어두운 복도 */
  | { a: 'mood'; v: 0 | 1 | 2 }
  /** 감염자가 태리에게 달려든다 */
  | { a: 'charge'; id: string }
  | { a: 'item'; name: string }
  | { a: 'phone'; from: string; text: string; alert?: boolean }
  | { a: 'broadcast'; lines: string[] }
  | { a: 'shake'; s?: number }
  | { a: 'sfx'; name: 'bang' | 'door' | 'scrape' | 'groan' | 'paper' | 'bell' | 'punch' }
  | { a: 'wait'; ms: number }
  /** 끝까지 내려가지 않는 손잡이 */
  | { a: 'hold'; label: string; stopAt: number }
  /** 외시경으로 본 장면 (배경 + 짧은 줄) */
  | { a: 'peep'; bg: Bg; lines: string[] }
  | { a: 'fight'; id: string }
  | { a: 'bandage' }
  | { a: 'goto'; area: string; x: number }
  | { a: 'outfit'; v: 'casual' | 'uni' | 'track' }
  | { a: 'patch' }
  | { a: 'remove'; id: string }
  /** 암전 + 가운데 글 */
  | { a: 'dark'; ms: number; text?: string }
  /** 이벤트 그림 (public/img 에 있을 때만) */
  | { a: 'cg'; key: string; ms?: number }
  /** 조건: all 이 모두 켜져 있으면 then */
  | { a: 'if'; all: string[]; then: Action[] }
  | { a: 'chapterEnd'; line: string; next: { story?: number; level?: string } };

export interface Obj {
  id: string;
  x: number;
  label: string;
  /** 이 조건일 때만 조사할 수 있다 */
  when?: (f: Flags) => boolean;
  /** 다가가기만 해도 실행 (조사 키 없이) */
  auto?: boolean;
  do: Action[];
}

export interface Actor {
  id: string;
  x: number;
  kind: 'crawler' | 'normal';
  when?: (f: Flags) => boolean;
}

export interface Area {
  name: string;
  width: number;
  draw: (scene: Phaser.Scene, layer: Phaser.GameObjects.Container) => void;
  objects: Obj[];
  actors?: Actor[];
  /** 들어올 때 한 번 */
  onEnter?: { when?: (f: Flags) => boolean; do: Action[] };
}

export interface Level {
  id: string;
  no: number;
  name: string;
  areas: Record<string, Area>;
  start: { area: string; x: number };
  intro: { bg: Bg; lines: string[] };
  first: Action[];
}
