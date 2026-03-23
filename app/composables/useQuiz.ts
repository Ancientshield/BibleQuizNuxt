import type { QuestionDTO, AnswerRecord, QuizResult } from '~/types/quiz';

export const useQuiz = () => {
  const questions = ref<QuestionDTO[]>([]);
  const currentIndex = ref(0);
  const score = ref(0);
  const answers = ref<AnswerRecord[]>([]);

  const isFinished = computed(() => questions.value.length > 0 && currentIndex.value >= questions.value.length);
  const currentQuestion = computed(() => questions.value[currentIndex.value] ?? null);

  async function fetchQuestions() {
    const data = await $fetch<QuestionDTO[]>('/api/biblequiz/start');
    questions.value = data;
    currentIndex.value = 0;
    score.value = 0;
    answers.value = [];
  }

  async function checkAnswer(questionId: number, answer: string): Promise<boolean> {
    const isCorrect = await $fetch<boolean>('/api/biblequiz/check', {
      method: 'POST',
      params: { questionId, answer },
    });

    if (isCorrect) score.value++;
    answers.value.push({ questionId, selectedAnswer: answer, isCorrect });
    return isCorrect;
  }

  function nextQuestion() {
    currentIndex.value++;
  }

  function getResult(): QuizResult {
    return {
      score: score.value,
      totalQuestions: questions.value.length,
      records: answers.value,
    };
  }

  function resetQuiz() {
    questions.value = [];
    currentIndex.value = 0;
    score.value = 0;
    answers.value = [];
  }

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
