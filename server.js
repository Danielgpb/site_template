const http = require('http');
const fs = require('fs');
const path = require('path');

const mimes = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp'
};

http.createServer((req, res) => {
  let u = decodeURIComponent(req.url.split('?')[0]);
  if (u.endsWith('/')) u += 'index.html';
  let f = path.join(__dirname, u);
  if (!path.extname(f)) f = path.join(f, 'index.html');
  fs.readFile(f, (e, d) => {
    if (e) { res.writeHead(404); res.end('Not found'); return; }
    res.writeHead(200, { 'Content-Type': mimes[path.extname(f)] || 'application/octet-stream' });
    res.end(d);
  });
}).listen(9000, '0.0.0.0', () => console.log('Server running at http://0.0.0.0:9000'));
