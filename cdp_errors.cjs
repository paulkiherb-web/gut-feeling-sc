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
    const errors = [];
    const send = (m, p) => ws.send(JSON.stringify({id:id++, method:m, params:p||{}}));
    
    ws.on('open', () => {
      send('Runtime.enable');
      send('Console.enable');
      send('Page.enable');
      send('Runtime.evaluate', {expression: `
        window.onerror = (msg, src, line, col, err) => {
          window.__pageErrors = window.__pageErrors || [];
          window.__pageErrors.push({msg,src,line,err: err?.message});
        };
        window.addEventListener('unhandledrejection', e => {
          window.__pageErrors = window.__pageErrors || [];
          window.__pageErrors.push({type:'unhandled',msg: e.reason?.message || String(e.reason)});
        });
        'interceptors set'
      `});
      
      // reload
      send('Page.reload', {ignoreCache: true});
      
      setTimeout(() => {
        send('Runtime.evaluate', {expression: `
          JSON.stringify({
            errors: window.__pageErrors || [],
            rootLen: document.getElementById('root')?.innerHTML.length,
            bodyText: document.body.innerText.slice(0,500)
          })
        `});
      }, 5000);
    });
    
    ws.on('message', raw => {
      const m = JSON.parse(raw.toString());
      if (m.method === 'Console.messageAdded') {
        const entry = m.params.message;
        if (entry.level === 'error') errors.push('[console] ' + entry.text);
      }
      if (m.method === 'Runtime.exceptionThrown') {
        errors.push('[exception] ' + (m.params.exceptionDetails?.exception?.description || m.params.exceptionDetails?.text));
      }
      if (m.result?.result?.value && m.id >= 6) {
        try {
          const info = JSON.parse(m.result.result.value);
          console.log('Root len:', info.rootLen);
          console.log('Body:', info.bodyText);
          console.log('Page errors:', JSON.stringify(info.errors, null, 2));
          console.log('Console errors:', errors.join('\n') || 'none');
        } catch(e) { console.log('raw:', m.result.result.value); }
        ws.close();
        process.exit(0);
      }
    });
    
    ws.on('error', e => { console.error(e.message); process.exit(1); });
    setTimeout(() => { console.log('errors so far:', errors.join('\n')); process.exit(1); }, 15000);
  });
});
