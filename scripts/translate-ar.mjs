import fs from 'fs';
import { translate } from '@vitalets/google-translate-api';

const arPath = 'src/messages/ar/auto.json';

async function run() {
  if (!fs.existsSync(arPath)) return console.error('auto.json not found');
  
  const dict = JSON.parse(fs.readFileSync(arPath, 'utf8'));
  const keys = Object.keys(dict);
  let updated = 0;

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const val = dict[key];
    
    if (val.startsWith('[AR] ')) {
      const originalText = val.substring(5); // remove [AR] 
      try {
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=ar&dt=t&q=${encodeURIComponent(originalText)}`;
        const response = await fetch(url);
        const data = await response.json();
        const translatedText = data[0].map(x => x[0]).join('');
        dict[key] = translatedText;
        updated++;
        console.log(`Translated [${i+1}/${keys.length}]: ${originalText} -> ${translatedText}`);
        
        // Save every 10 translations to avoid losing progress
        if (updated % 10 === 0) {
            fs.writeFileSync(arPath, JSON.stringify(dict, null, 2));
        }
        
        // Sleep a bit to avoid rate limits
        await new Promise(r => setTimeout(r, 3000));
      } catch (err) {
        console.error(`Failed to translate: ${originalText}`, err.message);
        // Save current progress and exit on block
        fs.writeFileSync(arPath, JSON.stringify(dict, null, 2));
        break;
      }
    }
  }

  fs.writeFileSync(arPath, JSON.stringify(dict, null, 2));
  console.log(`Finished translating ${updated} strings.`);
}

run();
