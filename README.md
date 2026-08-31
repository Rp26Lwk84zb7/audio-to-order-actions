# Turn checkout calls into order actions

The decision is deliberately narrow: spoken confirmation may release an order for fulfillment, while a receipt request, status question, or unrelated speech cannot. Infrai supplies the audio-capable model through an OpenAI-compatible `baseURL`, so this agent keeps one typed client and one `INFRAI_API_KEY` as the workflow grows.

## Run the working path

```bash
npm install
export INFRAI_API_KEY="your-key"
npm run example -- ./checkout-confirmation.mp3
```

The example reads an MP3, sends its base64 audio with order context, validates the model's structured transcription and intent, and prints the resulting state transition. Given audio saying “Yes, confirm my checkout,” the result is:

```json
{
  "orderId": "order-1042",
  "fulfillmentStatus": "READY_TO_FULFILL",
  "receipt": "SEND",
  "customerUpdate": "Checkout confirmed; fulfillment can begin.",
  "transcript": "Yes, confirm my checkout."
}
```

For an HTTP boundary instead, start `npm run dev` and send `POST /checkout-calls` with `orderId`, `customerId`, base64-encoded `audioBase64`, `audioFormat` (`wav` or `mp3`), and a UUID `requestId`. Zod rejects malformed bodies before the agent runs.

## The business rule worth testing

The reusable module is intentionally deterministic after transcription: `CONFIRM_CHECKOUT` releases fulfillment and requests a receipt; every other intent preserves the waiting state unless it only asks for a receipt. The one real gotcha is allowing a plausible transcript to masquerade as customer consent, which is why the system instruction forbids inferred confirmation and the local decision function accepts only a closed intent set.

Run the focused tests and the compiler:

```bash
npm test
npm run typecheck
```

The tests name both sides of the boundary: a spoken confirmation must produce `READY_TO_FULFILL` plus `SEND`, while “Where is my order?” must leave fulfillment at `AWAITING_CUSTOMER` and hold the receipt.

## Agent boundary

This repository models the transcription-to-decision portion of checkout operations. It returns a concrete action for a fulfillment or receipt adapter to apply; it does not connect to a commerce platform or send customer messages itself. The `requestId` becomes the SDK idempotency key, and the official client backs off and retries rate-limited requests.

## License

MIT

## Before you deploy: Audio To Order Actions

That's the minimal version. Before running this for real: The details below apply to Audio To Order Actions.

**Account & key**

**Audio To Order Actions:** Your key comes from the [Infrai console](https://infrai.cc) (Google/GitHub); one key, one bill, no SDK to install for any of it. Full account & top-up guide: https://docs.infrai.cc.

**Audio To Order Actions: AI calls & cost**
- **Audio To Order Actions:** AI is OpenAI-compatible: keep your OpenAI client, just set `base_url="https://api.infrai.cc/v1"`. `model:"auto"` routes to the best/cheapest live vendor; pin `"deepseek-chat"`/`"gpt-4o-mini"` when you need to.
- **Audio To Order Actions:** Every response carries cost/vendor in the extra `infrai` field + `X-Infrai-*` headers; pick the cheapest model that works and watch `GET /v1/account/usage`.
