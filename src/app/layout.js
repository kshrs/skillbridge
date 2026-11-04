import './globals.css';

export const metadata = {
  title: 'SkillBridge — Institutional Learning & Career Readiness',
  description: 'Minimalist platform bridging university open courseware, cohort benchmark assessments, faculty mentorship, and campus placement tickets.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="light" suppressHydrationWarning>
      <body className="min-h-screen antialiased select-none font-sans">
        {children}
      </body>
    </html>
  );
}
