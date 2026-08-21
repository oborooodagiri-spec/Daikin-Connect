const fs = require('fs');
const glob = require('glob');
const files = glob.sync('src/components/*PDFTemplate.tsx');
let c = 0;
files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  if (content.includes('ReportSignatureFooter') && content.includes('onEngineerSignClick=') && !content.includes('onReviewerSignClick={')) {
    content = content.replace(
      /onEngineerSignClick=\{typeof data !== 'undefined' \? data.onEngineerSignClick : undefined\}/g,
      "onEngineerSignClick={typeof data !== 'undefined' ? data.onEngineerSignClick : undefined}\n         onReviewerSignClick={typeof data !== 'undefined' ? data.onReviewerSignClick : undefined}"
    );
    fs.writeFileSync(f, content);
    console.log('Fixed missing prop in ' + f);
    c++;
  }
});
console.log('Fixed ' + c + ' files');