import nosecone from "nosecone";

Bun.serve({
  port: 3000,
  async fetch(req) {
    return new Response("Hello world", {
      headers: nosecone(),
    });
  },
});
