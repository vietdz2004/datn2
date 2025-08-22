const http = require('http');

function putStatus(id, status, lyDo = '') {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ status, lyDo });
    const options = {
      hostname: 'localhost',
      port: 5002,
      path: `/api/admin/orders/${id}/status`,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    };
    const req = http.request(options, (res) => {
      let body = '';
      res.setEncoding('utf8');
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          resolve({ statusCode: res.statusCode, body: json });
        } catch (e) {
          resolve({ statusCode: res.statusCode, body });
        }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

(async () => {
  try {
    const id = process.argv[2] || '168';
    const status = process.argv[3] || 'da_xac_nhan';
    const lyDo = process.argv[4] || '';
    const result = await putStatus(id, status, lyDo);
    console.log('Response:', JSON.stringify(result, null, 2));
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
})();
