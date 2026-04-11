/**
 * useQuiz — 核心答題邏輯
 *
 * 這個 composable 管理一整輪測驗的狀態（題目、進度、分數、作答紀錄）。
 * 架構重點：後端一次回傳 10 題含所有選項和 `correct` 旗標，前端本地驗答，
 * 答題過程中不會再打 API（零延遲），只有「開始測驗」和「結算提交」會打 API。
 */

// 後端回傳的選項（含 correct，前端本地驗答用）
interface OptionDTO {
  id: number;
  content: string;
  correct: boolean;
}

// 後端回傳的題目（含完整選項陣列 + 經文出處）
interface QuestionDTO {
  id: number;
  content: string;
  category: string | null;
  bibleRef: string | null;
  options: OptionDTO[];
}

// 前端自行管理的作答紀錄（提交到後端時用，不包含題目內容）
interface AnswerRecord {
  questionId: number;
  selectedOptionId: number;
  isCorrect: boolean;
}

// 前端自行組裝的結算結果（顯示在結算畫面）
interface QuizResult {
  score: number;
  totalQuestions: number;
  records: AnswerRecord[];
}

export type { OptionDTO, QuestionDTO, AnswerRecord };

export const useQuiz = () => {
  // ── 反應式狀態（整輪測驗的核心資料） ──
  const questions = ref<QuestionDTO[]>([]);
  const currentIndex = ref(0);
  const score = ref(0);
  const answers = ref<AnswerRecord[]>([]);

  // 判斷「是否已答完所有題目」：用來切換顯示結算畫面
  const isFinished = computed(() => questions.value.length > 0 && currentIndex.value >= questions.value.length);

  // 當前題目：template 直接綁 currentQuestion，切題時自動更新
  const currentQuestion = computed(() => questions.value[currentIndex.value] ?? null);

  /**
   * 向後端取 10 題（隨機）並重置所有狀態。
   * 一次拿完整題目（含 correct），後續驗答不需要再打 API。
   */
  const fetchQuestions = async () => {
    const data = await $fetch<QuestionDTO[]>('/api/biblequiz/start');
    questions.value = data;
    currentIndex.value = 0;
    score.value = 0;
    answers.value = [];
  };

  /**
   * 本地驗答（同步），回傳正確選項的 ID；找不到題目或正確答案回傳 null。
   *
   * 為什麼要本地驗答：答題體驗要「點下去就立刻顯示對錯」，網路往返會造成延遲。
   * 後端信任前端的紀錄，結算時會再由後端用 question_id 重新驗證並扣分作弊。
   */
  const checkAnswer = (questionId: number, selectedOptionId: number): number | null => {
    const question = questions.value.find(q => q.id === questionId);
    if (!question) return null;

    const correctOption = question.options.find(o => o.correct);
    if (!correctOption) return null;

    const isCorrect = selectedOptionId === correctOption.id;
    if (isCorrect) score.value++;

    answers.value.push({ questionId, selectedOptionId, isCorrect });
    return correctOption.id;
  };

  // 前進到下一題（start.vue 會在答題展示動畫結束後呼叫）
  const nextQuestion = () => {
    currentIndex.value++;
  };

  // 組裝結算結果：結算畫面和提交 API 都會用到
  const getResult = (): QuizResult => ({
    score: score.value,
    totalQuestions: questions.value.length,
    records: answers.value,
  });

  // 整輪重置：「再玩一次」按鈕會呼叫這個，同時清空 localStorage 進度
  const resetQuiz = () => {
    questions.value = [];
    currentIndex.value = 0;
    score.value = 0;
    answers.value = [];
    localStorage.removeItem('quiz_progress');
  };

  // ── G-5-7：作答紀錄提交 + localStorage 暫存 ──

  /**
   * 把當前進度（題號、分數、答題紀錄）寫進 localStorage。
   *
   * 為什麼要存：如果使用者中途關閉分頁或重新整理，重新進來至少可以看到自己答到哪。
   * 存在每次 handleSelect 之後呼叫，不影響主流程效能。
   */
  const saveProgress = () => {
    localStorage.setItem(
      'quiz_progress',
      JSON.stringify({
        answers: answers.value,
        currentIndex: currentIndex.value,
        score: score.value,
      })
    );
  };

  /**
   * 結算時把作答紀錄提交到後端（寫入 user_quiz_round + user_quiz_answer 表）。
   *
   * 未登入者不提交（遊客可以玩但不累積紀錄）。
   * 提交失敗不影響結算畫面顯示（try/catch 吞掉錯誤），因為分數在前端已經算好了。
   * 成功後清掉 localStorage 進度，避免下次重新載入時誤讀舊資料。
   */
  const submitResults = async () => {
    const auth = useAuthStore();
    if (!auth.isLoggedIn) return;

    try {
      await useAuthFetch('/api/user/quiz/submit', {
        method: 'POST',
        body: {
          score: score.value,
          answers: answers.value.map(a => ({
            questionId: a.questionId,
            selectedOptionId: a.selectedOptionId,
          })),
        },
      });
    } catch {
      // 提交失敗不影響結算畫面
    }

    localStorage.removeItem('quiz_progress');
  };

  return {
    questions,
    currentIndex,
    score,
    answers,
    isFinished,
    currentQuestion,
    fetchQuestions,
    checkAnswer,
    nextQuestion,
    getResult,
    resetQuiz,
    saveProgress,
    submitResults,
  };
};
