// 회색 박스 전투 화면. 규칙은 전부 src/rules 에 있고, 여기서는 상태를 그려 주기만 한다.
import './style.css';
import { canAppend, planCost, resolveRound, startCombat, validatePlan } from '../rules/combat';
import { CARD_ORDER, CARDS, DEFAULT_TUNING, ENEMIES, INTENTS, cloneEnemy, cloneTuning } from '../rules/data';
import type { CardId, CombatState, EnemyDef, RoundEvent } from '../rules/types';
import { simulate, type SimStats } from '../sim/bot';

interface LogLine { round: number; ev: RoundEvent }

const ui = {
  tuning: cloneTuning(DEFAULT_TUNING),
  enemies: ENEMIES.map(cloneEnemy),
  enemyIdx: 0,
  seed: 1,
  state: null as unknown as CombatState,
  plan: [] as CardId[],
  log: [] as LogLine[],
  tenCount: 0,
  sim: null as SimStats[] | null,
  tuneOpen: false,
};

const app = document.getElementById('app')!;
const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);
const enemy = (): EnemyDef => ui.enemies[ui.enemyIdx];

function newFight(sameSeed = false) {
  if (!sameSeed) ui.seed = Math.floor(Math.random() * 1e9);
  ui.state = startCombat(cloneEnemy(enemy()), ui.tuning, ui.seed);
  ui.plan = [];
  ui.log = [];
  ui.tenCount = 0;
  render();
}

function addCard(c: CardId) {
  if (ui.state.outcome !== 'ongoing' || !canAppend(ui.state, ui.plan, c, ui.tuning)) return;
  ui.plan.push(c);
  render();
}

function commit() {
  if (ui.state.outcome !== 'ongoing' || validatePlan(ui.state, ui.plan, ui.tuning)) return;
  const round = ui.state.round;
  const { state, events } = resolveRound(ui.state, ui.plan, ui.tuning);
  ui.log.push(...events.map((ev) => ({ round, ev })));
  ui.state = state;
  ui.plan = [];
  render();
}

// ---------- 그리기 ----------

function pips(n: number, max: number) {
  return Array.from({ length: max }, (_, i) => `<span class="pip ${i < n ? '' : 'empty'}"></span>`).join('');
}

function noiseBar(n: number) {
  const max = 8;
  return `<div class="noise">${Array.from({ length: max }, (_, i) =>
    `<i class="${i < n ? 'on' : ''} ${i >= 3 ? 'hot' : ''}"></i>`).join('')}</div>`;
}

function renderPreview(): string {
  const s = ui.state;
  if (s.outcome !== 'ongoing') return '';
  const err = validatePlan(s, ui.plan, ui.tuning);
  if (err) return `<div class="preview"><span class="err">${esc(err)}</span></div>`;
  if (ui.plan.length === 0)
    return `<div class="preview hint">카드를 고르면 결과를 미리 보여 줍니다. 아무것도 안 내고 진행할 수도 있어요.</div>`;
  const { state: r, events } = resolveRound(s, ui.plan, ui.tuning);
  const head = r.outcome === 'ko'
    ? `<b class="ev-ko">KO 예상</b> · 소음 +${r.noise - s.noise}`
    : `자세 ${s.poise} → ${r.poise}${r.poise === 0 ? ' (머리 열림)' : ''} · 소음 +${r.noise - s.noise}`;
  const lines = events.map((e) => `<li class="ev-${e.kind}">${esc(e.text)}</li>`).join('');
  return `<div class="preview">${head}<ul class="log" style="max-height:none;margin-top:4px">${lines}</ul></div>`;
}

function renderResult(): string {
  const s = ui.state;
  if (s.outcome === 'ongoing') return '';
  const bite = s.bites > 0 ? `<div class="tag red">물림 ${s.bites}회 → 감염 타이머 시작</div>` : '';
  if (s.outcome === 'ko') {
    const quiet = s.round === 1 && s.hitsTaken === 0 && s.noise === 0;
    const ten = s.enemy.boss
      ? ui.tenCount < 10
        ? `<div class="hint">보스를 쓰러뜨렸다. 직접 세라.</div><div class="ten">${ui.tenCount || ''}</div>
           <button class="primary" data-act="ten">카운트 (${ui.tenCount + 1})</button>`
        : `<div class="ten">10</div><div>텐 카운트. 일어나지 않는다.</div>`
      : '';
    return `<div class="panel result">
      <div class="big ko">KO</div>
      <div>${s.round}라운드 · 소음 ${s.noise}${quiet ? ' — <b>빠르게, 맞지 않고, 끝냈다.</b>' : ''}</div>
      ${bite}${ten}
      <div class="actions" style="justify-content:center;margin-top:14px">
        <button data-act="again">다음 전투</button><button data-act="retry">같은 시드로 다시</button></div>
    </div>`;
  }
  return `<div class="panel result">
    <div class="big fail">끝내지 못했다</div>
    <div>소음 ${s.noise} — 소리가 복도 끝까지 퍼졌다. 근처 감염자가 몰려온다.</div>${bite}
    <div class="actions" style="justify-content:center;margin-top:14px">
      <button data-act="again">다음 전투</button><button data-act="retry">같은 시드로 다시</button></div>
  </div>`;
}

