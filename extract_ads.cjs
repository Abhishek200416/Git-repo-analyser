const fs = require('fs');

const appContent = fs.readFileSync('src/App.tsx', 'utf8');

const popupAdStart = appContent.indexOf('const PopupAd = ({');
const adBannerStart = appContent.indexOf('const AdBanner = ({');
const copyToClipboardStart = appContent.indexOf('const copyToClipboard = (text: string) => {');

const popupAdCode = appContent.substring(popupAdStart, adBannerStart);
const adBannerCode = appContent.substring(adBannerStart, copyToClipboardStart);

fs.writeFileSync('src/components/PopupAd.tsx', `import React from 'react';\nimport { motion } from 'motion/react';\nimport { X, Sparkles, Gift } from 'lucide-react';\n\nexport ` + popupAdCode, 'utf8');
fs.writeFileSync('src/components/AdBanner.tsx', `import React from 'react';\nimport { X, ExternalLink } from 'lucide-react';\n\nexport ` + adBannerCode, 'utf8');

const newAppContent = appContent.substring(0, popupAdStart) + appContent.substring(copyToClipboardStart);
fs.writeFileSync('src/App.tsx', newAppContent, 'utf8');

console.log("Extracted PopupAd and AdBanner");
