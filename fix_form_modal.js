const fs = require('fs');
let text = fs.readFileSync('src/app/admin/live-data/DealFormModal.tsx', 'utf8');

const regex = /<div className="space-y-1\.5">\s*<label className="text-\[10px\] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1\.5">\s*<Calendar size=\{12\}\/> Closed Period \(Override FY\)\s*<\/label>\s*<select name="closed_period" value=\{formData\.closed_period\} onChange=\{handleChange\}\s*className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500\/10 outline-none transition-all appearance-none cursor-pointer">\s*<option value="">Auto \(Ikuti Target PO\)<\/option>\s*<option value="FY24">FY24<\/option>\s*<option value="FY25">FY25<\/option>\s*<option value="FY26">FY26<\/option>\s*<option value="FY27">FY27<\/option>\s*<option value="FY28">FY28<\/option>\s*<option value="FY29">FY29<\/option>\s*<option value="FY30">FY30<\/option>\s*<\/select>\s*<\/div>/g;

const replacement = `{(deal?.is_closed || formData.status === 'A') && (
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                      <Calendar size={12}/> Closed Period (Override FY)
                    </label>
                    <select name="closed_period" value={formData.closed_period} onChange={handleChange}
                      className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all appearance-none cursor-pointer">
                      <option value="">Auto (Ikuti Target PO)</option>
                      <option value="FY24">FY24</option>
                      <option value="FY25">FY25</option>
                      <option value="FY26">FY26</option>
                      <option value="FY27">FY27</option>
                      <option value="FY28">FY28</option>
                      <option value="FY29">FY29</option>
                      <option value="FY30">FY30</option>
                    </select>
                  </div>
                )}`;

if (regex.test(text)) {
  text = text.replace(regex, replacement);
  fs.writeFileSync('src/app/admin/live-data/DealFormModal.tsx', text);
  console.log('Replaced successfully');
} else {
  console.log('Regex did not match!');
}
