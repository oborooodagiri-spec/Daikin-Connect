import React from 'react';
import { t, Language } from '@/lib/i18n';

// ─── Color Palette ──────────────────────────────────────────────────────────
const C = {
  navy: '#003366',
  cyan: '#00a1e4',
  headerBg: '#003366',
  headerFg: '#ffffff',
  catBg: '#f1f5f9',
  rowEven: '#ffffff',
  rowOdd: '#f8fafc',
  designText: '#94a3b8',
  border: '#cbd5e1',
  statusOn: '#059669',
  statusOff: '#dc2626',
  statusTrip: '#ea580c',
  statusNormal: '#059669',
  statusAlarm: '#dc2626',
};

// ─── Shared styles ──────────────────────────────────────────────────────────
const S = {
  page: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    fontFamily: "'Segoe UI', 'Helvetica Neue', Arial, sans-serif",
    fontSize: '7pt',
    color: '#1e293b',
    lineHeight: 1.3,
  } as React.CSSProperties,
  thCell: {
    border: `0.5pt solid ${C.border}`,
    padding: '1.2mm 1mm',
    fontSize: '6.5pt',
    fontWeight: 800,
    color: C.headerFg,
    backgroundColor: C.headerBg,
    textAlign: 'center' as const,
    whiteSpace: 'nowrap' as const,
    lineHeight: 1.2,
  } as React.CSSProperties,
  thCellWrap: {
    border: `0.5pt solid ${C.border}`,
    padding: '1mm 1mm',
    fontSize: '6pt',
    fontWeight: 800,
    color: C.headerFg,
    backgroundColor: C.headerBg,
    textAlign: 'center' as const,
    lineHeight: 1.15,
  } as React.CSSProperties,
  tdCell: {
    border: `0.5pt solid ${C.border}`,
    padding: '0.5mm 1mm',
    fontSize: '6.5pt',
    textAlign: 'center' as const,
    fontWeight: 600,
  } as React.CSSProperties,
  tdLabel: {
    border: `0.5pt solid ${C.border}`,
    padding: '0.5mm 1.5mm',
    fontSize: '6.5pt',
    textAlign: 'left' as const,
    fontWeight: 700,
    color: C.navy,
    whiteSpace: 'nowrap' as const,
    backgroundColor: '#f8fafd',
  } as React.CSSProperties,
  catRow: {
    backgroundColor: C.catBg,
    borderLeft: `5px solid ${C.cyan}`,
    fontSize: '10pt',
    fontWeight: 900,
    color: C.navy,
  } as React.CSSProperties,
  table: {
    width: '100%',
    borderCollapse: 'collapse' as const,
    tableLayout: 'fixed' as const,
  } as React.CSSProperties,
};

// ─── Helpers ────────────────────────────────────────────────────────────────
const statusColor = (val: string): string => {
  if (!val || val === '-') return '#64748b';
  const v = val.toString().toUpperCase().trim();
  if (v === 'ON' || v === 'RUNNING' || v === 'NORMAL' || v === 'OPEN') return C.statusOn;
  if (v === 'OFF' || v === 'STOP' || v === 'CLOSED') return C.statusOff;
  if (v === 'TRIP' || v === 'ALARM' || v === 'ERROR' || v === 'FAULT') return C.statusTrip;
  return '#1e293b';
};

const formatDate = (d: string) => {
  if (!d) return '-';
  try {
    const dt = new Date(d);
    return dt.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
  } catch { return d; }
};

