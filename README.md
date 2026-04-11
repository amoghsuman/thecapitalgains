# The Capital Gains

Premium financial education platform for Indian retail investors and traders.

**Live:** https://thecapitalgains.vercel.app  
**Stack:** Next.js 14 · Supabase · Sanity CMS v3 · Tailwind CSS · Vercel  
**Payments:** Razorpay (integration pending)

## Local Development

```bash
npm install
npm run dev
```

Set the following environment variables in .env.local:
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY
- NEXT_PUBLIC_SANITY_PROJECT_ID
- NEXT_PUBLIC_SANITY_DATASET
- SANITY_API_TOKEN

## Content Scripts

- upload-courses.mjs — uploads course structure to Sanity
- inject-lesson-content.mjs — patches lesson content into existing Sanity documents
- generate-lesson-content.mjs — generates lesson JSON for injection

## Notes

- middleware lives in proxy.ts (function: proxy) per Next.js 16 convention
- Lesson title matching in inject script is case and character sensitive
- Windows: always create files via VS Code New File, not PowerShell
