require('dotenv').config();
const { translateReportStringsAction } = require('./src/app/actions/translate');

async function test() {
  const result = await translateReportStringsAction({ test: "Cooling coil is dirty" }, "ja");
  console.log(JSON.stringify(result, null, 2));
}

test();
