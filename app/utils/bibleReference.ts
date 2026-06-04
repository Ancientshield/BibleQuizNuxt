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

const FHL_BOOK_ALIASES = [
  ['創世記', '創', 'Ge'],
  ['出埃及記', '出', 'Ex'],
  ['利未記', '利', 'Le'],
  ['民數記', '民', 'Nu'],
  ['申命記', '申', 'De'],
  ['約書亞記', '書', 'Jos'],
  ['士師記', '士', 'Jud'],
  ['路得記', '得', 'Ru'],
  ['撒母耳記上', '撒上', '1Sa'],
  ['撒母耳記下', '撒下', '2Sa'],
  ['列王紀上', '王上', '1Ki'],
  ['列王紀下', '王下', '2Ki'],
  ['歷代志上', '代上', '1Ch'],
  ['歷代志下', '代下', '2Ch'],
  ['以斯拉記', '拉', 'Ezr'],
  ['尼希米記', '尼', 'Ne'],
  ['以斯帖記', '斯', 'Es'],
  ['約伯記', '伯', 'Job'],
  ['詩篇', '詩', 'Ps'],
  ['箴言', '箴', 'Pr'],
  ['傳道書', '傳', 'Ec'],
  ['雅歌', '歌', 'So'],
  ['以賽亞書', '賽', 'Isa'],
  ['耶利米書', '耶', 'Jer'],
  ['耶利米哀歌', '哀', 'La'],
  ['以西結書', '結', 'Eze'],
  ['但以理書', '但', 'Da'],
  ['何西阿書', '何', 'Ho'],
  ['約珥書', '珥', 'Joe'],
  ['阿摩司書', '摩', 'Am'],
  ['俄巴底亞書', '俄', 'Ob'],
  ['約拿書', '拿', 'Jon'],
  ['彌迦書', '彌', 'Mic'],
  ['那鴻書', '鴻', 'Na'],
  ['哈巴谷書', '哈', 'Hab'],
  ['西番雅書', '番', 'Zep'],
  ['哈該書', '該', 'Hag'],
  ['撒迦利亞書', '亞', 'Zec'],
  ['瑪拉基書', '瑪', 'Mal'],
  ['馬太福音', '太', 'Mt'],
  ['馬可福音', '可', 'Mr'],
  ['路加福音', '路', 'Lu'],
  ['約翰福音', '約', 'Joh'],
  ['使徒行傳', '徒', 'Ac'],
  ['羅馬書', '羅', 'Ro'],
  ['哥林多前書', '林前', '1Co'],
  ['哥林多後書', '林後', '2Co'],
  ['加拉太書', '加', 'Ga'],
  ['以弗所書', '弗', 'Eph'],
  ['腓立比書', '腓', 'Php'],
  ['歌羅西書', '西', 'Col'],
  ['帖撒羅尼迦前書', '帖前', '1Th'],
  ['帖撒羅尼迦後書', '帖後', '2Th'],
  ['提摩太前書', '提前', '1Ti'],
  ['提摩太後書', '提後', '2Ti'],
  ['提多書', '多', 'Tit'],
  ['腓利門書', '門', 'Phm'],
  ['希伯來書', '來', 'Heb'],
  ['雅各書', '雅', 'Jas'],
  ['彼得前書', '彼前', '1Pe'],
  ['彼得後書', '彼後', '2Pe'],
  ['約翰一書', '約一', '1Jo'],
  ['約翰二書', '約二', '2Jo'],
  ['約翰三書', '約三', '3Jo'],
  ['猶大書', '猶', 'Jude'],
  ['啟示錄', '啟', 'Re'],
] as const;

const FHL_BOOK_CODES = FHL_BOOK_ALIASES.reduce<Record<string, string>>(
  (codes, [fullName, chineseAbbr, englishAbbr]) => {
    codes[fullName] = chineseAbbr;
    codes[chineseAbbr] = chineseAbbr;
    codes[englishAbbr] = englishAbbr;
    return codes;
  },
  {}
);

/**
 * 把後端送來的 bibleRef 字串（例如 "詩篇 75:1-3" / "創世記 1:1"）組成
 * 信望愛閱讀頁（read.php）的 URL。格式不符就回 null。
 *
 * 後端格式：`{書卷全名} {chapter}:{verseStart}` 或 `{書卷全名} {chapter}:{verseStart}-{verseEnd}`
 *
 * FHL read.php 的 chineses 參數吃「中文縮寫」或「短英文縮寫」，不吃完整書名。
 * 所以後端的全名（創世記、撒母耳記上、哥林多前書...）需要先轉成 FHL 縮寫。
 */
export const buildFhlReadUrl = (text: string | null | undefined): string | null => {
  if (!text) return null;

  // 書卷名可能含「上 / 下」「前 / 後」「一 / 二 / 三」，不能用 \w+ 抓，
  // 改用「任何非空白字元」直到第一個空白後接章節。
  const match = text.trim().match(/^(\S+)\s+(\d+)(?::(\d+(?:-\d+)?))?$/);
  if (!match) return null;

  const [, bookName, chapter, verse] = match;
  const bookCode = FHL_BOOK_CODES[bookName];
  if (!bookCode) return null;

  const params = new URLSearchParams({
    VERSION1: 'unv',
    strongflag: '0',
    TABFLAG: '1',
    chineses: bookCode,
    chap: chapter,
    submit1: '閱讀',
  });
  if (verse) params.set('sec', verse);

  return `${FHL_BASE}?${params.toString()}`;
};
