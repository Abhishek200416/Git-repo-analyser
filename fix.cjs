const fs = require('fs');
let content = fs.readFileSync('src/utils/pdfExport.tsx', 'utf8');
content = content.replace(/\\`/g, '`');
content = content.replace(/\\\${/g, '${');
fs.writeFileSync('src/utils/pdfExport.tsx', content, 'utf8');
console.log("Fixed backticks");
