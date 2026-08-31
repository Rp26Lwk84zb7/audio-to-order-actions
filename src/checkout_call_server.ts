import { createServer } from "node:http";
import { ZodError } from "zod";
import { checkoutCallSchema } from "./order_action.js";
import { transcribeAndAct } from "./checkout_call_agent.js";

const port = Number(process.env.PORT ?? 3000);

const server = createServer(async (request, response) => {
  response.setHeader("content-type", "application/json");
  if (request.method !== "POST" || request.url !== "/checkout-calls") {
    response.writeHead(404).end(JSON.stringify({ error: "Route not found" }));
    return;
  }

  try {
    const chunks: Buffer[] = [];
    for await (const chunk of request) chunks.push(Buffer.from(chunk));
    const call = checkoutCallSchema.parse(JSON.parse(Buffer.concat(chunks).toString("utf8")));
    const action = await transcribeAndAct(call);
    response.writeHead(200).end(JSON.stringify(action));
  } catch (error) {
    if (error instanceof ZodError || error instanceof SyntaxError) {
      response.writeHead(400).end(JSON.stringify({ error: "Invalid checkout call", details: String(error) }));
      return;
    }
    console.error(error);
    response.writeHead(502).end(JSON.stringify({ error: "The checkout call could not be processed" }));
  }
});

server.listen(port, () => console.log(`Checkout call service listening on http://localhost:${port}`));
