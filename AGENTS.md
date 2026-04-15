# AGENTS Guide

## Project Snapshot
- WeChat Mini Program + Tencent Cloud Functions for a referral workflow: alumni post jobs -> teacher audits -> students apply -> alumni process applications.
- Frontend lives in `miniprogram/`; backend logic is split into one-function-per-folder under `cloudfunctions/`.
- The app initializes cloud + silent login on launch in `miniprogram/app.js`.

## Architecture and Data Flow
- UI pages call cloud functions directly via `wx.cloud.callFunction` (example: `miniprogram/pages/job_list/job_list.js`, `miniprogram/pages/job_detail/job_detail.js`).
- Auth is centralized in `miniprogram/utils/auth.js` (`silentLogin`, `interactiveLogin`, local storage sync).
- Role and permission checks are enforced server-side in cloud functions (examples: `cloudfunctions/postJob/index.js`, `cloudfunctions/auditJob/index.js`).
- Sensitive fields are gated in `cloudfunctions/getJobDetail/index.js` (`referralCode`, `contactWechat`, `jobLink` returned only for accepted applicants).
- Application status machine is in `cloudfunctions/updateApplicationStatus/index.js`: `pending -> processing -> accepted/rejected`.

## Repo Map for Fast Navigation
- Core pages: `miniprogram/pages/job_list/`, `miniprogram/pages/job_detail/`, `miniprogram/pages/manage_applications/`, `miniprogram/pages/teacher_stats/`.
- Core functions: `login`, `setUserRole`, `getJobList`, `getJobDetail`, `postJob`, `applyJob`, `getApplications`, `updateApplicationStatus`, `auditJob`, `getTeacherStats`.
- Domain docs with current behavior: `docs/prd.md`, `docs/handover-2026-04-14.md`, `docs/architecture-issues.md`.

## Codebase-Specific Conventions
- Cloud functions return unified shapes: `{ code, data?, message?, total?, hasMore? }`; keep this contract when adding APIs.
- Pagination pattern is consistent: `pageNum`, `pageSize`, `skip`, `limit = Math.min(pageSize, 20)` (see `getJobList`, `getApplications`, `getNotifications`).
- Write-paths avoid raw event spreading; use whitelist object construction (example: `cloudfunctions/postJob/index.js`, `cloudfunctions/applyJob/index.js`).
- Identity is derived from `cloud.getWXContext().OPENID`; do not trust caller-provided user ids.
- Data naming is camelCase and status values are string enums (`pending`, `processing`, `accepted`, `rejected`, `published`).

## Developer Workflows (Verified)
- Install root deps: `npm install` (root `package.json` holds shared tooling and miniprogram libs).
- In WeChat DevTools: open project root, then run "Build npm" (required by `project.config.json` with `packNpmManually: true`).
- Deploy cloud functions from DevTools per function folder (handover notes warn against bulk deploy stalls).
- Local tests are script files (no npm script wrapper):
  - `node tests/cloudfunctions/validation.test.js` (passes locally)
  - `node tests/cloudfunctions/getTeacherStats.test.js` (currently 1 failing assertion in role-denial case)

## Integration Notes and Pitfalls
- Cloud env is mostly hardcoded (`cloud1-3g3q2srz04d1d705`) in many functions; `getTeacherStats` uses `cloud.DYNAMIC_CURRENT_ENV`.
- `notifications` page is the main exception that may write DB directly from frontend (documented in `docs/prd.md`).
- `createIndexes` exists (`cloudfunctions/createIndexes/index.js`) but may still require manual control-console fallback.
- If docs conflict, prefer current code + latest handover (`docs/handover-2026-04-14.md`) over older planning docs.

