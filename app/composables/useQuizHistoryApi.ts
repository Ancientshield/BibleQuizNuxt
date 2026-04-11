/**
 * useQuizHistoryApi — 個人作答紀錄與統計 API
 *
 * my-history 頁面的資料來源。包含三支 API：
 * - 歷史列表（所有玩過的場次）
 * - 總覽統計（總場數、平均、滿分次數、總經驗值）
 * - 單場詳情（逐題回顧：答對/答錯、選了什麼、正確答案、bibleRef）
 *
 * 資料來源是後端 user_quiz_round + user_quiz_answer 兩張表，
 * 每次 submitResults 都會寫入一筆 round + 多筆 answer。
 */

/** 歷史列表項目（不含逐題細節，只有總分和時間） */
export interface RoundHistory {
  roundId: number;
  score: number;
  totalQuestions: number;
  completedAt: string;
}

/** 使用者總覽統計 */
export interface UserStats {
  totalGames: number; // 總遊戲場次
  averageScore: number; // 平均分數
  perfectGames: number; // 滿分次數
  totalScore: number; // 累積總經驗值 EXP
}

/** 答題回顧的單一選項 */
export interface OptionItem {
  id: number;
  content: string;
  correct: boolean;
}

/** 答題回顧的逐題詳情（含題目、選項、使用者選了哪個、是否答對、bibleRef） */
export interface AnswerDetail {
  questionId: number;
  questionContent: string;
  bibleRef: string | null;
  options: OptionItem[];
  selectedOptionId: number;
  correct: boolean;
}

/** 單場回顧完整資料 */
export interface RoundDetail {
  roundId: number;
  score: number;
  totalQuestions: number;
  completedAt: string;
  answers: AnswerDetail[];
}

export const useQuizHistoryApi = () => {
  // ── 歷史列表 ──
  // 用於 my-history 首頁，依時間倒序排列
  const listHistory = () => useAuthFetch<RoundHistory[]>('/api/user/history');

  // ── 總覽統計 ──
  // 用於 my-history 首頁上方的統計卡片（cyan/purple/amber 三張）
  const getStats = () => useAuthFetch<UserStats>('/api/user/stats');

  // ── 單場詳情 ──
  // 用於 my-history/[id] 答題回顧頁，可以逐題看自己的作答
  const getRoundDetail = (id: number | string) => useAuthFetch<RoundDetail>(`/api/user/history/${id}`);

  return { listHistory, getStats, getRoundDetail };
};
