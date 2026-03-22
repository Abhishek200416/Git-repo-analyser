const fs = require('fs');
const content = fs.readFileSync('src/App.tsx', 'utf8');

const startStr = "  const exportToPDF = async (type: 'analysis' | 'documentation' = 'analysis', phaseIndices?: number[]) => {";
const endStr = "  const exportToMarkdown = () => {";

const startIndex = content.indexOf(startStr);
const endIndex = content.indexOf(endStr);

if (startIndex !== -1 && endIndex !== -1) {
  const newFunction = `  const exportToPDF = async (type: 'analysis' | 'documentation' = 'analysis', phaseIndices?: number[]) => {
    if (!currentAnalysis) return;
    await generatePDF(type, phaseIndices, parsedPhases, currentAnalysis);
  };

`;
  const newContent = content.substring(0, startIndex) + newFunction + content.substring(endIndex);
  fs.writeFileSync('src/App.tsx', newContent, 'utf8');
  console.log("Replaced successfully");
} else {
  console.log("Could not find start or end");
}
