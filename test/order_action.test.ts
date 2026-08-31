import assert from "node:assert/strict";
import test from "node:test";
import { decideOrderAction } from "../src/order_action.js";

test("spoken checkout confirmation releases fulfillment and sends a receipt", () => {
  const action = decideOrderAction(
    { orderId: "order-1042" },
    { transcript: "Yes, confirm my checkout.", intent: "CONFIRM_CHECKOUT" }
  );

  assert.deepEqual(action, {
    orderId: "order-1042",
    fulfillmentStatus: "READY_TO_FULFILL",
    receipt: "SEND",
    customerUpdate: "Checkout confirmed; fulfillment can begin.",
    transcript: "Yes, confirm my checkout."
  });
});

test("a status question cannot release fulfillment", () => {
  const action = decideOrderAction(
    { orderId: "order-1042" },
    { transcript: "Where is my order?", intent: "ASK_STATUS" }
  );

  assert.equal(action.fulfillmentStatus, "AWAITING_CUSTOMER");
  assert.equal(action.receipt, "HOLD");
});
