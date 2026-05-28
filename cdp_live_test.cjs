// Live test: intercept AI fetch, inject mock plan, test full flow
const WebSocket = require('ws');
const http = require('http');
const fs = require('fs');

const MOCK_PLANS_RESPONSE = JSON.stringify({
  plans: [
    {
      effort: 'gentle',
      title: 'Мягкий старт',
      oneLineWhy: 'Лёгкий режим без перегрузки',
      badge: '🌱',
      tags: ['энергия', 'вода', 'сон'],
      expectedDelta: { energy: 8, sleep: 5, readiness: 7 },
      daily: [{
        dayIndex: 1,
        items: [
          { id: 'g-w1', time: '07:00', category: 'hydration', title: 'Стакан воды', expectedImpact: { readiness: 3 } },
          { id: 'g-m1', time: '08:00', category: 'meal', title: 'Белковый завтрак', expectedImpact: { readiness: 8, energy: 6 } },
          { id: 'g-mv1', time: '15:30', category: 'movement', title: 'Прогулка 10 мин', expectedImpact: { readiness: 5 } },
          { id: 'g-m3', time: '19:00', category: 'meal', title: 'Лёгкий ужин', expectedImpact: { readiness: 4 } },
          { id: 'g-s1', time: '23:00', category: 'sleep', title: 'Сон 7ч', expectedImpact: { readiness: 9, sleep: 8 } }
        ]
      }]
    },
    {
      effort: 'balanced',
      title: 'Сбалансированная энергия',
      oneLineWhy: 'Больше фокуса, меньше спада после обеда',
      badge: '⚡',
      tags: ['энергия', 'фокус', 'движение'],
      expectedDelta: { energy: 12, sleep: 7, readiness: 10 },
      daily: [{
        dayIndex: 1,
        items: [
          { id: 'b-w1', time: '07:00', category: 'hydration', title: 'Стакан воды', expectedImpact: { readiness: 3 } },
          { id: 'b-m1', time: '08:00', category: 'meal', title: 'Белковый завтрак', expectedImpact: { readiness: 10, energy: 8 } },
          { id: 'b-mv1', time: '09:00', category: 'movement', title: 'Прогулка 15 мин', expectedImpact: { readiness: 6 } },
          { id: 'b-m2', time: '13:00', category: 'meal', title: 'Обед без углеводов', expectedImpact: { readiness: 8, nutrition: 7 } },
          { id: 'b-mv2', time: '15:30', category: 'movement', title: 'Растяжка', expectedImpact: { readiness: 5 } },
          { id: 'b-m3', time: '18:30', category: 'meal', title: 'Ужин до 19:30', expectedImpact: { readiness: 6, nutrition: 5 } },
          { id: 'b-s1', time: '22:30', category: 'sleep', title: 'Сон 7.5ч', expectedImpact: { readiness: 11, sleep: 9 } }
        ]
      }]
    },
    {
      effort: 'intense',
      title: 'Глубокий сдвиг',
      oneLineWhy: 'Максимум за 14 дней — для тех, кто готов',
      badge: '🔥',
      tags: ['интенсив', 'спорт', 'режим'],
      expectedDelta: { energy: 18, sleep: 9, readiness: 15 },
      daily: [{
        dayIndex: 1,
        items: [
          { id: 'i-w1', time: '06:30', category: 'hydration', title: 'Вода натощак', expectedImpact: { readiness: 4 } },
          { id: 'i-mv0', time: '07:00', category: 'movement', title: 'Зарядка 20 мин', expectedImpact: { readiness: 8, energy: 7 } },
          { id: 'i-m1', time: '08:00', category: 'meal', title: 'Высокобелковый завтрак', expectedImpact: { readiness: 12, energy: 10 } },
          { id: 'i-m2', time: '12:30', category: 'meal', title: 'Чистый обед', expectedImpact: { readiness: 10, nutrition: 9 } },
          { id: 'i-mv1', time: '18:00', category: 'movement', title: 'Тренировка 40 мин', expectedImpact: { readiness: 12, energy: 10 } },
          { id: 'i-s1', time: '22:00', category: 'sleep', title: 'Сон 8ч', expectedImpact: { readiness: 14, sleep: 12 } }
        ]
      }]
    }
  ],
  course: 'energy',
  durationDays: 14,
  generatedAt: '2026-05-27T10:00:00Z'
});

