import { Project, SyntaxKind, JsxText, JsxExpression, Node, StringLiteral } from 'ts-morph';
import * as fs from 'fs';
import * as path from 'path';

// Define the target directories and output JSON paths
const targetDirs = [
  'src/components/doctor',
  'src/components/patient',
  'src/components/admin',
  'src/components/assistant',
  'src/components/appointments',
  'src/app/[locale]/(dashboard)'
];
const enJsonPath = 'src/messages/en/auto.json';
const arJsonPath = 'src/messages/ar/auto.json';

// Utility to create a camelCase key from text
function generateKey(text: string): string {
  const clean = text.replace(/[^a-zA-Z0-9\s]/g, '').trim();
  const words = clean.split(/\s+/).slice(0, 4);
  if (words.length === 0 || words[0] === '') return 'emptyKey';
  const camel = words.map((w, i) => i === 0 ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('');
  return camel || 'generatedKey';
}

async function run() {
  const project = new Project({
    tsConfigFilePath: 'tsconfig.json',
  });

  const enDict: Record<string, string> = {};
  const arDict: Record<string, string> = {};

  if (fs.existsSync(enJsonPath)) Object.assign(enDict, JSON.parse(fs.readFileSync(enJsonPath, 'utf8')));
  if (fs.existsSync(arJsonPath)) Object.assign(arDict, JSON.parse(fs.readFileSync(arJsonPath, 'utf8')));

  for (const dir of targetDirs) {
    const fullDir = path.join(process.cwd(), dir);
    if (!fs.existsSync(fullDir)) continue;

    project.addSourceFilesAtPaths(`${fullDir}/**/*.tsx`);
  }

  const sourceFiles = project.getSourceFiles();
  console.log(`Found ${sourceFiles.length} files to process.`);

  let modifiedFilesCount = 0;

  for (const sourceFile of sourceFiles) {
    let modified = false;

    // Find all JSX Text nodes
    const jsxTexts = sourceFile.getDescendantsOfKind(SyntaxKind.JsxText);
    for (const textNode of jsxTexts) {
      const text = textNode.getLiteralText().trim();
      // Skip if empty, or only symbols/numbers, or looks like code/math
      if (!text || text.length < 2 || !/[a-zA-Z]/.test(text)) continue;
      
      const key = generateKey(text);
      const uniqueKey = enDict[key] && enDict[key] !== text ? `${key}_${Math.random().toString(36).substr(2, 4)}` : key;
      
      enDict[uniqueKey] = text;
      // Mark for manual AR translation later
      if (!arDict[uniqueKey]) arDict[uniqueKey] = `[AR] ${text}`;

      textNode.replaceWithText(`{t('${uniqueKey}')}`);
      modified = true;
    }

    // Find string literals in specific JSX attributes like placeholder, title
    const jsxAttributes = sourceFile.getDescendantsOfKind(SyntaxKind.JsxAttribute);
    for (const attr of jsxAttributes) {
      const name = attr.getNameNode().getText();
      if (['placeholder', 'title', 'label', 'alt'].includes(name)) {
        const init = attr.getInitializer();
        if (Node.isStringLiteral(init)) {
          const text = init.getLiteralValue().trim();
          if (!text || text.length < 2 || !/[a-zA-Z]/.test(text)) continue;

          const key = generateKey(text);
          const uniqueKey = enDict[key] && enDict[key] !== text ? `${key}_${Math.random().toString(36).substr(2, 4)}` : key;
          
          enDict[uniqueKey] = text;
          if (!arDict[uniqueKey]) arDict[uniqueKey] = `[AR] ${text}`;

          init.replaceWithText(`{t('${uniqueKey}')}`);
          modified = true;
        }
      }
    }

    if (modified) {
      // Check if useTranslations is imported
      const imports = sourceFile.getImportDeclarations();
      const hasNextIntl = imports.some(imp => imp.getModuleSpecifierValue() === 'next-intl');
      
      if (!hasNextIntl) {
        sourceFile.addImportDeclaration({
          namedImports: ['useTranslations'],
          moduleSpecifier: 'next-intl'
        });
      }

      // We need to insert `const t = useTranslations('auto');` into the main component.
      // Doing this via AST robustly for all component styles (arrow vs function) is tricky.
      // We will try to find the default export or the first function that returns JSX.
      const functions = sourceFile.getFunctions();
      const arrowFunctions = sourceFile.getDescendantsOfKind(SyntaxKind.ArrowFunction);
      
      const components = [...functions, ...arrowFunctions].filter(f => {
         // rough heuristic: contains JSX
         return f.getDescendantsOfKind(SyntaxKind.JsxElement).length > 0 || f.getDescendantsOfKind(SyntaxKind.JsxSelfClosingElement).length > 0;
      });

      for (const comp of components) {
         // Check if 'const t =' already exists
         const body = comp.getBody();
         if (body && Node.isBlock(body)) {
           const hasT = body.getVariableStatements().some(vs => vs.getText().includes('useTranslations'));
           if (!hasT) {
             body.insertStatements(0, `const t = useTranslations("auto");`);
           }
         }
      }

      modifiedFilesCount++;
    }
  }

  await project.save();

  // Save the dictionaries
  if (!fs.existsSync(path.dirname(enJsonPath))) fs.mkdirSync(path.dirname(enJsonPath), { recursive: true });
  if (!fs.existsSync(path.dirname(arJsonPath))) fs.mkdirSync(path.dirname(arJsonPath), { recursive: true });
  
  fs.writeFileSync(enJsonPath, JSON.stringify(enDict, null, 2));
  fs.writeFileSync(arJsonPath, JSON.stringify(arDict, null, 2));

  console.log(`Successfully translated ${modifiedFilesCount} files.`);
}

run().catch(console.error);
