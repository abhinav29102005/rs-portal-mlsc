const fs = require('fs');
const path = require('path');

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      processDir(fullPath);
    } else if (file === 'page.tsx' || file === 'route.ts' || file === 'layout.tsx') {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // Check if it already has runtime exported
      if (content.includes('export const runtime')) {
        continue;
      }

      // Check if it uses client
      if (content.includes('"use client"') || content.includes("'use client'")) {
        console.log(`Skipping Client Component: ${fullPath}`);
        continue;
      }

      console.log(`Patching: ${fullPath}`);
      content = `export const runtime = "edge";\n\n` + content;
      fs.writeFileSync(fullPath, content);
    }
  }
}

processDir(path.join(__dirname, 'src/app'));
