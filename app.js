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
    ['Тревога · сначала опора', 'Если комфортно, обними себя или положи ладонь на грудь.', 'Останься так на несколько спокойных выдохов. Не нужно менять дыхание.', '≈ 15 секунд'],
    ['Тревога · назвать главное', 'Коротко назови, о чём эта тревога.', 'Достаточно одного слова или фразы. Не нужно записывать все мысли.', '≈ 15 секунд']
  ],
  panic: [
    ['Паника · внешний ориентир', 'Посмотри на один нейтральный предмет.', 'Назови про себя его цвет или форму. Не нужно пристально всматриваться.', '≈ 15 секунд'],
    ['Паника · здесь и сейчас', 'Отметь одну вещь, которую слышишь.', 'Если звуки неприятны, вместо этого почувствуй стопы на полу.', '≈ 15 секунд']
  ],
  overloaded: [
    ['Перегруз · пауза', 'Положи ладони на любую поверхность.', 'Заметь её на ощупь. Глаза можно оставить открытыми.', '≈ 15 секунд'],
    ['Перегруз · снизить шум', 'Убери один небольшой раздражитель.', 'Например, отключи одно уведомление или отложи одну вещь, которая отвлекает.', '≈ 15 секунд']
  ],
  low: [
    ['Грусть · заметить рядом', 'Найди глазами одну знакомую вещь.', 'Просто назови её про себя. Не нужно добиваться особого чувства.', '≈ 15 секунд'],
    ['Грусть · проверить потребность', 'Проверь, нужно ли тебе сейчас что-то простое.', 'Вода, тепло или удобнее сесть — выбери только одно, если хочется.', '≈ 20 секунд']
  ],
  derealization: [
    ['Внешний ориентир · увидеть', 'Найди один обычный предмет вокруг.', 'Назови его цвет. Если смотреть неприятно — остановись.', '≈ 15 секунд'],
    ['Внешний ориентир · коснуться', 'Если комфортно, коснись ближайшей поверхности.', 'Отметь одно её свойство: например, гладкая или прохладная.', '≈ 15 секунд']
  ],
  depersonalization: [
    ['Внешний ориентир · место', 'Назови про себя, где ты сейчас.', 'Достаточно простого ответа: дома, на улице, в транспорте или другое.', '≈ 15 секунд'],
    ['Внешний ориентир · предмет', 'Найди одну знакомую вещь вокруг.', 'Назови её и для чего обычно её используют. Если не подходит — пропусти.', '≈ 15 секунд']
  ],
  stuck: [
    ['Начать с малого · опора', 'Почувствуй стопы на полу или опору под собой.', 'Ничего менять не нужно — просто заметь контакт.', '≈ 15 секунд'],
    ['Начать с малого · действие', 'Назови одно действие, с которого можно начать.', 'Например: открыть файл, найти вещь или написать первую строку.', '≈ 20 секунд']
  ],
  unsure: [
    ['Начать с простого · увидеть', 'Найди глазами один обычный предмет.', 'Назови про себя его цвет или форму.', '≈ 15 секунд'],
    ['Начать с простого · заметить', 'Заметь одну вещь, которая сейчас рядом.', 'Это может быть звук, поверхность или опора под ногами.', '≈ 15 секунд']
  ]
};
const themeInteractions = {
  anxious: {
    section: 'Тревога · следующий шаг',
    title: 'Как можно поступить с тревогой?',
    intro: 'Выбери один небольшой вариант. Здесь не нужно решать всё сразу.',
    options: [
      ['Сделать один шаг сейчас', 'Выбери действие, которое можно начать за полминуты. Например, открыть нужный файл или написать одно предложение.'],
      ['Вернуться к этому позже', 'Отметь время, когда вернёшься к вопросу. Сейчас переключись на одно простое дело.'],
      ['Отложить то, что не зависит от меня', 'Назови про себя то, на что сейчас нельзя повлиять, и выбери ближайшее небольшое дело.']
    ]
  },
  panic: {
    section: 'Паника · внешний ориентир',
    title: 'Выбери нейтральную точку опоры',
    intro: 'Выбери один внешний ориентир, который не усиливает дискомфорт.',
    options: [
      ['Предмет, который я вижу', 'Назови его обычное название и один заметный цвет. Можно остановиться на этом.'],
      ['Нейтральный звук вокруг', 'Отметь, откуда он может идти. Если звуки мешают — выбери другой вариант.'],
      ['Поверхность рядом', 'Если комфортно, коснись её и заметь одно свойство: гладкая, мягкая или прохладная.']
    ]
  },
  overloaded: {
    section: 'Перегруз · снизить нагрузку',
    title: 'Что можно временно убрать?',
    intro: 'Выбери один источник нагрузки, который можно уменьшить прямо сейчас.',
    options: [
      ['Уведомления или лишний звук', 'Отключи один источник шума или уведомлений, если это удобно.'],
      ['Одну задачу', 'Отложи или раздели одно дело на более маленький шаг.'],
      ['Разговор или контакт', 'Если можно, попроси короткую паузу или обозначь, что ответишь позже.']
    ]
  },
  low: {
    section: 'Грусть · бережный выбор',
    title: 'Какой тип шага сейчас доступнее?',
    intro: 'Не нужно менять настроение. Выбери один посильный шаг.',
    options: [
      ['Позаботиться о базовом', 'Проверь, хочется ли воды, еды, тепла или удобного положения. Можно выбрать только одно.'],
      ['Добавить что-то знакомое', 'Выбери знакомую музыку, предмет или спокойное занятие, если это сейчас подходит.'],
      ['Быть на связи', 'Можно отправить короткое сообщение близкому, не объясняя всё подробно.']
    ]
  },
  stuck: {
    section: 'Трудно собраться · начать с малого',
    title: 'Выбери старт, а не весь результат',
    intro: 'Подумай об одном отложенном деле. Выбери, с какого маленького шага начать.',
    options: [
      ['Открыть нужный файл или вкладку', 'Открой только нужное место. Продолжать прямо сейчас необязательно.'],
      ['Подготовить один предмет', 'Положи рядом то, что понадобится для первого шага.'],
      ['Записать действие на две минуты', 'Сформулируй один конкретный глагол: открыть, найти, написать или разложить.']
    ]
  },
  unsure: {
    section: 'Неясное состояние · подобрать слова',
    title: 'Какое слово чуть ближе?',
    intro: 'Выбери слово, которое примерно подходит, или оставь это без названия.',
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
  const isInteraction = stepIndex === 2;
  const isExtra = stepIndex === 3;
  const technique = activeTechniques[0];
  const step = practices[activeMood][Math.min(stepIndex, 1)];
  const interaction = themeInteractions[activeMood];
  stepCount.textContent = isExtra ? 'по желанию' : `шаг ${stepIndex + 1} из 3`;
  progressFill.style.width = `${(Math.min(stepIndex + 1, 3) / 3) * 100}%`;
  kicker.textContent = isExtra ? `Дополнительно · ${technique?.section || 'упражнение'}` : (isInteraction ? interaction.section : step[0]);
  title.textContent = isExtra ? (technique?.title || 'Дополнительное упражнение') : (isInteraction ? interaction.title : step[1].replace(/<br\s*\/?\s*>/gi, ' '));
  copy.textContent = isExtra ? (technique?.instruction || 'Упражнение недоступно. Его можно пропустить.') : (isInteraction ? interaction.intro : step[2]);
  const duration = document.getElementById('practice-time');
  duration.textContent = isExtra ? estimateDuration(technique?.instruction || '') : (isInteraction ? 'Около 30 секунд' : step[3]);
  document.getElementById('practice-label').textContent = isExtra ? 'необязательное упражнение' : 'короткая практика · около минуты';
  practiceWrap.classList.toggle('has-interaction', isInteraction);
  practiceWrap.classList.toggle('is-extra', isExtra);
  actionChoices.hidden = !isInteraction;
  if (isInteraction) drawThemeInteraction();
  else { actionChoices.replaceChildren(); actionChoices.hidden = true; interactionResponse.replaceChildren(); interactionResponse.hidden = true; }
  document.getElementById('next-step').innerHTML = stepIndex >= 2 ? 'Завершить <span aria-hidden="true">›</span>' : 'Дальше <span aria-hidden="true">›</span>';
  document.getElementById('skip-step').textContent = isExtra ? 'Пропустить упражнение' : 'Пропустить шаг';
  document.getElementById('practice-back').textContent = isExtra ? '← К завершению' : (stepIndex === 0 ? '← К выбору' : '← Предыдущий шаг');
}
function estimateDuration(instruction) {
  const numberWords = {одну: 1, один: 1, одна: 1, двух: 2, две: 2, два: 2, трёх: 3, три: 3, четырёх: 4, четыре: 4, пяти: 5, пять: 5, десяти: 10, десять: 10, пятнадцати: 15, пятнадцать: 15};
  const digitMatch = instruction.match(/(\d+)\s*(?:минут\w*|мин\.?)/i);
  if (digitMatch) return `Около ${digitMatch[1]} минут · можно остановиться раньше`;
  const wordMatch = instruction.match(/(?:^|[^А-Яа-яЁё])(одну|один|одна|двух|две|два|трёх|три|четырёх|четыре|пяти|пять|десяти|десять|пятнадцати|пятнадцать)\s+минут\w*/iu);
  return wordMatch ? `Около ${numberWords[wordMatch[1].toLowerCase()]} минут · можно остановиться раньше` : 'Время зависит от упражнения · можно остановиться раньше';
}
async function loadPracticeCatalog() {
  if (!practiceCatalog) {
    const response = await fetch('data/practices.json');
    if (!response.ok) throw new Error('Каталог практик недоступен');
    practiceCatalog = await response.json();
  }
  return practiceCatalog;
}
function startPractice(mood = activeMood) {
  activeMood = mood; stepIndex = 0; activeTechniques = [];
  renderStep(); showScreen('practice', {step: stepIndex});
}
async function startExtraPractice() {
  try {
    const catalog = await loadPracticeCatalog();
    const options = catalog.filter(item => item.state_key === activeMood);
    if (!options.length) throw new Error('Нет дополнительных упражнений');
    activeTechniques = [options[Math.floor(Math.random() * options.length)]];
    stepIndex = 3;
    renderStep(); showScreen('practice', {step: stepIndex});
  } catch (_) {
    const area = document.getElementById('feedback-area');
    area.replaceChildren(); area.hidden = false;
    const message = document.createElement('p');
    message.textContent = 'Дополнительное упражнение сейчас недоступно. Короткий маршрут уже завершён.';
    area.append(message);
    area.scrollIntoView({behavior: 'smooth', block: 'center'});
  }
}
document.querySelector('[data-home]').addEventListener('click', event => { event.preventDefault(); showScreen('home'); });
document.querySelectorAll('[data-go]').forEach(button => button.addEventListener('click', () => showScreen(button.dataset.go)));
document.querySelectorAll('[data-safety]').forEach(button => button.addEventListener('click', () => showScreen('safety')));
document.querySelectorAll('[data-back]').forEach(button => button.addEventListener('click', () => window.history.back()));
document.querySelectorAll('[data-mood]').forEach(button => button.addEventListener('click', () => startPractice(button.dataset.mood)));
document.getElementById('practice-back').addEventListener('click', () => window.history.back());
function finishPractice() {
  const area = document.getElementById('feedback-area'); area.hidden = true; area.replaceChildren();
  document.getElementById('finish-evaluation').hidden = false;
  document.getElementById('finish-next-actions').hidden = false;
  document.querySelector('[data-go="home"].text-button').hidden = false;
  showScreen('finish');
}
function advancePracticeStep() {
  if (stepIndex < 2) { stepIndex += 1; renderStep(); showScreen('practice', {step: stepIndex}); }
  else finishPractice();
}
document.getElementById('next-step').addEventListener('click', advancePracticeStep);
document.getElementById('skip-step').addEventListener('click', advancePracticeStep);
document.querySelector('[data-restart]').addEventListener('click', () => showScreen('choose'));
document.querySelector('[data-extra-practice]').addEventListener('click', startExtraPractice);
document.querySelectorAll('[data-feedback]').forEach(button => button.addEventListener('click', () => {
  if (button.dataset.feedback === 'nochange') { showScreen('soft-support'); return; }
  if (button.dataset.feedback === 'done') { showScreen('home'); return; }
  const area = document.getElementById('feedback-area'); area.replaceChildren(); area.hidden = false;
  const person = button.dataset.feedback === 'person';
  const p = document.createElement('p');
  p.textContent = person ? 'Вот короткое сообщение, которое можно отправить близкому.' : 'Спасибо, что отметил(а). Можно выбрать следующий шаг, когда будешь готов(а).';
  area.append(p);
  if (person) {
    document.getElementById('finish-evaluation').hidden = true;
    document.getElementById('finish-next-actions').hidden = true;
    document.querySelector('[data-go="home"].text-button').hidden = true;
    const card = document.createElement('div'); card.className = 'copy-card';
    const quote = document.createElement('p'); quote.textContent = '«Мне сейчас непросто. Можешь побыть со мной на связи или позвонить?»';
    const copyButton = document.createElement('button'); copyButton.type = 'button'; copyButton.className = 'copy-button'; copyButton.textContent = 'Скопировать текст';
    copyButton.addEventListener('click', () => copyText(quote.textContent, card)); card.append(quote, copyButton); area.append(card);
    const support = document.createElement('button'); support.type = 'button'; support.className = 'inline-action'; support.textContent = 'Если не к кому обратиться — посмотреть варианты поддержки';
    support.addEventListener('click', () => showScreen('soft-support')); area.append(support);
    const back = document.createElement('button'); back.type = 'button'; back.className = 'feedback-change'; back.textContent = '← К вариантам';
    back.addEventListener('click', () => finishPractice()); area.append(back);
  }
  area.scrollIntoView({behavior: 'smooth', block: person ? 'center' : 'nearest'});
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
