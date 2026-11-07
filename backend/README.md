# Uplocket lookup adapter

`lookup-worker.mjs` is a read-only adapter for `POST https://uplocket.io.vn/api/locket/lookup`.
It provides CORS for the GitHub Pages origin and filters the provider response to:
`username`, `name`, `avatar`, `is_gold`, `package_name`, `expires_at`, `checked_at`, and source labels.
UIDs, activation codes, tokens, holder records and order actions are never forwarded.

The backend is deployed at `https://anhhphuongg-lookup-api.biggerdotterel.chatgpt.site`.
It starts owner-private through Sites. Changing it to public requires the owner's explicit instruction;
never put a Sites service token in the browser. Public deployment of the lookup route is needed before
enabling it on the public GitHub Pages frontend.

`assets/lookup-config.js` currently enables lookup only in local preview. After the owner authorizes
public API access and that route passes a live lookup check, set `enabled: true` for production.
The frontend submits only the username after the visitor clicks the lookup button and discloses Uplocket
as the destination. An upstream failure keeps Gold status unknown. A false `is_gold` value offers a link
to upgrade on Uplocket; this project does not grant subscriptions or create orders.

Status is explicitly attributed to Uplocket and is not represented as an official Locket subscription check.
The requested package, provider package and provider expiry are shown separately.
The existing DNS file remains a generic site download, not a profile issued by the provider for the account.

Tests: `node --test backend/lookup-worker.test.mjs`.
Local preview with live read-only requests: `node backend/dev-server.mjs`.
For UI checks with deterministic local fixtures, set `LOOKUP_FIXTURES=1` before running the preview;
these fixtures run only in the local Node preview and are not part of the deployed Worker.

The Worker keeps sanitized results in memory for 30 seconds and applies a per-isolate request budget.
That budget is not a durable distributed abuse protection service.
