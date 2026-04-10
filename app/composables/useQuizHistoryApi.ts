/** 歷史列表項目 */
export interface RoundHistory {
  roundId: number;
  score: number;
  totalQuestions: number;
  completedAt: string;
}

/** 使用者統計 */
export interface UserStats {
  totalGames: number;
  averageScore: number;
  perfectGames: number;
  totalScore: number;
}

/** 答題回顧選項 */
export interface OptionItem {
  id: number;
  content: string;
  correct: boolean;
}

/** 答題回顧逐題詳情 */
export interface AnswerDetail {
  questionId: number;
  questionContent: string;
  bibleRef: string | null;
  options: OptionItem[];
  selectedOptionId: number;
  correct: boolean;
}

/** 單局回顧詳情 */
export interface RoundDetail {
  roundId: number;
  score: number;
  totalQuestions: number;
  completedAt: string;
  answers: AnswerDetail[];
}

/** 作答紀錄與統計 API（歷史列表、統計、單局詳情） */
export const useQuizHistoryApi = () => {
  const listHistory = () => useAuthFetch<RoundHistory[]>('/api/user/history');

  const getStats = () => useAuthFetch<UserStats>('/api/user/stats');

  const getRoundDetail = (id: number | string) => useAuthFetch<RoundDetail>(`/api/user/history/${id}`);

  return { listHistory, getStats, getRoundDetail };
};
