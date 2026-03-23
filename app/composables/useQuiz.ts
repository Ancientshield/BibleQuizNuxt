// 後端回傳的題目（不含正確答案）
interface QuestionDTO {
  id: number;
  content: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
}

// 前端自行管理的作答紀錄
interface AnswerRecord {
  questionId: number;
  selectedAnswer: string; // 'A' | 'B' | 'C' | 'D'
  isCorrect: boolean;
}

// 前端自行組裝的結算結果
interface QuizResult {
  score: number;
  totalQuestions: number;
  records: AnswerRecord[];
}

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

  const checkAnswer = async (questionId: number, answer: string): Promise<boolean> => {
    const isCorrect = await $fetch<boolean>('/api/biblequiz/check', {
      method: 'POST',
      params: { questionId, answer },
    });

    if (isCorrect) score.value++;
    answers.value.push({ questionId, selectedAnswer: answer, isCorrect });
    return isCorrect;
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
