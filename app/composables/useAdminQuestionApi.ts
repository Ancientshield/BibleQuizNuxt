/** 管理後台題目項目 */
export interface AdminQuestionItem {
  id: number;
  content: string;
  status: string;
  categoryId: number | null;
  categoryName: string | null;
  bibleBookId: number | null;
  bibleRef: string | null;
  bibleChapter: number | null;
  bibleVerseStart: number | null;
  bibleVerseEnd: number | null;
  options: { id: number; content: string; correct: boolean; selectedCount?: number }[];
  totalAnswered: number | null;
  correctCount: number | null;
  accuracyRate: number | null;
  mostSelectedWrongOption: string | null;
  authorName: string | null;
  createdAt: string;
}

/** 分頁回應 */
export interface AdminPageResponse {
  content: AdminQuestionItem[];
  totalElements: number;
  totalPages: number;
}

/** 分類 */
export interface AdminCategory {
  id: number;
  name: string;
}

/** 聖經書卷 */
export interface AdminBibleBook {
  id: number;
  name: string;
}

/** 管理後台題目 API（列表、核准、退回、編輯、刪除、取分類、取書卷） */
export const useAdminQuestionApi = () => {
  const listQuestions = (params: string) => useAuthFetch<AdminPageResponse>(`/api/admin/questions?${params}`);

  const publish = (id: number, body: Record<string, unknown>) =>
    useAuthFetch(`/api/admin/questions/${id}/publish`, { method: 'PATCH', body });

  const reject = (id: number) => useAuthFetch(`/api/admin/questions/${id}/reject`, { method: 'PATCH' });

  const update = (id: number, body: Record<string, unknown>) =>
    useAuthFetch(`/api/admin/questions/${id}`, { method: 'PUT', body });

  const remove = (id: number) => useAuthFetch(`/api/admin/questions/${id}`, { method: 'DELETE' });

  const getCategories = () => useAuthFetch<AdminCategory[]>('/api/admin/questions/categories');

  const getBibleBooks = () => useAuthFetch<AdminBibleBook[]>('/api/admin/questions/bible-books');

  return { listQuestions, publish, reject, update, remove, getCategories, getBibleBooks };
};
