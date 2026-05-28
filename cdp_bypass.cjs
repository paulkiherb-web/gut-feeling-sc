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
    const eid = send('Runtime.evaluate', {expression: expr, awaitPromise: true});
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
  const r = await evalJS(`
    (() => {
      const all = Array.from(document.querySelectorAll('button, [role="button"]'));
      const el = all.find(e => e.innerText?.trim() === '${text}') 
                || all.find(e => e.innerText?.trim().includes('${text}'));
      if (el) { 
        el.dispatchEvent(new MouseEvent('mousedown', {bubbles:true}));
        el.dispatchEvent(new MouseEvent('mouseup', {bubbles:true}));
        el.click(); 
        return 'ok:' + el.innerText?.trim().slice(0,30); 
      }
      return 'miss';
    })()
  `);
  console.log('  [' + text + ']:', r?.slice(0,50));
  return r;
}

async function getState() {
  const r = await evalJS('JSON.stringify({url:location.href, text:document.body.innerText.slice(0,200), btns:Array.from(document.querySelectorAll("button")).map(b=>b.innerText.trim().slice(0,25)).filter(t=>t).slice(0,10)})');
  try { return JSON.parse(r); } catch(e) { return {url:'', text:r||'', btns:[]}; }
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
  
  console.log('\n🚀 Bypassing onboarding via store injection...');
  
  // Inject state directly into Zustand persisted storage
  await evalJS(`
    // Set onboarding complete + psychProfile + course = null (so course guard shows)
    localStorage.setItem('boosta_onboarded', 'true');
    localStorage.setItem('boosta_psych_profile', JSON.stringify({
      trigger: 'Стресс на работе',
      selfTalk: 'Спокойно и мягко',
      motivation: 'Видимый прогресс',
      style: 'Точный'
    }));
    // Patch the zustand persisted store to set onboarded=true, activeCourse=null
    try {
      const storeKey = 'state-os-core-v1';
      const existing = localStorage.getItem(storeKey);
      const parsed = existing ? JSON.parse(existing) : {};
      // Set activeCourse to null so course guard shows
      if (parsed.state) {
        parsed.state.course = { activeCourse: null };
        parsed.state.onboarding = { ...parsed.state.onboarding, isComplete: true };
      } else {
        parsed.state = { course: { activeCourse: null }, onboarding: { isComplete: true } };
      }
      localStorage.setItem(storeKey, JSON.stringify(parsed));
      'store patched';
    } catch(e) { 'error: ' + e.message; }
  `);
  
  // Navigate to /boosta
  send('Page.navigate', {url:'http://localhost:8082/boosta'});
  await sleep(3000);
  
  let state = await getState();
  console.log('At /boosta:', state.url, '|', state.text.slice(0,100));
  console.log('Buttons:', state.btns.join(' | '));
  await screenshot('s1_course_guard.jpg');
  
  // Should see course setup screen — pick "Энергия"
  console.log('\n🎯 Selecting course: Энергия');
  await clickText('Энергия');
  await sleep(800);
  await screenshot('s2_energy_selected.jpg');
  
  await clickText('Начать курс');
  await sleep(2500);
  
  state = await getState();
  console.log('After course select:', state.url, '|', state.text.slice(0,120));
  await screenshot('s3_dual_path.jpg');
  
  ws.close();
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
