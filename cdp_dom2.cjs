const WebSocket = require('ws');
const http = require('http');

http.get('http://localhost:9222/json', res => {
  let data = '';
  res.on('data', d => data += d);
  res.on('end', () => {
    const tabs = JSON.parse(data);
    const tab = tabs.find(t => t.url && t.url.includes('8081'));
    if (!tab) { console.log('No tab at 8081. All:', tabs.map(t=>t.url)); process.exit(1); }
    
    const ws = new WebSocket(tab.webSocketDebuggerUrl);
    let id = 1;
    const results = [];
    const send = (method, params) => ws.send(JSON.stringify({id:id++, method, params: params||{}}));
    
    ws.on('open', () => {
      // Enable console
      send('Runtime.enable');
      // Get console errors
      send('Runtime.evaluate', {expression: `
        (() => {
          const errs = window.__errors || [];
          return JSON.stringify({
            innerHTML: document.getElementById('root')?.innerHTML.slice(0,500) || 'no root',
            bodyChildren: document.body.children.length,
            hasRoot: !!document.getElementById('root'),
            viewport: window.innerWidth + 'x' + window.innerHeight,
            localStorage: Object.keys(localStorage).join(','),
            appText: Array.from(document.querySelectorAll('[class]')).map(e=>e.tagName+':'+e.className.slice(0,20)).slice(0,5).join('; ')
          });
        })()
      `});
    });
    
    ws.on('message', data => {
      const msg = JSON.parse(data.toString());
      if (msg.result?.result?.value) {
        try {
          const info = JSON.parse(msg.result.result.value);
          console.log('=== RENDER STATE ===');
          Object.entries(info).forEach(([k,v]) => console.log(k+':', v));
        } catch(e) { console.log('val:', msg.result.result.value); }
        ws.close();
        process.exit(0);
      }
    });
    
    ws.on('error', e => { console.error(e.message); process.exit(1); });
    setTimeout(() => { console.log('timeout'); process.exit(1); }, 8000);
  });
});
