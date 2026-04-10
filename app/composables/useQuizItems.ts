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
    fiftyFifty: false,
    scriptureHint: false,
    audiencePoll: false,
  });

  const eliminatedOptionIds = ref<number[]>([]);
  const hintVisible = ref(false);
  const pollData = ref<Record<number, number> | null>(null);

  // ── 50/50 ──

  const useFiftyFifty = (question: QuestionDTO | null) => {
    if (used.fiftyFifty || !question) return;
    used.fiftyFifty = true;
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

  const useAudiencePoll = async (question: QuestionDTO | null) => {
    if (used.audiencePoll || !question) return;
    used.audiencePoll = true;
    try {
      const data = await $fetch<{ optionId: number; percentage: number }[]>(`/api/biblequiz/poll/${question.id}`);
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
    used.fiftyFifty = false;
    used.scriptureHint = false;
    used.audiencePoll = false;
    resetForNextQuestion();
  };

  return {
    used,
    eliminatedOptionIds,
    hintVisible,
    pollData,
    useFiftyFifty,
    useScriptureHint,
    useAudiencePoll,
    resetForNextQuestion,
    resetAll,
  };
};
