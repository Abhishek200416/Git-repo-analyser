const fs = require('fs');

const appContent = fs.readFileSync('src/App.tsx', 'utf8');

const modalStart = appContent.indexOf('{showDonationModal && (');
const modalEnd = appContent.indexOf('</AnimatePresence>', modalStart) + '</AnimatePresence>'.length;

const newAppContent = appContent.substring(0, modalStart - 20) + 
  `\n      <DonationModal
        show={showDonationModal}
        onClose={() => setShowDonationModal(false)}
      />\n` + 
  appContent.substring(modalEnd);

fs.writeFileSync('src/App.tsx', newAppContent, 'utf8');
console.log("Replaced inline DonationModal with DonationModal component");
