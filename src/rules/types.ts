// 전투 규칙에 쓰이는 타입. 화면(Phaser/DOM)과 무관한 순수 데이터만 둔다.

export type CardId = 'jab' | 'step' | 'weave' | 'clinch' | 'body' | 'upper' | 'cork';

/** 감염자가 라운드 시작에 예고하는 행동 */
export type Intent = 'bite' | 'grab' | 'push' | 'stagger';

export interface Tuning {
  /** 라운드마다 다시 차는 스태미나 */
  stamina: number;
  /** 기본 라운드 수 (적마다 덮어쓸 수 있음) */
  maxRounds: number;
  costs: Record<CardId, number>;
  /** 어퍼가 KO를 내는 자세 상한 (0 = 머리가 열렸을 때만) */
  upperKoPoise: number;
  /** 코크스크류가 KO를 내는 자세 상한 */
  corkKoPoise: number;
  /** 카운터 상태일 때 KO 상한에 더해지는 값 (데미지는 2배) */
  counterKoBonus: number;
  noise: {
    /** KO가 1라운드 늦어질 때마다 */
    perExtraRound: number;
    corkMiss: number;
    pushHit: number;
    biteHit: number;
    /** 끝내지 못했을 때 */
    timeout: number;
  };
}

export interface EnemyDef {
  id: string;
  name: string;
  desc: string;
  poise: number;
  maxRounds?: number;
  /** 예고 행동 가중치 */
  intents: Partial<Record<Intent, number>>;
  /** 낮은 자세: 바디 −1, 열리지 않은 머리에 어퍼 −2, 코크스크류 빗나감 */
  lowTarget?: boolean;
  /** 외눈: 물기를 위빙으로 피하면 다음 라운드에 태리를 놓친다(비틀거림 확정) */
  blindSide?: boolean;
  boss?: boolean;
}

export type Outcome = 'ongoing' | 'ko' | 'timeout';

export interface CombatState {
  enemy: EnemyDef;
  maxRounds: number;
  poise: number;
  round: number;
  intent: Intent;
  grabbed: boolean;
  lostTrack: boolean;
  noise: number;
  hitsTaken: number;
  bites: number;
  outcome: Outcome;
  rng: number;
  log: string[];
}

export interface RoundEvent {
  text: string;
  kind: 'hit' | 'ko' | 'evade' | 'miss' | 'hurt' | 'info';
}
