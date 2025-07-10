import type { Metadata } from 'next';
import { Inter, Geist } from 'next/font/google';
import { AuthProvider } from '@/lib/auth/AuthContext';
import { Navigation } from '@/components/layout/Navigation';
import { Header } from '@/components/layout/Header';
import { Providers } from './providers';
import '@/styles/globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const geist = Geist({
  subsets: ['latin'],
  variable: '--font-geist',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    template: '%s | AnnotateAI',
    default: 'AnnotateAI - Computer Vision Data Labeling Platform',
  },
  description: 'Professional computer vision data labeling platform with AI-powered annotation tools, real-time collaboration, and enterprise-grade quality control.',
  keywords: [
    'computer vision',
    'data labeling',
    'machine learning',
    'AI annotation',
    'image annotation',
    'video annotation',
    'object detection',
    'semantic segmentation',
    'keypoint detection',
    'annotation platform',
    'ML training data',
    'COCO format',
    'YOLO format',
    'Pascal VOC',
  ],
  authors: [{ name: 'AnnotateAI Team' }],
  creator: 'AnnotateAI',
  publisher: 'AnnotateAI',
  metadataBase: new URL(process.env.NEXTAUTH_URL || 'http://localhost:3000'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    title: 'AnnotateAI - Computer Vision Data Labeling Platform',
    description: 'Professional computer vision data labeling platform with AI-powered annotation tools, real-time collaboration, and enterprise-grade quality control.',
    siteName: 'AnnotateAI',
    images: [
      {
        url: '/images/og-image.png',
        width: 1200,
        height: 630,
        alt: 'AnnotateAI Platform Screenshot',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AnnotateAI - Computer Vision Data Labeling Platform',
    description: 'Professional computer vision data labeling platform with AI-powered annotation tools.',
    images: ['/images/twitter-image.png'],
    creator: '@annotateai',
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
  verification: {
    google: process.env.GOOGLE_VERIFICATION_ID,
  },
  other: {
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'black-translucent',
    'apple-mobile-web-app-title': 'AnnotateAI',
    'mobile-web-app-capable': 'yes',
    'msapplication-TileColor': '#6366f1',
    'theme-color': '#6366f1',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html 
      lang="en" 
      className={`${inter.variable} ${geist.variable}`}
      suppressHydrationWarning
    >
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body 
        className="min-h-screen bg-gradient-to-br from-annotate-primary-50 via-white to-annotate-primary-100 font-primary antialiased"
        suppressHydrationWarning
      >
        <Providers>
          <AuthProvider>
            <div className="min-h-screen flex">
              {/* Sidebar Navigation */}
              <Navigation />
              
              {/* Main Content Area */}
              <div className="flex-1 flex flex-col">
                {/* Header */}
                <Header />
                
                {/* Page Content */}
                <main className="flex-1 overflow-auto">
                  {children}
                </main>
              </div>
            </div>
          </AuthProvider>
        </Providers>
        
        {/* Analytics Scripts */}
        {process.env.NODE_ENV === 'production' && (
          <>
            {/* Google Analytics */}
            {process.env.GOOGLE_ANALYTICS_ID && (
              <>
                <script
                  async
                  src={`https://www.googletagmanager.com/gtag/js?id=${process.env.GOOGLE_ANALYTICS_ID}`}
                />
                <script
                  dangerouslySetInnerHTML={{
                    __html: `
                      window.dataLayer = window.dataLayer || [];
                      function gtag(){dataLayer.push(arguments);}
                      gtag('js', new Date());
                      gtag('config', '${process.env.GOOGLE_ANALYTICS_ID}', {
                        page_title: document.title,
                        page_location: window.location.href,
                      });
                    `,
                  }}
                />
              </>
            )}
            
            {/* Mixpanel Analytics */}
            {process.env.MIXPANEL_TOKEN && (
              <script
                dangerouslySetInnerHTML={{
                  __html: `
                    (function(c,a){if(!a.__SV){var b=window;try{var d,m,j,k=b.location,f=k.hash;d=function(a,b){return(m=a.match(RegExp(b+"=([^&]*)")))?m[1]:null};f&&d(f,"state")&&(j=JSON.parse(decodeURIComponent(d(f,"state"))),"mpeditor"===j.action&&(b.sessionStorage.setItem("_mpcehash",f),history.replaceState(j.desiredHash||"",c.title,k.pathname+k.search)))}catch(n){}var l,h;window.mixpanel=a;a._i=[];a.init=function(b,d,g){function c(b,i){var a=i.split(".");2==a.length&&(b=b[a[0]],i=a[1]);b[i]=function(){b.push([i].concat(Array.prototype.slice.call(arguments,0)))}}var e=a;"undefined"!==typeof g?e=a[g]=[]:g="mixpanel";e.people=e.people||[];e.toString=function(b){var a="mixpanel";"mixpanel"!==g&&(a+="."+g);b||(a+=" (stub)");return a};e.people.toString=function(){return e.toString(1)+".people (stub)"};l="disable time_event track track_pageview track_links track_forms track_with_groups add_group set_group remove_group register register_once alias unregister identify name_tag set_config reset opt_in_tracking opt_out_tracking has_opted_in_tracking has_opted_out_tracking clear_opt_in_out_tracking start_batch_senders people.set people.set_once people.unset people.increment people.append people.union people.track_charge people.clear_charges people.delete_user people.remove".split(" ");for(h=0;h<l.length;h++)c(e,l[h]);var f="set_config set_group remove_group clear_opt_in_out_tracking start_batch_senders".split(" ");for(h=0;h<f.length;h++)e[f[h]]=function(){return e.push([f[h]].concat(Array.prototype.slice.call(arguments,0)))}};a.init('${process.env.MIXPANEL_TOKEN}');}})(document,window.mixpanel||[]);
                  `,
                }}
              />
            )}
          </>
        )}
        
        {/* Development Tools */}
        {process.env.NODE_ENV === 'development' && (
          <div className="fixed bottom-4 left-4 z-50">
            <div className="annotate-glass p-2 rounded-lg">
              <div className="text-xs text-annotate-primary-600 font-mono">
                DEV MODE
              </div>
            </div>
          </div>
        )}
      </body>
    </html>
  );
}