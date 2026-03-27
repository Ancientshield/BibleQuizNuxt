// 後端回傳的選項（含 correct，前端本地驗答）
interface OptionDTO {
  id: number;
  content: string;
  correct: boolean;
}

// 後端回傳的題目（含選項陣列）
interface QuestionDTO {
  id: number;
  content: string;
  category: string | null;
  bibleRef: string | null;
  options: OptionDTO[];
}

// 前端自行管理的作答紀錄
interface AnswerRecord {
  questionId: number;
  selectedOptionId: number;
  isCorrect: boolean;
}

// 前端自行組裝的結算結果
interface QuizResult {
  score: number;
  totalQuestions: number;
  records: AnswerRecord[];
}

export type { OptionDTO, QuestionDTO };

export const useQuiz = () => {
  const questions = ref<QuestionDTO[]>([]);
  const currentIndex = ref(0);
  const score = ref(0);
  const answers = ref<AnswerRecord[]>([]);

  const isFinished = computed(() => questions.value.length > 0 && currentIndex.value >= questions.value.length);
  const currentQuestion = computed(() => questions.value[currentIndex.value] ?? null);

  const fetchQuestions = async () => {
    const data = await $fetch<QuestionDTO[]>('/api/biblequiz/start');
    questions.value = data;
    currentIndex.value = 0;
    score.value = 0;
    answers.value = [];
  };

  // 本地驗答（同步），回傳正確選項的 ID；找不到回傳 null
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

  const nextQuestion = () => {
    currentIndex.value++;
  };

  const getResult = (): QuizResult => {
    return {
      score: score.value,
      totalQuestions: questions.value.length,
      records: answers.value,
    };
  };

  const resetQuiz = () => {
    questions.value = [];
    currentIndex.value = 0;
    score.value = 0;
    answers.value = [];
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
  };
};
