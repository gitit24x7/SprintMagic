export const SAMPLE_SPRINT = `---
type: sprint
title: "Auth & Onboarding"
start: 2026-06-12
end: 2026-06-26
phases: [Backlog, In Progress, Review, Done]
---

## Backlog
- [ ] Password reset flow #auth ^Login *3
- [ ] OAuth with Google @priya !med ^Login *5
- [ ] Rate-limit login attempts !low #security ^Login *2
- [ ] Welcome email sequence @sam ^Onboarding *3

## In Progress
- [ ] Build login form @alice ~2026-06-15 !high #auth ^Login *5
  Standard email + password form. Must validate inline and support
  "remember me". Follow the Figma spec linked in #design.
  - [ ] Email + password fields
  - [ ] Inline validation
  - [ ] "Remember me" checkbox
- [ ] Session token refresh @sam ~2026-06-18 !med ^Login *3
- [ ] Onboarding checklist UI @priya ~2026-06-17 ^Onboarding *5
  - [ ] Progress indicator
  - [ ] Skip-for-now option

## Review
- [ ] Sign-up validation @alice #auth ^Login *2

## Done
- [x] Set up DB schema %task @bob ^Infra *3
- [x] Wire up email provider %task @sam #infra ^Infra *2
`

export const SAMPLE_KANBAN = `---
type: kanban
title: "Support Queue"
phases: [Inbox, Working, Blocked, Shipped]
---

## Inbox
- [ ] Customer can't export CSV %bug ^Exports
- [ ] Dark mode request %task @lee ^Theming
- [ ] Typo on pricing page %bug !low

## Working (2)
- [ ] Investigate slow dashboard %task @priya !high #perf ^Performance
- [ ] Refund webhook failures %bug @sam ^Billing

## Blocked
- [ ] Waiting on vendor API key %task @lee !med ^Billing

## Shipped
- [x] Fix broken avatar upload %bug @alice ^Uploads
`
