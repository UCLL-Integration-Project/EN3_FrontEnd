/* eslint-disable @typescript-eslint/no-require-imports */
const { createServer } = require('https');
const { parse } = require('url');
const next = require('next');
const fs = require('fs');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

// Read the OKD-generated certificates mounted via the Deployment YAML
const httpsOptions = {
  key: fs.readFileSync('/etc/tls/private/tls.key'),
  cert: fs.readFileSync('/etc/tls/private/tls.crt'),
};

// Force the port to 8080 to match your frontend Pod configuration
const PORT = process.env.PORT || 8080;

app.prepare().then(() => {
  createServer(httpsOptions, (req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  }).listen(PORT, (err) => {
    if (err) throw err;
    console.log(`> Next.js securely listening for HTTPS on port ${PORT}`);
  });
});