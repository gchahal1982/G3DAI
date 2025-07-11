import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '../styles/globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'G3D MedSight Pro - Medical Imaging AI Platform',
  description: 'Advanced medical imaging AI platform for radiology and diagnostic imaging',
  keywords: ['medical imaging', 'AI', 'radiology', 'DICOM', 'healthcare', 'diagnostics'],
  authors: [{ name: 'G3DAI Medical Team' }],
  openGraph: {
    title: 'G3D MedSight Pro',
    description: 'Advanced medical imaging AI platform for healthcare providers',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} min-h-screen bg-medical-gradient`}>
        <div id="modal-root" />
        {children}
      </body>
    </html>
  );
} 