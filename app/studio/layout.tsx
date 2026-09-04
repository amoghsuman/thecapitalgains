// Sanity Studio's own root layout — deliberately minimal and independent of
// app/(site)/layout.tsx. /studio is a separate top-level route (a sibling of
// the (site) route group, not inside it), so per Next.js's "multiple root
// layouts" pattern it needs its own <html>/<body>. This is what gives Studio
// genuine isolation: no site Navbar/Footer/DisclaimerBar, no Tailwind/theme
// CSS (globals.css, premium-theme.css), no Inter font — none of it is
// imported here, so none of it can bleed into Studio's own UI.
export default function StudioLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
