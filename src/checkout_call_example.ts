import { readFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { checkoutCallSchema } from "./order_action.js";
import { transcribeAndAct } from "./checkout_call_agent.js";

const audioPath = process.argv[2];
if (!audioPath) {
  throw new Error("Run with an MP3 path: npm run example -- ./checkout-confirmation.mp3");
}

const call = checkoutCallSchema.parse({
  orderId: "order-1042",
  customerId: "customer-88",
  audioBase64: (await readFile(audioPath)).toString("base64"),
  audioFormat: "mp3",
  requestId: randomUUID()
});

console.log(JSON.stringify(await transcribeAndAct(call), null, 2));
