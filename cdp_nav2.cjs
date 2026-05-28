const WebSocket = require('ws');
const http = require('http');
const fs = require('fs');

http.get('http://localhost:9222/json', res => {
  let data = '';
  res.on('data', d => data += d);
  res.on('end', () => {
    const tabs = JSON.parse(data);
    const tab = tabs.find(t => !t.url.includes('devtools')) || tabs[0];
    const ws = new WebSocket(tab.webSocketDebuggerUrl);
    let id = 1;
    const send = (m, p) => { ws.send(JSON.stringify({id:id++, method:m, params:p||{}})); return id-1; };
    
    ws.on('open', () => {
      send('Emulation.setDeviceMetricsOverride', {width:430, height:932, deviceScaleFactor:1, mobile:true});
      send('Page.navigate', {url:'http://localhost:8082/boosta'});
      
      // Just wait 6 seconds then get state + screenshot
      setTimeout(() => {
        send('Runtime.evaluate', {expression: `
          JSON.stringify({
            url: location.href,
            rootLen: document.getElementById('root')?.innerHTML.length || 0,
            bodyText: document.body.innerText.slice(0,500),
            buttons: Array.from(document.querySelectorAll('button')).map(b=>b.innerText.trim().slice(0,30)).filter(t=>t).slice(0,10)
          })
        `});
      }, 6000);
      
      setTimeout(() => {
        send('Page.captureScreenshot', {format:'jpeg', quality:80});
      }, 6500);
    });
    
    ws.on('message', raw => {
      const msg = JSON.parse(raw.toString());
      
      if (msg.result?.result?.value && msg.result.result.value.startsWith('{')) {
        try {
          const info = JSON.parse(msg.result.result.value);
          console.log('URL:', info.url);
          console.log('Root len:', info.rootLen);
          console.log('Body:', info.bodyText);
          console.log('Buttons:', info.buttons.join(' | '));
        } catch(e) { console.log(e.message); }
      }
      
      if (msg.result?.data) {
        const buf = Buffer.from(msg.result.data, 'base64');
        fs.writeFileSync('screen1.jpg', buf);
        console.log('Screenshot:', buf.length, 'bytes');
        ws.close();
        process.exit(0);
      }
    });
    
    ws.on('error', e => { console.error(e.message); process.exit(1); });
    setTimeout(() => process.exit(1), 15000);
  });
});
