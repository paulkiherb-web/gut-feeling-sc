const WebSocket = require('ws');
const http = require('http');
const fs = require('fs');

// Take screenshot helper using CDP
function takeScreenshot(ws, id, filename, callback) {
  ws.send(JSON.stringify({id, method: 'Page.captureScreenshot', params: {format:'jpeg', quality:85}}));
}

http.get('http://localhost:9222/json', res => {
  let data = '';
  res.on('data', d => data += d);
  res.on('end', () => {
    const tabs = JSON.parse(data);
    console.log('Tabs:', tabs.map(t=>t.url).join('\n'));
    
    // Use first non-devtools tab
    const tab = tabs.find(t => !t.url.includes('devtools') && !t.url.includes('chrome')) || tabs[0];
    console.log('Using tab:', tab.url);
    
    const ws = new WebSocket(tab.webSocketDebuggerUrl);
    let id = 1;
    let screenshotCount = 0;
    const send = (m, p) => { ws.send(JSON.stringify({id:id++, method:m, params:p||{}})); return id-1; };
    
    ws.on('open', () => {
      // Set mobile viewport
      send('Emulation.setDeviceMetricsOverride', {width:430, height:932, deviceScaleFactor:1, mobile:true});
      // Navigate to new port
      send('Page.navigate', {url:'http://localhost:8082/boosta'});
      console.log('Navigated to 8082/boosta');
    });
    
    ws.on('message', raw => {
      const msg = JSON.parse(raw.toString());
      
      if (msg.method === 'Page.frameStopLoading') {
        console.log('Page loaded');
        setTimeout(() => {
          // Check the page state
          const evalId = send('Runtime.evaluate', {expression: `
            JSON.stringify({
              url: location.href,
              rootLen: document.getElementById('root')?.innerHTML.length,
              bodyText: document.body.innerText.slice(0,400),
              buttons: Array.from(document.querySelectorAll('button')).map(b=>b.innerText.trim().slice(0,25)).filter(t=>t).slice(0,8),
              hasError: !!document.querySelector('.error') 
            })
          `});
          
          // Also take a screenshot
          setTimeout(() => {
            const ssId = send('Page.captureScreenshot', {format:'jpeg', quality:80});
            console.log('Screenshot request id:', ssId);
          }, 500);
        }, 2000);
      }
      
      if (msg.result?.result?.value && typeof msg.result.result.value === 'string' && msg.result.result.value.startsWith('{')) {
        try {
          const info = JSON.parse(msg.result.result.value);
          console.log('\n=== PAGE STATE ===');
          console.log('URL:', info.url);
          console.log('Root innerHTML len:', info.rootLen);
          console.log('Body text:', info.bodyText);
          console.log('Buttons:', info.buttons.join(' | '));
        } catch(e) {}
      }
      
      if (msg.result?.data) {
        // Screenshot data
        const buf = Buffer.from(msg.result.data, 'base64');
        const fname = `screen_${++screenshotCount}.jpg`;
        fs.writeFileSync(fname, buf);
        console.log(`\nScreenshot saved: ${fname} (${buf.length} bytes)`);
        if (screenshotCount >= 1) {
          ws.close();
          process.exit(0);
        }
      }
    });
    
    ws.on('error', e => { console.error('WS error:', e.message); process.exit(1); });
    setTimeout(() => { console.log('Timeout'); process.exit(1); }, 20000);
  });
});
