const fs = require('fs');
let text = fs.readFileSync('src/app/admin/live-data/PartialCloseModal.tsx', 'utf8');

text = text.replace(
  'onFullClose: (deal: DealData) => Promise<void>;\r\n  onPartialClose: (deal: DealData, amount: number) => Promise<void>;',
  'onFullClose: (deal: DealData, overrideFY?: string) => Promise<void>;\n  onPartialClose: (deal: DealData, amount: number, overrideFY?: string) => Promise<void>;'
);
text = text.replace(
  'onFullClose: (deal: DealData) => Promise<void>;\n  onPartialClose: (deal: DealData, amount: number) => Promise<void>;',
  'onFullClose: (deal: DealData, overrideFY?: string) => Promise<void>;\n  onPartialClose: (deal: DealData, amount: number, overrideFY?: string) => Promise<void>;'
);

text = text.replace(
  'const [isSubmitting, setIsSubmitting] = useState(false);',
  'const [isSubmitting, setIsSubmitting] = useState(false);\n  const [closedPeriod, setClosedPeriod] = useState<string>("");'
);

text = text.replace(
  'await onFullClose(deal);',
  'await onFullClose(deal, closedPeriod);'
);

text = text.replace(
  'await onPartialClose(deal, numAmount);',
  'await onPartialClose(deal, numAmount, closedPeriod);'
);

const selectHtml = `
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              Closed Period (Override FY)
            </label>
            <select name="closed_period" value={closedPeriod} onChange={(e) => setClosedPeriod(e.target.value)}
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
`;

text = text.replace(
  '<div className="p-6 space-y-6">\r\n          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">',
  '<div className="p-6 space-y-6">\n          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">'
);

text = text.replace(
  '<div className="p-6 space-y-6">\n          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">',
  `<div className="p-6 space-y-6">\n${selectHtml}\n          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">`
);

fs.writeFileSync('src/app/admin/live-data/PartialCloseModal.tsx', text);
