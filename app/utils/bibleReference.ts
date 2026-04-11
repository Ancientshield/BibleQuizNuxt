/**
 * bibleReference — 題目經文出處相關的共用常數 / 工具。
 *
 * 核准 / 編輯題目 Modal 需要：
 * 1. 根據使用者選的「書卷」推出該書卷有幾章（章節數下拉）
 * 2. 統一的節數選單（聖經最多 176 節）
 *
 * 兩個 Modal 原本各自 import 重複的 BOOK_CHAPTERS，改成從這個 utils 自動載入。
 */

// 和合本 66 卷各自的章數，index 對應 bible_book 表的 sortOrder（1~66）
const BOOK_CHAPTERS: Record<number, number> = {
  1: 50,
  2: 40,
  3: 27,
  4: 36,
  5: 34,
  6: 24,
  7: 21,
  8: 4,
  9: 31,
  10: 24,
  11: 22,
  12: 25,
  13: 29,
  14: 36,
  15: 10,
  16: 13,
  17: 10,
  18: 42,
  19: 150,
  20: 31,
  21: 12,
  22: 8,
  23: 66,
  24: 52,
  25: 5,
  26: 48,
  27: 12,
  28: 14,
  29: 3,
  30: 9,
  31: 1,
  32: 4,
  33: 7,
  34: 3,
  35: 3,
  36: 3,
  37: 2,
  38: 14,
  39: 4,
  40: 28,
  41: 16,
  42: 24,
  43: 21,
  44: 28,
  45: 16,
  46: 16,
  47: 13,
  48: 6,
  49: 6,
  50: 4,
  51: 4,
  52: 5,
  53: 3,
  54: 6,
  55: 4,
  56: 3,
  57: 1,
  58: 13,
  59: 5,
  60: 5,
  61: 3,
  62: 5,
  63: 1,
  64: 1,
  65: 1,
  66: 22,
};

// 聖經最長的詩篇 119 有 176 節，統一提供 1~176 節選單
export const VERSE_OPTIONS = Array.from({ length: 176 }, (_, i) => i + 1);

// 根據書卷 ID 推出章數選單（null / 找不到書卷都回空陣列，方便 disabled 下拉）
export const getChapterOptions = (bookId: number | null): number[] => {
  if (!bookId) return [];
  const max = BOOK_CHAPTERS[bookId] || 0;
  return Array.from({ length: max }, (_, i) => i + 1);
};
