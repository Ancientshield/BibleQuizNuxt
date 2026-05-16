/**
 * bibleReference — 題目經文出處相關的共用常數 / 工具。
 *
 * 核准 / 編輯題目 Modal 需要：
 * 1. 根據使用者選的「書卷」推出該書卷有幾章（章節數下拉）
 * 2. 統一的節數選單（聖經最多 176 節）
 *
 * 另外提供：
 * 3. buildFhlReadUrl(text) — 把 "創世記 1:1-3" 這種字串組成信望愛閱讀頁 URL
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

const FHL_BASE = 'https://bible.fhl.net/new/read.php';

/**
 * 把後端送來的 bibleRef 字串（例如 "詩篇 75:1-3" / "創世記 1:1"）組成
 * 信望愛閱讀頁（read.php）的 URL。格式不符就回 null。
 *
 * 後端格式：`{書卷全名} {chapter}:{verseStart}` 或 `{書卷全名} {chapter}:{verseStart}-{verseEnd}`
 *
 * 為什麼書卷直接塞全名？
 *   實測信望愛的 chineses 參數同時接受全名（詩篇）和簡稱（詩）。
 *   官方 JSON API（qb.php）能用 sec= 定位到節，但 qb.php 回 JSON 不是
 *   給人看的閱讀頁；給人看的 read.php 只接受 chap，不接受節參數。
 *   所以這裡只把書卷+章帶過去，使用者自己在閱讀頁掃到對應節。
 *
 * 書卷名比對交給信望愛伺服器，前端不維護對照表 —— 後端 bible_book 表
 * 的全名（創世記、撒母耳記上、哥林多前書...）跟信望愛下拉選單一致。
 */
export const buildFhlReadUrl = (text: string | null | undefined): string | null => {
  if (!text) return null;

  // 書卷名可能含「上 / 下」「前 / 後」「一 / 二 / 三」，不能用 \w+ 抓，
  // 改用「任何非空白字元」直到第一個空白後接章節。
  const match = text.trim().match(/^(\S+)\s+(\d+)(?::\d+(?:-\d+)?)?$/);
  if (!match) return null;

  const [, bookName, chapter] = match;

  const params = new URLSearchParams({
    VERSION1: 'unv',
    strongflag: '0',
    TABFLAG: '1',
    chineses: bookName,
    chap: chapter,
    submit1: '閱讀',
  });
  return `${FHL_BASE}?${params.toString()}`;
};
