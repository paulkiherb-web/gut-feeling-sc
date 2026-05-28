const WebSocket = require('ws');
const http = require('http');
const fs = require('fs');

const MOCK_RESPONSE = {
  "plans": [
    {
      "effort": "gentle",
      "title": "Мягкий старт",
      "oneLineWhy": "Лёгкий режим без перегрузки — подходит твоему ритму",
      "badge": "🌱",
      "tags": ["энергия", "вода", "сон"],
      "expectedDelta": { "energy": 8, "sleep": 5, "readiness": 7 },
      "daily": [
        {
          "dayIndex": 1,
          "items": [
            {"id":"g-w1","time":"07:00","category":"hydration","title":"Стакан воды","expectedImpact":{"readiness":3}},
            {"id":"g-m1","time":"08:00","category":"meal","title":"Белковый завтрак","expectedImpact":{"readiness":8,"energy":6}},
            {"id":"g-w2","time":"12:00","category":"hydration","title":"Вода 500мл","expectedImpact":{"readiness":2}},
            {"id":"g-m2","time":"13:00","category":"meal","title":"Обед: белок + овощи","expectedImpact":{"readiness":6,"nutrition":5}},
            {"id":"g-mv1","time":"15:30","category":"movement","title":"Прогулка 10 мин","expectedImpact":{"readiness":5,"energy":4}},
            {"id":"g-m3","time":"19:00","category":"meal","title":"Лёгкий ужин","expectedImpact":{"readiness":4}},
            {"id":"g-s1","time":"23:00","category":"sleep","title":"Сон 7ч","expectedImpact":{"readiness":9,"sleep":8}}
          ]
        }
      ]
    },
    {
      "effort": "balanced",
      "title": "Сбалансированная энергия",
      "oneLineWhy": "Больше фокуса, меньше спада после обеда",
      "badge": "⚡",
      "tags": ["энергия", "фокус", "движение"],
      "expectedDelta": { "energy": 12, "sleep": 7, "readiness": 10 },
      "daily": [
        {
          "dayIndex": 1,
          "items": [
            {"id":"b-w1","time":"07:00","category":"hydration","title":"Стакан воды","expectedImpact":{"readiness":3}},
            {"id":"b-m1","time":"08:00","category":"meal","title":"Белковый завтрак","expectedImpact":{"readiness":10,"energy":8}},
            {"id":"b-mv1","time":"09:00","category":"movement","title":"Прогулка 15 мин","expectedImpact":{"readiness":6,"energy":5}},
            {"id":"b-w2","time":"11:00","category":"hydration","title":"Вода","expectedImpact":{"readiness":2}},
            {"id":"b-m2","time":"13:00","category":"meal","title":"Обед без быстрых углеводов","expectedImpact":{"readiness":8,"nutrition":7}},
            {"id":"b-mv2","time":"15:30","category":"movement","title":"Растяжка 10 мин","expectedImpact":{"readiness":5}},
            {"id":"b-m3","time":"18:30","category":"meal","title":"Ужин до 19:30","expectedImpact":{"readiness":6,"nutrition":5}},
            {"id":"b-s1","time":"22:30","category":"sleep","title":"Сон 7.5ч","expectedImpact":{"readiness":11,"sleep":9}}
          ]
        }
      ]
    },
    {
      "effort": "intense",
      "title": "Глубокий сдвиг",
      "oneLineWhy": "Максимум за 14 дней — для тех, кто готов менять режим",
      "badge": "🔥",
      "tags": ["интенсив", "спорт", "строгий режим"],
      "expectedDelta": { "energy": 18, "sleep": 9, "readiness": 15 },
      "daily": [
        {
          "dayIndex": 1,
          "items": [
            {"id":"i-w1","time":"06:30","category":"hydration","title":"Вода натощак","expectedImpact":{"readiness":4}},
            {"id":"i-mv0","time":"07:00","category":"movement","title":"Утренняя зарядка 20 мин","expectedImpact":{"readiness":8,"energy":7}},
            {"id":"i-m1","time":"08:00","category":"meal","title":"Высокобелковый завтрак","expectedImpact":{"readiness":12,"energy":10}},
            {"id":"i-w2","time":"10:00","category":"hydration","title":"Вода","expectedImpact":{"readiness":2}},
            {"id":"i-m2","time":"12:30","category":"meal","title":"Чистый обед: курица + зелень","expectedImpact":{"readiness":10,"nutrition":9}},
            {"id":"i-mv1","time":"18:00","category":"movement","title":"Тренировка 40 мин","expectedImpact":{"readiness":12,"energy":10}},
            {"id":"i-m3","time":"19:30","category":"meal","title":"Белковый ужин","expectedImpact":{"readiness":7,"nutrition":6}},
            {"id":"i-s1","time":"22:00","category":"sleep","title":"Сон 8ч","expectedImpact":{"readiness":14,"sleep":12}}
          ]
        }
      ]
    }
  ],
  "course": "energy",
  "durationDays": 14,
  "generatedAt": "2026-05-27T10:00:00Z"
};

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
    setTimeout(resolve, 3500);
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
    setTimeout(() => resolve(null), 6000);
  });
}

