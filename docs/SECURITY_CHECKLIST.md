# Enterprise Security & Hardening Checklist

MinecraftCloud implements defense-in-depth architecture across all layers of the application and hosting infrastructure.

---

## 1. Authentication & Session Hardening

- [x] **Secure Password Hashing**: Passwords hashed using PBKDF2 with SHA-512 and unique cryptographic 16-byte random salt (`SecurityCrypto.hashPassword`). Plaintext passwords are never stored or logged.
- [x] **Signed JWT Tokens**: Session tokens signed with HMAC-SHA256 (`AUTH_SECRET`) and configured with a 7-day expiration time.
- [x] **HTTP-Only Cookies**: Cookies set with `httpOnly: true`, `secure: true` (in production), `sameSite: 'lax'`, and scoped to `/`.
- [x] **Role-Based Access Control (RBAC)**:
  - `OWNER`: Full root control, billing, server deletion, user invitation.
  - `ADMIN`: Server configuration, start/stop/restart, plugins, world management.
  - `MODERATOR`: Interactive console execution, player kick, ban, unban, operator commands.
  - `VIEWER`: Read-only telemetry, resource metrics, online player count.

---

## 2. Path Traversal & File Sandbox Defense

- [x] **Strict Canonical Path Assertion**:
  `SandboxedFileSystem.resolveSafePath()` resolves the requested relative path and asserts that the canonical real path starts with `/data/servers/{serverId}`.
- [x] **Null Byte & Traversal Stripping**: All `\0`, `..`, and symlinks targeting files outside the assigned server volume are rejected with an explicit `400 Bad Request`.
- [x] **Filesize Protection**: Files larger than 5 MB are prevented from opening in the text editor to avoid memory exhaustion.

---

## 3. Command Injection & Console Sanitization

- [x] **No Direct Shell Access**: The dashboard console communicates exclusively via Minecraft Source RCON protocol on port `25575`. It never executes arbitrary host operating system commands (no `child_process.exec` on user input).
- [x] **Sanitization Rules**: Special shell control characters (`;`, `&`, `|`, `` ` ``, `$`, `>`, `<`) are stripped and rejected before reaching execution.

---

## 4. Container & Operating System Isolation

- [x] **Non-Root Execution**: Minecraft server containers run as user `minecraft` (`UID:GID 1000:1000`).
- [x] **Resource Caps**: Containers enforce strict memory limits (`Memory`) and CPU throttling (`NanoCpus`) to prevent noisy-neighbor host crashes.
- [x] **Agent Authentication**: All Node Agent API endpoints require the `X-Agent-Secret` token header. Requests without valid tokens are immediately rejected with `401 Unauthorized`.
- [x] **Secrets in Environment Variables**: Database passwords, JWT secrets, and Agent secrets are loaded exclusively via environment variables (`process.env`).

---

## 5. Audit Logging

- [x] **Audit Trail**: Operational events (`SERVER_START`, `SERVER_STOP`, `SERVER_RESTART`, `SERVER_KILL`, `EXEC_COMMAND`, `CONFIG_UPDATE`, `BACKUP_RESTORE`, `USER_LOGIN`) are persistently logged with timestamp, user ID, and client IP address.
