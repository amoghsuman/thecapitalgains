// Feature gate for the Capital AI tutor. NEXT_PUBLIC_ so client components can
// hide their entry points; the server route stays independently protected by
// auth and rate limiting regardless of this flag.
export const TUTOR_ENABLED = process.env.NEXT_PUBLIC_TUTOR_ENABLED === "true";
