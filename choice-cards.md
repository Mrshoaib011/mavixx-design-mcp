# Tappable choices

Use the host's supported choice-card capability. In ChatGPT surfaces supporting the Ask User Input widget, render the GenUI directive below in the assistant response, with real dynamically selected options. This is a rendering directive, not a shell command or an invented MCP tool. Give one short introduction, render the card, and end the turn awaiting selection. All decisions here are single-select. Always include a specific free-text placeholder. Accept the selected label as the answer and resume current task state.

## Format card

Use the relevant output's choices from SKILL.md, not every size for every output. Do not show any format card for a logo. Example social-post card:

genui{"ask_user_input":{"questions":[{"question":"Which aspect ratio should this post use?","options":["1:1 — Square","4:5 — Portrait","3:4 — Tall portrait","16:9 — Landscape","9:16 — Vertical","3:2 — Wide","Let ChatGPT decide"],"type":"single_select","free_text_placeholder":"Enter a custom ratio or size"}]}}

## Optional style suggestions — only when requested

Do not show this card during normal creation; automatically adopt a suitable template instead. Use it only when the user explicitly asks for style choices. Retrieve four suitable styles for the current brief. Explain their visual outcomes briefly. Replace the example labels with these four actual choices; keep all four plus “Let ChatGPT decide” in one card. Do not infer style from another completed creation.

genui{"ask_user_input":{"questions":[{"question":"Which design style should this new graphic use?","options":["Art Deco","Pop Art","Japandi","Mid-Century","Let ChatGPT decide"],"type":"single_select","free_text_placeholder":"Name another design style"}]}}

## Product background card

Show only when a supplied product photo has a background and the current request has not already answered this decision. Do not ask for a logo; its outer-background removal is automatic.

genui{"ask_user_input":{"questions":[{"question":"Remove the background from the product photo?","options":["Yes — Remove background","No — Keep original background","Let ChatGPT decide"],"type":"single_select","free_text_placeholder":"Describe another background treatment"}]}}

## Multi-object scope card

Show after removal is selected and scope is ambiguous. Describe the full set using only visible items. Customize options to the supplied photo.

genui{"ask_user_input":{"questions":[{"question":"Which objects should remain in the cutout?","options":["Bed only","Full visible bedroom set","Let ChatGPT decide"],"type":"single_select","free_text_placeholder":"List the exact objects to keep"}]}}

## Batching and availability

Batch independent unresolved format/background decisions into one widget with up to three questions. Template selection is automatic after the canvas is known; style selection is not a required choice. Scope must wait for Yes unless removal was already specified. Do not ask a question whose answer is already given. Never issue generation while a required choice is unanswered.

If the widget is not supported, use an exposed native input tool only within its actual schema limits. Some native tools permit just 2–3 choices, so do not squeeze four styles into that tool or discard a style. Use the four-style-plus-automatic widget when supported. If no control can display all choices, briefly explain the limitation and show a concise text list. Do not claim a custom popup or installed UI integration exists. A skill can instruct supported rendering; it cannot enable unavailable host controls.


## Post-delivery variation card

Offer only after delivering the social-media graphics. Keep this optional and do not create extra outputs merely because the card is shown. Explain: "Create fresh text and distinct layouts within the same campaign theme, keeping the CTA and logo in place." A selected path continues the approved master system with rewritten headline/supporting copy and a changed main layout; the CTA, logo and fixed footer anchors retain their original content, appearance and positions. Optional background variations remain within the original theme and approved palette family. Read references/variation-system.md before planning the batch. Accept legacy same-design labels as these paths, honoring any explicit current exact-copy instruction.

genui{"ask_user_input":{"questions":[{"question":"Would you like more variations of this design?","options":["Same product, new layout","Different product, new layout"],"type":"single_select","free_text_placeholder":"Describe the variations and number of posts you want"}]}}

## Variation quantity card

Skip when the user already supplied the number. Accept any positive whole-number custom count. For carousel sets, replace "posts" with "carousels" and preserve the slide count separately.

genui{"ask_user_input":{"questions":[{"question":"How many additional posts would you like?","options":["2 more posts","4 more posts"],"type":"single_select","free_text_placeholder":"Enter any positive whole number of additional posts"}]}}

For "Different product, new layout", request missing new product assets/details after resolving quantity, or batch independent quantity and text-brief questions when the host supports it. Image attachments must be requested in ordinary text; do not pretend a text field uploads an image. Follow the new asset's own background-removal and scope decisions. In all cases accept a combined reply that already resolves mode, quantity and product details.

## Missing inputs and automatic design decisions

Ask only essential unresolved inputs. For subjective format/background/scope/content-treatment decisions, include “Let ChatGPT decide” and a free-text alternative. Resolve automatic choices from the current brief. Never use automatic choice to fabricate a real product/logo, historical/current facts, prices, dates, claims or contacts. For an essential missing fact/asset, describe what is needed; where appropriate offer “Add the real details/asset” or “Create a generic concept” only if generic output can satisfy the user’s intent. Ask image uploads in ordinary text; a text card does not upload files. Choosing a generic concept is explicit authorization, not a hidden fallback.

Do not add an extra default creation-path card when inputs are sufficient. Keep the existing two variation paths and 2/4/custom quantity cards. “Let ChatGPT decide” does not automatically create unrequested extra posts.
