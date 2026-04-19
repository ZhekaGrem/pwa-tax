// Empty stub for the `server-only` package, aliased in vitest.config.ts
// for the node test project. The real package throws at import time
// outside a React Server Component build, which breaks vitest imports
// of files like src/lib/pdf.ts and src/lib/firebase/admin.ts.
export {}
