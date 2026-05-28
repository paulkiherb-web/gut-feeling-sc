const WebSocket = require('ws');
const http = require('http');
const fs = require('fs');

let id = 1;
let ws;
const send = (m, p) => { ws.send(JSON.stringify({id:id++, method:m, params:p||{}})); return id-1; };
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function screenshot(name) {
  return new Promise(resolve => {
    const ssId = send('Page.captureScreenshot', {format:'jpeg', quality:80});
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
  const r = await evalJS(`
    (() => {
      const all = Array.from(document.querySelectorAll('button, [role="button"]'));
      const el = all.find(e => e.innerText?.trim() === '${text}') 
                || all.find(e => e.innerText?.trim().includes('${text}'));
      if (el) { el.click(); return 'ok:' + el.innerText?.trim().slice(0,30); }
      return 'miss. btns: ' + all.map(e=>e.innerText?.trim().slice(0,20)).filter(t=>t).join(', ');
    })()
  `);
  console.log('  click [' + text + ']:', r?.slice(0,60));
  return r;
}

async function getState() {
  const r = await evalJS('JSON.stringify({url:location.href, text:document.body.innerText.slice(0,200), btns:Array.from(document.querySelectorAll("button")).map(b=>b.innerText.trim().slice(0,20)).filter(t=>t).slice(0,8)})');
  try { return JSON.parse(r); } catch(e) { return {url:'', text: r, btns:[]}; }
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
  send('Emulation.setDeviceMetricsOverride', {width:390, height:844, deviceScaleFactor:1, mobile:true});
  
  console.log('\n=== STEP 4: PSYCH PROFILE ===');
  // Select one from each group
  await clickText('Стресс на работе');
  await sleep(300);
  await clickText('Спокойно и мягко');
  await sleep(300);
  await clickText('Видимый прогресс');
  await sleep(300);
  await clickText('Точный');
  await sleep(300);
  await clickText('Голос понятен');
  await sleep(2000);
  
  let state = await getState();
  console.log('After psycho:', state.url, '|', state.text.slice(0,60));
  await screenshot('s5_diets.jpg');
  
  console.log('\n=== STEP 5: DIETS ===');
  // No selection required usually, just continue
  await clickText('Дальше');
  await sleep(2000);
  state = await getState();
  console.log('After diets:', state.text.slice(0,80));
  await screenshot('s6_rest.jpg');
  
  console.log('\n=== STEP 6: REST WINDOW ===');
  await clickText('Дальше');
  await sleep(2000);
  state = await getState();
  console.log('After rest:', state.text.slice(0,80));
  await screenshot('s7_ghost.jpg');
  
  console.log('\n=== STEP 7: GHOST BIRTH ===');
  // Wait a moment for the ghost birth animation
  await sleep(1500);
  await clickText('Дальше');
  await sleep(2000);
  state = await getState();
  console.log('After ghost:', state.text.slice(0,80));
  await screenshot('s8_token.jpg');
  
  console.log('\n=== STEP 8: FIRST TOKEN ===');
  await clickText('Дальше');
  await sleep(2500);
  state = await getState();
  console.log('After step8:', state.url, '|', state.text.slice(0,100));
  await screenshot('s_post_onboarding.jpg');
  
  // Should be at /boosta with course guard
  console.log('\n=== COURSE SETUP GUARD ===');
  state = await getState();
  console.log('URL:', state.url);
  console.log('Text:', state.text.slice(0,150));
  console.log('Buttons:', state.btns.join(' | '));
  
  // If course setup is showing, pick "Энергия" (Energy)
  await clickText('Энергия');
  await sleep(500);
  const afterCourse = await evalJS('JSON.stringify({url:location.href, text:document.body.innerText.slice(0,200), btns:Array.from(document.querySelectorAll("button")).map(b=>b.innerText.trim().slice(0,25)).filter(t=>t).slice(0,8)})');
  console.log('After clicking Энергия:', afterCourse?.slice(0,150));
  
  await clickText('Начать курс');
  await sleep(2000);
  
  state = await getState();
  console.log('\nFinal URL:', state.url);
  console.log('Final text:', state.text.slice(0,200));
  await screenshot('s_dual_path.jpg');
  
  ws.close();
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
