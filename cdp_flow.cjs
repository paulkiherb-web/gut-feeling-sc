const WebSocket = require('ws');
const http = require('http');
const fs = require('fs');

let id = 1;
let ws;
let shotCount = 0;

const send = (m, p) => { ws.send(JSON.stringify({id:id++, method:m, params:p||{}})); return id-1; };
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function saveScreenshot(name) {
  return new Promise((resolve) => {
    const ssId = send('Page.captureScreenshot', {format:'jpeg', quality:80});
    const handler = (raw) => {
      const msg = JSON.parse(raw.toString());
      if (msg.id === ssId && msg.result?.data) {
        ws.removeListener('message', handler);
        const buf = Buffer.from(msg.result.data, 'base64');
        fs.writeFileSync(name, buf);
        console.log(`Saved ${name} (${buf.length} bytes)`);
        resolve();
      }
    };
    ws.on('message', handler);
    setTimeout(resolve, 3000);
  });
}

async function evalJS(expr) {
  return new Promise((resolve) => {
    const eid = send('Runtime.evaluate', {expression: expr});
    const handler = (raw) => {
      const msg = JSON.parse(raw.toString());
      if (msg.id === eid) {
        ws.removeListener('message', handler);
        resolve(msg.result?.result?.value);
      }
    };
    ws.on('message', handler);
    setTimeout(() => resolve(null), 5000);
  });
}

async function clickButton(text) {
  const result = await evalJS(`
    (() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const btn = btns.find(b => b.innerText.trim().includes('${text}'));
      if (btn) { btn.click(); return 'clicked: ' + btn.innerText.trim().slice(0,30); }
      return 'not found. buttons: ' + btns.map(b=>b.innerText.trim().slice(0,15)).join(', ');
    })()
  `);
  console.log('Click result:', result);
  return result;
}

async function main() {
  const data = await new Promise(r => {
    http.get('http://localhost:9222/json', res => {
      let d = '';
      res.on('data', chunk => d += chunk);
      res.on('end', () => r(d));
    });
  });
  
  const tabs = JSON.parse(data);
  const tab = tabs.find(t => !t.url.includes('devtools')) || tabs[0];
  ws = new WebSocket(tab.webSocketDebuggerUrl);
  
  await new Promise(r => ws.on('open', r));
  send('Emulation.setDeviceMetricsOverride', {width:430, height:932, deviceScaleFactor:1, mobile:true});
  
  // Step 1 — already on onboarding mirror screen
  await sleep(1000);
  console.log('\n--- Step 1: Onboarding Mirror ---');
  await clickButton('Понял механику');
  await sleep(2000);
  await saveScreenshot('step2_biometrics.jpg');
  
  // Step 2 — Biometrics — fill in some data
  console.log('\n--- Step 2: Biometrics ---');
  const step2Body = await evalJS('document.body.innerText.slice(0,200)');
  console.log('Step 2 body:', step2Body);
  
  // Fill age, weight, height
  await evalJS(`
    const inputs = document.querySelectorAll('input[type="number"], input[type="text"]');
    console.log('inputs found:', inputs.length);
    inputs.forEach((inp, i) => {
      const label = inp.closest('div')?.querySelector('label')?.innerText || inp.placeholder || '';
      console.log(i, label);
    });
    // Try to fill common fields
    const allInputs = Array.from(document.querySelectorAll('input'));
    allInputs.forEach(inp => {
      if (inp.placeholder?.includes('возраст') || inp.id?.includes('age')) {
        inp.value = '35'; inp.dispatchEvent(new Event('input', {bubbles:true}));
      }
      if (inp.placeholder?.includes('вес') || inp.id?.includes('weight')) {
        inp.value = '82'; inp.dispatchEvent(new Event('input', {bubbles:true}));
      }
      if (inp.placeholder?.includes('рост') || inp.id?.includes('height')) {
        inp.value = '180'; inp.dispatchEvent(new Event('input', {bubbles:true}));
      }
    });
  `);
  
  await clickButton('Далее');
  await sleep(2000);
  await saveScreenshot('step3.jpg');
  
  const step3Body = await evalJS('document.body.innerText.slice(0,150)');
  console.log('Step 3 body:', step3Body);
  
  // Continue through remaining steps
  for (let i = 0; i < 7; i++) {
    await clickButton('Далее');
    await sleep(1500);
  }
  
  await saveScreenshot('after_onboarding.jpg');
  const finalBody = await evalJS('JSON.stringify({url: location.href, text: document.body.innerText.slice(0,300), buttons: Array.from(document.querySelectorAll("button")).map(b=>b.innerText.trim().slice(0,25)).filter(t=>t).slice(0,8)})');
  console.log('\nAfter onboarding:', finalBody);
  
  ws.close();
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