function renderLog(): string {
  if (ui.log.length === 0) return '<p class="hint">아직 기록이 없습니다.</p>';
  let html = '';
  let last = 0;
  for (const { round, ev } of ui.log) {
    if (round !== last) {
      html += `<li class="round-sep">— ${round}라운드 —</li>`;
      last = round;
    }
    html += `<li class="ev-${ev.kind}">${esc(ev.text)}</li>`;
  }
  return `<ul class="log" id="log">${html}</ul>`;
}

function renderTuning(): string {
  const t = ui.tuning;
  const num = (path: string, label: string, v: number) =>
    `<label>${label}<input type="number" min="0" max="20" data-tune="${path}" value="${v}"></label>`;
  const costs = CARD_ORDER.map((c) => num(`costs.${c}`, CARDS[c].name, t.costs[c])).join('');
  const poise = ui.enemies.map((e, i) => num(`enemy.${i}`, e.name, e.poise)).join('');
  const sim = ui.sim
    ? `<div class="table-wrap"><table><tr><th>적</th><th>봇</th><th>1R KO</th><th>KO</th><th>물림</th><th>평균 소음</th><th>평균 라운드</th></tr>${ui.sim
        .map((r) => `<tr><td>${r.enemy}</td><td>${r.bot === 'greedy' ? '잘 읽는 봇' : '아무렇게나'}</td>
          <td>${Math.round(r.koRound1 * 100)}%</td><td>${Math.round(r.koTotal * 100)}%</td>
          <td>${Math.round(r.bitten * 100)}%</td><td>${r.avgNoise.toFixed(2)}</td><td>${r.avgRounds.toFixed(2)}</td></tr>`)
        .join('')}</table></div>
       <p class="hint">'잘 읽는 봇'은 예고를 보고 이번 라운드만 최선으로 고르는 봇, '아무렇게나'는 가능한 카드 순서 중 무작위로 고르는 봇입니다. 두 봇의 차이가 클수록 실력이 결과를 좌우합니다.</p>`
    : '';
  return `<details class="panel" ${ui.tuneOpen ? 'open' : ''} id="tune">
    <summary>수치 조정 · 봇 시뮬레이션</summary>
    <div class="tune-group">기본</div>
    <div class="tune-grid">
      ${num('stamina', '라운드당 스태미나', t.stamina)}
      ${num('maxRounds', '최대 라운드', t.maxRounds)}
      ${num('upperKoPoise', '어퍼 KO 자세 ≤', t.upperKoPoise)}
      ${num('corkKoPoise', '코크 KO 자세 ≤', t.corkKoPoise)}
      ${num('counterKoBonus', '카운터 KO 보너스', t.counterKoBonus)}
    </div>
    <div class="tune-group">카드 비용</div><div class="tune-grid">${costs}</div>
    <div class="tune-group">적 자세</div><div class="tune-grid">${poise}</div>
    <div class="tune-group">소음</div>
    <div class="tune-grid">
      ${num('noise.perExtraRound', '라운드 지연당', t.noise.perExtraRound)}
      ${num('noise.corkMiss', '코크 빗나감', t.noise.corkMiss)}
      ${num('noise.pushHit', '밀기 맞음', t.noise.pushHit)}
      ${num('noise.biteHit', '물림', t.noise.biteHit)}
      ${num('noise.timeout', '못 끝냄', t.noise.timeout)}
    </div>
    <div class="actions">
      <button class="primary" data-act="sim">봇으로 적마다 1000판 돌리기</button>
      <button data-act="reset">기본값으로</button>
    </div>
    <p class="hint">카드 비용·소음 같은 규칙은 바로, 적 자세는 다음 전투부터 적용됩니다.</p>
    ${sim}
  </details>`;
}

