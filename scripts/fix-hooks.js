const fs = require('fs');
const path = 'src/components/global/Sidebar.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Remove ALL inner map hook calls
content = content.replace(/\{subItems\.map\(\(item\) => \{\s*const tAuto = useTranslations\("auto"\);/g, '{subItems.map((item) => {');
content = content.replace(/\{subItems\.map\(\(sub\) => \{\s*const tAuto = useTranslations\("auto"\);/g, '{subItems.map((sub) => {');
content = content.replace(/\{section\.items\.map\(\(item\) => \{\s*const tAuto = useTranslations\("auto"\);/g, '{section.items.map((item) => {');

// 2. Add tAuto to SettingsGroup
const settingsGroupFind = 'function SettingsGroup({\n  role,\n  onClose,\n}: {\n  role: string;\n  onClose?: () => void;\n}) {\n  const pathname = usePathname();';
const settingsGroupReplace = 'function SettingsGroup({\n  role,\n  onClose,\n}: {\n  role: string;\n  onClose?: () => void;\n}) {\n  const tAuto = useTranslations("auto");\n  const pathname = usePathname();';
content = content.replace(settingsGroupFind, settingsGroupReplace);

// 3. Add tAuto to NavGroup
const navGroupFind = 'function NavGroup({ item, onClose }: { item: NavItem; onClose?: () => void }) {\n  const pathname = usePathname();';
const navGroupReplace = 'function NavGroup({ item, onClose }: { item: NavItem; onClose?: () => void }) {\n  const tAuto = useTranslations("auto");\n  const pathname = usePathname();';
content = content.replace(navGroupFind, navGroupReplace);

fs.writeFileSync(path, content);
console.log('Fixed React hook violation in Sidebar.tsx');
