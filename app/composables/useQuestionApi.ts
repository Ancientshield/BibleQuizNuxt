/** 投稿表單資料 */
export interface QuestionFormData {
  content: string;
  options: { content: string; correct: boolean }[];
}

/** 投稿列表項目 */
export interface QuestionItem {
  id: number;
  content: string;
  status: string;
  options: { id: number }[];
  createdAt: string;
}

/** 投稿題目詳情（編輯用） */
export interface QuestionDetail {
  id: number;
  content: string;
  options: { id: number; content: string; correct: boolean }[];
}

/** 使用者投稿題目 API（建立、列表、詳情、更新、刪除） */
export const useQuestionApi = () => {
  const create = (data: QuestionFormData) => useAuthFetch('/api/questions', { method: 'POST', body: data });

  const listMine = () => useAuthFetch<QuestionItem[]>('/api/questions/mine');

  const getDetail = (id: number) => useAuthFetch<QuestionDetail>(`/api/questions/${id}`);

  const update = (id: number, data: QuestionFormData) =>
    useAuthFetch(`/api/questions/${id}`, { method: 'PUT', body: data });

  const remove = (id: number) => useAuthFetch(`/api/questions/${id}`, { method: 'DELETE' });

  return { create, listMine, getDetail, update, remove };
};
