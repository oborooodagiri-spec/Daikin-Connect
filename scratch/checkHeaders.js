const http = require('http');

http.get('http://localhost:3000/api/assets/preventive/1779698727905-blob', (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  console.log(`HEADERS: ${JSON.stringify(res.headers, null, 2)}`);
  res.on('data', () => {});
  res.on('end', () => console.log('Done'));
});
