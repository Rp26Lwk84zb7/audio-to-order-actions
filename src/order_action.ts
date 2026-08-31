import { z } from "zod";

export const checkoutCallSchema = z.object({
  orderId: z.string().min(1),
  customerId: z.string().min(1),
  audioBase64: z.string().min(1),
  audioFormat: z.enum(["wav", "mp3"]),
  requestId: z.string().uuid()
});

export type CheckoutCall = z.infer<typeof checkoutCallSchema>;

export const transcriptDecisionSchema = z.object({
  transcript: z.string().min(1),
  intent: z.enum(["CONFIRM_CHECKOUT", "REQUEST_RECEIPT", "ASK_STATUS", "OTHER"])
});

export type TranscriptDecision = z.infer<typeof transcriptDecisionSchema>;

export type OrderAction = {
  orderId: string;
  fulfillmentStatus: "READY_TO_FULFILL" | "AWAITING_CUSTOMER";
  receipt: "SEND" | "HOLD";
  customerUpdate: string;
  transcript: string;
};

export function decideOrderAction(
  call: Pick<CheckoutCall, "orderId">,
  decision: TranscriptDecision
): OrderAction {
  switch (decision.intent) {
    case "CONFIRM_CHECKOUT":
      return {
        orderId: call.orderId,
        fulfillmentStatus: "READY_TO_FULFILL",
        receipt: "SEND",
        customerUpdate: "Checkout confirmed; fulfillment can begin.",
        transcript: decision.transcript
      };
    case "REQUEST_RECEIPT":
      return {
        orderId: call.orderId,
        fulfillmentStatus: "AWAITING_CUSTOMER",
        receipt: "SEND",
        customerUpdate: "Receipt requested; checkout remains unchanged.",
        transcript: decision.transcript
      };
    case "ASK_STATUS":
      return {
        orderId: call.orderId,
        fulfillmentStatus: "AWAITING_CUSTOMER",
        receipt: "HOLD",
        customerUpdate: "Order status requested; no fulfillment change was made.",
        transcript: decision.transcript
      };
    case "OTHER":
      return {
        orderId: call.orderId,
        fulfillmentStatus: "AWAITING_CUSTOMER",
        receipt: "HOLD",
        customerUpdate: "The call was recorded without changing the order.",
        transcript: decision.transcript
      };
  }
}
