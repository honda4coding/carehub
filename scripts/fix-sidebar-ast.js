const { Project, SyntaxKind } = require('ts-morph');
const project = new Project({ tsConfigFilePath: 'tsconfig.json' });
const file = project.getSourceFile('src/components/global/Sidebar.tsx');

if (!file.getImportDeclaration('next-intl')) {
    file.addImportDeclaration({
        namedImports: ['useTranslations'],
        moduleSpecifier: 'next-intl'
    });
}

const components = ['SettingsGroup', 'NavGroup', 'SidebarContent', 'Sidebar'];
for (const compName of components) {
    const fn = file.getFunction(compName);
    if (fn) {
        if (!fn.getVariableStatement('t')) {
            fn.insertStatements(0, 'const t = useTranslations("auto");');
        }
    }
}

const expressions = file.getDescendantsOfKind(SyntaxKind.JsxExpression);
let count = 0;
for (const expr of expressions) {
    const text = expr.getExpression()?.getText();
    if (text === 'item.label') {
        expr.getExpression().replaceWithText('t(item.label.replace(/[^a-zA-Z0-9]/g, "") as any)');
        count++;
    } else if (text === 'section.title') {
        expr.getExpression().replaceWithText('t(section.title.replace(/[^a-zA-Z0-9]/g, "") as any)');
        count++;
    }
}

file.saveSync();
console.log('Modified ' + count + ' JSX expressions.');
