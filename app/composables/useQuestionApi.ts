/**
 * useQuestionApi — 使用者投稿題目 API
 *
 * 一般使用者的投稿 CRUD：建立、列出自己的、看詳情、編輯、刪除。
 * 跟 useAdminQuestionApi 不同：這裡是「我自己的投稿」，admin 是「所有人的投稿」。
 *
 * 全部用 `useAuthFetch`，因為這些操作都要求登入（middleware: 'auth'）。
 */

/** 投稿表單資料（create + update 都用這個形狀） */
export interface QuestionFormData {
  content: string;
  options: { content: string; correct: boolean }[];
}

/** 「我的投稿」列表項目（含狀態標籤顯示：待審核 / 已上架 / 未通過） */
export interface QuestionItem {
  id: number;
  content: string;
  status: string; // PENDING | PUBLISHED | REJECTED
  options: { id: number }[];
  createdAt: string;
}

/** 單筆題目詳情（編輯頁面用，需要知道每個選項的 correct 狀態） */
export interface QuestionDetail {
  id: number;
  content: string;
  options: { id: number; content: string; correct: boolean }[];
}

export const useQuestionApi = () => {
  // ── 新增投稿 ──
  // 建立後狀態會是 PENDING，要等管理者審核才會上架（變成 PUBLISHED）
  const create = (data: QuestionFormData) => useAuthFetch('/api/questions', { method: 'POST', body: data });

  // ── 我的投稿列表 ──
  // 只回傳當前登入者建立的題目（後端用 JWT 的 userId 過濾）
  const listMine = () => useAuthFetch<QuestionItem[]>('/api/questions/mine');

  // ── 單筆投稿詳情 ──
  // 編輯頁面載入時用這個拿完整資料（listMine 沒有選項文字，只有 id）
  const getDetail = (id: number) => useAuthFetch<QuestionDetail>(`/api/questions/${id}`);

  // ── 更新投稿 ──
  // 只有 PENDING 或 REJECTED 狀態的題目可以編輯，後端會檢查擁有者 + 狀態
  const update = (id: number, data: QuestionFormData) =>
    useAuthFetch(`/api/questions/${id}`, { method: 'PUT', body: data });

  // ── 刪除投稿 ──
  // 同樣只有 PENDING/REJECTED 可刪，已上架的題目不能由使用者刪（要管理者處理）
  const remove = (id: number) => useAuthFetch(`/api/questions/${id}`, { method: 'DELETE' });

  return { create, listMine, getDetail, update, remove };
};
