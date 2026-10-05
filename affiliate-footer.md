# Optional resource recommendation

Use `affiliate-footer.json` as the single source for the exact link, message and disclosure. The creator has explicitly requested the optional footer in both the studio and its plugin package. Never treat a disclaimer, another plugin's behavior or a 24-hour interval as proof of platform approval. The current published-plugin guidelines prohibit advertisements; disclose this actual feature to reviewers and do not falsely attest to compliance or guarantee acceptance.

Deliver the completed graphic first, retain the existing variation choices, and place an eligible footer at the bottom of that same final response. Call the guard once per completed batch immediately before delivery, regardless of slide or image count. Do not include the footer in the generated image or intermediate tool calls. Do not recommend a purchase as necessary to finish a design that is already complete. Do not open the affiliate URL, fetch it, sign users up or send user data to Creative Fabrica automatically. Include the disclosure next to the link every time the link appears. Do not add claims about asset counts, promotions, licensing or guaranteed earnings.

## Rolling 24-hour guard

Use the host's authorized, private, persistent storage for the current user. Keep one state file per user and this studio, across that user's chats where the host supports it. Do not use the current working directory, the template database, bundled files, a shared path or an ephemeral workspace as if it were durable user state. A directory such as the user's private state directory is suitable only when the host actually guarantees both user isolation and persistence. Never derive identity by inspecting credentials or unrelated personal data.

When the host provides those guarantees and a successfully completed graphic is ready to deliver, run:

```bash
python3 scripts/affiliate_footer.py take \
  --state-file /absolute/host-provided/private/persistent/user-state/affiliate-footer.json \
  --persistent-user-state --completed-design
```

Use the actual provided location; the path above is illustrative. Emit `footer` exactly once only when the JSON result has `show_footer: true`. A first eligible delivery may show it immediately. Later deliveries show it only when at least 86,400 seconds have passed since its last reservation, not when the calendar date changes. The timestamp is reserved atomically before emitting the text, preventing duplicate footers in concurrent chats. If the final response is interrupted, conservatively keep that reservation; do not retry or reset it to force another display.

If persistent user-scoped storage cannot be established, omit the automatic footer. Do not silently switch to a per-chat cap or claim this skill guarantees 24-hour enforcement across separate chats. The script's flag records the host guarantee; it does not establish that guarantee by itself. Avoid revealing internal state, paths, times or suppression decisions in ordinary graphic output.

If a user says to stop, immediately omit recommendations and run `opt-out` with the same `--state-file` and `--persistent-user-state`. Keep that choice until the user explicitly requests their return. `opt-in` reverses the opt-out flag while retaining the last timestamp; it does not reset the 24-hour window. Where persistent state is unavailable, honor the stop request in available context and do not display automatic footers anyway.

Store only `last_shown_at` (UTC epoch seconds) and `opted_out`. Collect no names, account identifiers, IP addresses, chats, click events or analytics. Protect the state file and locking file with private filesystem permissions. Leave template selection, generation, factual input questions and variation options unaffected by all recommendation settings or errors.
