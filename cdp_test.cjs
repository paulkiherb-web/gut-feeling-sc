const WebSocket = require('ws');
const fs = require('fs');

const ws = new WebSocket('ws://localhost:9222/devtools/page/99C3068A12B5822B8675BAB988FFAF1F');
let id = 1;
let phase = 0;
const send = (method, params) => { ws.send(JSON.stringify({id:id++,method,params:params||{}})); };

ws.on('open', () => {
  send('Runtime.evaluate', {expression: 'localStorage.clear(); location.reload(); "done"'});
});

ws.on('message', (data) => {
  const msg = JSON.parse(data.toString());
  if (msg.result && msg.result.data) {
    const buf = Buffer.from(msg.result.data, 'base64');
    const label = phase === 0 ? 'fresh' : phase === 1 ? 'course-selected' : phase === 2 ? 'tokens-logged' : 'corrections';
    fs.writeFileSync('C:/boosta/test-' + label + '.png', buf);
    console.log('Screenshot saved: test-' + label + '.png (' + buf.length + ' bytes)');
    phase++;
    
    if (phase === 1) {
      // Select Energy course
      setTimeout(() => {
        send('Runtime.evaluate', {expression: `
          // Find and click the Energy course button
          const btns = Array.from(document.querySelectorAll('button'));
          const energyBtn = btns.find(b => b.textContent.includes('Энергия'));
          if (energyBtn) { energyBtn.click(); "clicked energy"; } else { "not found: " + btns.map(b=>b.textContent.slice(0,20)).join("|"); }
        `});
        setTimeout(() => send('Page.captureScreenshot', {format:'png'}), 1500);
      }, 500);
    } else if (phase === 2) {
      // Log alcohol token via localStorage manipulation
      setTimeout(() => {
        send('Runtime.evaluate', {expression: `
          // Click confirm button
          const btns = Array.from(document.querySelectorAll('button'));
          const confirmBtn = btns.find(b => b.textContent.includes('Начать курс') || b.textContent.includes('→'));
          if (confirmBtn) { confirmBtn.click(); "clicked confirm"; } else { btns.length + " buttons, no confirm"; }
        `});
        setTimeout(() => send('Page.captureScreenshot', {format:'png'}), 2000);
      }, 500);
    } else if (phase === 3) {
      ws.close();
      process.exit(0);
    }
  } else if (msg.result && msg.result.result && phase === 0) {
    // After reload, wait then screenshot
    setTimeout(() => send('Page.captureScreenshot', {format:'png'}), 3000);
  }
});

ws.on('error', e => { console.error('WS error:', e.message); process.exit(1); });
setTimeout(() => { console.error('Timeout after 30s'); process.exit(1); }, 30000);
