const month = 7;
const year = 2026;

const startStr = `${year}-${String(month + 1).padStart(2, '0')}-01T00:00:00.000+07:00`;
const start = new Date(startStr);
const lastDay = new Date(year, month + 1, 0).getDate();
const endStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}T23:59:59.999+07:00`;
const end = new Date(endStr);

console.log("August start UTC:", start.toISOString());
console.log("August end UTC:", end.toISOString());

const recordUTC = new Date("2026-07-31T23:06:00.000Z"); // User check in at Aug 1 06:06 WIB
console.log("Record is in August range?", recordUTC >= start && recordUTC <= end);

const julyMonth = 6;
const jStartStr = `${year}-${String(julyMonth + 1).padStart(2, '0')}-01T00:00:00.000+07:00`;
const jStart = new Date(jStartStr);
const jLastDay = new Date(year, julyMonth + 1, 0).getDate();
const jEndStr = `${year}-${String(julyMonth + 1).padStart(2, '0')}-${String(jLastDay).padStart(2, '0')}T23:59:59.999+07:00`;
const jEnd = new Date(jEndStr);

console.log("July start UTC:", jStart.toISOString());
console.log("July end UTC:", jEnd.toISOString());
console.log("Record is in July range?", recordUTC >= jStart && recordUTC <= jEnd);
