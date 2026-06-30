const fs = require('fs');
const path = 'src/components/global/Sidebar.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(/const t = useTranslations\("auto"\);/g, 'const tAuto = useTranslations("auto");');
content = content.replace(/t\('carehub'\)/g, 'tAuto(\'carehub\')');
content = content.replace(/t\('avatar'\)/g, 'tAuto(\'avatar\')');
content = content.replace(/t\('signOut'\)/g, 'tAuto(\'signOut\')');

fs.writeFileSync(path, content);
console.log('Fixed Sidebar.tsx');
