# Vercel runtime audit — 2026-07-31

Read-only inspection of Vercel project `volleyball-club`.

## Deployment state

- Framework: Next.js
- Configured runtime: Node.js 24.x
- Latest deployment: `READY`
- Latest deployment target: preview (`target: null`)
- Production promotion/deployment was not performed during this work

## Runtime error groups, previous seven days

| Error | Count | Route | Interpretation |
|---|---:|---|---|
| Telegram Bot API `sendMessage` returned 400 | 45 | `/api/telegram` | Existing production bot delivery failure; inspect Telegram response description and target chat state before rollout |
| Telegram webhook failed | 45 | `/api/telegram` | Wrapper error caused by the same failed bot delivery |
| Duplicate training date (`23505`) | 1 | `/admin/trainings/new` | Existing single-training-per-date constraint rejected an organizer attempt |

The logs contain no participant phone numbers in these groups. The V2 logging
code continues to record only stable event names, outcome, sanitized code, and
latency.

These errors belong to the currently deployed legacy build, not the un-deployed
V2 working tree. They should be included in the pre-production smoke checklist:

1. send a bot message and verify Telegram accepts the configured target;
2. create/edit a training and verify duplicate-date feedback is understandable;
3. confirm the V2 preview remains clean before enabling production flags.
