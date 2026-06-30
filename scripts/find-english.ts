import { Project, SyntaxKind, StringLiteral, JsxText } from 'ts-morph';

const project = new Project({ tsConfigFilePath: 'tsconfig.json' });
project.addSourceFilesAtPaths([
  'src/components/**/*.tsx',
  'src/app/[locale]/(dashboard)/**/*.tsx'
]);

const files = project.getSourceFiles();

const ignoredNames = ['auto', 'common', 'className', 'id', 'name', 'type', 'key', 'variant', 'size', 'href'];

let englishStrings = new Set<string>();

for (const file of files) {
  // Find StringLiterals that might be user-facing text
  const strings = file.getDescendantsOfKind(SyntaxKind.StringLiteral);
  for (const s of strings) {
    const text = s.getLiteralValue();
    // Only care if it contains alphabet chars and is > 2 chars
    if (!/[a-zA-Z]{2,}/.test(text)) continue;
    // Ignore camelCase, PascalCase, or snake_case which are usually keys
    if (/^[a-z]+[A-Z][a-zA-Z]*$/.test(text)) continue; // camelCase
    if (/^[A-Z][a-zA-Z]*$/.test(text)) continue; // PascalCase (mostly) - actually some PascalCase are labels.
    if (/^[a-z_]+$/.test(text)) continue; // snake_case
    
    // Check parent to see if it's an attribute like className, id, etc.
    const parent = s.getParent();
    if (parent && parent.getKind() === SyntaxKind.JsxAttribute) {
      const attrName = (parent as any).getNameNode().getText();
      if (ignoredNames.includes(attrName)) continue;
    }
    
    // Also ignore if it's an import path
    if (parent && parent.getKind() === SyntaxKind.ImportDeclaration) continue;

    englishStrings.add(`[Literal] ${file.getBaseName()}: "${text}"`);
  }
}

console.log(`Found ${englishStrings.size} potential English strings.`);
Array.from(englishStrings).slice(0, 50).forEach(s => console.log(s));
