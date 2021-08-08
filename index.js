const http = require('http');

// https://api.wort.ir/api/vocab/search/de-fa/de?query=gut
// https://api.wort.ir/api/vocab/details/de?slug=/woerterbuch/deutsch-persisch/gut
const server = http.createServer((req, res) => {
      const word = req.url.replace(/\//g, '');
      console.log({word});

      res.writeHead(200);
      res.end('Hello, World!');
});

server.listen(80, '0.0.0.0');
console.log('listening on 0.0.0.0:80/');

