/**
 * Smart Analytic Engine (Rule-Based) - Priority Edition
 * Implements ISO 55001 & ASHRAE 180 inspired service prioritization.
 */

export async function generateTechnicalInsightAction(
  reportData: any, 
  insightType: 'vitality' | 'achievement' | 'volume' | 'pareto',
  language: 'id' | 'en' | 'ja' = 'id'
) {
  if (!reportData) {
    return { success: false, error: "No report data provided." };
  }

  try {
    const analyticData = generateRuleBasedInsight(reportData, insightType, language);
    return { 
      success: true, 
      insight: analyticData.text,
      mitigation: analyticData.mitigation,
      priority: analyticData.priorityLevel 
    };
  } catch (error: any) {
    console.error("Analytic Engine Error:", error);
    return { success: false, error: "Calculation error occurred." };
  }
}

function generateRuleBasedInsight(data: any, type: string, lang: string): any {
  const score = data.summary?.avgPerformance || 0;
  const achievement = data.summary?.achievementRate || 0;
  
  // Calculate Global Priority Level based on average score
  // Range: 0-53% (P1), 54-74% (P2), 75-110% (P3)
  let priorityLevel = 3;
  if (score < 54) priorityLevel = 1;
  else if (score < 75) priorityLevel = 2;

  const dictionary: any = {
    id: {
      labels: ["Priority 1 (Urgent)", "Priority 2 (Alert)", "Priority 3 (Healthy)"],
      vitality: {
        3: `Kondisi unit mayoritas berada di Priority 3 (${score}%). Performa sangat baik dan efisien.`,
        2: `Mayoritas unit berada di Priority 2 (${score}%). Penurunan efisiensi mulai terdeteksi, periksa filter dan koil.`,
        1: `SITUS KRITIS! Rata-rata performa masuk Priority 1 (${score}%). Diperlukan audit teknis total segera.`
      },
      mitigation: {
        3: "Lanjutkan pemeliharaan rutin. Pertahankan SOP pembersihan bulanan.",
        2: "Jadwalkan inspeksi mendalam pada siklus berikutnya. Fokus pada penghematan energi.",
        1: "SEGERA lakukan tindakan korektif (Corrective Audit). Buat tiket perbaikan untuk unit terdaftar."
      }
    },
    en: {
      labels: ["Priority 1 (Urgent)", "Priority 2 (Alert)", "Priority 3 (Healthy)"],
      vitality: {
        3: `Most units are in Priority 3 (${score}%). Performance is optimal and meeting design specs.`,
        2: `Priority 2 detected at ${score}%. Subtle efficiency loss found. Recommend checking filters/coils.`,
        1: `CRITICAL SITE! Average performance is Priority 1 (${score}%). High risk of mechanical failure.`
      },
      mitigation: {
        3: "Continue routine maintenance. Maintain monthly cleaning SOP.",
        2: "Schedule deep inspection in the next cycle. Focus on energy optimization.",
        1: "IMMEDIATE corrective action required. Create repair tickets for flagged units."
      }
    },
    ja: {
      labels: ["Priority 1 (緊急)", "Priority 2 (警告)", "Priority 3 (正常)"],
      vitality: {
        3: `ほとんどのユニットが Priority 3 (${score}%) です。パフォーマンスは最適で、設計仕様を満たしています。`,
        2: `Priority 2 (${score}%) が検出されました。わずかな効率低下が見られます。フィルターとコイルの点検をお勧めします。`,
        1: `サイトが深刻な状態です！平均パフォーマンスが Priority 1 (${score}%) です。故障のリスクが非常に高いです。`
      },
      mitigation: {
        3: "定期メンテナンスを継続してください。月次の清掃SOPを維持します。",
        2: "次回のサイクルで詳細な点検をスケジュールしてください。エネルギー最適化に焦点を当てます。",
        1: "直ちに是正措置（故障修理）が必要です。フラグが立てられたユニットの修理チケットを作成してください。"
      }
    }
  };

  const l = dictionary[lang] || dictionary['id'];
  let text = "Analyzing...";
  let mitigation = "";

  if (type === 'vitality') {
    text = l.vitality[priorityLevel];
    mitigation = l.mitigation[priorityLevel];
  } else if (type === 'achievement') {
    text = achievement >= 100 
      ? (lang === 'en' ? "Target achieved. Schedule maintained." : lang === 'ja' ? "ターゲット達成。スケジュール維持。" : "Target tercapai. Jadwal pengerjaan terjaga.")
      : (lang === 'en' ? "Maintenance backlog detected. Schedule behind." : lang === 'ja' ? "メンテナンスの遅れが発生。スケジュール遅延。" : "Terjadi backlog pemeliharaan. Jadwal terlambat.");
    mitigation = achievement >= 100 
      ? (lang === 'en' ? "Validate all sign-offs." : "Validasi seluruh tanda tangan.")
      : (lang === 'en' ? "Assign additional resources." : "Tambahkan sumber daya teknisi.");
  } else {
    text = l.vitality[priorityLevel];
    mitigation = l.mitigation[priorityLevel];
  }

  return { text, mitigation, priorityLevel };
}
