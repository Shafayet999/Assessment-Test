Developer Assessment & Coding Platform Backend


Health Check Endpoint: [https://coding-platform-henna.vercel.app/](https://coding-platform-henna.vercel.app/)

Postman Collection: Postman Workspace

1. Project Overview & Architecture
An enterprise-grade, serverless Developer Assessment & Coding Platform Backend designed to evaluate technical talent through automated test workflows, question banks, scheduled candidate invitations, real-time timer tracking, automated grading, and payment processing.

The service is built on a Serverless-First architecture. To overcome strict Node.js ESM module resolution constraints in cloud serverless environments, the application utilizes TSUP to compile and bundle all source files, controllers, and middlewares into a unified executable deployment (dist/server.js). Database connections are maintained via Prisma Connection Pooling to eliminate exhaustion errors on serverless cold starts.

2. Technology Stack
Runtime & Framework: Node.js, Express.js (v5.x), TypeScript

Bundler & Build Pipeline: TSUP (Powered by esbuild, configured with CJS require shim for ESM)

Database & ORM: PostgreSQL (Cloud-hosted via Prisma Data Platform), Prisma ORM (v7.x) with pooled connections (pooled.db.prisma.io)

Caching & Key-Value Store: Redis (Cloud instance via Upstash / Redis Cloud)

Schema Validation: Zod (v4.x)

Authentication & Security: JWT (Access & Refresh tokens), HTTP-Only Cookies, BCrypt.js

Payment Processing: bKash Tokenized Sandbox API

Email & Notifications: Nodemailer (Gmail SMTP), EJS View Engine

Media & Documents: Cloudinary SDK, Multer, PDFKit

Code Formatting & Linting: Biome.js

Deployment & Hosting: Vercel Serverless Functions

3. Core Features & System Capabilities
Role-Based Access Control (RBAC): Granular authorization guards separating SUPER_ADMIN, ADMIN, and CANDIDATE operations.

Question Bank Management: Centralized repository for MCQs and coding challenges categorized by difficulty, tags, and points.

Dynamic Assessment Creation: Orchestration of multi-question exams with strict durations, total points, and passing scores.

Candidate Invitation & Examination Lifecycle: Email-driven assessment invitations, execution tracking, single-attempt locks, and automated submission handlers.

Automated Evaluation Engine: Atomic database transactions that calculate candidate scores and assign pass/fail status immediately upon submission.

Digital Wallet Integration: End-to-end tokenized bKash payment lifecycle for candidate registration and assessment access fees.

Governance & Audit Trails: Administrative analytics, user status moderation, and persistent platform audit logs.

4. Live API Catalog (24 Endpoints)
Authentication Module (3 Endpoints)
POST /api/v1/auth/register — Register candidate or administrator accounts.

POST /api/v1/auth/login — Authenticate credentials and issue JWT tokens/cookies.

POST /api/v1/auth/logout — Revoke active refresh tokens and clear sessions.

Assessments & Submissions Module (12 Endpoints)
POST /api/v1/assessments/questions — Add a new question to the pool.

GET /api/v1/assessments/questions — List all questions from the question bank.

POST /api/v1/assessments — Build and publish a new assessment.

GET /api/v1/assessments — Fetch all published assessments.

GET /api/v1/assessments/:id — Retrieve detailed assessment metadata and syllabus.

DELETE /api/v1/assessments/:id — Remove an assessment by ID (Admin only).

POST /api/v1/submissions/invite — Send candidate assessment invitations via email.

GET /api/v1/submissions/my-assessments — Retrieve assigned exams for the logged-in candidate.

POST /api/v1/submissions/start/:assessmentId — Initialize candidate exam attempt and lock start time.

POST /api/v1/submissions/submit/:assessmentId — Submit assessment answers for evaluation.

GET /api/v1/submissions/results/:submissionId — Retrieve graded assessment results and answer breakdown.

GET /api/v1/submissions/assessment/:assessmentId — Fetch all candidate submissions for a specific exam.

Payment Module (3 Endpoints)
POST /api/v1/payments/initiate — Generate tokenized bKash payment checkout URL.

GET /api/v1/payments/my-history — Fetch personal transaction records for candidates.

GET /api/v1/payments/all — Inspect global payment and revenue records (Admin only).

User Profile Module (2 Endpoints)
GET /api/v1/auth/me — Fetch currently authenticated user credentials and profile state.

PATCH /api/v1/auth/me — Update personal name, avatar, and contact details.

Admin Governance Module (4 Endpoints)
GET /api/v1/admin/dashboard-stats — Platform metrics (total users, active exams, completion rates, gross revenue).

GET /api/v1/admin/users — Fetch and filter complete user directory.

PATCH /api/v1/admin/users/:userId — Modify account access status (ACTIVE, BLOCKED) or update roles.

GET /api/v1/admin/audit-logs — Review immutable audit logs of sensitive system actions.

5. Architectural Components Configured in Codebase
(Implemented in source dependencies and ready for runtime activation)

Dynamic PDF Certificate Generator (pdfkit): Programmatic generation of verifiable assessment completion certificates and result transcripts.

Cloud File Processing Pipeline (cloudinary, multer): Secure multi-part buffer processing for profile images and assessment media assets.

HTML Email Templating Engine (ejs): Templated invitation cards and payment receipt delivery via SMTP.

Redis In-Memory Layer (redis): Token blacklist storage, rate-limiting counters, and ephemeral cache storage.

Automated Data Seeding Engine (seedInitialData): Default database provisioning for Super Admin accounts and foundational testing records.

6. Deferred Features (Pending Frontend Integration)
Google OAuth 2.0 Social Sign-In:

The backend authentication handler (google-auth-library) is fully configured. Activation is paused pending frontend Google Client ID setup and redirect URI consent screen integration.

Live Video Proctoring & WebSockets:

Stateless serverless containers do not support persistent bidirectional TCP sockets. Real-time webcam feeds and tab-switching monitoring will be coordinated via client-side event streams in the frontend release.

Background Scheduled Tasks (node-cron):

Ephemeral serverless runtimes terminate idle background intervals. Recurring automated cleanup routines will transition to Vercel Cron Jobs / Upstash QStash upon platform deployment.