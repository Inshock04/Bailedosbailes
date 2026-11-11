require('dotenv').config();
const token = process.env.MERCADOPAGO_ACCESS_TOKEN || process.env.MP_ACCESS_TOKEN;

async function run() {
  try {
    const res = await fetch('https://mcp.mercadopago.com/mcp', {
      headers: {
        'Accept': 'application/json, text/event-stream',
        'Authorization': 'Bearer ' + token
      }
    });
    console.log('Status:', res.status);
    if (res.status === 200) {
      console.log('Connected! Reading stream...');
      const reader = res.body.getReader();
      let count = 0;
      let endpoint = null;
      while (count < 2) {
        const {value, done} = await reader.read();
        if (done) break;
        const chunk = new TextDecoder().decode(value);
        console.log('Chunk:', chunk);
        if (chunk.includes('endpoint')) {
           const match = chunk.match(/endpoint[^"]+"([^"]+)"/);
           if (match) endpoint = match[1];
        }
        count++;
      }
      reader.cancel();
      console.log('Endpoint found:', endpoint);

      if (endpoint) {
        console.log('Sending tools/list to endpoint...');
        // ensure endpoint is absolute URL
        const url = new URL(endpoint, 'https://mcp.mercadopago.com');
        const rpcRes = await fetch(url.toString(), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
          },
          body: JSON.stringify({
            jsonrpc: '2.0',
            id: 1,
            method: 'tools/list',
            params: {}
          })
        });
        const rpcText = await rpcRes.text();
        console.log('RPC Response:', rpcText);
      }
    } else {
      const text = await res.text();
      console.log('Response:', text);
    }
  } catch (err) {
    console.error('Error:', err);
  }
}
run();