const MOCK_WHISPER_RESPONSE = JSON.stringify({ whisper: 'Это нас сдвинуло.' });
const MOCK_CORRECTION_RESPONSE = JSON.stringify({
  corrections: [
    { id: 'c1', effort: 'fast', title: 'Стакан воды сейчас', description: 'Разбавит влияние алкоголя', expectedImpact: { readiness: 3 } },
    { id: 'c2', effort: 'reliable', title: '15 мин прогулки', description: 'Ускорит выведение', expectedImpact: { readiness: 6 } },
    { id: 'c3', effort: 'full', title: 'Белок в следующий приём', description: 'Полная компенсация дня', expectedImpact: { readiness: 10 } }
  ]
});

const FETCH_INTERCEPT = `
  window.__origFetch = window.__origFetch || window.fetch.bind(window);
  window.fetch = async function(url, opts) {
    const u = typeof url === 'string' ? url : url.url;
    if (u && u.includes('generate-intensive-plans')) {
      console.log('[mock] plans');
      return new Response(${JSON.stringify(MOCK_PLANS_RESPONSE)}, {status:200, headers:{'Content-Type':'application/json'}});
    }
    if (u && u.includes('generate-whisper')) {
      console.log('[mock] whisper');
      return new Response(${JSON.stringify(MOCK_WHISPER_RESPONSE)}, {status:200, headers:{'Content-Type':'application/json'}});
    }
    if (u && u.includes('generate-corrections')) {
      console.log('[mock] corrections');
      return new Response(${JSON.stringify(MOCK_CORRECTION_RESPONSE)}, {status:200, headers:{'Content-Type':'application/json'}});
    }
    return window.__origFetch(url, opts);
  };
  'intercepted';
`;

let id = 1;
let ws;
const send = (m, p) => { ws.send(JSON.stringify({ id: id++, method: m, params: p || {} })); return id - 1; };
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function screenshot(name) {
  return new Promise(resolve => {
    const ssId = send('Page.captureScreenshot', { format: 'jpeg', quality: 85 });
    const h = (raw) => {
      const msg = JSON.parse(raw.toString());
      if (msg.id === ssId && msg.result?.data) {
        ws.removeListener('message', h);
        const buf = Buffer.from(msg.result.data, 'base64');
        fs.writeFileSync(name, buf);
        console.log('📸 ' + name + ' (' + buf.length + 'b)');
        resolve();
      }
    };
    ws.on('message', h);
    setTimeout(resolve, 4000);
  });
}

async function evalJS(expr) {
  return new Promise(resolve => {
    const eid = send('Runtime.evaluate', { expression: expr });
    const h = (raw) => {
      const msg = JSON.parse(raw.toString());
      if (msg.id === eid) {
        ws.removeListener('message', h);
        resolve(msg.result?.result?.value);
      }
    };
    ws.on('message', h);
    setTimeout(() => resolve(null), 7000);
  });
}

async function clickText(text) {
  const r = await evalJS(`
    (() => {
      const all = Array.from(document.querySelectorAll('button,[role=button]'));
      const el = all.find(e => e.innerText?.trim() === '${text}') || all.find(e => e.innerText?.trim().includes('${text}'));
      if (el) { el.click(); return 'ok:' + el.innerText?.trim().slice(0,30); }
      return 'miss. btns: ' + all.map(e=>e.innerText?.trim().slice(0,18)).filter(t=>t).slice(0,8).join(' | ');
    })()
  `);
  console.log('  [' + text + ']:', (r || '').slice(0, 70));
  return r;
}

async function getBody() {
  return await evalJS('document.body.innerText.slice(0,400)') || '';
}

