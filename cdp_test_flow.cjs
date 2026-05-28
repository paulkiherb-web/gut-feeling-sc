const WebSocket = require('ws');
const http = require('http');
const fs = require('fs');

let id = 1;
let ws;
const send = (m, p) => { ws.send(JSON.stringify({id:id++, method:m, params:p||{}})); return id-1; };
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function screenshot(name) {
  return new Promise(resolve => {
    const ssId = send('Page.captureScreenshot', {format:'jpeg', quality:85});
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
    setTimeout(resolve, 3000);
  });
}

async function evalJS(expr) {
  return new Promise(resolve => {
    const eid = send('Runtime.evaluate', {expression: expr});
    const h = (raw) => {
      const msg = JSON.parse(raw.toString());
      if (msg.id === eid) {
        ws.removeListener('message', h);
        resolve(msg.result?.result?.value);
      }
    };
    ws.on('message', h);
    setTimeout(() => resolve(null), 5000);
  });
}

async function clickText(text) {
  return evalJS(`
    (() => {
      const all = Array.from(document.querySelectorAll('button, [role="button"]'));
      const el = all.find(e => e.innerText?.trim() === '${text}') 
                || all.find(e => e.innerText?.trim().includes('${text}'));
      if (el) { el.click(); return 'ok:' + el.innerText?.trim().slice(0,25); }
      return 'miss: ' + all.map(e=>e.innerText?.trim().slice(0,15)).filter(t=>t).slice(0,6).join(', ');
    })()
  `);
}

async function getBody() {
  const r = await evalJS('document.body.innerText.slice(0,300)');
  return r || '';
}

const MOCK_PLAN = {
  id: 'plan-energy-balanced-001',
  effort: 'balanced',
  title: 'Сбалансированная энергия',
  oneLineWhy: 'Больше фокуса без провалов после обеда',
  badge: '⚡',
  tags: ['energy', 'focus', 'sleep'],
  course: 'energy',
  durationDays: 14,
  expectedDelta: { energy: 12, sleep: 8, readiness: 10 },
  generatedAt: new Date().toISOString(),
  daily: [
    {
      dayIndex: 1,
      items: [
        { id:'b-w1', time:'07:00', category:'hydration', title:'Стакан воды', expectedImpact:{readiness:3,energy:2} },
        { id:'b-m1', time:'08:00', category:'meal', title:'Белковый завтрак', expectedImpact:{readiness:8,energy:6,nutrition:5} },
        { id:'b-mv1', time:'09:00', category:'movement', title:'Лёгкая прогулка 10 мин', expectedImpact:{readiness:5,energy:4} },
        { id:'b-w2', time:'11:00', category:'hydration', title:'Вода', expectedImpact:{readiness:2} },
        { id:'b-m2', time:'13:00', category:'meal', title:'Обед: белок + овощи', expectedImpact:{readiness:7,energy:5,nutrition:6} },
        { id:'b-mv2', time:'15:30', category:'movement', title:'Прогулка 15 мин', expectedImpact:{readiness:6,energy:5} },
        { id:'b-m3', time:'18:30', category:'meal', title:'Лёгкий ужин', expectedImpact:{readiness:5,nutrition:4} },
        { id:'b-s1', time:'22:30', category:'sleep', title:'Сон 7.5ч', expectedImpact:{readiness:10,sleep:8,energy:7} }
      ]
    }
  ]
};

