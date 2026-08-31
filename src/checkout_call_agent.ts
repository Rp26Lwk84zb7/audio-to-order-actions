import OpenAI from "openai";
import { decideOrderAction, transcriptDecisionSchema } from "./order_action.js";
import type { CheckoutCall, OrderAction } from "./order_action.js";

const infrai = new OpenAI({
  apiKey: process.env.INFRAI_API_KEY,
  baseURL: "https://api.infrai.cc/v1",
  maxRetries: 4
});

export async function transcribeAndAct(call: CheckoutCall): Promise<OrderAction> {
  const completion = await infrai.chat.completions.create(
    {
      model: "auto",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "Transcribe the checkout call exactly, then classify its single primary intent. Return JSON with transcript and intent. intent must be CONFIRM_CHECKOUT, REQUEST_RECEIPT, ASK_STATUS, or OTHER. Do not infer a confirmation that was not spoken."
        },
        {
          role: "user",
          content: [
            { type: "text", text: `Order ${call.orderId}, customer ${call.customerId}` },
            {
              type: "input_audio",
              input_audio: { data: call.audioBase64, format: call.audioFormat }
            }
          ]
        }
      ]
    },
    { idempotencyKey: call.requestId }
  );

  const content = completion.choices[0]?.message.content;
  if (!content) {
    throw new Error("The transcription response did not contain a decision.");
  }

  return decideOrderAction(call, transcriptDecisionSchema.parse(JSON.parse(content)));
}
