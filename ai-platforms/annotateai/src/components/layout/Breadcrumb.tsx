'use client';

import React from 'react';
import Link from 'next/link';

export interface BreadcrumbItem {
  name: string;
  href?: string;
  current?: boolean;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ items, className = '' }) => {
  return (
    <nav className={`flex ${className}`} aria-label="Breadcrumb">
      <ol role="list" className="flex items-center space-x-4">
        {items.map((item, index) => (
          <li key={item.name}>
            <div className="flex items-center">
              {index > 0 && (
                <svg
                  className="flex-shrink-0 h-5 w-5 text-gray-400 mr-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  aria-hidden="true"
                >
                  <path d="M5.555 17.776l8-16 .894.448-8 16-.894-.448z" />
                </svg>
              )}
              
              {item.href && !item.current ? (
                <Link
                  href={item.href}
                  className="text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {item.name}
                </Link>
              ) : (
                <span
                  className={`text-sm font-medium ${
                    item.current
                      ? 'text-gray-900 cursor-default'
                      : 'text-gray-500'
                  }`}
                  aria-current={item.current ? 'page' : undefined}
                >
                  {item.name}
                </span>
              )}
            </div>
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumb; 