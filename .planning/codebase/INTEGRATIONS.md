# External Integrations

**Analysis Date:** 2026-02-06

## APIs & External Services

**Avatar Generation:**
- DiceBear - Avatar generation service
  - SDK/Client: None (direct HTTP calls via image `src` attributes)
  - Usage: `components/shared/TeamAvatar.tsx` generates deterministic avatars for teams
  - Endpoint: `https://api.dicebear.com/9.x/shapes/svg?seed={teamName}&size={size}`
  - Style: "shapes" style with team names as seed
  - Auth: None required (public API)

**Image Hosting:**
- GitHub - User avatar fallback
  - Usage: `components/dashboard/layout/DashboardHero.tsx` and `components/dashboard/layout/UserFooter.tsx`
  - Default avatar: `https://github.com/shadcn.png`
  - Auth: None required (public CDN)

**Cryptoicons (referenced in config):**
- Protocol: HTTPS
- Hostname: `cryptoicons.org`
- Pathname: `/**`
- Status: Configured in `next.config.ts` but no usage detected in current codebase

## Data Storage

**Databases:**
- None - Application uses only mock data

**File Storage:**
- Local filesystem only - No cloud storage integration
- Public assets stored in `public/` directory

**Caching:**
- Browser-level only (image `loading="lazy"` on TeamAvatar)
- Next.js built-in static optimization

## Authentication & Identity

**Auth Provider:**
- None - Application has no authentication layer
- No login/authentication mechanism implemented
- All data is mock data for demonstration purposes

## Monitoring & Observability

**Error Tracking:**
- None detected

**Logs:**
- Console logging only (standard browser/Node.js console)

## CI/CD & Deployment

**Hosting:**
- Designed for Vercel (Next.js creator platform)
- Can also deploy to any Node.js hosting supporting Next.js
- Build command: `next build --webpack`
- Start command: `next start`

**CI Pipeline:**
- Not configured (no GitHub Actions, GitLab CI, or other CI files present)

## Environment Configuration

**Required env vars:**
- None - Application runs without environment variables

**Secrets location:**
- No secrets management - Mock data only

**Configuration files:**
- `next.config.ts` - Remote image hostname allowlist

## Image Optimization

**Remote Patterns Configured (next.config.ts):**

```typescript
{
  protocol: "https",
  hostname: "api.dicebear.com",
  pathname: "/**"
},
{
  protocol: "https",
  hostname: "raw.githubusercontent.com",
  pathname: "/**"
},
{
  protocol: "https",
  hostname: "cryptoicons.org",
  pathname: "/**"
}
```

**Implementation:**
- Next.js Image Optimization disabled for remote URLs
- All remote images loaded via `<img>` tags directly (not `<Image>` component from next/image)

## Webhooks & Callbacks

**Incoming:**
- None

**Outgoing:**
- None

---

*Integration audit: 2026-02-06*
