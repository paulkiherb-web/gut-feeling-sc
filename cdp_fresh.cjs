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

async function evalJS(expr, awaitP) {
  return new Promise(resolve => {
    const eid = send('Runtime.evaluate', {expression: expr, awaitPromise: !!awaitP});
    const h = (raw) => {
      const msg = JSON.parse(raw.toString());
      if (msg.id === eid) {
        ws.removeListener('message', h);
        resolve(msg.result?.result?.value);
      }
    };
    ws.on('message', h);
    setTimeout(() => resolve(null), 8000);
  });
}

async function clickText(text) {
  return evalJS(`
    (() => {
      const all = Array.from(document.querySelectorAll('button, [role="button"]'));
      const el = all.find(e => e.innerText?.trim() === '${text}') 
                || all.find(e => e.innerText?.trim().includes('${text}'));
      if (el) { el.click(); return 'ok:' + el.innerText?.trim().slice(0,30); }
      return 'miss. btns: ' + all.map(e=>e.innerText?.trim().slice(0,15)).filter(t=>t).join(',');
    })()
  `);
}

async function getBody() {
  const r = await evalJS('document.body.innerText.slice(0,300)');
  return r || '';
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
  
  // Clear everything and start fresh
  console.log('🔄 Clearing state and starting fresh...');
  await evalJS(`
    localStorage.clear();
    localStorage.setItem('boosta_onboarded', 'true');
    localStorage.setItem('boosta_psych_profile', JSON.stringify({
      trigger: 'Стресс на работе', selfTalk: 'Спокойно и мягко',
      motivation: 'Видимый прогресс', style: 'Точный'
    }));
  `);
  
  send('Page.navigate', {url:'http://localhost:8082/boosta'});
  await sleep(3000);
  
  let body = await getBody();
  console.log('Fresh load:', body.slice(0,100));
  await screenshot('01_fresh.jpg');
  
  // Select course
  console.log('\n🎯 Selecting Энергия course...');
  let r = await clickText('Энергия');
  console.log('  Energy click:', r?.slice(0,50));
  await sleep(500);
  r = await clickText('Начать курс');
  console.log('  Start course:', r?.slice(0,50));
  await sleep(2000);
  
  body = await getBody();
  console.log('After course setup:', body.slice(0,120));
  await screenshot('02_no_plan.jpg');
  
  // Click "Подобрать план" to go to PlanForgeScreen  
  console.log('\n📋 Opening PlanForge...');
  r = await clickText('Подобрать план');
  console.log('  Plan button:', r?.slice(0,50));
  await sleep(2000);
  
  body = await getBody();
  console.log('PlanForge screen:', body.slice(0,120));
  await screenshot('03_plan_forge.jpg');
  
  // Check if any error or loading state
  const rootLen = await evalJS('document.getElementById("root")?.innerHTML.length');
  console.log('Root innerHTML length:', rootLen);
  
  // Now check if there's Zustand store accessible
  const zustandCheck = await evalJS(`
    // Try to find Zustand stores
    const keys = Object.keys(window).filter(k => k.includes('store') || k.includes('zustand'));
    const devtoolsKey = '__zustand_devtools__';
    return JSON.stringify({
      windowKeys: keys.slice(0,10),
      hasDevtools: !!window[devtoolsKey],
      storeKeys: Object.keys(localStorage).join(',')
    });
  `);
  console.log('Zustand check:', zustandCheck);
  
  ws.close();
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
