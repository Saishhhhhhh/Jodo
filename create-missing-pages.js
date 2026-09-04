const fs = require('fs');
const path = require('path');

const sidebarPath = 'apps/admin/src/components/layout/sidebar.tsx';
const dashboardPath = 'apps/admin/src/app/(dashboard)';

const sidebarContent = fs.readFileSync(sidebarPath, 'utf8');

// Regex to find all href properties
const hrefRegex = /href:\s*['"]([^'"]+)['"]/g;
let match;
const links = new Set();

while ((match = hrefRegex.exec(sidebarContent)) !== null) {
  const href = match[1];
  if (href !== '/' && href !== '/products' && href !== '/orders' && href !== '/customers' && href !== '/inventory' && href !== '/discounts' && href !== '/apps' && href !== '/analytics') {
    links.add(href);
  }
}

const pageTemplate = (title) => `'use client';

import { LayoutDashboard } from 'lucide-react';

export default function ${title.replace(/[^a-zA-Z]/g, '')}Page() {
  return (
    <div className="flex h-[80vh] flex-col items-center justify-center text-center px-4 animate-fade-in">
      <div className="rounded-full bg-primary/10 p-4 mb-4">
        <LayoutDashboard className="h-10 w-10 text-primary" />
      </div>
      <h2 className="text-3xl font-bold tracking-tight mb-2">Page in Maintenance</h2>
      <p className="text-muted-foreground max-w-[500px]">
        We are currently building out this feature. Please check back later.
      </p>
    </div>
  );
}
`;

console.log(`Found ${links.size} unbuilt routes in sidebar.`);

for (const link of links) {
  // link is like /collections or /settings/staff
  const routePath = path.join(dashboardPath, link);
  const pageFile = path.join(routePath, 'page.tsx');
  
  if (!fs.existsSync(routePath)) {
    fs.mkdirSync(routePath, { recursive: true });
  }

  if (!fs.existsSync(pageFile)) {
    // Generate a quick title from the path, e.g. /settings/staff -> SettingsStaff
    const title = link.split('/').filter(Boolean).map(segment => segment.charAt(0).toUpperCase() + segment.slice(1)).join('');
    fs.writeFileSync(pageFile, pageTemplate(title));
    console.log(`Created stub for ${link}`);
  }
}
console.log('All missing pages generated successfully!');
