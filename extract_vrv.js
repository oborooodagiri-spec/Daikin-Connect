const fs = require('fs');
const path = require('path');

const filePath = 'C:\\Users\\D22AGRI-EPL\\.gemini\\antigravity\\brain\\dee6cee5-f2b0-41dd-8878-e58424e3ce3f\\.system_generated\\steps\\2937\\content.md';
const content = fs.readFileSync(filePath, 'utf-8');

// Regex to find things inside <h1, <h2, <h3, <h4 or with class="title" or something that looks like a product name
const matches = content.match(/<h[1-4][^>]*>(.*?)<\/h[1-4]>/g);
if (matches) {
    matches.forEach(m => {
        const text = m.replace(/<[^>]+>/g, '').trim();
        if (text) console.log("Header:", text);
    });
}

// Also let's try to find text inside <span class="product-title"> or similar?
const spans = content.match(/<span[^>]*>(.*?)<\/span>/g);
if (spans) {
    spans.forEach(s => {
        const text = s.replace(/<[^>]+>/g, '').trim();
        if (text && text.includes('VRV')) console.log("Span:", text);
    });
}

const divs = content.match(/<div[^>]*class="[^"]*title[^"]*"[^>]*>(.*?)<\/div>/gi);
if (divs) {
    divs.forEach(d => {
        const text = d.replace(/<[^>]+>/g, '').trim();
        if (text) console.log("Div title:", text);
    });
}
