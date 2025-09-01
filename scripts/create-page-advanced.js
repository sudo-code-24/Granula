#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Get command line arguments
const args = process.argv.slice(2);
const pageName = args[0];
const pageType = args[1] || 'basic'; // basic, form, dashboard, blank

if (!pageName) {
  console.error('❌ Please provide a page name!');
  console.log('Usage: npm run create-page-advanced <page-name> [page-type]');
  console.log('Page types: basic, form, dashboard, blank');
  console.log('Examples:');
  console.log('  npm run create-page-advanced login');
  console.log('  npm run create-page-advanced dashboard dashboard');
  console.log('  npm run create-page-advanced contact form');
  process.exit(1);
}

// Convert page name to kebab-case
const folderName = pageName
  .replace(/([A-Z])/g, '-$1')
  .toLowerCase()
  .replace(/^-/, '')
  .replace(/\s+/g, '-');

const appDir = path.join(__dirname, '..', 'app');
const pageDir = path.join(appDir, folderName);
const pageFile = path.join(pageDir, 'page.tsx');

// Check if page already exists
if (fs.existsSync(pageDir)) {
  console.error(`❌ Page "${folderName}" already exists!`);
  process.exit(1);
}

// Create the page directory
try {
  fs.mkdirSync(pageDir, { recursive: true });
  console.log(`✅ Created directory: ${folderName}/`);
} catch (error) {
  console.error('❌ Failed to create directory:', error.message);
  process.exit(1);
}

// Page templates based on type
const templates = {
  basic: `import React from 'react';

export default function ${pageName.charAt(0).toUpperCase() + pageName.slice(1)}Page() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold text-center text-gray-900 mb-6">
          ${pageName.charAt(0).toUpperCase() + pageName.slice(1)} Page
        </h1>
        <p className="text-gray-600 text-center">
          This is the ${pageName} page. Customize it according to your needs.
        </p>
      </div>
    </div>
  );
}`,

  form: `import React from 'react';

export default function ${pageName.charAt(0).toUpperCase() + pageName.slice(1)}Page() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            ${pageName.charAt(0).toUpperCase() + pageName.slice(1)}
          </h2>
        </div>
        <form className="mt-8 space-y-6">
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">Email address</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Password"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}`,

  dashboard: `import React from 'react';

export default function ${pageName.charAt(0).toUpperCase() + pageName.slice(1)}Page() {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-semibold text-gray-900">
            ${pageName.charAt(0).toUpperCase() + pageName.slice(1)} Dashboard
          </h1>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4">
            <div className="border-4 border-dashed border-gray-200 rounded-lg h-96 flex items-center justify-center">
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Dashboard Content
                </h3>
                <p className="text-gray-500">
                  Add your dashboard components and widgets here.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}`,

  blank: `import React from 'react';

export default function ${pageName.charAt(0).toUpperCase() + pageName.slice(1)}Page() {
  return (
    <div>
      {/* Your content goes here */}
    </div>
  );
}`
};

// Get the template based on page type
const pageTemplate = templates[pageType] || templates.basic;

try {
  fs.writeFileSync(pageFile, pageTemplate);
  console.log(`✅ Created file: ${folderName}/page.tsx`);
} catch (error) {
  console.error('❌ Failed to create page file:', error.message);
  process.exit(1);
}

console.log(`\n🎉 Successfully created ${folderName} page!`);
console.log(`📁 Location: app/${folderName}/page.tsx`);
console.log(`🌐 Access at: http://localhost:3000/${folderName}`);
console.log(`📝 Page type: ${pageType}`);
console.log('\n💡 You can now customize the page content in the created file.');
console.log('\n📚 Available page types:');
console.log('  - basic: Simple centered page with title and description');
console.log('  - form: Page with a basic form layout');
console.log('  - dashboard: Dashboard-style layout with header and content area');
console.log('  - blank: Minimal blank page for custom layouts');
