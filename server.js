// ============================================================
//  PiForge — Local Node.js Webserver
//  Draai met: node server.js
//  Open dan: http://localhost:3000
// ============================================================

const http = require('http');
const fs   = require('fs');
const path = require('path');

const PORT      = process.env.PORT || 3000;
const PUBLIC    = path.join(__dirname, 'public');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css':  'text/css',
  '.js':   'application/javascript',
  '.json': 'application/json',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif':  'image/gif',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
  '.woff': 'font/woff',
  '.woff2':'font/woff2',
};

const server = http.createServer((req, res) => {
  let urlPath = req.url.split('?')[0]; // strip query strings

  // Redirect root to index.html
  if (urlPath === '/') urlPath = '/index.html';

  const filePath = path.join(PUBLIC, urlPath);
  const ext      = path.extname(filePath).toLowerCase();
  const mime     = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, data) => {
    if (err) {
      if (err.code === 'ENOENT') {
        // 404 — serve index.html as fallback (SPA-style)
        fs.readFile(path.join(PUBLIC, 'index.html'), (err2, html) => {
          if (err2) {
            res.writeHead(500);
            res.end('Server error');
          } else {
            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end(html);
          }
        });
      } else {
        res.writeHead(500);
        res.end('Server error: ' + err.message);
      }
      return;
    }

    // Security headers
    res.writeHead(200, {
      'Content-Type':  mime,
      'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=3600',
      'X-Content-Type-Options': 'nosniff',
    });
    res.end(data);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  const ifaces = require('os').networkInterfaces();
  const localIP = Object.values(ifaces)
    .flat()
    .find(i => i.family === 'IPv4' && !i.internal)?.address || 'onbekend';

  console.log('\n╔════════════════════════════════════════╗');
  console.log('║         PiForge Webserver              ║');
  console.log('╠════════════════════════════════════════╣');
  console.log(`║  Lokaal:    http://localhost:${PORT}       ║`);
  console.log(`║  Netwerk:   http://${localIP}:${PORT}  ║`);
  console.log('║  Stop:      Ctrl + C                   ║');
  console.log('╚════════════════════════════════════════╝\n');
});
