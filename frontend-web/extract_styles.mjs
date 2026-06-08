import fs from 'fs';

const html = fs.readFileSync('/Users/abdulsametevlice/Desktop/gelir-gider-app/cashio.html', 'utf8');

const styleMatch = html.match(/<style>([\s\S]*?)<\/style>/);
if (styleMatch) {
  let css = styleMatch[1];
  // Replace references to images if any, but cashio seems to have none explicitly that fail..
  // We need to keep Tailwind directives
  const finalCss = `@tailwind base;\n@tailwind components;\n@tailwind utilities;\n\n${css}`;
  fs.writeFileSync('/Users/abdulsametevlice/Desktop/gelir-gider-app/frontend-web/src/index.css', finalCss);
  console.log('index.css successfully rewritten!');
} else {
  console.log('style not found');
}
