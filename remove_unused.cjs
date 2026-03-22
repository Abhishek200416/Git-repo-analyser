const fs = require('fs');

const appContent = fs.readFileSync('src/App.tsx', 'utf8');

const termsStart = appContent.indexOf('const Terms = () => (');
const privacyStart = appContent.indexOf('const Privacy = () => (');
const popupAdStart = appContent.indexOf('const PopupAd = ({');
const adBannerStart = appContent.indexOf('const AdBanner = ({');
const copyToClipboardStart = appContent.indexOf('const copyToClipboard = (text: string) => {');

// We can just remove Terms and Privacy since they are unused.
// Let's remove from termsStart to popupAdStart
const newAppContent = appContent.substring(0, termsStart) + appContent.substring(popupAdStart);

fs.writeFileSync('src/App.tsx', newAppContent, 'utf8');
console.log("Removed Terms and Privacy");