async function main() {
  const data = await new Promise(r => {
    http.get('http://localhost:9222/json', res => {
      let d=''; res.on('data', c=>d+=c); res.on('end', ()=>r(d));
    });
  });
  const tabs = JSON.parse(data);
  const tab = tabs.find(t => !t.url.includes('devtools')) || tabs[0];
  ws = new WebSocket(tab.webSocketDebuggerUrl);
  await new Promise(r => ws.on('open', r));
  send('Emulation.setDeviceMetricsOverride', {width:390, height:844, deviceScaleFactor:1, mobile:true});
  
  console.log('\n🔧 Injecting mock plan into store...');
  await evalJS(`
    const storeKey = 'state-os-core-v1';
    const plan = ${JSON.stringify(MOCK_PLAN)};
    
    let store = {};
    try { store = JSON.parse(localStorage.getItem(storeKey) || '{}'); } catch(e) {}
    if (!store.state) store.state = {};
    
    store.state.course = { activeCourse: 'energy' };
    store.state.intensivePlanOptions = [plan];
    store.state.activeIntensivePlanId = plan.id;
    store.state.intensiveStartedAt = new Date().toISOString();
    store.state.onboarding = { isComplete: true };
    
    localStorage.setItem(storeKey, JSON.stringify(store));
    localStorage.setItem('boosta_onboarded', 'true');
    'plan injected';
  `);
  
  send('Page.navigate', {url:'http://localhost:8082/boosta'});
  await sleep(3000);
  
  let body = await getBody();
  console.log('Initial screen:', body.slice(0,150));
  await screenshot('t1_dual_path_initial.jpg');
  
  // Now log tokens to simulate a day with deviations
  console.log('\n🧪 Injecting events: breakfast ✅, then alcohol 🍷, smoking 🚬...');
  
  await evalJS(`
    // Dispatch token events via the app's event system
    // First: breakfast (positive)
    const now = new Date();
    const events = [
      {
        id: 'evt-breakfast-' + Date.now(),
        type: 'scan.completed',
        timestamp: new Date(now.getTime() - 4*3600000).toISOString(),
        payload: {
          foodName: 'Омлет с овощами',
          nutrients: { protein: 28, fat: 12, carbs: 8, calories: 250 },
          signals: { hasProtein: true, isHealthyFat: true, isLowCarb: true, isHighFiber: true },
          verdict: 'green',
          mealContext: 'breakfast'
        }
      },
      {
        id: 'evt-water-' + (Date.now()+1),
        type: 'hydration.logged',
        timestamp: new Date(now.getTime() - 3*3600000).toISOString(),
        payload: { amountMl: 500 }
      },
      {
        id: 'evt-run-' + (Date.now()+2),
        type: 'token.logged',
        timestamp: new Date(now.getTime() - 2*3600000).toISOString(),
        payload: {
          tokenId: 'run',
          tokenLabel: 'Пробежка',
          tokenCategory: 'movement',
          signals: { hasMovement: true, isAerobic: true }
        }
      }
    ];
    
    // Inject via store key
    const storeKey = 'state-os-core-v1';
    let store = JSON.parse(localStorage.getItem(storeKey) || '{}');
    if (!store.state) store.state = {};
    store.state.eventLog = events;
    localStorage.setItem(storeKey, JSON.stringify(store));
    'positive events injected';
  `);
  
  send('Page.navigate', {url:'http://localhost:8082/boosta'});
  await sleep(2500);
  await screenshot('t2_after_positive_events.jpg');
  body = await getBody();
  console.log('After positive events:', body.slice(0,150));
  
  // Now add negative events: alcohol + smoking
  await evalJS(`
    const storeKey = 'state-os-core-v1';
    let store = JSON.parse(localStorage.getItem(storeKey) || '{}');
    const events = store.state.eventLog || [];
    const now = new Date();
    
    events.push({
      id: 'evt-alcohol-' + Date.now(),
      type: 'token.logged',
      timestamp: new Date(now.getTime() - 60*60000).toISOString(),
      payload: {
        tokenId: 'alcohol',
        tokenLabel: 'Алкоголь',
        tokenCategory: 'substance',
        signals: { hasAlcohol: true, isSubstance: true }
      }
    });
    events.push({
      id: 'evt-smoking-' + (Date.now()+1),
      type: 'token.logged',
      timestamp: new Date(now.getTime() - 30*60000).toISOString(),
      payload: {
        tokenId: 'smoking',
        tokenLabel: 'Курение',
        tokenCategory: 'substance',
        signals: { hasSmoking: true, isSubstance: true }
      }
    });
    events.push({
      id: 'evt-sex-' + (Date.now()+2),
      type: 'token.logged',
      timestamp: new Date(now.getTime() - 20*60000).toISOString(),
      payload: {
        tokenId: 'sex',
        tokenLabel: 'Секс',
        tokenCategory: 'lifestyle',
        signals: { hasMovement: true, isIntimate: true }
      }
    });
    
    store.state.eventLog = events;
    localStorage.setItem(storeKey, JSON.stringify(store));
    events.length + ' events total';
  `);
  
  send('Page.navigate', {url:'http://localhost:8082/boosta'});
  await sleep(3000);
  await screenshot('t3_after_deviations.jpg');
  body = await getBody();
  console.log('After deviations (alcohol+smoking+sex):', body.slice(0,200));
  
  // Check Day tab
  console.log('\n📅 Checking Day tab...');
  const dayTabR = await clickText('День');
  console.log('Day tab click:', dayTabR);
  await sleep(2000);
  await screenshot('t4_day_screen.jpg');
  body = await getBody();
  console.log('Day screen:', body.slice(0,200));
  
  // Check History tab
  const histTabR = await clickText('История');
  console.log('History tab click:', histTabR);
  await sleep(1500);
  await screenshot('t5_history.jpg');
  
  ws.close();
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