// ─── Page Header ────────────────────────────────────────────────────────────
const renderPageHeader = (
  sectionTitle: string,
  date: string,
  inspector: string,
  pageNum: string,
) => (
  <div style={{ marginBottom: '3mm' }}>
    {/* Top bar */}
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderBottom: `3px solid ${C.navy}`,
      paddingBottom: '2mm',
      marginBottom: '2mm',
    }}>
      <div style={{ flex: 1 }}>
        <div style={{
          fontSize: '14pt',
          fontWeight: 900,
          color: C.navy,
          letterSpacing: '0.5px',
          lineHeight: 1.2,
        }}>
          DAILY LOGSHEET — HVAC MONITORING REPORT
        </div>
        <div style={{
          fontSize: '9pt',
          fontWeight: 700,
          color: C.cyan,
          marginTop: '0.5mm',
          letterSpacing: '1px',
        }}>
          LANUD ROESMIN NURJADIN — RAFALE SIMULATOR
        </div>
      </div>
      {/* Logo placeholder */}
      <div style={{
        width: '28mm',
        height: '14mm',
        border: `1.5px solid ${C.navy}`,
        borderRadius: '2mm',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '8pt',
        fontWeight: 900,
        color: C.navy,
        backgroundColor: '#f0f4f8',
        letterSpacing: '1px',
      }}>
        DAIKIN
      </div>
    </div>

    {/* Info row */}
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{ display: 'flex', gap: '8mm', fontSize: '7.5pt' }}>
        <div>
          <span style={{ fontWeight: 800, color: C.navy }}>Date: </span>
          <span style={{ fontWeight: 600 }}>{formatDate(date)}</span>
        </div>
        <div>
          <span style={{ fontWeight: 800, color: C.navy }}>Inspector: </span>
          <span style={{ fontWeight: 600 }}>{inspector || '-'}</span>
        </div>
      </div>
      <div style={{ fontSize: '7pt', fontWeight: 600, color: '#64748b' }}>{pageNum}</div>
    </div>

    {/* Section title */}
    {sectionTitle && (
      <div style={{
        ...S.catRow,
        padding: '1.5mm 3mm',
        marginTop: '2mm',
        borderRadius: '1mm',
      }}>
        {sectionTitle}
      </div>
    )}
  </div>
);

// ─── Page Footer ────────────────────────────────────────────────────────────
const renderPageFooter = () => (
  <div style={{
    marginTop: 'auto',
    borderTop: `1px solid ${C.border}`,
    paddingTop: '1.5mm',
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '6pt',
    color: '#94a3b8',
  }}>
    <span>PT. DAIKIN APPLIED SOLUTION INDONESIA — Confidential</span>
    <span>Generated by EPL LINK</span>
  </div>
);

// ─── Design value annotation ────────────────────────────────────────────────
const dv = (label: string, design?: string) => (
  <div>
    <div>{label}</div>
    {design && (
      <div style={{ fontSize: '5pt', color: C.designText, fontWeight: 500, fontStyle: 'italic' }}>
        ({design})
      </div>
    )}
  </div>
);

