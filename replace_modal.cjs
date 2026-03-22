const fs = require('fs');

const appContent = fs.readFileSync('src/App.tsx', 'utf8');

const modalStart = appContent.indexOf('{showPhaseSelector && (');
const modalEnd = appContent.indexOf('</AnimatePresence>', modalStart) + '</AnimatePresence>'.length;

const newAppContent = appContent.substring(0, modalStart - 20) + 
  `\n      <PhaseSelectorModal
        show={showPhaseSelector}
        onClose={() => setShowPhaseSelector(false)}
        exportType={exportType}
        parsedPhases={parsedPhases}
        selectedPhasesForExport={selectedPhasesForExport}
        setSelectedPhasesForExport={setSelectedPhasesForExport}
        onExport={exportToPDF}
      />\n` + 
  appContent.substring(modalEnd);

fs.writeFileSync('src/App.tsx', newAppContent, 'utf8');
console.log("Replaced inline modal with PhaseSelectorModal component");