async function clickText(text) {
  const r = await evalJS(
    (() => {
      const all = Array.from(document.querySelectorAll('button, [role=button]'));
      const el = all.find(e => e.innerText?.trim() === '') || all.find(e => e.innerText?.trim().includes(''));
      if (el) { el.click(); return 'ok:' + el.innerText?.trim().slice(0,30); }
      return 'miss. btns: ' + all.map(e=>e.innerText?.trim().slice(0,20)).filter(t=>t).slice(0,8).join(' | ');
    })()
  );
  console.log('  [' + text + ']:', r?.slice(0,60));
  return r;
}

async function getBody() {
  return await evalJS('document.body.innerText.slice(0,400)') || '';
}

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
  
  console.log('🔄 Clearing localStorage...');
  await evalJS('localStorage.clear(); localStorage.setItem("boosta_onboarded", "true"); localStorage.setItem("boosta_psych_profile", JSON.stringify({trigger:"Стресс на работе",selfTalk:"Спокойно и мягко",motivation:"Видимый прогресс",style:"Точный"}))');
  
  // Intercept fetch to mock edge function response
  await evalJS(
    const origFetch = window.fetch.bind(window);
    window.fetch = async function(url, opts) {
      if (typeof url === 'string' && url.includes('generate-intensive-plans')) {
        console.log('[mock] intercepted generate-intensive-plans call');
        return new Response(JSON.stringify(), {
          status: 200, 
          headers: {'Content-Type': 'application/json'}
        });
      }
      return origFetch(url, opts);
    };
    'fetch intercepted';
  );
  
  send('Page.navigate', {url:'http://localhost:8082/boosta'});
  await sleep(2500);
  
  let body = await getBody();
  console.log('Course screen:', body.slice(0,80));
  
  await clickText('Энергия');
  await sleep(400);
  await clickText('Начать курс');
  await sleep(2000);
  
  body = await getBody();
  console.log('After course:', body.slice(0,80));
  
  await clickText('Подобрать план');
  await sleep(1000);
  
  // Intercept fetch AFTER navigation (re-inject on the new page)
  await evalJS(
    const origFetch = window.fetch.bind(window);
    window.fetch = async function(url, opts) {
      if (typeof url === 'string' && url.includes('generate-intensive-plans')) {
        console.log('[mock] intercepted generate-intensive-plans');
        return new Response('', {
          status: 200,
          headers: {'Content-Type': 'application/json'}
        });
      }
      return origFetch(url, opts);
    };
    'fetch re-intercepted';
  );
  
  await sleep(3000);
  body = await getBody();
  console.log('PlanForge after mock:', body.slice(0,200));
  await screenshot('04_plan_forge_loaded.jpg');
  
  ws.close();
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
