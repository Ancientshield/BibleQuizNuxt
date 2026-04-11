import type { QuestionDTO } from './useQuiz';

/**
 * useQuizItems — 答題輔助道具系統
 *
 * 每一局（10 題）三個道具各限用 1 次，用完就灰化不能再點。
 * 道具邏輯刻意跟 useQuiz 分開：useQuiz 只管題目/分數/作答紀錄，
 * 這裡只管道具狀態，兩者互不依賴，start.vue 自己把兩個 composable 接起來。
 *
 * 三種道具：
 * - 刪去法（eliminate）：隨機反灰 2 個錯誤選項，純前端運算
 * - 經文提示（scriptureHint）：顯示 bibleRef，純前端切換 flag
 * - 觀眾投票（audiencePoll）：顯示歷史選項分佈 %，要打 API 拿統計資料
 */
export const useQuizItems = () => {
  // 三個道具的「已使用」flag，用 reactive 物件方便用 key 索引
  const used = reactive({
    eliminate: false,
    scriptureHint: false,
    audiencePoll: false,
  });

  // 刪去法消除的選項 ID（給選項元件判斷要不要反灰）
  const eliminatedOptionIds = ref<number[]>([]);

  // 經文提示是否顯示（start.vue 用 v-if 綁這個）
  const hintVisible = ref(false);

  // 觀眾投票百分比表 {optionId: percentage}；null 表示還沒用過道具
  const pollData = ref<Record<number, number> | null>(null);

  /**
   * 刪去法 — 隨機挑 2 個錯誤選項反灰。
   * 純前端處理：從 question.options 過濾出非正確的，洗牌後取前 2 個。
   * 為什麼要 shuffle：避免每次都反灰同樣的兩個，保持隨機感。
   */
  const useEliminate = (question: QuestionDTO | null) => {
    if (used.eliminate || !question) return;
    used.eliminate = true;
    const wrong = question.options.filter(o => !o.correct);
    const shuffled = [...wrong].sort(() => Math.random() - 0.5);
    eliminatedOptionIds.value = shuffled.slice(0, 2).map(o => o.id);
  };

  /**
   * 經文提示 — 顯示 bibleRef 字串。
   * 後端 fetchQuestions 已經把 bibleRef 一起回傳，這裡只要把 flag 打開讓 template 顯示。
   */
  const useScriptureHint = () => {
    if (used.scriptureHint) return;
    used.scriptureHint = true;
    hintVisible.value = true;
  };

  // 取得該題的歷史投票分佈（後端統計所有作答者選了哪個選項的 %）
  const fetchPollData = (questionId: number) =>
    $fetch<{ optionId: number; percentage: number }[]>(`/api/biblequiz/poll/${questionId}`);

  /**
   * 觀眾投票 — 顯示歷史選項分佈。
   *
   * 唯一需要打 API 的道具。為了讓選項元件永遠能安全讀取 pollData[optionId]，
   * 這裡不論 API 成功或失敗，都會把所有 optionId 先填成 0%，再用後端資料覆寫。
   * 所以選項元件不用判斷 undefined，直接讀就能拿到數字。
   */
  const useAudiencePoll = async (question: QuestionDTO | null) => {
    if (used.audiencePoll || !question) return;
    used.audiencePoll = true;
    try {
      const data = await fetchPollData(question.id);
      // 先全部填 0%，再用 API 結果覆蓋
      const map: Record<number, number> = {};
      question.options.forEach(o => (map[o.id] = 0));
      data.forEach(d => (map[d.optionId] = d.percentage));
      pollData.value = map;
    } catch {
      // API 失敗時，全部顯示 0%（仍然觸發 UI 效果，只是數字沒意義）
      const map: Record<number, number> = {};
      question.options.forEach(o => (map[o.id] = 0));
      pollData.value = map;
    }
  };

  /**
   * 切題時重置「當題視覺狀態」但保留 `used` 旗標。
   * 例如：第 1 題用了刪去法，第 2 題不能再用，但第 1 題消除的選項 ID 必須清空，
   * 否則會影響第 2 題的反灰判斷。
   */
  const resetForNextQuestion = () => {
    eliminatedOptionIds.value = [];
    hintVisible.value = false;
    pollData.value = null;
  };

  /**
   * 整局重置 — 「再玩一次」時呼叫。
   * 把 used 全部清零 + 清掉當題視覺狀態。
   */
  const resetAll = () => {
    used.eliminate = false;
    used.scriptureHint = false;
    used.audiencePoll = false;
    resetForNextQuestion();
  };

  return {
    used,
    eliminatedOptionIds,
    hintVisible,
    pollData,
    useEliminate,
    useScriptureHint,
    useAudiencePoll,
    resetForNextQuestion,
    resetAll,
  };
};