function render() {
  const s = ui.state;
  const t = ui.tuning;
  const intent = INTENTS[s.intent];
  const left = t.stamina - planCost(ui.plan, t);
  const ongoing = s.outcome === 'ongoing';

  const hand = CARD_ORDER.map((c, i) => {
    const ok = ongoing && canAppend(s, ui.plan, c, t);
    return `<button class="card" data-card="${c}" ${ok ? '' : 'disabled'}>
      <div class="top"><span class="name">${CARDS[c].name}</span><span class="cost">${t.costs[c]}</span></div>
      <div class="txt">${CARDS[c].text}</div><div class="key">${i + 1}</div></button>`;
  }).join('');

  const planChips = ui.plan.length
    ? ui.plan.map((c, i) => `<button class="chip" data-remove="${i}" title="빼기">${CARDS[c].name} ✕</button>`).join('→')
    : '<span class="empty">이번 라운드에 낼 카드를 순서대로 고르세요</span>';

  app.innerHTML = `
    <header>
      <h1>103동 <small>전투 프로토타입 v0.1</small></h1>
      <div class="enemy-tabs">${ui.enemies.map((e, i) =>
        `<button data-enemy="${i}" class="${i === ui.enemyIdx ? 'active' : ''}">${e.name}</button>`).join('')}</div>
    </header>

    <div class="arena">
      <div class="panel">
        <div class="enemy-name">${s.enemy.name}</div>
        <div class="enemy-desc">${s.enemy.desc}</div>
        <div>자세 ${s.poise}/${s.enemy.poise} ${s.poise === 0 && ongoing ? '<span class="head-open">— 머리가 열렸다</span>' : ''}</div>
        <div class="pips">${pips(s.poise, s.enemy.poise)}</div>
        ${ongoing ? `<div class="intent"><span class="icon">${intent.icon}</span><div><b>예고: ${intent.name}</b><div>${intent.text}</div></div></div>` : ''}
      </div>
      <div class="panel">
        <div class="stats">
          <div><span>라운드</span> ${Math.min(s.round, s.maxRounds)} / ${s.maxRounds}</div>
          <div><span>시드</span> ${ui.seed}</div>
          <div><span>맞은 횟수</span> ${s.hitsTaken}</div>
          <div><span>물림</span> ${s.bites}</div>
        </div>
        <div style="margin-top:8px"><span class="hint">복도 소음</span> <b>${s.noise}</b>${noiseBar(s.noise)}</div>
        ${s.grabbed ? '<span class="tag red">붙잡힘</span>' : ''}
        ${s.bites > 0 ? '<span class="tag red">감염 타이머</span>' : ''}
        <p class="hint" style="margin-bottom:0">1라운드 KO·무피격이면 소음 0. 라운드가 늘어날 때마다 소음이 쌓입니다.</p>
      </div>
    </div>

    ${renderResult()}

    ${ongoing ? `<div class="panel">
      <div class="plan">${planChips}<span class="stamina">스태미나 ${left}/${t.stamina}</span></div>
      ${renderPreview()}
      <div class="hand">${hand}</div>
      <div class="actions" style="margin-top:12px">
        <button class="primary" data-act="commit" ${validatePlan(s, ui.plan, t) ? 'disabled' : ''}>라운드 진행 (Enter)</button>
        <button data-act="clear" ${ui.plan.length ? '' : 'disabled'}>비우기 (Backspace)</button>
      </div>
    </div>` : ''}

    <div class="panel"><h2>기록</h2>${renderLog()}</div>
    ${renderTuning()}
  `;
  const log = document.getElementById('log');
  if (log) log.scrollTop = log.scrollHeight;
}

// ---------- 입력 ----------

app.addEventListener('click', (e) => {
  const el = (e.target as HTMLElement).closest('button');
  if (!el) return;
  const d = el.dataset;
  if (d.card) addCard(d.card as CardId);
  else if (d.remove) { ui.plan.splice(Number(d.remove), 1); render(); }
  else if (d.enemy) { ui.enemyIdx = Number(d.enemy); newFight(); }
  else if (d.act === 'commit') commit();
  else if (d.act === 'clear') { ui.plan = []; render(); }
  else if (d.act === 'again') newFight();
  else if (d.act === 'retry') newFight(true);
  else if (d.act === 'ten') { ui.tenCount = Math.min(10, ui.tenCount + 1); render(); }
  else if (d.act === 'sim') {
    el.textContent = '도는 중…';
    setTimeout(() => {
      ui.sim = ui.enemies.flatMap((en) => (['greedy', 'random'] as const).map((b) => simulate(en, ui.tuning, b, 1000)));
      render();
    }, 20);
  } else if (d.act === 'reset') {
    ui.tuning = cloneTuning(DEFAULT_TUNING);
    ui.enemies = ENEMIES.map(cloneEnemy);
    ui.sim = null;
    newFight();
  }
});

app.addEventListener('toggle', (e) => {
  if ((e.target as HTMLElement).id === 'tune') ui.tuneOpen = (e.target as HTMLDetailsElement).open;
}, true);

app.addEventListener('change', (e) => {
  const input = e.target as HTMLInputElement;
  const path = input.dataset.tune;
  if (!path) return;
  const v = Math.max(0, Math.min(20, Math.round(Number(input.value) || 0)));
  const [a, b] = path.split('.');
  const t = ui.tuning as unknown as Record<string, unknown>;
  if (a === 'enemy') ui.enemies[Number(b)].poise = Math.max(1, v);
  else if (b) (t[a] as Record<string, number>)[b] = v;
  else t[a] = a === 'stamina' || a === 'maxRounds' ? Math.max(1, v) : v;
  ui.sim = null;
  render();
});

window.addEventListener('keydown', (e) => {
  if ((e.target as HTMLElement).tagName === 'INPUT') return;
  const n = Number(e.key);
  if (n >= 1 && n <= CARD_ORDER.length) addCard(CARD_ORDER[n - 1]);
  else if (e.key === 'Enter') {
    if (ui.state.outcome === 'ongoing') commit();
    else if (ui.state.enemy.boss && ui.state.outcome === 'ko' && ui.tenCount < 10) { ui.tenCount++; render(); }
    else newFight();
  } else if (e.key === 'Backspace') { ui.plan.pop(); render(); }
});

newFight();
