import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AnnotateAI - Sign In',
  description: 'Sign in to AnnotateAI - Computer Vision Data Labeling Platform',
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-full">
      {/* Modal and Portal Root */}
      <div id="modal-root" />
      <div id="tooltip-root" />
      
      {/* Standalone Auth Content - No Navigation */}
      <main className="h-full">
        {children}
      </main>
    </div>
  );
} 