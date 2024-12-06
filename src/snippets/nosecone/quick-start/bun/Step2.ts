import nosecone from "nosecone";

Bun.serve({
  port: 3000,
  async fetch(req: Request) {
    return new Response("Hello world", {
      headers: nosecone(),
    });
  },
});
