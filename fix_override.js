const fs = require('fs');
let text = fs.readFileSync('src/app/admin/live-data/DealFormModal.tsx', 'utf8');

const search = `                    <div className="space-y-1.5">\r\n                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">\r\n                        <Calendar size={12}/> Closed Period (Override FY)\r\n                      </label>\r\n                      <select name="closed_period" value={formData.closed_period} onChange={handleChange}\r\n                        className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all appearance-none cursor-pointer">\r\n                        <option value="">Auto (Ikuti Target PO)</option>\r\n                        <option value="FY24">FY24</option>\r\n                        <option value="FY25">FY25</option>\r\n                        <option value="FY26">FY26</option>\r\n                        <option value="FY27">FY27</option>\r\n                        <option value="FY28">FY28</option>\r\n                        <option value="FY29">FY29</option>\r\n                        <option value="FY30">FY30</option>\r\n                      </select>\r\n                    </div>`;

const replace = `                  {(deal?.is_closed || deal?.status === 'A') && (
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

text = text.replace(search, replace);
text = text.replace(search.replace(/\r\n/g, '\n'), replace);

fs.writeFileSync('src/app/admin/live-data/DealFormModal.tsx', text);
