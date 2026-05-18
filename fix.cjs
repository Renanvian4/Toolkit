const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'src/components');
const files = fs.readdirSync(dir).filter(f => f.endsWith('Tool.tsx'));

files.forEach(f => {
  const filePath = path.join(dir, f);
  let content = fs.readFileSync(filePath, 'utf8');

  // Fix min-h-0 which became min-h-full min-h-[300px]
  content = content.replace(/min-h-full min-h-\[300px\]/g, 'min-h-0');

  // Fix h-4 which became h-full min-h-[300px]
  content = content.replace(/h-full min-h-\[300px\]/g, 'h-4');

  // Now actually replace h-[400px] with h-full min-h-[300px]
  content = content.replace(/h-\[400px\]/g, 'h-full min-[300px]');
  
  // also handle h-[300px], h-[350px], h-[600px] to be h-full
  content = content.replace(/h-\[(300|350|400|600)px\]/g, 'h-full min-h-[300px]');

  fs.writeFileSync(filePath, content);
});

console.log("Fixed files.");
