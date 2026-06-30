import { Project, SyntaxKind, Node } from 'ts-morph';

async function run() {
  const project = new Project({ tsConfigFilePath: 'tsconfig.json' });
  const fs = require('fs');
  const path = require('path');
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

  const filesToProcess = [...walk('src/components'), ...walk('src/app')];
  for(const file of filesToProcess) {
     project.addSourceFileAtPath(file);
  }

  const files = project.getSourceFiles();
  let removedCount = 0;

  for (const file of files) {
    const calls = file.getDescendantsOfKind(SyntaxKind.CallExpression);
    let modified = false;
    
    // We iterate backwards or just collect them first so we don't break iteration
    const toRemove = [];
    
    for (const call of calls) {
      if (call.getExpression().getText() === 'useTranslations' && call.getArguments()[0]?.getText() === '"auto"') {
        const varDecl = call.getFirstAncestorByKind(SyntaxKind.VariableStatement);
        if (varDecl) {
          const parentFuncArrow = varDecl.getFirstAncestorByKind(SyntaxKind.ArrowFunction);
          const parentFuncExpr = varDecl.getFirstAncestorByKind(SyntaxKind.FunctionExpression);
          
          const parentFunc = parentFuncArrow || parentFuncExpr;
          if (parentFunc) {
            // Is this function passed as an argument to another call? e.g. array.map(...)
            const parentCall = parentFunc.getFirstAncestorByKind(SyntaxKind.CallExpression);
            if (parentCall) {
               // Only remove if the function is a direct child of the arguments array, or safely just any CallExpression parent.
               toRemove.push(varDecl);
            }
          }
        }
      }
    }
    
    for (const stmt of toRemove) {
      try {
        if (!stmt.wasForgotten()) {
          stmt.remove();
          modified = true;
          removedCount++;
        }
      } catch (e) {
        // ignore
      }
    }
  }

  await project.save();
  console.log(`Removed ${removedCount} invalid useTranslations calls.`);
}

run().catch(console.error);
