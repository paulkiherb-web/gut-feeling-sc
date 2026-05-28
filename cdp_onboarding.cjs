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
        console.log(`📸 ${name} (${buf.length}b)`);
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
    setTimeout(() => resolve(null), 4000);
  });
}

async function click(selector) {
  const r = await evalJS(`
    (() => {
      const el = document.querySelector('${selector}');
      if (el) { el.click(); return 'ok:' + el.innerText?.slice(0,20); }
      return 'not found: ${selector}';
    })()
  `);
  console.log('click', selector, '->', r);
}

async function clickText(text) {
  const r = await evalJS(`
    (() => {
      const all = Array.from(document.querySelectorAll('button, [role="button"]'));
      const el = all.find(e => e.innerText?.trim().includes('${text}'));
      if (el) { el.click(); return 'ok:' + el.innerText?.trim().slice(0,25); }
      return 'not found. have: ' + all.map(e=>e.innerText?.trim().slice(0,15)).filter(t=>t).join(', ');
    })()
  `);
  console.log('clickText [' + text + ']:', r);
}

async function fillInput(placeholder, value) {
  const r = await evalJS(`
    (() => {
      const inputs = Array.from(document.querySelectorAll('input'));
      const inp = inputs.find(i => i.placeholder?.includes('${placeholder}') || i.previousElementSibling?.innerText?.includes('${placeholder}') || i.closest('div')?.querySelector('label, span')?.innerText?.includes('${placeholder}'));
      if (inp) {
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
        nativeInputValueSetter.call(inp, '${value}');
        inp.dispatchEvent(new Event('input', {bubbles:true}));
        inp.dispatchEvent(new Event('change', {bubbles:true}));
        return 'set ' + inp.placeholder + '=' + inp.value;
      }
      const all = inputs.map(i=>i.placeholder||i.id||'').filter(t=>t).join(', ');
      return 'not found placeholder [${placeholder}]. inputs: ' + all;
    })()
  `);
  console.log('fill [' + placeholder + ']:', r);
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
  
  // --- STEP 2: Fill biometrics ---
  console.log('\n📋 Step 2: Biometrics');
  await fillInput('Рост', '180');
  await fillInput('рост', '180');
  await sleep(300);
  await fillInput('Вес', '82');
  await fillInput('вес', '82');
  await sleep(300);
  await clickText('Дальше');
  await sleep(2000);
  await screenshot('s3_condition.jpg');
  
  let body = await evalJS('document.body.innerText.slice(0,200)');
  console.log('Step 3:', body?.slice(0,100));
  
  // --- STEP 3: Health condition ---
  await clickText('Здоров');
  await sleep(500);
  await clickText('Дальше');
  await sleep(2000);
  await screenshot('s4_psycho.jpg');
  body = await evalJS('document.body.innerText.slice(0,200)');
  console.log('Step 4:', body?.slice(0,100));
  
  // --- STEP 4: Psych profile ---
  await clickText('Дальше');
  await sleep(2000);
  await screenshot('s5_diet.jpg');
  body = await evalJS('document.body.innerText.slice(0,200)');
  console.log('Step 5:', body?.slice(0,100));
  
  // --- STEP 5: Diets ---
  await clickText('Дальше');
  await sleep(2000);
  
  // --- STEP 6: Rest window ---
  await clickText('Дальше');
  await sleep(2000);
  
  // --- STEP 7: Ghost birth ---
  await clickText('Дальше');
  await sleep(2000);
  
  // --- STEP 8: First token ---
  await clickText('Дальше');
  await sleep(2000);
  
  // --- Should be at /boosta or course setup ---
  await screenshot('s_course_setup.jpg');
  body = await evalJS('JSON.stringify({url: location.href, text: document.body.innerText.slice(0,300), buttons: Array.from(document.querySelectorAll("button")).map(b=>b.innerText.trim().slice(0,30)).filter(t=>t).slice(0,10)})');
  console.log('\n🎯 After onboarding:', body);
  
  ws.close();
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
