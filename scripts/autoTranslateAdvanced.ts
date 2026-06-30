import { Project, SyntaxKind, Node, StringLiteral } from 'ts-morph';
import * as fs from 'fs';
import * as path from 'path';

const targetDirs = [
  'src/components',
  'src/app'
];
const enJsonPath = 'src/messages/en/auto.json';
const arJsonPath = 'src/messages/ar/auto.json';

function generateKey(text: string): string {
  const clean = text.replace(/[^a-zA-Z0-9\s]/g, '').trim();
  const words = clean.split(/\s+/).slice(0, 4);
  if (words.length === 0 || words[0] === '') return 'emptyKey';
  const camel = words.map((w, i) => i === 0 ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('');
  return camel || 'generatedKey';
}

async function run() {
  const project = new Project({ tsConfigFilePath: 'tsconfig.json' });

  const enDict: Record<string, string> = {};
  const arDict: Record<string, string> = {};

  if (fs.existsSync(enJsonPath)) Object.assign(enDict, JSON.parse(fs.readFileSync(enJsonPath, 'utf8')));
  if (fs.existsSync(arJsonPath)) Object.assign(arDict, JSON.parse(fs.readFileSync(arJsonPath, 'utf8')));

  function walk(dir: string): string[] {
    let results: string[] = [];
    const list = fs.readdirSync(dir);
    list.forEach((file: string) => {
      file = path.join(dir, file);
      const stat = fs.statSync(file);
      if (stat && stat.isDirectory()) { 
        results = results.concat(walk(file));
      } else if (file.endsWith('.tsx')) {
        results.push(file);
      }
    });
    return results;
  }

  for (const dir of targetDirs) {
    const fullDir = path.join(process.cwd(), dir);
    if (!fs.existsSync(fullDir)) continue;
    const files = walk(fullDir);
    for (const file of files) {
      project.addSourceFileAtPath(file);
    }
  }

  const sourceFiles = project.getSourceFiles();
  console.log(`Found ${sourceFiles.length} files to process.`);
  let modifiedFilesCount = 0;

  for (const sourceFile of sourceFiles) {
    let modified = false;

    // 1. JsxAttributes: label, subtitle, description, title, placeholder
    const jsxAttributes = sourceFile.getDescendantsOfKind(SyntaxKind.JsxAttribute);
    for (const attr of jsxAttributes) {
      const name = attr.getNameNode().getText();
      if (['label', 'subtitle', 'description', 'title', 'placeholder', 'fallback'].includes(name)) {
        const init = attr.getInitializer();
        if (Node.isStringLiteral(init)) {
          const text = init.getLiteralValue().trim();
          if (!text || text.length < 2 || !/[a-zA-Z]/.test(text)) continue;

          const key = generateKey(text);
          const uniqueKey = enDict[key] && enDict[key] !== text ? `${key}_${Math.random().toString(36).substr(2, 4)}` : key;
          
          enDict[uniqueKey] = text;
          if (!arDict[uniqueKey]) arDict[uniqueKey] = `[AR] ${text}`;

          // Replace `label="Text"` with `label={t('text')}`
          init.replaceWithText(`{t('${uniqueKey}')}`);
          modified = true;
        }
      }
    }

    // 2. Toasts and Zod Errors
    const stringLiterals = sourceFile.getDescendantsOfKind(SyntaxKind.StringLiteral);
    for (const s of stringLiterals) {
        const text = s.getLiteralValue().trim();
        if (!text || text.length < 2 || !/[a-zA-Z]/.test(text)) continue;
        
        // Ignore single words if they are lowercase or camelCase
        if (/^[a-z]+[A-Z]?[a-z]*$/.test(text) && !text.includes(' ')) continue;

        const parent = s.getParent();
        if (parent && parent.getKind() === SyntaxKind.CallExpression) {
            const callExp = parent.asKind(SyntaxKind.CallExpression);
            if (callExp) {
                const exprText = callExp.getExpression().getText();
                // Match toast("..."), toast.success("..."), onToast("...")
                if (exprText.includes('toast') || exprText.includes('onToast') || exprText.includes('setToast') || exprText.includes('setToastMsg') || exprText.includes('setBioToast')) {
                    const key = generateKey(text);
                    const uniqueKey = enDict[key] && enDict[key] !== text ? `${key}_${Math.random().toString(36).substr(2, 4)}` : key;
                    enDict[uniqueKey] = text;
                    if (!arDict[uniqueKey]) arDict[uniqueKey] = `[AR] ${text}`;
                    
                    s.replaceWithText(`t('${uniqueKey}')`);
                    modified = true;
                }
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

      // Inject t safely at top level components (not inner loops)
      const functions = sourceFile.getFunctions();
      const arrowFunctions = sourceFile.getDescendantsOfKind(SyntaxKind.ArrowFunction);
      
      const components = [...functions, ...arrowFunctions].filter(f => {
         return f.getDescendantsOfKind(SyntaxKind.JsxElement).length > 0 || f.getDescendantsOfKind(SyntaxKind.JsxSelfClosingElement).length > 0;
      });

      for (const comp of components) {
         // ONLY inject if this component is NOT inside a CallExpression (like .map)
         if (comp.getFirstAncestorByKind(SyntaxKind.CallExpression)) continue;

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
  fs.writeFileSync(enJsonPath, JSON.stringify(enDict, null, 2));
  fs.writeFileSync(arJsonPath, JSON.stringify(arDict, null, 2));

  console.log(`Successfully extracted advanced translations from ${modifiedFilesCount} files.`);
}

run().catch(console.error);
