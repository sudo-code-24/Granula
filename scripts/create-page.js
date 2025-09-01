#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Get the page name from command line arguments
const pageName = process.argv[2];

if (!pageName) {
  console.error('❌ Please provide a page name!');
  console.log('Usage: npm run create-page <page-name>');
  console.log('Example: npm run create-page login');
  process.exit(1);
}

// Convert page name to kebab-case if it contains spaces or camelCase
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

// Create the page.tsx file with a basic template
const pageTemplate = `import React from 'react';

export default function ${pageName.charAt(0).toUpperCase() + pageName.slice(1)}Page() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">${pageName.charAt(0).toUpperCase() + pageName.slice(1)} Page</h1>
        <p className="text-gray-600">This is the ${pageName} page.</p>
      </div>
    </div>
  );
}
`;

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
console.log('\n💡 You can now customize the page content in the created file.');
