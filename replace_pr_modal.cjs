const fs = require('fs');

const appContent = fs.readFileSync('src/App.tsx', 'utf8');

const modalStart = appContent.indexOf('{showPRModal && (');
const modalEnd = appContent.indexOf('</AnimatePresence>', modalStart) + '</AnimatePresence>'.length;

const newAppContent = appContent.substring(0, modalStart - 20) + 
  `\n      <PRModal
        show={showPRModal}
        onClose={() => setShowPRModal(false)}
        prConfig={prConfig}
        setPrConfig={setPrConfig}
        onGenerate={() => {
          setShowPRModal(false);
          setShowPRCommands(true);
        }}
      />\n` + 
  appContent.substring(modalEnd);

fs.writeFileSync('src/App.tsx', newAppContent, 'utf8');
console.log("Replaced inline PRModal with PRModal component");
