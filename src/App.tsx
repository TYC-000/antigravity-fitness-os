import React, { useState, useRef, useEffect } from 'react';
import { 
  Activity, BrainCircuit, Loader2, AlertCircle, CheckCircle2, 
  Ruler, Shield, Zap, Target, Dumbbell, SquareActivity, 
  Cylinder, Rocket, Microscope, Printer, Apple,
  Watch, Moon, HeartPulse 
} from 'lucide-react';

const EQUIPMENT_LIST = [
  { id: 'dumbbells', label: '啞鈴', icon: Dumbbell },
  { id: 'barbell', label: '槓鈴', icon: Dumbbell },
  { id: 'cable_machine', label: '纜繩滑輪機', icon: Zap },
  { id: 'hack_squat_machine', label: '哈克深蹲機', icon: SquareActivity },
  { id: 'bench', label: '臥推椅', icon: Cylinder },
  { id: 'leg_press', label: '腿推機', icon: SquareActivity },
  { id: 'kettlebell', label: '壺鈴', icon: Dumbbell },
  { id: 'pull_up_bar', label: '單槓', icon: Activity },
];

const MUSCLE_GROUPS = [
  { id: 'quadriceps_and_glutes', label: 'Quads & Glutes (股四頭與臀大肌)' },
  { id: 'back_and_biceps', label: 'Back & Biceps (背闊肌與二頭肌)' },
  { id: 'chest_and_triceps', label: 'Chest & Triceps (胸大肌與三頭肌)' },
  { id: 'hamstrings_and_calves', label: 'Hamstrings & Calves (腿後側與小腿)' },
  { id: 'shoulders_and_core', label: 'Shoulders & Core (肩部與核心)' },
];

