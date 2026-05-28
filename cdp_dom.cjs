const WebSocket = require('ws');

// First get fresh tab list
const http = require('http');
http.get('http://localhost:9222/json', res => {
  let data = '';
  res.on('data', d => data += d);
  res.on('end', () => {
    const tabs = JSON.parse(data);
    const tab = tabs.find(t => t.url && t.url.includes('8081'));
    if (!tab) { console.log('No tab found. Tabs:', tabs.map(t=>t.url).join('\n')); process.exit(1); }
    
    const ws = new WebSocket(tab.webSocketDebuggerUrl);
    let id = 1;
    const send = (method, params) => ws.send(JSON.stringify({id:id++, method, params: params||{}}));
    
    ws.on('open', () => {
      // Set a proper viewport
      send('Emulation.setDeviceMetricsOverride', {width:430, height:932, deviceScaleFactor:2, mobile:true});
      setTimeout(() => {
        // Get the page body text to verify what's rendered
        send('Runtime.evaluate', {expression: `
          JSON.stringify({
            title: document.title,
            bodyText: document.body.innerText.slice(0, 1000),
            url: location.href,
            buttons: Array.from(document.querySelectorAll('button')).map(b=>b.innerText.slice(0,30)).slice(0,10),
            h1: document.querySelector('h1')?.innerText
          })
        `});
      }, 1000);
    });
    
    ws.on('message', data => {
      const msg = JSON.parse(data.toString());
      if (msg.result && msg.result.result && msg.result.result.value) {
        try {
          const info = JSON.parse(msg.result.result.value);
          console.log('=== PAGE STATE ===');
          console.log('URL:', info.url);
          console.log('Title:', info.title);
          console.log('H1:', info.h1);
          console.log('Buttons:', info.buttons.join(' | '));
          console.log('Body text preview:', info.bodyText);
        } catch(e) {
          console.log('Raw result:', msg.result.result.value);
        }
        ws.close();
        process.exit(0);
      }
    });
    
    ws.on('error', e => { console.error(e.message); process.exit(1); });
    setTimeout(() => process.exit(1), 10000);
  });
});
