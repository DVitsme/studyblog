@AGENTS.md

## ⚠️ TODO before launch — rotate the initial admin password

A generated **initial owner password** was set during Phase 1 (local `.dev.vars` + the prod Worker
secret `AUTH_OWNER_HASH`) so login is testable now. **Rotate it before launch.** The plaintext is
intentionally NOT stored in this committed file (it would leak to git/GitHub) — it lives in the
assistant's session memory and was shared in chat. Rotate via `plan/04-auth.md` §4: regenerate the
`scrypt:<salt>:<hash>` value, `wrangler secret put AUTH_OWNER_HASH`, and update `.dev.vars`.