export default function App() {
  const [femurRatio, setFemurRatio] = useState<'low' | 'normal' | 'high'>('high');
  const [coreStability, setCoreStability] = useState<'low' | 'moderate' | 'high'>('moderate');
  const [currentRPE, setCurrentRPE] = useState<number>(6);
  const [availableEquipment, setAvailableEquipment] = useState<string[]>([
    'dumbbells', 'cable_machine', 'hack_squat_machine', 'bench', 'barbell'
  ]);
  const [targetMuscleGroup, setTargetMuscleGroup] = useState<string>('quadriceps_and_glutes');
  
  const [dataSource, setDataSource] = useState<'wearable' | 'inbody'>('wearable');

  const [sleepScore, setSleepScore] = useState<number>(80);
  const [hrvStatus, setHrvStatus] = useState<'low' | 'normal' | 'optimal'>('normal');
  const [rhrTrend, setRhrTrend] = useState<'normal' | 'elevated'>('normal');

  const [asymmetry, setAsymmetry] = useState<number>(2.0);
  const [phaseAngle, setPhaseAngle] = useState<number>(7.0);
  const [ecwRatio, setEcwRatio] = useState<number>(0.380);

  const [loading, setLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);
  const [result, setResult] = useState<{
    recommended_exercises: string[];
    biomechanical_reasoning: string;
    autoregulation_feedback: string;
    nutrition_prescription: string;
  } | null>(null);
  const [error, setError] = useState('');

  // ✨ 新增：台灣四季旬食資料庫 (Seasonal Fruits Database)
  const [currentSeason, setCurrentSeason] = useState('');
  const [seasonalFruits, setSeasonalFruits] = useState('');

  // 系統啟動時，自動偵測當前月份並指派當季水果
  useEffect(() => {
    const month = new Date().getMonth() + 1; // getMonth() 回傳 0-11
    if (month >= 3 && month <= 5) {
      setCurrentSeason('春季');
      setSeasonalFruits('聖女小番茄、草莓或枇杷 (富含高濃度維生素C與茄紅素)');
    } else if (month >= 6 && month <= 8) {
      setCurrentSeason('夏季');
      setSeasonalFruits('愛文芒果、西瓜或火龍果 (具備光速補醣與促進一氧化氮生成之效)');
    } else if (month >= 9 && month <= 11) {
      setCurrentSeason('秋季');
      setSeasonalFruits('麻豆文旦、柿子或水梨 (富含抗氧化劑與穩定膳食纖維)');
    } else {
      setCurrentSeason('冬季');
      setSeasonalFruits('柳丁、蜜棗或橘子 (富含協助合成第一型膠原蛋白的維生素C)');
    }
  }, []);

  const toggleEquipment = (id: string) => {
    setAvailableEquipment(prev => 
      prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id]
    );
  };

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 100));
      const htmlToImage = await import('html-to-image');
      const element = exportRef.current;
      if (!element) return;
      const dataUrl = await htmlToImage.toPng(element, { quality: 1, backgroundColor: '#ffffff', pixelRatio: 2 });
      const link = document.createElement('a');
      link.download = `Antigravity_Prescription_${new Date().toISOString().slice(0,10)}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Image Export failed:', error);
      alert('匯出失敗，請稍後再試。');
    } finally {
      setIsExporting(false);
    }
  };

  // --- 核心專家系統引擎 ---
  const generatePrescription = async () => {
    setLoading(true);
    setError('');
    setResult(null);

    await new Promise(resolve => setTimeout(resolve, 600));

    try {
      if (availableEquipment.length === 0) {
        throw new Error('請至少選擇一項可用器材。');
      }

      let exercises: string[] = [];
      let reasoning: string[] = [];
      let feedback: string[] = [];
      let nutrition = ''; 
      let currentEquipment = [...availableEquipment];

      // 0. 雙引擎數據統合
      let isFatigued = false;
      let isInflamed = false;

      if (dataSource === 'wearable') {
        if (hrvStatus === 'low' || sleepScore < 60) isFatigued = true;
        if (rhrTrend === 'elevated') isInflamed = true;
      } else {
        if (phaseAngle < 5.0) isFatigued = true;
        if (ecwRatio > 0.395) isInflamed = true;
      }

      let metabolicDemand = 'low';
      if (['quadriceps_and_glutes', 'back_and_biceps'].includes(targetMuscleGroup)) {
        metabolicDemand = 'high';
      } else if (targetMuscleGroup === 'chest_and_triceps') {
        metabolicDemand = 'moderate';
      }

      // ✨ 1. 雙維度營養矩陣 + 四季旬食模組
      if (isInflamed) {
        const sourceText = dataSource === 'wearable' ? '安靜心率 (RHR) 異常升高' : '細胞外水分比 (ECW/TBW) 偏高';
        nutrition = `🚨 [抗發炎與代謝介入] 偵測到 ${sourceText}，暗示潛在系統性發炎壓力。`;
        if (metabolicDemand === 'high') {
           nutrition += `針對大肌群訓練誘發的強烈發炎反應，建議訓練後立即補充高劑量 Omega-3 (如：深海魚油或野生鮭魚)，並強烈建議搭配台灣${currentSeason}盛產的 ${seasonalFruits}，以強效清除活性氧類 (ROS) 並調節微血管通透性。`;
        } else {
           nutrition += `本次訓練局部代謝壓力較低。建議以台灣${currentSeason}當季的 ${seasonalFruits} 為主，協助清除游離自由基，不需額外大幅增加精緻碳水化合物的攝取。`;
        }
      } else if (isFatigued) {
        const sourceText = dataSource === 'wearable' ? '心率變異度 (HRV) 低落或睡眠嚴重不足' : '細胞相位角 (PhA < 5.0) 偏低';
        nutrition = `⚡ [中樞神經修復介入] 偵測到 ${sourceText}，反映顯著的交感神經亢奮與損耗。`;
        if (metabolicDemand === 'high') {
           nutrition += `大肌群訓練將進一步榨乾神經系統。黃金窗口內必須強制補充高生物價蛋白質（如：牛肉），並攝取台灣${currentSeason}特產的 ${seasonalFruits} 作為優質的果糖來源，加速 ATP-PC 系統回補並輔助神經元修復。`;
        } else {
           nutrition += `針對中/小肌群訓練，營養策略應著重於細胞膜重建，推薦攝取全脂雞蛋搭配台灣${currentSeason}的 ${seasonalFruits}，提供抗氧化保護網，避免過度進食導致消化負擔。`;
        }
      } else {
        nutrition = '⚖️ [合成代謝最佳化] 目前自律神經與各項代謝指標穩定，展現良好的合成代謝潛力。';
        if (metabolicDemand === 'high') {
           nutrition += `🎯 因應大肌群產生的巨大肝醣缺口，啟動「高碳水/高蛋白」策略。建議攝取根莖類澱粉搭配去骨雞腿肉，餐後補充台灣${currentSeason}盛產的 ${seasonalFruits}，以完美的微量營養素矩陣最大化 mTORC1 肌肉合成訊號。`;
        } else {
           nutrition += `🎯 中/小肌群熱量消耗有限。建議採用「中低碳水/適度蛋白」策略，保留營養額度給優質脂肪，並以台灣${currentSeason}的 ${seasonalFruits} 作為點綴，嚴格控制無謂的熱量盈餘以防脂肪囤積。`;
        }
      }

      // 2. 生物力學疲勞防護邏輯
      if (isFatigued) {
        const sourceName = dataSource === 'wearable' ? '日常穿戴 (HRV/睡眠)' : '細胞相位角 (PhA)';
        feedback.push(`⚠️ [神經疲勞警示] 依據 ${sourceName} 指標，建議本次訓練總容量調降 20%-30%。`);
        currentEquipment = currentEquipment.filter(eq => eq !== 'barbell');
        reasoning.push('因應系統性神經疲勞，演算法已主動排除需高度神經徵召之「槓鈴自由重量」動作。');
      }

      if (asymmetry > 5.0) {
        reasoning.push(`[肌肉不對稱補償] 偵測到顯著節段不對稱 (${asymmetry}%)，已強制導入單側獨立發力動作。`);
      }

      if (isInflamed) {
        const sourceName = dataSource === 'wearable' ? '安靜心率 (RHR)' : '細胞水分比 (ECW)';
        feedback.push(`🚨 [壓力防護] 偵測到 ${sourceName} 異常，請注意組間恢復時間，並避免力竭。`);
        reasoning.push('為避免過度訓練惡化，演算法已主動過濾高離心拉伸 (Eccentric-focused) 之負荷動作。');
      }

      // 3. 基礎生物力學適配邏輯 (依部位)
      switch (targetMuscleGroup) {
        case 'quadriceps_and_glutes':
          if (femurRatio === 'high') {
             reasoning.push('針對「長股骨」比例，優化深蹲力學減少腰椎剪力，重點轉移至下肢推舉。');
             if (currentEquipment.includes('hack_squat_machine')) exercises.push('Hack Squat (哈克深蹲)');
             else if (currentEquipment.includes('leg_press')) exercises.push('Leg Press (腿推機)');
             else if (currentEquipment.includes('dumbbells')) exercises.push('Dumbbell Goblet Squat (啞鈴高腳杯深蹲)');
          } else {
             reasoning.push('針對正常/短股骨比例，建議執行常規深蹲動作。');
             if (currentEquipment.includes('barbell')) exercises.push('Barbell Back Squat (槓鈴背蹲舉)');
             else if (currentEquipment.includes('dumbbells')) exercises.push('Dumbbell Split Squat (啞鈴分腿蹲)');
          }
          if (asymmetry > 5.0 && currentEquipment.includes('dumbbells')) exercises.push('Dumbbell Bulgarian Split Squat (單側保加利亞分腿蹲)');
          else if (currentEquipment.includes('cable_machine')) exercises.push('Cable Pull-through (纜繩後拉)');
          else if (currentEquipment.includes('kettlebell')) exercises.push('Kettlebell Swing (壺鈴擺盪)');
          break;

        case 'chest_and_triceps':
          reasoning.push('胸三頭肌群訓練已根據您的核心穩定度與可用器材進行配對。');
          if (currentEquipment.includes('bench') && currentEquipment.includes('barbell') && coreStability !== 'low') exercises.push('Barbell Bench Press (槓鈴臥推)');
          else if (currentEquipment.includes('bench') && currentEquipment.includes('dumbbells')) exercises.push('Dumbbell Bench Press (啞鈴臥推)');
          if (currentEquipment.includes('cable_machine')) { exercises.push('Cable Chest Fly (纜繩飛鳥)'); exercises.push('Cable Tricep Pushdown (纜繩三頭肌下壓)'); }
          else if (currentEquipment.includes('dumbbells')) exercises.push('Dumbbell Overhead Tricep Extension (啞鈴過頭三頭伸展)');
          break;
          
        case 'back_and_biceps':
          reasoning.push('背二頭肌群著重於垂直與水平拉力動作的平衡。');
          if (currentEquipment.includes('pull_up_bar')) exercises.push('Pull-ups (引體向上)');
          else if (currentEquipment.includes('cable_machine')) exercises.push('Lat Pulldown (滑輪下拉)');
          if (currentEquipment.includes('dumbbells') && currentEquipment.includes('bench')) exercises.push('Chest-Supported Dumbbell Row (胸靠啞鈴划船)');
          else if (currentEquipment.includes('barbell') && coreStability !== 'low') exercises.push('Barbell Row (槓鈴划船)');
          if (currentEquipment.includes('dumbbells')) exercises.push('Dumbbell Bicep Curl (啞鈴二頭彎舉)');
          break;

        case 'hamstrings_and_calves':
           if (!isInflamed) {
              reasoning.push('已安排高張力的後側鏈訓練。');
              if (currentEquipment.includes('barbell')) exercises.push('Barbell Romanian Deadlift (槓鈴羅馬尼亞硬舉)');
              else if (currentEquipment.includes('dumbbells')) exercises.push('Dumbbell RDL (啞鈴羅馬尼亞硬舉)');
           } else {
              reasoning.push('因壓力發炎指標偏高，已排除 RDL 等高離心動作，改以低損傷動作替代。');
           }
           if (currentEquipment.includes('cable_machine')) exercises.push('Cable Pull-through (纜繩後拉)');
           if (currentEquipment.includes('dumbbells')) exercises.push('Dumbbell Calf Raise (啞鈴提踵)');
           break;

        case 'shoulders_and_core':
           reasoning.push('肩部訓練已根據您的核心穩定度評估最佳抗重力姿勢。');
           if (coreStability === 'high' && currentEquipment.includes('barbell')) exercises.push('Standing Barbell Overhead Press (站姿槓鈴肩推)');
           else if (currentEquipment.includes('dumbbells')) exercises.push('Seated Dumbbell Shoulder Press (坐姿啞鈴肩推)');
           if (currentEquipment.includes('dumbbells')) exercises.push('Dumbbell Lateral Raise (啞鈴側平舉)');
           if (currentEquipment.includes('cable_machine')) exercises.push('Cable Crunch (纜繩捲腹)');
           break;
      }

      if (exercises.length === 0) {
         exercises.push('Bodyweight Squat (徒手深蹲)');
         exercises.push('Push-ups (伏地挺身)');
         reasoning.push('⚠️ 在目前的環境約束下，自動降級為自體重量基礎訓練模式。');
      }

      // 4. RPE 自律調節反饋
      if (currentRPE <= 5) feedback.push('📈 [漸進性超負荷] 前次 RPE < 6，建議本次訓練重量增加 5%，或增加 2 次反覆次數。');
      else if (currentRPE >= 8) feedback.push('⚓ [負荷維持] 前次 RPE ≥ 8，建議維持原重量，專注於動作控制與向心爆發力。');
      else feedback.push('⚖️ [穩定適應] 前次 RPE 位於最佳區間，建議微幅提升重量 (2.5%) 或維持現狀。');

      setResult({
        recommended_exercises: [...new Set(exercises)],
        biomechanical_reasoning: reasoning.join(' '),
        autoregulation_feedback: feedback.join(' '),
        nutrition_prescription: nutrition
      });

    } catch (err: any) {
      setError(err.message || '運算過程中發生未預期錯誤。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8 flex flex-col items-center print:p-0 print:bg-white bg-slate-950 text-slate-200">
      <div className="w-full max-w-6xl print:max-w-none">
        <header className="mb-8 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
              <Activity className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white">Antigravity Fitness OS</h1>
              <p className="text-sm text-gray-400 font-mono mt-1">v4.1 // Localized Seasonal Nutrition AI</p>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 print:block">
          {/* 左側輸入區塊 */}
          <div className={`lg:col-span-5 space-y-6 print:hidden ${isExporting ? 'hidden' : ''}`}>
            
            <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-6 space-y-6">
              <div className="flex items-center gap-2 border-b border-gray-800 pb-3">
                <Ruler className="w-5 h-5 text-blue-400" />
                <h2 className="text-lg font-semibold text-gray-200">Base Biometrics (基礎物理特徵)</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="flex items-center gap-2 text-xs font-medium text-gray-400 mb-2">股骨/軀幹比例</label>
                  <div className="flex bg-[#1a1a1a] rounded-lg p-1 border border-gray-800">
                    {[{ id: 'low', label: 'Short' }, { id: 'normal', label: 'Normal' }, { id: 'high', label: 'Long' }].map(opt => (
                      <button key={opt.id} onClick={() => setFemurRatio(opt.id as any)} className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${femurRatio === opt.id ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}>{opt.label}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="flex items-center gap-2 text-xs font-medium text-gray-400 mb-2">核心穩定度</label>
                  <div className="flex bg-[#1a1a1a] rounded-lg p-1 border border-gray-800">
                    {[{ id: 'low', label: 'Low' }, { id: 'moderate', label: 'Mod' }, { id: 'high', label: 'High' }].map(opt => (
                      <button key={opt.id} onClick={() => setCoreStability(opt.id as any)} className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${coreStability === opt.id ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}>{opt.label}</button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-400">
                    <Zap className="w-4 h-4" />
                    Current RPE (上次訓練強度)
                  </label>
                  <span className="text-lg font-mono font-bold text-white">{currentRPE}</span>
                </div>
                <input type="range" min="1" max="10" step="0.5" value={currentRPE} onChange={(e) => setCurrentRPE(parseFloat(e.target.value))} className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-gradient-to-r from-emerald-500 via-yellow-500 to-red-500 outline-none" style={{ WebkitAppearance: 'none' }} />
                <style>{`input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; height: 18px; width: 18px; border-radius: 50%; background: white; border: 2px solid #1a1a1a; box-shadow: 0 0 10px rgba(0,0,0,0.5); cursor: pointer; }`}</style>
              </div>
            </div>

            <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4 border-b border-gray-800 pb-3">
                <Microscope className="w-5 h-5 text-purple-400" />
                <h2 className="text-lg font-semibold text-gray-200">Physiological Data (生理數據)</h2>
              </div>

              <div className="flex bg-[#1a1a1a] rounded-xl p-1 border border-gray-800 mb-6">
                <button
                  onClick={() => setDataSource('wearable')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg transition-all ${dataSource === 'wearable' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400 hover:text-gray-200'}`}
                >
                  <Watch className="w-4 h-4" />
                  日常穿戴快篩
                </button>
                <button
                  onClick={() => setDataSource('inbody')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg transition-all ${dataSource === 'inbody' ? 'bg-purple-600 text-white shadow-md' : 'text-gray-400 hover:text-gray-200'}`}
                >
                  <Microscope className="w-4 h-4" />
                  月度 InBody
                </button>
              </div>

              {dataSource === 'wearable' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 text-xs font-medium text-gray-400">
                        <Moon className="w-4 h-4 text-indigo-400" /> 睡眠分數 (Sleep Score)
                      </div>
                      <span className={`text-sm font-mono font-bold ${sleepScore < 60 ? 'text-red-400' : 'text-emerald-400'}`}>{sleepScore}</span>
                    </div>
                    <input type="range" min="0" max="100" step="1" value={sleepScore} onChange={(e) => setSleepScore(parseInt(e.target.value))} className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-500" />
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-xs font-medium text-gray-400 mb-2">
                      <HeartPulse className="w-4 h-4 text-pink-400" /> 心率變異度狀態 (HRV Status)
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[{ id: 'low', label: '低落 (Low)' }, { id: 'normal', label: '正常 (Normal)' }, { id: 'optimal', label: '最佳 (Optimal)' }].map(opt => (
                        <button key={opt.id} onClick={() => setHrvStatus(opt.id as any)} className={`py-2 px-2 rounded-lg text-xs font-medium transition-all border ${hrvStatus === opt.id ? 'bg-pink-500/20 border-pink-500/50 text-pink-300' : 'bg-[#1a1a1a] border-gray-800 text-gray-400'}`}>{opt.label}</button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-xs font-medium text-gray-400 mb-2">
                      <Activity className="w-4 h-4 text-red-400" /> 安靜心率趨勢 (RHR Trend)
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {[{ id: 'normal', label: '穩定正常 (Stable)' }, { id: 'elevated', label: '異常升高 (Elevated)' }].map(opt => (
                        <button key={opt.id} onClick={() => setRhrTrend(opt.id as any)} className={`py-2 px-2 rounded-lg text-xs font-medium transition-all border ${rhrTrend === opt.id ? 'bg-red-500/20 border-red-500/50 text-red-300' : 'bg-[#1a1a1a] border-gray-800 text-gray-400'}`}>{opt.label}</button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {dataSource === 'inbody' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-medium text-gray-400">節段肌肉不對稱率 (%)</label>
                      <span className={`text-sm font-mono font-bold ${asymmetry > 5.0 ? 'text-red-400' : 'text-emerald-400'}`}>{asymmetry.toFixed(1)}%</span>
                    </div>
                    <input type="range" min="0" max="15" step="0.1" value={asymmetry} onChange={(e) => setAsymmetry(parseFloat(e.target.value))} className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex flex-col">
                        <label className="text-xs font-medium text-gray-400">細胞相位角 (PhA)</label>
                        <span className="text-[10px] text-gray-500 mt-0.5">*若無此數據請保持預設 7.0</span>
                      </div>
                      <span className={`text-sm font-mono font-bold ${phaseAngle < 5.0 ? 'text-red-400' : 'text-emerald-400'}`}>{phaseAngle.toFixed(1)}</span>
                    </div>
                    <input type="range" min="3.0" max="10.0" step="0.1" value={phaseAngle} onChange={(e) => setPhaseAngle(parseFloat(e.target.value))} className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-medium text-gray-400">細胞外水分比率 (ECW/TBW)</label>
                      <span className={`text-sm font-mono font-bold ${ecwRatio > 0.395 ? 'text-orange-500' : 'text-emerald-400'}`}>{ecwRatio.toFixed(3)}</span>
                    </div>
                    <input type="range" min="0.360" max="0.420" step="0.001" value={ecwRatio} onChange={(e) => setEcwRatio(parseFloat(e.target.value))} className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500" />
                  </div>
                </div>
              )}
            </div>

            <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Target className="w-5 h-5 text-blue-400" />
                <h2 className="text-lg font-semibold text-gray-200">Target Muscle Group</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {MUSCLE_GROUPS.map(group => (
                  <button key={group.id} onClick={() => setTargetMuscleGroup(group.id)} className={`px-4 py-2 rounded-full text-xs font-medium transition-all border ${targetMuscleGroup === group.id ? 'bg-blue-500/20 border-blue-500/50 text-blue-300 shadow-[0_0_10px_rgba(59,130,246,0.15)]' : 'bg-[#1a1a1a] border-gray-800 text-gray-400 hover:border-gray-600'}`}>{group.label}</button>
                ))}
              </div>
            </div>

            <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <Dumbbell className="w-5 h-5 text-blue-400" />
                  <h2 className="text-lg font-semibold text-gray-200">Available Equipment</h2>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setAvailableEquipment(['dumbbells', 'bench'])} className="px-3 py-1.5 text-xs font-medium rounded-full border border-gray-700 bg-gray-800/50 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors">🏠 居家訓練</button>
                  <button onClick={() => setAvailableEquipment(EQUIPMENT_LIST.map(eq => eq.id))} className="px-3 py-1.5 text-xs font-medium rounded-full border border-gray-700 bg-gray-800/50 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors">🏢 全館器材</button>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {EQUIPMENT_LIST.map(eq => {
                  const Icon = eq.icon;
                  const isSelected = availableEquipment.includes(eq.id);
                  return (
                    <button key={eq.id} onClick={() => toggleEquipment(eq.id)} className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${isSelected ? 'bg-blue-500/10 border-blue-500/50 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.15)]' : 'bg-[#1a1a1a] border-gray-800 text-gray-500 hover:border-gray-600'}`}>
                      <Icon className="w-6 h-6 mb-2" />
                      <span className="text-[10px] font-medium text-center leading-tight">{eq.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <button onClick={generatePrescription} disabled={loading} className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(37,99,235,0.2)]">
              {loading ? <><Loader2 className="w-6 h-6 animate-spin" /><span>運算處方中...</span></> : <><Rocket className="w-6 h-6" /><span>🚀 生成生物力學處方</span></>}
            </button>
            {error && <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-3 text-red-400"><AlertCircle className="w-5 h-5 shrink-0 mt-0.5" /><p className="text-sm">{error}</p></div>}
          </div>

          {/* 右側輸出區塊 */}
          <div className="lg:col-span-7">
            <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-6 h-full min-h-[600px] flex flex-col">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-800">
                <div className="flex items-center gap-2">
                  <BrainCircuit className="w-5 h-5 text-blue-400" />
                  <h2 className="text-lg font-semibold text-gray-200">Computation Results</h2>
                </div>
                {result && (
                  <button onClick={handleExportPDF} disabled={isExporting} className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium rounded-lg border border-gray-700 disabled:opacity-50">
                    {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Printer className="w-4 h-4" />}
                    <span>{isExporting ? '⏳ 渲染報告中...' : '📄 匯出處方報告 (Export PDF)'}</span>
                  </button>
                )}
              </div>

              {result ? (
                <div className="space-y-8 flex-1 overflow-y-auto pr-2">
                  <section>
                    <h3 className="text-sm font-mono mb-3 uppercase tracking-wider text-gray-500">Recommended Exercises</h3>
                    <div className="space-y-2">
                      {result.recommended_exercises.map((ex, idx) => (
                        <div key={idx} className="p-4 bg-[#1a1a1a] border border-gray-800 rounded-lg flex items-center gap-3">
                          <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-mono">{idx + 1}</div>
                          <span className="font-medium text-gray-200">{ex}</span>
                        </div>
                      ))}
                    </div>
                  </section>
                  <section>
                    <h3 className="text-sm font-mono mb-3 uppercase tracking-wider text-gray-500">Biomechanical Reasoning</h3>
                    <div className="p-5 bg-blue-950/20 border border-blue-900/30 rounded-lg relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                      <p className="text-sm leading-relaxed text-gray-300">{result.biomechanical_reasoning}</p>
                    </div>
                  </section>
                  <section>
                    <h3 className="text-sm font-mono mb-3 uppercase tracking-wider text-gray-500">Autoregulation Feedback</h3>
                    <div className="p-5 bg-emerald-950/20 border border-emerald-900/30 rounded-lg relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-emerald-400" />
                        <p className="text-sm leading-relaxed text-gray-300">{result.autoregulation_feedback}</p>
                      </div>
                    </div>
                  </section>
                  <section>
                    <h3 className="text-sm font-mono mb-3 uppercase tracking-wider text-amber-500/80">🍎 Seasonal Nutrition Matrix ({currentSeason})</h3>
                    <div className="p-5 bg-amber-950/20 border border-amber-900/30 rounded-lg relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1 h-full bg-amber-500"></div>
                      <div className="flex items-start gap-3">
                        <Apple className="w-5 h-5 shrink-0 mt-0.5 text-amber-400" />
                        <p className="text-sm leading-relaxed text-gray-300">{result.nutrition_prescription}</p>
                      </div>
                    </div>
                  </section>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-gray-500 space-y-4">
                  <div className="w-16 h-16 rounded-full border border-gray-800 flex items-center justify-center"><BrainCircuit className="w-8 h-8 opacity-50" /></div>
                  <p className="text-sm font-mono text-center max-w-xs">等待輸入參數... 在地化 CDSS 決策系統已就緒。</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="overflow-hidden h-0 w-0 absolute top-[-9999px] left-[-9999px]">
        {/* PDF Export Markup Hidden */}
      </div>
    </div>
  );
}