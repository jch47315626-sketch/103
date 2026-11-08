// npm run img — 제1~4화에 필요한 그림 목록(docs/ch1-4-images.md)을 만들고, public/img 에 뭐가 들어갔는지 보여 준다.
// 그림 자리는 src/game/imageSlots.json, 프롬프트는 docs/chatgpt-prompts.md 에서 가져온다.
import fs from 'node:fs';

const slots = JSON.parse(fs.readFileSync('src/game/imageSlots.json', 'utf8'));
const md = fs.readFileSync('docs/chatgpt-prompts.md', 'utf8');
let have = [];
try { have = fs.readdirSync('public/img').filter((f) => /\.(png|jpe?g|webp)$/i.test(f)).map((f) => f.replace(/\.[^.]+$/, '')); } catch { /* 없음 */ }

/** "### `name` — 설명" 바로 아래 ``` 블록 */
function promptOf(name) {
  const i = md.indexOf('### `' + name + '`');
  if (i < 0) return null;
  const a = md.indexOf('```', i);
  const b = md.indexOf('```', a + 3);
  return md.slice(a + 3, b).trim();
}

const starter = md.match(/\*\*대화 시작용 문장\*\*\s*```\s*([\s\S]*?)```/)?.[1].trim() ?? '';
let total = 0, done = 0;
const missingPrompt = [];
const out = [
  '# 제1화~제4화 그림 목록',
  '',
  '> `npm run img`로 다시 만든다 (손으로 고치지 않는다). ✅ = `public/img/`에 들어 있음.',
  '> 프롬프트 원본은 `docs/chatgpt-prompts.md`, 게임의 그림 자리는 `src/game/imageSlots.json`.',
  '',
  '## 쓰는 법',
  '',
  '1. ChatGPT에서 새 대화를 열고 아래 **대화 시작용 문장**을 먼저 보낸다. 같은 대화에서 계속 뽑아야 화풍이 이어진다.',
  '2. 인물이 나오는 그림(싸움 상대, 서 있는 그림, 이벤트 그림)은 만들어 둔 **캐릭터 시트를 같이 올리고** “첨부한 인물과 같은 사람으로”를 앞에 붙인다.',
  '3. 투명 배경이 필요한 것(싸움 상대·서 있는 그림·주먹·아이콘)은 “transparent background PNG”로 요청한다. 배경이 남으면 지운 뒤 넣는다.',
  '4. 받은 그림을 **제목의 영문 이름 그대로** `public/img/`에 넣는다 (png·jpg·webp). 게임은 다시 빌드하면 바로 그 그림을 쓴다.',
  '5. 위에서부터 순서대로 뽑으면 된다. 1·2번만 있어도 게임 화면이 거의 다 바뀐다.',
  '',
  '**대화 시작용 문장**',
  '',
  '```', starter, '```', '',
];
const summary = [];
for (const g of slots.groups) {
  const n = g.slots.length;
  const ok = g.slots.filter((s) => s.files.some((f) => have.includes(f))).length;
  total += n; done += ok;
  summary.push(`| ${g.name.replace(/ —.*/, '')} | ${ok} / ${n} | ${g.size} |`);
  out.push(`## ${g.name}`, '', `크기: ${g.size} · ${ok}/${n}장 들어 있음`, '');
  for (const s of g.slots) {
    const name = s.files[0];
    const got = s.files.find((f) => have.includes(f));
    const p = promptOf(name);
    if (!p) missingPrompt.push(name);
    out.push(`### ${got ? '✅' : '⬜'} \`${name}\` — ${s.use}`, '');
    if (got && got !== name) out.push(`(\`${got}\` 으로 들어 있음)`, '');
    out.push('```', p ?? '(docs/chatgpt-prompts.md 에 프롬프트 없음)', '```', '');
  }
}
out.splice(5, 0, '| 묶음 | 들어 있음 | 크기 |', '| --- | --- | --- |', ...summary, `| **합계** | **${done} / ${total}** | |`, '');
fs.writeFileSync('docs/ch1-4-images.md', out.join('\n'));

console.log(`제1~4화 그림: ${done} / ${total}장 들어 있음 → docs/ch1-4-images.md`);
for (const line of summary) console.log('  ' + line.replace(/\|/g, ' ').trim());
if (missingPrompt.length) { console.log('프롬프트를 못 찾은 이름:', missingPrompt.join(', ')); process.exitCode = 1; }
const unknown = have.filter((h) => !slots.groups.some((g) => g.slots.some((s) => s.files.includes(h))));
if (unknown.length) console.log('게임에서 아직 안 쓰는 그림:', unknown.join(', '));
