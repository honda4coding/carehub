const fs = require('fs');
const path = 'src/components/global/Sidebar.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace('const { user, logout } = useAuth();', 'const { user, logout } = useAuth();\n    const tAuto = useTranslations("auto");');

fs.writeFileSync(path, content);
console.log('Fixed SidebarContent tAuto reference');
