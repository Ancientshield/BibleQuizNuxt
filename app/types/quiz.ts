// 後端回傳的題目（不含正確答案）
export interface QuestionDTO {
  id: number;
  content: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
}

// 前端自行管理的作答紀錄
export interface AnswerRecord {
  questionId: number;
  selectedAnswer: string; // 'A' | 'B' | 'C' | 'D'
  isCorrect: boolean;
}

// 前端自行組裝的結算結果
export interface QuizResult {
  score: number;
  totalQuestions: number;
  records: AnswerRecord[];
}

// 選項按鈕的顯示狀態
export type OptionStatus = 'idle' | 'correct' | 'wrong' | 'dimmed';
