/* eslint-disable @typescript-eslint/no-require-imports */
const { createServer: createHttpsServer } = require('https');
const { createServer: createHttpServer } = require('http');
const { parse } = require('url');
const next = require('next');
const fs = require('fs');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev, dir: __dirname });
const handle = app.getRequestHandler();

// Use port 8080 to match Pod configuration
const PORT = process.env.PORT || 8080;

// Certificate paths (OKD/Kubernetes mounts)
const certPath = '/etc/tls/private/tls.crt';
const keyPath = '/etc/tls/private/tls.key';

let server;
let isHttps = false;

// DRY Request Handler
const requestHandler = (req, res) => {
  const parsedUrl = parse(req.url, true);
  handle(req, res, parsedUrl);
};

if (fs.existsSync(certPath) && fs.existsSync(keyPath)) {
  try {
    const httpsOptions = {
      key: fs.readFileSync(keyPath),
      cert: fs.readFileSync(certPath),
    };
    server = createHttpsServer(httpsOptions, requestHandler);
    isHttps = true;
    console.log('> Using HTTPS with certificates from /etc/tls/private/');
  } catch (err) {
    console.error('> Failed to load certificates, falling back to HTTP:', err);
    server = createHttpServer(requestHandler);
  }
} else {
  console.log('> Certificates not found, starting in HTTP mode (expected for local dev)');
  server = createHttpServer(requestHandler);
}

app.prepare().then(() => {
  server.listen(PORT, (err) => {
    if (err) throw err;
    const protocol = isHttps ? 'https' : 'http';
    console.log(`> Next.js listening on ${protocol}://localhost:${PORT}`);
  });
});

// Graceful Shutdown Handling for OKD/Kubernetes
const shutdown = (signal) => {
  console.log(`\n> Received ${signal}. Shutting down gracefully...`);
  if (server) {
    server.close((err) => {
      if (err) {
        console.error('> Error during shutdown:', err);
        process.exit(1);
      }
      console.log('> Closed all active connections. Exiting.');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
