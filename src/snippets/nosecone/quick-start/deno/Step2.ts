import nosecone from "npm:nosecone";

Deno.serve({ port: 3000 }, async (req) => {
  return new Response("Hello world", {
    headers: nosecone(),
  });
});
