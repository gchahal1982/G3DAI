import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '../styles/globals.css';
import Navigation from '@/components/layout/Navigation';
import Header from '@/components/layout/Header';
import Breadcrumb from '@/components/layout/Breadcrumb';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'AnnotateAI - Computer Vision Data Labeling Platform',
  description: 'Production-ready AI-powered annotation platform for computer vision training data with advanced glassmorphism UI',
  keywords: ['AI', 'annotation', 'computer vision', 'machine learning', 'data labeling', 'YOLO', 'COCO', 'Pascal VOC'],
  authors: [{ name: 'G3DAI Team' }],
  creator: 'G3DAI',
  publisher: 'G3DAI',
  applicationName: 'AnnotateAI',
  openGraph: {
    title: 'AnnotateAI - AI-Powered Computer Vision Platform',
    description: 'Transform your computer vision projects with intelligent annotation tools, AI-assisted labeling, and export to COCO, YOLO, Pascal VOC formats',
    type: 'website',
    url: 'https://annotateai.g3dai.com',
    siteName: 'AnnotateAI by G3DAI',
    locale: 'en_US',
    images: [
      {
        url: '/images/og-annotateai.png',
        width: 1200,
        height: 630,
        alt: 'AnnotateAI - Computer Vision Data Labeling Platform with AI Assistance'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AnnotateAI - AI-Powered Computer Vision Platform',
    description: 'Transform your computer vision projects with intelligent annotation tools and AI assistance',
    creator: '@G3DAI',
    images: ['/images/twitter-annotateai.png']
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon.ico', sizes: 'any' }
    ],
    apple: '/apple-touch-icon.png',
    shortcut: '/favicon.ico'
  },
  manifest: '/manifest.json',
  verification: {
    google: 'annotateai-verification-token',
  },
  other: {
    'msapplication-TileColor': '#6366f1',
    'msapplication-config': '/browserconfig.xml'
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark h-full" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#6366f1" />
        <meta name="color-scheme" content="dark" />
        <meta name="format-detection" content="telephone=no" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={`${inter.variable} font-sans antialiased h-full bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white overflow-hidden`}>
        {/* Modal and Portal Root */}
        <div id="modal-root" />
        <div id="tooltip-root" />
        <div id="dropdown-root" />
        
        {/* Main Application Layout */}
        <div className="h-full flex bg-gray-900/50 backdrop-blur-sm">
          {/* Navigation Sidebar - Hidden on mobile, fixed positioning handled within component */}
          <div className="hidden lg:block">
            <Navigation />
          </div>
          
          {/* Main Content Container - Responsive offset for sidebar */}
          <div className="flex-1 flex flex-col min-h-full max-h-screen overflow-hidden lg:ml-80 ml-0">
            {/* Header */}
            <Header 
              className="flex-shrink-0" 
              showSearch={true}
            />
            
            {/* Content Area with Breadcrumb */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Breadcrumb Navigation */}
              <div className="flex-shrink-0 px-6 py-3 border-b border-white/5 bg-white/2 backdrop-blur-sm">
                <Breadcrumb />
              </div>
              
              {/* Scrollable Main Content */}
              <main className="flex-1 overflow-y-auto overflow-x-hidden">
                <div className="p-6">
                  {children}
                </div>
              </main>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Overlay */}
        <div 
          id="mobile-nav-overlay" 
          className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm hidden"
          onClick={() => {
            const overlay = document.getElementById('mobile-nav-overlay');
            if (overlay) overlay.classList.add('hidden');
          }}
        >
          <div className="w-80 h-full">
            <Navigation />
          </div>
        </div>
        
        {/* Global Loading Indicator */}
        <div id="loading-indicator" className="hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
          <div className="flex items-center justify-center h-full">
            <div className="glass-card p-6">
              <div className="flex items-center space-x-3">
                <div className="loading-spinner" />
                <span className="text-white text-sm">Loading...</span>
              </div>
            </div>
          </div>
        </div>

        {/* Development Tools - Only in development */}
        {process.env.NODE_ENV === 'development' && (
          <div className="fixed bottom-4 right-4 z-50">
            <div className="glass-btn px-3 py-2 text-xs text-gray-400">
              <span>Dev Mode</span>
            </div>
          </div>
        )}

        {/* Analytics and Tracking Scripts */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Initialize client-side analytics
              if (typeof window !== 'undefined') {
                window.annotateAI = {
                  version: '1.0.0',
                  platform: 'web',
                  env: '${process.env.NODE_ENV}'
                };
              }
            `
          }}
        />
      </body>
    </html>
  );
} 