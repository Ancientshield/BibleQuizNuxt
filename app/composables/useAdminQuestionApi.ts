/**
 * useAdminQuestionApi — 管理後台題目管理 API
 *
 * admin/questions 頁面的資料來源，只有 ADMIN 角色能呼叫。
 * 後端透過 Spring Security 檢查 JWT 角色，如果非 ADMIN 會回 403。
 *
 * 與 useQuestionApi 的差別：
 * - useQuestionApi 只能看/改自己的投稿
 * - useAdminQuestionApi 能看/改所有人的投稿，還能核准 / 退回投稿
 */

/** 管理後台題目項目（比前台多帶統計欄位：作答次數、正確率、熱門錯答） */
export interface AdminQuestionItem {
  id: number;
  content: string;
  status: string; // PENDING | PUBLISHED | REJECTED
  categoryId: number | null;
  categoryName: string | null;
  bibleBookId: number | null;
  bibleRef: string | null;
  bibleChapter: number | null;
  bibleVerseStart: number | null;
  bibleVerseEnd: number | null;
  options: { id: number; content: string; correct: boolean; selectedCount?: number }[];
  totalAnswered: number | null; // 總作答次數
  correctCount: number | null; // 答對次數
  accuracyRate: number | null; // 正確率
  mostSelectedWrongOption: string | null; // 最常被選的錯答（幫助 admin 改題）
  authorName: string | null;
  createdAt: string;
}

/** Spring Data JPA Page 分頁回應 */
export interface AdminPageResponse {
  content: AdminQuestionItem[];
  totalElements: number;
  totalPages: number;
}

/** 分類 lookup table */
export interface AdminCategory {
  id: number;
  name: string;
}

/** 聖經書卷 lookup table */
export interface AdminBibleBook {
  id: number;
  name: string;
}

export const useAdminQuestionApi = () => {
  // ── 題目列表（支援多條件篩選 + 分頁） ──
  // params 是 query string 形式，由呼叫端用 URLSearchParams 組好：
  // 支援 status、categoryId、keyword、optionKeyword、author、dateFrom、dateTo、page、size、includeStats
  const listQuestions = (params: string) => useAuthFetch<AdminPageResponse>(`/api/admin/questions?${params}`);

  // ── 核准上架 ──
  // 把題目從 PENDING 改為 PUBLISHED，同時必填分類、書卷、章、節
  // （使用者投稿時沒填這些，admin 審核時要補齊）
  const publish = (id: number, body: Record<string, unknown>) =>
    useAuthFetch(`/api/admin/questions/${id}/publish`, { method: 'PATCH', body });

  // ── 退回投稿 ──
  // 把題目從 PENDING 改為 REJECTED，使用者可以看到狀態變成「未通過」並重新編輯
  const reject = (id: number) => useAuthFetch(`/api/admin/questions/${id}/reject`, { method: 'PATCH' });

  // ── 編輯題目 ──
  // admin 可以改任何題目（包含已上架的），body 要包含完整題目 + 選項 + 經文資料
  const update = (id: number, body: Record<string, unknown>) =>
    useAuthFetch(`/api/admin/questions/${id}`, { method: 'PUT', body });

  // ── 刪除題目 ──
  // admin 可以直接硬刪（連同關聯的 option、user_quiz_answer 一起）
  const remove = (id: number) => useAuthFetch(`/api/admin/questions/${id}`, { method: 'DELETE' });

  // ── 取得分類清單（給下拉選單用） ──
  // 分類 CRUD 端點移到 /api/admin/categories（見 AdminCategoryController）
  const getCategories = () => useAuthFetch<AdminCategory[]>('/api/admin/categories');

  // ── 取得聖經書卷清單（66 卷，給核准 / 編輯時選書卷用） ──
  const getBibleBooks = () => useAuthFetch<AdminBibleBook[]>('/api/admin/questions/bible-books');

  return { listQuestions, publish, reject, update, remove, getCategories, getBibleBooks };
};