// ═══════════════════════════════════════════════════════════════════════════
// MAIN EXPORT
// ═══════════════════════════════════════════════════════════════════════════
export const getLogsheetRoesminSections = (data: any, lang: Language = 'id') => {
  const { date, inspector, formData } = data || {};
  const getVal = (unitId: string, paramKey: string): string =>
    formData?.[unitId]?.[paramKey]?.toString() || '-';

  const pages: React.ReactElement[] = [];

  // ═══════════════════════════════════════════════════════════════════════
  // PAGE 1: CHILLER (ch_1 to ch_10)
  // ═══════════════════════════════════════════════════════════════════════
  const chillerIds = Array.from({ length: 10 }, (_, i) => `ch_${i + 1}`);
  const chillerParams: { key: string; label: string; design?: string; unit?: string }[] = [
    { key: 'status', label: 'Status' },
    { key: 'run_hours', label: 'Run Hours' },
    { key: 'mv_status', label: 'MV Status' },
    { key: 'capacity', label: 'Cap.', unit: '%' },
    { key: 'ewt', label: 'EWT', design: '12', unit: '°C' },
    { key: 'lwt', label: 'LWT', design: '7', unit: '°C' },
    { key: 'delta_t', label: 'Δt', design: '5', unit: '°C' },
    { key: 'press_inlet', label: 'P.Inlet', unit: 'Bar' },
    { key: 'press_outlet', label: 'P.Outlet', unit: 'Bar' },
    { key: 'delta_p', label: 'ΔP', unit: 'Bar' },
    { key: 'arus_r', label: 'Arus R', design: '168.5', unit: 'Amp' },
    { key: 'arus_s', label: 'Arus S', design: '168.5', unit: 'Amp' },
    { key: 'arus_t', label: 'Arus T', design: '168.5', unit: 'Amp' },
    { key: 'volt_rs', label: 'V RS', design: '400', unit: 'V' },
    { key: 'volt_rt', label: 'V RT', design: '400', unit: 'V' },
    { key: 'volt_st', label: 'V ST', design: '400', unit: 'V' },
    { key: 'condenser', label: 'Condenser' },
  ];

  const chwpIds = ["chwp_2.01", "chwp_2.02", "chwp_1.01", "chwp_1.02", "chwp_1.03", "chwp_1.04"];
  const chwpLabels = ["CHWP 2.01", "CHWP 2.02", "CHWP 1.01", "CHWP 1.02", "CHWP 1.03", "CHWP 1.04"];
  const chwpParams = [
    { key: "status", label: "Status" },
    { key: "press_inlet", label: "P.Inlet", unit: "Bar" },
    { key: "press_outlet", label: "P.Outlet", unit: "Bar" },
    { key: "delta_p", label: "ΔP", unit: "Bar" },
    { key: "arus_r", label: "Arus R", unit: "Amp", design: "15.6" },
    { key: "arus_s", label: "Arus S", unit: "Amp", design: "15.6" },
    { key: "arus_t", label: "Arus T", unit: "Amp", design: "15.6" },
    { key: "volt_rs", label: "V RS", unit: "V", design: "400" },
    { key: "volt_rt", label: "V RT", unit: "V", design: "400" },
    { key: "volt_st", label: "V ST", unit: "V", design: "400" },
  ];

  const mainLineParams = [
    { key: "temp_inlet", label: "Temp Inlet", unit: "°C", design: "7" },
    { key: "temp_outlet", label: "Temp Outlet", unit: "°C", design: "12" },
    { key: "water_flow", label: "Water Flow", unit: "L/s" },
    { key: "mv_persen", label: "MV", unit: "%" },
  ];

  const cracParams = [
    { key: "status", label: "Status Unit" },
    { key: "fan_status", label: "Status Fan" },
    { key: "comp1", label: "Status Comp - 1" },
    { key: "comp2", label: "Status Comp - 2" },
    { key: "temp_alarm", label: "Temp High Alarm" },
    { key: "rh_alarm", label: "RH High Alarm" },
    { key: "alarm_status", label: "Alarm Status" },
    { key: "fan_speed", label: "Supply Fan Speed", unit: "%" },
    { key: "return_temp", label: "Return Air Temp", unit: "°C" },
    { key: "return_rh", label: "Return Air RH", unit: "%" },
  ];

  const cracUnits = [
    { id: "crac_gf_01", label: "CRAC-GF-01" },
    { id: "crac_gf_02", label: "CRAC-GF-02" },
    { id: "crac_2nd_01", label: "CRAC-2ND-01" },
    { id: "crac_2nd_02", label: "CRAC-2ND-02" }
  ];

  const powerParams = [
    { key: "l1_l2", label: "L1 - L2", unit: "V", design: "400" },
    { key: "l2_l3", label: "L2 - L3", unit: "V", design: "400" },
    { key: "l3_l1", label: "L3 - L1", unit: "V", design: "400" },
  ];


  pages.push(
    <div key="page-1-plant" style={S.page}>
      {renderPageHeader('DAILY LOGSHEET — HVAC MONITORING REPORT', date, inspector, 'Page 1 of 4')}
      
      <div style={{ padding: '0 2mm' }}>
        <div style={{ ...S.catRow, marginBottom: '1.5mm', fontSize: '7.5pt' }}>CHILLER PERFORMANCE — CH-1 to CH-10</div>
        <table style={S.table}>
          <thead>
            <tr>
              <th style={{ ...S.thCell, width: '55px', textAlign: 'left' as const }}>UNIT</th>
              {chillerParams.map((p) => (
                <th key={p.key} style={S.thCellWrap}>
                  {dv(`${p.label}${p.unit ? ` (${p.unit})` : ''}`, p.design)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {chillerIds.map((id, idx) => (
              <tr key={id} style={{ backgroundColor: idx % 2 === 0 ? C.rowEven : C.rowOdd }}>
                <td style={S.tdLabel}>Chiller {idx + 1}</td>
                {chillerParams.map((p) => {
                  const val = getVal(id, p.key);
                  const isStatus = p.key === 'status' || p.key === 'mv_status' || p.key === 'condenser';
                  return (
                    <td key={p.key} style={{
                      ...S.tdCell,
                      color: isStatus ? statusColor(val) : undefined,
                      fontWeight: isStatus ? 800 : 600,
                    }}>
                      {val}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ display: 'flex', gap: '4mm', marginTop: '3mm' }}>
          {/* CHWP Table */}
          <div style={{ flex: 1.5 }}>
            <div style={{ ...S.catRow, marginBottom: '1.5mm', fontSize: '7.5pt' }}>CHILLED WATER PUMPS (CHWP)</div>
            <table style={S.table}>
              <thead>
                <tr>
                  <th style={{ ...S.thCell, width: '70px', textAlign: 'left' as const }}>UNIT</th>
                  {chwpParams.map((p) => (
                    <th key={p.key} style={S.thCellWrap}>
                      {dv(`${p.label}${p.unit ? ` (${p.unit})` : ''}`, p.design)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {chwpIds.map((id, idx) => (
                  <tr key={id} style={{ backgroundColor: idx % 2 === 0 ? C.rowEven : C.rowOdd }}>
                    <td style={S.tdLabel}>{chwpLabels[idx]}</td>
                    {chwpParams.map((p) => {
                      const val = getVal(id, p.key);
                      return (
                        <td key={p.key} style={{
                          ...S.tdCell,
                          color: p.key === 'status' ? statusColor(val) : undefined,
                          fontWeight: p.key === 'status' ? 800 : 600,
                        }}>
                          {val}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Main Line Pipe */}
          <div style={{ flex: 1 }}>
            <div style={{ ...S.catRow, marginBottom: '1.5mm', fontSize: '7.5pt' }}>MAIN LINE PIPE</div>
            <table style={S.table}>
              <thead>
                <tr>
                  <th style={{ ...S.thCell, width: '120px', textAlign: 'left' as const }}>PARAMETER</th>
                  <th style={{ ...S.thCell, width: '80px' }}>DESIGN</th>
                  <th style={{ ...S.thCell, width: '100px' }}>ACTUAL</th>
                </tr>
              </thead>
              <tbody>
                {mainLineParams.map((p, idx) => (
                  <tr key={p.key} style={{ backgroundColor: idx % 2 === 0 ? C.rowEven : C.rowOdd }}>
                    <td style={S.tdLabel}>{p.label} {p.unit ? `(${p.unit})` : ''}</td>
                    <td style={{ ...S.tdCell, color: C.designText, fontStyle: 'italic' }}>
                      {p.design || '-'}
                    </td>
                    <td style={{ ...S.tdCell, fontWeight: 700 }}>
                      {getVal('main_line', p.key)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {renderPageFooter()}
    </div>
  );

  // ═══════════════════════════════════════════════════════════════════════
  // PAGE 3: AHU
  // ═══════════════════════════════════════════════════════════════════════
  const ahuUnits = [
    { id: 'ahu_sim_1', label: 'AHU Simulator 1', type: 'sim' },
    { id: 'ahu_sim_2', label: 'AHU Simulator 2', type: 'sim' },
    { id: 'ahu_corridor', label: 'AHU Corridor', type: 'corridor' },
  ];

  // Build AHU parameter groups
  const ahuRoomParams: { key: string; label: string; design?: string }[] = [
    { key: 'room_temp', label: 'Room Temp (°C)', design: '19' },
    { key: 'room_rh', label: 'Room RH (%)', design: '50-60' },
    { key: 'room_press', label: 'Room Press (Pa)', design: '10-15' },
  ];
  const ahuFilterParams: { key: string; label: string; design?: string }[] = [
    { key: 'filter_pre', label: 'Filter Pre' },
    { key: 'filter_med', label: 'Filter Med' },
    { key: 'filter_hepa', label: 'Filter HEPA' },
  ];
  const ahuHeaterParams: { key: string; label: string; design?: string }[] = [
    { key: 'heater_status', label: 'Heater Status' },
    { key: 'heater_stage', label: 'Heater Stage' },
    { key: 'heater_amp_r', label: 'Htr Amp R' },
    { key: 'heater_amp_s', label: 'Htr Amp S' },
    { key: 'heater_amp_t', label: 'Htr Amp T' },
    { key: 'heater_volt_rs', label: 'Htr V RS', design: '400' },
    { key: 'heater_volt_rt', label: 'Htr V RT', design: '400' },
    { key: 'heater_volt_st', label: 'Htr V ST', design: '400' },
  ];
  const ahuFanParams: { key: string; label: string; design?: string }[] = [
    { key: 'fan_status', label: 'Fan Status' },
    { key: 'fan_freq', label: 'Fan Freq (Hz)', design: '50' },
    { key: 'fan_amp_r', label: 'Fan Amp R' },
    { key: 'fan_amp_s', label: 'Fan Amp S' },
    { key: 'fan_amp_t', label: 'Fan Amp T' },
    { key: 'fan_volt_rs', label: 'Fan V RS', design: '400' },
    { key: 'fan_volt_rt', label: 'Fan V RT', design: '400' },
    { key: 'fan_volt_st', label: 'Fan V ST', design: '400' },
  ];
  const ahuDamperParams: { key: string; label: string; design?: string }[] = [
    { key: 'damper_status', label: 'Damper Status' },
    { key: 'fresh_air_pct', label: 'Fresh Air (%)' },
    { key: 'ef_damper', label: 'EF Damper (%)' },
    { key: 'sa_1_1', label: 'SA 1-1 (%)', design: '100' },
    { key: 'sa_1_2', label: 'SA 1-2 (%)', design: '100' },
    { key: 'sa_1_3', label: 'SA 1-3 (%)', design: '100' },
    { key: 'sa_1_4', label: 'SA 1-4 (%)', design: '100' },
  ];
  const ahuCorridorExtra: { key: string; label: string; design?: string }[] = [
    { key: 'damper_corr_supply', label: 'Corr Supply (%)' },
    { key: 'damper_corr_return', label: 'Corr Return (%)' },
    { key: 'damper_comp_supply', label: 'Comp Supply (%)' },
    { key: 'fa_fan_status', label: 'FA Fan Status' },
    { key: 'fa_fan_freq', label: 'FA Fan Freq (Hz)' },
    { key: 'fa_fan_amp_r', label: 'FA Amp R' },
    { key: 'fa_fan_amp_s', label: 'FA Amp S' },
    { key: 'fa_fan_amp_t', label: 'FA Amp T' },
    { key: 'fa_fan_volt_rs', label: 'FA V RS', design: '400' },
    { key: 'fa_fan_volt_rt', label: 'FA V RT', design: '400' },
    { key: 'fa_fan_volt_st', label: 'FA V ST', design: '400' },
  ];

  // Render AHU as a vertical table per unit (parameter rows, unit columns)
  const allAhuParams = [
    { group: 'ROOM CONDITIONS', params: ahuRoomParams },
    { group: 'FILTERS', params: ahuFilterParams },
    { group: 'ELECTRIC HEATER', params: ahuHeaterParams },
    { group: 'SUPPLY FAN', params: ahuFanParams },
    { group: 'DAMPER & SUPPLY AIR', params: ahuDamperParams },
  ];

  pages.push(
    <div key="page-2-ahu-crac" style={S.page}>
      {renderPageHeader('AHU & CRAC MONITORING', date, inspector, 'Page 2 of 4')}
      
      <div style={{ padding: '0 2mm' }}>
        <div style={{ ...S.catRow, marginBottom: '1.5mm', fontSize: '7.5pt' }}>AIR HANDLING UNIT (AHU)</div>
        <table style={S.table}>
          <thead>
            <tr>
              <th style={{ ...S.thCell, width: '40px' }}>#</th>
              <th style={{ ...S.thCell, width: '130px', textAlign: 'left' as const }}>PARAMETER</th>
              <th style={{ ...S.thCell, width: '50px' }}>DESIGN</th>
              {ahuUnits.map((u) => (
                <th key={u.id} style={S.thCell}>{u.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {allAhuParams.map((group) => (
              <React.Fragment key={group.group}>
                {/* Group header row */}
                <tr>
                  <td colSpan={3 + ahuUnits.length} style={{
                    ...S.catRow,
                    padding: '1mm 3mm',
                    border: `0.5pt solid ${C.border}`,
                    fontSize: '7pt',
                  }}>
                    {group.group}
                  </td>
                </tr>
                {group.params.map((p, pIdx) => (
                  <tr key={p.key} style={{ backgroundColor: pIdx % 2 === 0 ? C.rowEven : C.rowOdd }}>
                    <td style={{ ...S.tdCell, fontSize: '6pt', color: '#94a3b8' }}>{pIdx + 1}</td>
                    <td style={S.tdLabel}>{p.label}</td>
                    <td style={{ ...S.tdCell, color: C.designText, fontStyle: 'italic', fontSize: '6pt' }}>
                      {p.design || '-'}
                    </td>
                    {ahuUnits.map((u) => {
                      const val = getVal(u.id, p.key);
                      const isStatus = p.key.includes('status');
                      return (
                        <td key={u.id} style={{
                          ...S.tdCell,
                          color: isStatus ? statusColor(val) : undefined,
                          fontWeight: isStatus ? 800 : 600,
                        }}>
                          {val}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </React.Fragment>
            ))}

            {/* Corridor-only extra params */}
            <tr>
              <td colSpan={3 + ahuUnits.length} style={{
                ...S.catRow,
                padding: '1mm 3mm',
                border: `0.5pt solid ${C.border}`,
                fontSize: '7pt',
              }}>
                CORRIDOR ADDITIONAL PARAMETERS
              </td>
            </tr>
            {ahuCorridorExtra.map((p, pIdx) => (
              <tr key={p.key} style={{ backgroundColor: pIdx % 2 === 0 ? C.rowEven : C.rowOdd }}>
                <td style={{ ...S.tdCell, fontSize: '6pt', color: '#94a3b8' }}>{pIdx + 1}</td>
                <td style={S.tdLabel}>{p.label}</td>
                <td style={{ ...S.tdCell, color: C.designText, fontStyle: 'italic', fontSize: '6pt' }}>
                  {p.design || '-'}
                </td>
                {ahuUnits.map((u) => {
                  const val = u.type === 'corridor' ? getVal(u.id, p.key) : '-';
                  const isStatus = p.key.includes('status');
                  return (
                    <td key={u.id} style={{
                      ...S.tdCell,
                      color: u.type === 'corridor'
                        ? (isStatus ? statusColor(val) : undefined)
                        : '#d1d5db',
                      fontWeight: isStatus ? 800 : 600,
                      fontStyle: u.type !== 'corridor' ? 'italic' : undefined,
                    }}>
                      {val}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ ...S.catRow, marginTop: '4mm', marginBottom: '1.5mm', fontSize: '7.5pt' }}>CRAC UNITS & POWER METER</div>
        <div style={{ display: 'flex', gap: '4mm' }}>
          {/* CRAC */}
          <div style={{ flex: 1.5 }}>
            <div style={{
              fontSize: '7.5pt', fontWeight: 800, color: C.navy,
              padding: '1mm 2mm', backgroundColor: '#eef2ff',
              borderLeft: `3px solid ${C.cyan}`, marginBottom: '1mm',
            }}>
              COMPUTER ROOM AIR CONDITIONING (CRAC)
            </div>
            <table style={S.table}>
              <thead>
                <tr>
                  <th style={{ ...S.thCell, width: '50px' }}>#</th>
                  <th style={{ ...S.thCell, width: '130px', textAlign: 'left' as const }}>PARAMETER</th>
                  {cracUnits.map((u) => (
                    <th key={u.id} style={S.thCell}>{u.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {cracParams.map((p, idx) => (
                  <tr key={p.key} style={{ backgroundColor: idx % 2 === 0 ? C.rowEven : C.rowOdd }}>
                    <td style={{ ...S.tdCell, fontSize: '6pt', color: '#94a3b8' }}>{idx + 1}</td>
                    <td style={S.tdLabel}>{p.label}</td>
                    {cracUnits.map((u) => {
                      const val = getVal(u.id, p.key);
                      const isStatus = p.key.includes('status') || p.key.includes('alarm') || p.key === 'comp1' || p.key === 'comp2' || p.key === 'fan_status';
                      return (
                        <td key={u.id} style={{
                          ...S.tdCell,
                          color: isStatus ? statusColor(val) : undefined,
                          fontWeight: isStatus ? 800 : 600,
                        }}>
                          {val}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Power Meter */}
          <div style={{ flex: 1 }}>
            <div style={{
              fontSize: '7.5pt', fontWeight: 800, color: C.navy,
              padding: '1mm 2mm', backgroundColor: '#eef2ff',
              borderLeft: `3px solid ${C.cyan}`, marginBottom: '1mm',
            }}>
              POWER METER
            </div>
            
      {/* Power Meter Tables */}
      <div style={{ display: 'flex', gap: '2mm', flexDirection: 'column' }}>
        {/* Genset */}
        <div>
          <div style={{
            fontSize: '7pt', fontWeight: 800, color: C.navy,
            padding: '1mm 2mm', backgroundColor: '#fef3c7',
            borderLeft: '3px solid #f59e0b', marginBottom: '1mm',
          }}>
            ⚡ POWER METER — GENSET
          </div>
          <table style={S.table}>
            <thead>
              <tr>
                <th style={{ ...S.thCell, textAlign: 'left' as const }}>PARAMETER</th>
                <th style={{ ...S.thCell, width: '60px' }}>DESIGN</th>
                <th style={{ ...S.thCell, width: '80px' }}>ACTUAL</th>
              </tr>
            </thead>
            <tbody>
              {powerParams.map((p, idx) => (
                <tr key={p.key} style={{ backgroundColor: idx % 2 === 0 ? C.rowEven : C.rowOdd }}>
                  <td style={S.tdLabel}>{p.label}</td>
                  <td style={{ ...S.tdCell, color: C.designText, fontStyle: 'italic' }}>{p.design}</td>
                  <td style={{ ...S.tdCell, fontWeight: 700 }}>{getVal('power_genset', p.key)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* PLN */}
        <div>
          <div style={{
            fontSize: '7pt', fontWeight: 800, color: C.navy,
            padding: '1mm 2mm', backgroundColor: '#dbeafe',
            borderLeft: '3px solid #3b82f6', marginBottom: '1mm',
          }}>
            ⚡ POWER METER — PLN
          </div>
          <table style={S.table}>
            <thead>
              <tr>
                <th style={{ ...S.thCell, textAlign: 'left' as const }}>PARAMETER</th>
                <th style={{ ...S.thCell, width: '60px' }}>DESIGN</th>
                <th style={{ ...S.thCell, width: '80px' }}>ACTUAL</th>
              </tr>
            </thead>
            <tbody>
              {powerParams.map((p, idx) => (
                <tr key={p.key} style={{ backgroundColor: idx % 2 === 0 ? C.rowEven : C.rowOdd }}>
                  <td style={S.tdLabel}>{p.label}</td>
                  <td style={{ ...S.tdCell, color: C.designText, fontStyle: 'italic' }}>{p.design}</td>
                  <td style={{ ...S.tdCell, fontWeight: 700 }}>{getVal('power_pln', p.key)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

          </div>
        </div>
      </div>

      {renderPageFooter()}
    </div>
  );

  // ═══════════════════════════════════════════════════════════════════════
  // PAGE 5: FCU — Ground Floor
  // ═══════════════════════════════════════════════════════════════════════
  const fcuGFRooms = [
    { id: 'fcu_gf_01', label: 'MDF Room' },
    { id: 'fcu_gf_02', label: 'Electrical Room' },
    { id: 'fcu_gf_03', label: 'Server IDF Room' },
    { id: 'fcu_gf_04', label: 'Ship & Packing Room' },
    { id: 'fcu_gf_05', label: 'Utility Office' },
    { id: 'fcu_gf_06', label: 'Computer Workshop' },
    { id: 'fcu_gf_07', label: 'Video Workshop' },
    { id: 'fcu_gf_08', label: 'Corridor' },
    { id: 'fcu_gf_09', label: 'Tech Pub Room' },
    { id: 'fcu_gf_10', label: 'Maintenance Manager Office' },
    { id: 'fcu_gf_11', label: 'Cafetaria' },
    { id: 'fcu_gf_12', label: 'Meeting Room' },
    { id: 'fcu_gf_13', label: 'Building Main Office' },
    { id: 'fcu_gf_14', label: 'Security Desk' },
    { id: 'fcu_gf_15', label: 'Instructor Manager' },
    { id: 'fcu_gf_16', label: 'Briefing Room' },
    { id: 'fcu_gf_17', label: 'Local Instructor Office' },
    { id: 'fcu_gf_18', label: 'Simulator Operator' },
    { id: 'fcu_gf_19', label: 'Simulator Technical' },
    { id: 'fcu_gf_20', label: "Trainee's Office" },
    { id: 'fcu_gf_21', label: 'IOS S1' },
    { id: 'fcu_gf_22', label: 'IOS S2' },
  ];

  const fcuParams: { key: string; label: string; design?: string; unit?: string }[] = [
    { key: 'room_temp', label: 'Room Temp', unit: '°C' },
    { key: 'setpoint', label: 'Setpoint', unit: '°C' },
    { key: 'fcu_status', label: 'FCU Status' },
    { key: 'mv_status', label: 'MV Status' },
    { key: 'ampere', label: 'Ampere', design: '0.98', unit: 'A' },
  ];

  const renderFcuTable = (rooms: { id: string; label: string }[]) => (
    <table style={S.table}>
      <thead>
        <tr>
          <th style={{ ...S.thCell, width: '25px' }}>No</th>
          <th style={{ ...S.thCell, width: '150px', textAlign: 'left' as const }}>ROOM / AREA</th>
          {fcuParams.map((p) => (
            <th key={p.key} style={S.thCellWrap}>
              {dv(`${p.label}${p.unit ? ` (${p.unit})` : ''}`, p.design)}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rooms.map((room, idx) => (
          <tr key={room.id} style={{ backgroundColor: idx % 2 === 0 ? C.rowEven : C.rowOdd }}>
            <td style={{ ...S.tdCell, fontSize: '6pt', color: '#94a3b8' }}>{idx + 1}</td>
            <td style={{ ...S.tdLabel, fontSize: '6pt' }}>{room.label}</td>
            {fcuParams.map((p) => {
              const val = getVal(room.id, p.key);
              const isStatus = p.key.includes('status');
              return (
                <td key={p.key} style={{
                  ...S.tdCell,
                  color: isStatus ? statusColor(val) : undefined,
                  fontWeight: isStatus ? 800 : 600,
                }}>
                  {val}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );

  pages.push(
    <div key="page-3-fcu-gf" style={S.page}>
      {renderPageHeader('FAN COIL UNIT (FCU) — GROUND FLOOR', date, inspector, 'Page 3 of 4')}
      <div style={{ padding: '0 2mm' }}>
        {renderFcuTable(fcuGFRooms)}
      </div>
      {renderPageFooter()}
    </div>
  );

  // ═══════════════════════════════════════════════════════════════════════
  // PAGE 6: FCU — 1st Floor
  // ═══════════════════════════════════════════════════════════════════════
  const fcu1FRooms = [
    { id: 'fcu_1f_01', label: 'Security Supervision' },
    { id: 'fcu_1f_02', label: 'Cafetaria' },
    { id: 'fcu_1f_03', label: 'Gan Room' },
    { id: 'fcu_1f_04', label: 'Male Changing Room' },
    { id: 'fcu_1f_05', label: 'Seller IT Room' },
    { id: 'fcu_1f_06', label: 'Training IT Room' },
    { id: 'fcu_1f_07', label: 'Prayer Room' },
    { id: 'fcu_1f_08', label: 'Sparepart Room' },
    { id: 'fcu_1f_09', label: 'IT Administration Office' },
    { id: 'fcu_1f_10', label: 'IT Network Supervision' },
    { id: 'fcu_1f_11', label: 'PPT Room' },
    { id: 'fcu_1f_12', label: 'Tutorial Classroom' },
    { id: 'fcu_1f_13', label: 'Tutorial Classroom 2' },
    { id: 'fcu_1f_14', label: 'Trainer Office Room 2' },
    { id: 'fcu_1f_15', label: 'Media Classroom' },
    { id: 'fcu_1f_16', label: 'Tutorial Classroom 3' },
    { id: 'fcu_1f_17', label: 'Meeting Room' },
    { id: 'fcu_1f_18', label: 'Coaching Room' },
    { id: 'fcu_1f_19', label: 'Secretariat Office' },
    { id: 'fcu_1f_20', label: 'General Manager Office' },
    { id: 'fcu_1f_21', label: 'Administrative Manager' },
    { id: 'fcu_1f_22', label: 'Practical Academic 2' },
    { id: 'fcu_1f_23', label: 'Practical Academic 1' },
    { id: 'fcu_1f_24', label: 'Planification Room' },
  ];

  pages.push(
    <div key="page-4-fcu-1f" style={S.page}>
      {renderPageHeader('FAN COIL UNIT (FCU) — 1ST FLOOR', date, inspector, 'Page 4 of 4')}
      <div style={{ padding: '0 2mm' }}>
        {renderFcuTable(fcu1FRooms)}

        {/* Final Signature Block */}
        <div style={{
          marginTop: '4mm',
          padding: '2mm 3mm',
          border: `1px solid ${C.border}`,
          borderRadius: '2mm',
          backgroundColor: '#fafbfc',
        }}>
          <div style={{
            fontSize: '7pt', fontWeight: 800, color: C.navy,
            textAlign: 'center', marginBottom: '2mm',
          }}>
            APPROVAL SIGNATURES
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-around' }}>
            {[
              { role: 'Prepared By', sub: 'Field Inspector' },
              { role: 'Reviewed By', sub: 'Site Supervisor' },
              { role: 'Approved By', sub: 'Project Manager' },
            ].map((s) => (
              <div key={s.role} style={{ width: '28%', textAlign: 'center' }}>
                <div style={{ fontSize: '6.5pt', fontWeight: 800, color: C.navy, marginBottom: '8mm' }}>
                  {s.role}
                </div>
                <div style={{
                  borderTop: `1px solid ${C.navy}`,
                  width: '80%',
                  margin: '0 auto',
                  paddingTop: '1mm',
                }}>
                  <div style={{ fontSize: '6pt', fontWeight: 600 }}>
                    {s.role === 'Prepared By' ? (inspector || '( ____________ )') : '( ____________ )'}
                  </div>
                  <div style={{ fontSize: '5pt', color: '#94a3b8', marginTop: '0.5mm' }}>{s.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {renderPageFooter()}
    </div>
  );

  return pages;
};
