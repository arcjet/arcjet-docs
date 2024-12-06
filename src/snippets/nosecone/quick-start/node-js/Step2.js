import nosecone from "nosecone";
import * as http from "node:http";

const server = http.createServer(async function (req, res) {
  res.setHeaders(nosecone());
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("Hello world");
});

server.listen(3000);