async function main() {
  const data = await new Promise(r => {
    http.get('http://localhost:9222/json', res => {
      let d = ''; res.on('data', c => d += c); res.on('end', () => r(d));
    });
  });
  const tabs = JSON.parse(data);
  const tab = tabs.find(t => !t.url.includes('devtools')) || tabs[0];
  ws = new WebSocket(tab.webSocketDebuggerUrl);
  await new Promise(r => ws.on('open', r));
  send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });

  console.log('\n🧹 Clear state + inject fetch mock...');
  await evalJS('localStorage.clear(); localStorage.setItem("boosta_onboarded","true"); localStorage.setItem("boosta_psych_profile", JSON.stringify({trigger:"Стресс на работе",selfTalk:"Спокойно и мягко",motivation:"Видимый прогресс",style:"Точный"}))');
  send('Page.navigate', { url: 'http://localhost:8082/boosta' });
  await sleep(6000); // wait for React to fully mount
  await evalJS(FETCH_INTERCEPT);

  // STEP 1: Show CourseSetupScreen, then inject course via store
  console.log('\n🎯 STEP 1: CourseSetupScreen — screenshot, then inject "Энергия"');
  let body = await getBody();
  console.log('Course screen:', body.slice(0, 100));
  await screenshot('01_course_select.jpg');

  // Direct store injection — reliable across all timing conditions
  const courseSet = await evalJS(`
    (() => {
      const store = window.__appStore;
      if (!store) return 'no-store';
      store.getState().setCourse({ activeCourse: 'energy' });
      return store.getState().course.activeCourse;
    })()
  `);
  console.log('  Course injected:', courseSet);
  await sleep(1500); // let React re-render

  body = await getBody();
  console.log('After course setup:', body.slice(0, 120));
  await screenshot('02_no_plan_home.jpg');

  // 2. Open PlanForge
  console.log('\n📋 STEP 2: Open PlanForge (AI mocked)');
  await evalJS(FETCH_INTERCEPT);
  await clickText('Подобрать план');
  await sleep(500);
  await evalJS(FETCH_INTERCEPT); // re-inject after React re-render
  await sleep(4000); // wait for AI mock + render

  body = await getBody();
  console.log('PlanForge content:', body.slice(0, 200));
  await screenshot('03_plan_forge_plans.jpg');

  // 3. Pick balanced plan
  console.log('\n✅ STEP 3: Pick balanced plan');
  // Try clicking the plan card button, fallback to store injection
  const planClickResult = await clickText('Выбрать этот план');
  if (!planClickResult || planClickResult.startsWith('miss')) {
    console.log('  UI click failed — injecting plan via store...');
    const planInjected = await evalJS(`
      (() => {
        const store = window.__appStore;
        if (!store) return 'no-store';
        const opts = store.getState().intensivePlanOptions;
        if (opts.length === 0) {
          // Inject mock plans then select balanced
          const mockPlans = ${JSON.stringify(JSON.parse(MOCK_PLANS_RESPONSE).plans.map((p, i) => ({
            id: `mock-plan-${i}`,
            effort: p.effort,
            title: p.title,
            oneLineWhy: p.oneLineWhy,
            badge: p.badge,
            tags: p.tags,
            expectedDelta: p.expectedDelta,
            daily: p.daily,
            course: 'energy',
            durationDays: 14,
            generatedAt: new Date().toISOString()
          })))};
          store.getState().setIntensivePlanOptions(mockPlans);
          store.getState().selectIntensivePlan('mock-plan-1');
          return 'injected: mock-plan-1';
        }
        const balanced = opts.find(p => p.effort === 'balanced') || opts[1] || opts[0];
        store.getState().selectIntensivePlan(balanced.id);
        return 'selected: ' + balanced.id;
      })()
    `);
    console.log('  Plan injected:', planInjected);
  }
  await sleep(2000);

  body = await getBody();
  console.log('After plan pick:', body.slice(0, 200));
  await screenshot('04_dual_path_with_plan.jpg');

  // Helper: dispatch event via live Zustand store (no page reload needed)
  async function appendEvent(event) {
    const r = await evalJS(`
      (() => {
        const store = window.__appStore;
        if (!store) return 'no store';
        try {
          store.getState().appendEvent(${JSON.stringify(event)});
          return 'ok';
        } catch(e) { return 'err: ' + e.message; }
      })()
    `);
    console.log('  appendEvent [' + event.type + ']:', r);
    return r;
  }

  // 4. Inject positive morning events via live store
  console.log('\n🌅 STEP 4: Log morning events (breakfast + water + run)');
  const now4 = Date.now();
  // Use today's morning timestamps (7-9 AM) so they fall within the plan day
  const todayBase = new Date(); todayBase.setHours(7, 30, 0, 0);
  const t7_30 = todayBase.getTime();
  const t9_00 = t7_30 + 90 * 60000;
  const t10_30 = t7_30 + 180 * 60000;

  await appendEvent({
    id: 'evt-breakfast-001',
    type: 'scan.completed',
    timestamp: new Date(t7_30).toISOString(),
    source: 'scanner',
    payload: {
      foodName: 'Омлет с овощами и курицей',
      nutrients: { protein: 32, fat: 14, carbs: 6, calories: 280 },
      signals: { hasProtein: true, isHealthyFat: true, isLowCarb: true },
      verdict: 'green',
      mealContext: 'breakfast'
    }
  });
  await sleep(400);

  await appendEvent({
    id: 'evt-water-001',
    type: 'hydration.logged',
    timestamp: new Date(t9_00).toISOString(),
    source: 'manual',
    payload: { amountMl: 500 }
  });
  await sleep(400);

  await appendEvent({
    id: 'evt-run-001',
    type: 'token.logged',
    timestamp: new Date(t10_30).toISOString(),
    source: 'token_picker',
    payload: {
      tokenId: 'run',
      tokenLabel: 'Пробежка',
      tokenCategory: 'movement',
      signals: { hasMovement: true, isAerobic: true }
    }
  });
  await sleep(2000); // let scores recompute

  // Print scores for report
  const scores4 = await evalJS(`
    (() => {
      const s = window.__appStore?.getState();
      if (!s) return 'no-store';
      return JSON.stringify({ scores: s.scores, dualPath: s.dualPath }, null, 0);
    })()
  `);
  console.log('Scores after positive events:', scores4?.slice(0, 300));

  body = await getBody();
  console.log('With positive events:', body.slice(0, 200));
  await screenshot('05_dual_path_positive.jpg');

  // 5. Log deviating events (alcohol + smoking + sex)
  console.log('\n💀 STEP 5: Log deviations (alcohol + smoking + sex)');
  const now5 = Date.now();
  // Use evening timestamps (20:00 - 21:30)
  const t20_00 = new Date(); t20_00.setHours(20, 0, 0, 0);
  const t21_00 = new Date(); t21_00.setHours(21, 0, 0, 0);
  const t21_30 = new Date(); t21_30.setHours(21, 30, 0, 0);

  await appendEvent({
    id: 'evt-alcohol-001',
    type: 'token.logged',
    timestamp: t20_00.toISOString(),
    source: 'token_picker',
    payload: {
      tokenId: 'alcohol',
      tokenLabel: 'Алкоголь',
      tokenCategory: 'substance',
      signals: { hasAlcohol: true, isSubstance: true }
    }
  });
  await sleep(600);

  await appendEvent({
    id: 'evt-smoking-001',
    type: 'token.logged',
    timestamp: t21_00.toISOString(),
    source: 'token_picker',
    payload: {
      tokenId: 'smoking',
      tokenLabel: 'Курение',
      tokenCategory: 'substance',
      signals: { hasSmoking: true, isSubstance: true }
    }
  });
  await sleep(600);

  await appendEvent({
    id: 'evt-sex-001',
    type: 'token.logged',
    timestamp: t21_30.toISOString(),
    source: 'token_picker',
    payload: {
      tokenId: 'sex',
      tokenLabel: 'Секс',
      tokenCategory: 'lifestyle',
      signals: { hasMovement: true, isIntimate: true }
    }
  });
  await sleep(2000); // let scores recompute

  // Print scores for report
  const scores5 = await evalJS(`
    (() => {
      const s = window.__appStore?.getState();
      if (!s) return 'no-store';
      return JSON.stringify({ scores: s.scores, dualPath: s.dualPath }, null, 0);
    })()
  `);
  console.log('Scores after deviations:', scores5?.slice(0, 300));

  body = await getBody();
  console.log('After deviations body:', body.slice(0, 200));
  await screenshot('06_dual_path_deviated.jpg');

  // Helper: click tab by span label, fallback to JS BoostaShell state
  async function clickTabReliable(label) {
    // First try span text click
    let r = await evalJS(`
      (() => {
        const spans = Array.from(document.querySelectorAll('nav span'));
        const span = spans.find(s => s.innerText?.trim() === '${label}');
        if (span) { span.closest('button')?.click(); return 'ok:' + span.innerText; }
        // Also try direct button text
        const btns = Array.from(document.querySelectorAll('nav button'));
        const btn = btns.find(b => b.innerText?.includes('${label}'));
        if (btn) { btn.click(); return 'ok-btn'; }
        return 'miss. spans: ' + spans.map(s=>s.innerText).join('|');
      })()
    `);
    console.log('  [tab:' + label + ']:', (r || '').slice(0, 80));
    return r;
  }

  // 6. Check Day tab
  console.log('\n📅 STEP 6: Day tab');
  await clickTabReliable('День');
  await sleep(2000);
  await screenshot('07_day_screen.jpg');
  body = await getBody();
  console.log('Day screen:', body.slice(0, 300));

  // 7. History tab
  console.log('\n📊 STEP 7: History tab');
  await clickTabReliable('История');
  await sleep(2000);
  await screenshot('08_history.jpg');
  body = await getBody();
  console.log('History screen:', body.slice(0, 200));

  // 8. Profile tab
  console.log('\n👤 STEP 8: Profile tab');
  await clickTabReliable('Профиль');
  await sleep(2500);
  // Diagnose select values
  const profileSelects = await evalJS(`
    (() => {
      const sels = Array.from(document.querySelectorAll('select'));
      return JSON.stringify(sels.map(s => ({
        label: s.closest('label')?.querySelector('span')?.innerText || s.id || '',
        value: s.value,
        selected: s.options[s.selectedIndex]?.text || 'none'
      })));
    })()
  `);
  console.log('  Select values:', profileSelects);
  await screenshot('09_profile.jpg');
  body = await getBody();
  console.log('Profile screen:', body.slice(0, 200));

  console.log('\n✅ TEST COMPLETE');
  ws.close();
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
