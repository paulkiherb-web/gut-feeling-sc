const WebSocket = require('ws');
const http = require('http');

http.get('http://localhost:9222/json', res => {
  let data = '';
  res.on('data', d => data += d);
  res.on('end', () => {
    const tabs = JSON.parse(data);
    const tab = tabs.find(t => t.url && t.url.includes('8081'));
    const ws = new WebSocket(tab.webSocketDebuggerUrl);
    let id = 1;
    const msgs = [];
    const send = (method, params) => ws.send(JSON.stringify({id:id++, method, params: params||{}}));
    
    ws.on('open', () => {
      send('Runtime.enable');
      send('Log.enable');
      // Navigate to force a reload
      send('Page.navigate', {url: 'http://localhost:8081/boosta'});
      setTimeout(() => {
        send('Runtime.evaluate', {expression: `
          (() => {
            // Check for React errors
            const rootEl = document.getElementById('root');
            return JSON.stringify({
              rootInner: rootEl ? rootEl.innerHTML.length : -1,
              bodyText: document.body.innerText.slice(0, 300),
              errorBoundary: document.querySelector('[data-error]')?.innerText,
              scripts: Array.from(document.querySelectorAll('script[src]')).map(s=>s.src.slice(-30)).slice(0,5)
            });
          })()
        `});
      }, 3000);
    });
    
    const consoleErrors = [];
    ws.on('message', raw => {
      const msg = JSON.parse(raw.toString());
      if (msg.method === 'Log.entryAdded' && msg.params?.entry?.level === 'error') {
        consoleErrors.push(msg.params.entry.text);
      }
      if (msg.result?.result?.value && msg.id >= 4) {
        try {
          const info = JSON.parse(msg.result.result.value);
          console.log('=== PAGE AFTER RELOAD ===');
          console.log('Root innerHTML length:', info.rootInner);
          console.log('Body text:', info.bodyText);
          console.log('Scripts:', info.scripts.join(', '));
          console.log('Console errors:', consoleErrors.slice(0,5).join('\n') || 'none');
        } catch(e) { console.log(msg.result.result.value); }
        ws.close();
        process.exit(0);
      }
    });
    
    ws.on('error', e => { console.error(e.message); process.exit(1); });
    setTimeout(() => { console.log('timeout, errors:', consoleErrors.join('\n')); process.exit(1); }, 12000);
  });
});
