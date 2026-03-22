const fs = require('fs');

let appContent = fs.readFileSync('src/App.tsx', 'utf8');

function replaceModal(content, stateVar, componentName) {
  const startStr = `{${stateVar} && (`;
  const startIdx = content.indexOf(startStr);
  if (startIdx === -1) return content;
  
  const endStr = '</AnimatePresence>';
  const endIdx = content.indexOf(endStr, startIdx) + endStr.length;
  
  // Find the AnimatePresence before the startStr
  const apStartStr = '<AnimatePresence>';
  const apStartIdx = content.lastIndexOf(apStartStr, startIdx);
  
  return content.substring(0, apStartIdx) + 
    `\n      <${componentName}
        show={${stateVar}}
        onClose={() => set${stateVar.charAt(0).toUpperCase() + stateVar.slice(1)}(false)}
      />\n` + 
    content.substring(endIdx);
}

appContent = replaceModal(appContent, 'showCookieModal', 'CookieModal');
appContent = replaceModal(appContent, 'showPrivacyModal', 'PrivacyModal');
appContent = replaceModal(appContent, 'showTermsModal', 'TermsModal');

fs.writeFileSync('src/App.tsx', appContent, 'utf8');
console.log("Replaced inline Terms, Privacy, and Cookie modals with components");
