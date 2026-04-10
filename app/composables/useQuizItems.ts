import type { QuestionDTO } from './useQuiz';

/**
 * 道具系統 — 每局各限用一次。
 *
 * 50/50：移除 2 個錯誤選項
 * 經文提示：顯示 bibleRef
 * 觀眾投票：顯示歷史選項分佈 %
 */
export const useQuizItems = () => {
  const used = reactive({
    eliminate: false,
    scriptureHint: false,
    audiencePoll: false,
  });

  const eliminatedOptionIds = ref<number[]>([]);
  const hintVisible = ref(false);
  const pollData = ref<Record<number, number> | null>(null);

  // ── 刪去法 ──
  // 移除 2 個錯誤選項（前端本地處理，不需 API 支援）
  const useEliminate = (question: QuestionDTO | null) => {
    if (used.eliminate || !question) return;
    used.eliminate = true;
    const wrong = question.options.filter(o => !o.correct);
    const shuffled = [...wrong].sort(() => Math.random() - 0.5);
    eliminatedOptionIds.value = shuffled.slice(0, 2).map(o => o.id);
  };

  // ── 經文提示 ──

  const useScriptureHint = () => {
    if (used.scriptureHint) return;
    used.scriptureHint = true;
    hintVisible.value = true;
  };

  // ── 觀眾投票 ──

  const fetchPollData = (questionId: number) =>
    $fetch<{ optionId: number; percentage: number }[]>(`/api/biblequiz/poll/${questionId}`);

  const useAudiencePoll = async (question: QuestionDTO | null) => {
    if (used.audiencePoll || !question) return;
    used.audiencePoll = true;
    try {
      const data = await fetchPollData(question.id);
      // 先全部填 0%，再覆蓋有資料的
      const map: Record<number, number> = {};
      question.options.forEach(o => (map[o.id] = 0));
      data.forEach(d => (map[d.optionId] = d.percentage));
      pollData.value = map;
    } catch {
      // API 失敗時，全部顯示 0%
      const map: Record<number, number> = {};
      question.options.forEach(o => (map[o.id] = 0));
      pollData.value = map;
    }
  };

  // ── 切題重置當題狀態 ──

  const resetForNextQuestion = () => {
    eliminatedOptionIds.value = [];
    hintVisible.value = false;
    pollData.value = null;
  };

  // ── 整局重置 ──

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
