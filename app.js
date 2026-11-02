const screens = [...document.querySelectorAll('.screen')];
const stepCount = document.getElementById('step-count');
const progressFill = document.getElementById('progress-fill');
const kicker = document.getElementById('practice-kicker');
const title = document.getElementById('practice-title');
const copy = document.getElementById('practice-text');
const actionChoices = document.getElementById('action-choices');
const interactionResponse = document.getElementById('interaction-response');
const practiceWrap = document.querySelector('.practice-wrap');
const moodgymBotCard = document.getElementById('moodgym-bot-card');
const moodgymBotLink = document.getElementById('moodgym-bot-link');
const moodgymBotUrl = window.MOODGYM_BOT_URL || '';
if (moodgymBotLink && /^https:\/\/t\.me\/[A-Za-z0-9_]{5,32}$/.test(moodgymBotUrl)) {
  moodgymBotLink.href = moodgymBotUrl;
  moodgymBotLink.target = '_blank';
  moodgymBotLink.rel = 'noreferrer';
  moodgymBotLink.hidden = false;
  if (moodgymBotCard) moodgymBotCard.hidden = false;
}
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
let activeMood = 'unsure';
let stepIndex = 0;
let activeTechniques = [];
let practiceCatalog = null;
const practices = {
  anxious: [
    ['Сначала просто оглянись', 'Найди глазами<br>один предмет вокруг.', 'Можно выбрать любой. Ненадолго задержи на нём взгляд, если это комфортно.', ''],
    ['Заметь опору', 'Почувствуй, что<br>держит тебя сейчас.', 'Обрати внимание на стопы на полу или спину на опоре. Ничего не меняй — только заметь.', ''],
    ['Выбери один маленький шаг', 'Что сейчас будет посильным?', 'Можно выбрать вариант или оставить этот шаг без ответа.', '']
  ],
  panic: [
    ['Посмотри вокруг', 'Назови про себя<br>одно место, где ты сейчас.', 'Не нужно искать причину происходящего. Просто отметь: «Я сейчас здесь».', ''],
    ['Найди одну опору', 'Заметь один звук<br>или одно прикосновение.', 'Выбери что-то нейтральное вокруг. Если не хочется — пропусти этот шаг.', ''],
    ['Выбери следующий шаг', 'Что поможет тебе<br>сейчас хоть немного?', 'Можно выбрать вариант или оставить этот шаг без ответа.', '']
  ],
  overloaded: [
    ['Сделай короткую паузу', 'Положи ладони<br>на любую поверхность.', 'Стол, колени, подлокотник. Почувствуй поверхность под ладонями. Можно не закрывать глаза.', ''],
    ['Ослабь усилие', 'Если хочется —<br>разожми пальцы.', 'Не нужно заставлять себя расслабляться. Просто проверь, есть ли место, где можно отпустить совсем немного.', ''],
    ['Верни себе выбор', 'Какой следующий шаг<br>будет посильным?', 'Можно выбрать вариант или оставить этот шаг без ответа.', '']
  ],
  low: [
    ['Останься в настоящем', 'Найди глазами<br>что-то знакомое.', 'Можно выбрать предмет, цвет или форму. Не нужно заставлять себя почувствовать что-то определённое.', ''],
    ['Заметь, что рядом', 'Почувствуй опору<br>под собой.', 'Если хочется, можно поставить ноги на пол или опереться спиной. Можно ничего не менять.', ''],
    ['Выбери, что будет бережно', 'Что может поддержать<br>ближайшие минуты?', 'Можно выбрать вариант или оставить этот шаг без ответа.', '']
  ],
  derealization: [
    ['Оглянись, если комфортно', 'Найди глазами<br>один знакомый предмет.', 'Можно назвать его про себя и отметить один цвет или форму. Если это усиливает дискомфорт — остановись и выбери другой шаг.', ''],
    ['Заметь точку опоры', 'Почувствуй поверхность<br>под ладонью или стопой.', 'Не нужно менять ощущения. Просто отметь контакт, если это сейчас подходит.', ''],
    ['Выбери поддержку', 'Что будет посильным<br>прямо сейчас?', 'Можно написать близкому, перейти в спокойное место или ничего пока не менять.', '']
  ],
  depersonalization: [
    ['Мягко отметь настоящее', 'Назови про себя<br>своё имя и место.', 'Только если это помогает. Можно вместо этого выбрать любой нейтральный предмет вокруг.', ''],
    ['Заметь внешний ориентир', 'Найди глазами<br>один цвет или форму.', 'Не нужно заставлять себя что-либо чувствовать. Если становится некомфортно — пропусти этот шаг.', ''],
    ['Выбери поддержку', 'Что будет посильным<br>прямо сейчас?', 'Можно написать близкому, перейти в спокойное место или ничего пока не менять.', '']
  ],
  stuck: [
    ['Не нужно решать всё', 'Почувствуй стопы<br>на полу.', 'Можно чуть пошевелить пальцами ног или просто заметить опору под ними.', ''],
    ['Выбери одно движение', 'Какое простое<br>движение доступно?', 'Например, подвигать пальцами или повернуть голову — только если комфортно.', ''],
    ['Назови самый малый шаг', 'Что можно сделать<br>за одну минуту?', 'Можно выбрать вариант или оставить этот шаг без ответа.', '']
  ],
  unsure: [
    ['Сначала просто оглянись', 'Найди глазами<br>один предмет вокруг.', 'Можно выбрать любой. Ненадолго задержи на нём взгляд, если это комфортно.', ''],
    ['Заметь опору', 'Почувствуй, что<br>держит тебя сейчас.', 'Обрати внимание на стопы на полу или спину на опоре. Ничего не меняй — только заметь.', ''],
    ['Выбери один маленький шаг', 'Что сейчас будет посильным?', 'Можно выбрать вариант или оставить этот шаг без ответа.', '']
  ]
};
const themeInteractions = {
  anxious: {
    section: 'Тревога · следующий шаг',
    title: 'Раздели тревогу на части',
    intro: 'Выбери, что сейчас ближе к этой тревоге.',
    options: [
      ['Могу повлиять на это сейчас', 'Выбери одно действие на ближайшие пару минут. Достаточно только начать.'],
      ['Вернусь к этому позже', 'Запиши или мысленно отметь время, когда вернёшься к вопросу. Сейчас можно переключиться на ближайшее дело.'],
      ['Пока не могу на это повлиять', 'Можно отложить решение и выбрать, что поможет тебе провести ближайшие минуты.']
    ]
  },
  panic: {
    section: 'Паника · внешний ориентир',
    title: 'Выбери нейтральную точку опоры',
    intro: 'Ориентируйся на то, что снаружи. Выбери только то, что не усиливает дискомфорт.',
    options: [
      ['Предмет, который я вижу', 'Назови его обычное название и один заметный цвет. Можно остановиться на этом.'],
      ['Нейтральный звук вокруг', 'Отметь, откуда он может идти. Если звуки мешают — выбери другой вариант.'],
      ['Поверхность рядом', 'Если комфортно, коснись её и заметь одно свойство: гладкая, мягкая или прохладная.']
    ]
  },
  overloaded: {
    section: 'Перегруз · снизить нагрузку',
    title: 'Что можно временно убрать?',
    intro: 'Выбери один источник нагрузки, который можно уменьшить на ближайшие минуты.',
    options: [
      ['Уведомления или лишний звук', 'Отключи один источник шума или уведомлений, если это удобно.'],
      ['Одну задачу', 'Отложи или раздели одно дело на более маленький шаг.'],
      ['Разговор или контакт', 'Если можно, попроси короткую паузу или обозначь, что ответишь позже.']
    ]
  },
  low: {
    section: 'Грусть · бережный выбор',
    title: 'Какой тип шага сейчас доступнее?',
    intro: 'Не нужно добиваться настроения получше. Выбери самый посильный вариант.',
    options: [
      ['Позаботиться о базовом', 'Проверь, хочется ли воды, еды, тепла или удобного положения. Можно выбрать только одно.'],
      ['Добавить что-то знакомое', 'Выбери знакомую музыку, предмет или спокойное занятие, если это сейчас подходит.'],
      ['Быть на связи', 'Можно отправить короткое сообщение близкому, не объясняя всё подробно.']
    ]
  },
  stuck: {
    section: 'Трудно собраться · начать с малого',
    title: 'Выбери старт, а не весь результат',
    intro: 'Подумай о деле, которое откладываешь. Какой первый шаг проще всего начать?',
    options: [
      ['Открыть нужный файл или вкладку', 'Открой только нужное место. Продолжать прямо сейчас необязательно.'],
      ['Подготовить один предмет', 'Положи рядом то, что понадобится для первого шага.'],
      ['Записать действие на две минуты', 'Сформулируй один конкретный глагол: открыть, найти, написать или разложить.']
    ]
  },
  unsure: {
    section: 'Неясное состояние · подобрать слова',
    title: 'Какое слово чуть ближе?',
    intro: 'Можно выбрать приблизительное слово или оставить ощущение без названия. Это не диагноз.',
    options: [
      ['Тревожно', 'Можно заметить: «Сейчас есть тревога». Не нужно сразу искать её причину.'],
      ['Грустно или пусто', 'Можно признать это состояние без требования немедленно его изменить.'],
      ['Злюсь или перегружен(а)', 'Проверь, нужна ли тебе сейчас пауза, граница или меньше стимулов.'],
      ['Устал(а) или растерян(а)', 'Можно начать с базового: проверить силы и выбрать только следующий небольшой шаг.'],
      ['Пока не знаю', 'Необязательно сейчас подбирать точное слово. Можно вернуться к выбору состояния позже.']
    ]
  },
  derealization: {
    section: 'Отстранённость от мира · внешний ориентир',
    title: 'Заметь обычную деталь вокруг',
    intro: 'Выбери внешний ориентир. Не нужно убеждать себя, что ощущения должны измениться.',
    options: [
      ['Цвет предмета', 'Найди один обычный предмет и назови его цвет. Если смотреть неприятно — остановись.'],
      ['Форма предмета', 'Отметь одну простую форму или линию вокруг, только если это комфортно.'],
      ['Привычная вещь рядом', 'Назови предмет, которым пользуешься в обычной жизни. Не нужно брать его в руки.']
    ]
  },
  depersonalization: {
    section: 'Отстранённость от себя · факт снаружи',
    title: 'Выбери один нейтральный факт',
    intro: 'Ориентируйся на внешний контекст, без проверки того, «достаточно ли ты здесь».',
    options: [
      ['Что за место вокруг', 'Назови тип места простыми словами: комната, улица, транспорт или другое.'],
      ['Чем я занимался(ась)', 'Отметь одно обычное действие, которое происходило до этой минуты.'],
      ['Один предмет рядом', 'Назови его и для чего он обычно нужен. Если это не подходит, пропусти шаг.']
    ]
  }
};
function showScreen(id, {record = true, step = stepIndex} = {}) {
  const token = id === 'practice' ? `practice-${step + 1}` : id;
  const activeScreen = document.querySelector('.screen.active')?.id;
  const sameView = activeScreen === id && (id !== 'practice' || window.location.hash === `#${token}`);
  if (record && !sameView && window.location.hash !== `#${token}`) window.location.hash = token;
  for (const screen of screens) {
    const active = screen.id === id;
    screen.hidden = !active;
    screen.classList.toggle('active', active);
  }
  document.querySelector('.shell').classList.toggle('practice-open', id === 'practice');
  window.scrollTo(0, 0);
}
function drawThemeInteraction() {
  actionChoices.replaceChildren();
  actionChoices.classList.remove('has-selection');
  interactionResponse.textContent = '';
  interactionResponse.hidden = true;
  const interaction = themeInteractions[activeMood];
  for (const [label, response] of interaction.options) {
    const button = document.createElement('button');
    button.type = 'button'; button.className = 'action-choice'; button.textContent = label;
    button.setAttribute('aria-pressed', 'false');
    button.addEventListener('click', () => {
      interactionResponse.hidden = false;
      actionChoices.querySelectorAll('.action-choice').forEach(option => option.setAttribute('aria-pressed', String(option === button)));
      const selectedLabel = document.createElement('strong'); selectedLabel.className = 'interaction-selected'; selectedLabel.textContent = label;
      const responseText = document.createElement('p'); responseText.textContent = response;
      const changeButton = document.createElement('button'); changeButton.type = 'button'; changeButton.className = 'inline-action'; changeButton.textContent = 'Изменить выбор';
      changeButton.addEventListener('click', () => {
        actionChoices.hidden = false;
        actionChoices.querySelectorAll('.action-choice').forEach(option => option.setAttribute('aria-pressed', 'false'));
        interactionResponse.replaceChildren(); interactionResponse.hidden = true;
      });
      actionChoices.hidden = true;
      interactionResponse.replaceChildren(selectedLabel, responseText, changeButton);
      window.scrollTo(0, 0);
    });
    actionChoices.append(button);
  }
}
function renderStep() {
  const isInteraction = stepIndex === 3;
  const technique = activeTechniques[stepIndex];
  const step = practices[activeMood][Math.min(stepIndex, 2)];
  const interaction = themeInteractions[activeMood];
  stepCount.textContent = `шаг ${stepIndex + 1} из 4`;
  progressFill.style.width = `${((stepIndex + 1) / 4) * 100}%`;
  kicker.textContent = isInteraction ? interaction.section : (technique ? technique.section : step[0]);
  title.textContent = isInteraction ? interaction.title : (technique ? technique.title : step[1].replace(/<br\s*\/?\s*>/gi, ' '));
  copy.textContent = isInteraction ? interaction.intro : (technique ? technique.instruction : step[2]);
  practiceWrap.classList.toggle('has-interaction', isInteraction);
  actionChoices.hidden = !isInteraction;
  if (isInteraction) drawThemeInteraction();
  else { actionChoices.replaceChildren(); actionChoices.hidden = true; interactionResponse.replaceChildren(); interactionResponse.hidden = true; }
  document.getElementById('next-step').innerHTML = isInteraction ? 'Завершить <span aria-hidden="true">›</span>' : 'Дальше <span aria-hidden="true">›</span>';
  document.getElementById('practice-back').textContent = stepIndex === 0 ? '← К выбору' : '← Предыдущий шаг';
}
function selectTechniqueSteps(items) {
  const sections = new Map();
  for (const item of items) {
    if (!sections.has(item.section)) sections.set(item.section, []);
    sections.get(item.section).push(item);
  }
  const groups = [...sections.values()].sort(() => Math.random() - 0.5);
  const selected = [];
  while (selected.length < 3 && groups.length) {
    const group = groups.shift();
    selected.push(group[Math.floor(Math.random() * group.length)]);
  }
  return selected;
}
async function startPractice(mood = activeMood) {
  activeMood = mood; stepIndex = 0; activeTechniques = [];
  try {
    const response = await fetch('data/practices.json');
    if (!response.ok) throw new Error('Каталог практик недоступен');
    if (!practiceCatalog) practiceCatalog = await response.json();
    const items = practiceCatalog.filter(item => item.state_key === mood);
    activeTechniques = selectTechniqueSteps(items);
    if (activeTechniques.length < 3) activeTechniques = [];
  } catch (_) {
    // The interview prototype remains usable when opened without its local server.
  }
  renderStep(); showScreen('practice', {step: stepIndex});
}
document.querySelector('[data-home]').addEventListener('click', event => { event.preventDefault(); showScreen('home'); });
document.querySelectorAll('[data-go]').forEach(button => button.addEventListener('click', () => showScreen(button.dataset.go)));
document.querySelectorAll('[data-safety]').forEach(button => button.addEventListener('click', () => showScreen('safety')));
document.querySelectorAll('[data-back]').forEach(button => button.addEventListener('click', () => window.history.back()));
document.querySelectorAll('[data-mood]').forEach(button => button.addEventListener('click', () => startPractice(button.dataset.mood)));
document.getElementById('practice-back').addEventListener('click', () => window.history.back());
document.getElementById('next-step').addEventListener('click', () => {
  if (stepIndex < 3) { stepIndex += 1; renderStep(); showScreen('practice', {step: stepIndex}); }
  else {
    document.getElementById('feedback-area').hidden = true;
    document.querySelector('.finish-options').hidden = false;
    showScreen('finish');
  }
});
document.querySelector('[data-restart]').addEventListener('click', () => showScreen('choose'));
document.querySelectorAll('[data-feedback]').forEach(button => button.addEventListener('click', () => {
  if (button.dataset.feedback === 'nochange') { showScreen('soft-support'); return; }
  const area = document.getElementById('feedback-area'); area.replaceChildren(); area.hidden = false;
  document.querySelector('.finish-options').hidden = true;
  const messages = {
    easier: 'Можно остановиться здесь или вернуться к делам в своём темпе.',
    person: 'Вот фраза, с которой можно начать. Если не к кому обратиться, открой варианты поддержки.',
    done: 'Можно вернуться к делам в своём темпе.'
  };
  const p = document.createElement('p'); p.textContent = messages[button.dataset.feedback]; area.append(p);
  if (button.dataset.feedback === 'person') {
    const card = document.createElement('div'); card.className = 'copy-card';
    const quote = document.createElement('p'); quote.textContent = '«Мне сейчас непросто. Можешь побыть со мной на связи или позвонить?»';
    const copyButton = document.createElement('button'); copyButton.type = 'button'; copyButton.className = 'copy-button'; copyButton.textContent = 'Скопировать текст';
    copyButton.addEventListener('click', () => copyText(quote.textContent, card)); card.append(quote, copyButton); area.append(card);
    const support = document.createElement('button'); support.type = 'button'; support.className = 'inline-action'; support.textContent = 'Если не к кому обратиться — посмотреть варианты поддержки';
    support.addEventListener('click', () => showScreen('soft-support')); area.append(support);
  }
  const changeButton = document.createElement('button');
  changeButton.type = 'button';
  changeButton.className = 'feedback-change';
  changeButton.textContent = 'Выбрать другой вариант';
  changeButton.addEventListener('click', () => {
    area.hidden = true;
    area.replaceChildren();
    document.querySelector('.finish-options').hidden = false;
    document.querySelector('.finish-options').scrollIntoView({behavior: 'smooth', block: 'center'});
  });
  area.append(changeButton);
  area.scrollIntoView({behavior: 'smooth', block: 'center'});
}));
async function copyText(text, container) {
  let status = container.querySelector('.copy-status');
  if (!status) { status = document.createElement('span'); status.className = 'copy-status'; container.append(status); }
  try { await navigator.clipboard.writeText(text); status.textContent = 'Скопировано'; }
  catch (_) {
    const area = document.createElement('textarea'); area.value = text; area.setAttribute('readonly', ''); area.style.position = 'fixed'; area.style.opacity = '0';
    document.body.append(area); area.select(); const copied = document.execCommand('copy'); area.remove();
    status.textContent = copied ? 'Скопировано' : 'Выдели текст выше и скопируй его вручную.';
  }
}
function syncFromHash() {
  const route = decodeURIComponent(window.location.hash.slice(1));
  const practiceMatch = /^practice-(\d+)$/.exec(route);
  const screenId = practiceMatch ? 'practice' : (screens.find(screen => screen.id === route)?.id || 'home');
  if (practiceMatch) { stepIndex = Math.max(0, Math.min(3, Number(practiceMatch[1]) - 1)); renderStep(); }
  showScreen(screenId, {record: false, step: stepIndex});
}
window.addEventListener('hashchange', syncFromHash);
syncFromHash();
