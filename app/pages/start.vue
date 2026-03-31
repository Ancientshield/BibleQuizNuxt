<template>
  <main class="quiz-page">
    <!-- 動態漸層背景 -->
    <div class="quiz-page__bg quiz-page__bg--gradient" />
    <div class="quiz-page__bg quiz-page__bg--radial" />

    <!-- 主內容區 -->
    <div class="quiz-page__content">
      <!-- ===== 答題中 ===== -->
      <template v-if="currentQuestion && !isFinished">
        <MoleculeProgressHeader
          :current="currentIndex + 1"
          :total="questions.length"
          :score="score"
        />

        <!-- 題目區：切題時加上 transitioning 滑出動畫 -->
        <section
          class="quiz-page__question-area"
          :class="{ 'quiz-page__question-area--transitioning': isTransitioning }"
        >
          <MoleculeQuestionCard :content="currentQuestion.content" />
        </section>

        <!-- 選項區：2×2 格線（桌面）/ 1×4 堆疊（手機） -->
        <section
          class="quiz-page__options-area"
          :class="{ 'quiz-page__options-area--transitioning': isTransitioning }"
        >
          <div class="quiz-page__options-grid">
            <MoleculeOptionButton
              v-for="option in options"
              :key="`${currentIndex}-${option.label}`"
              :label="option.label"
              :text="option.text"
              :state="getOptionState(option.label)"
              :disabled="answered"
              @select="handleSelect"
            />
          </div>
        </section>
      </template>

      <!-- ===== 結算畫面 ===== -->
      <LazyOrganismResultBoard
        v-else-if="isFinished"
        :score="score"
        :total="questions.length"
        @restart="handleRestart"
      />
    </div>
  </main>
</template>

<script setup lang="ts">
import type { OptionState } from '~/components/molecule/MoleculeOptionButton.vue';

definePageMeta({ layout: 'blank' });

// ── 遊戲邏輯（來自 composable） ──
const {
  questions,
  currentIndex,
  score,
  isFinished,
  currentQuestion,
  fetchQuestions,
  checkAnswer,
  nextQuestion,
  saveProgress,
  submitResults,
} = useQuiz();

// ── UI 狀態（僅限本頁面使用） ──
const selectedOptionId = ref<number | null>(null); // 使用者選的選項 ID
const answered = ref(false); // 是否已作答（鎖定按鈕用）
const correctOptionId = ref<number | null>(null); // 正確選項 ID（本地驗答結果）
const isTransitioning = ref(false); // 切題滑出動畫中

// ── 選項隨機排列 ──
// 每換一題 shuffle 一次，避免選項永遠在同一個位置。
// 用 optionId 取代 originalLabel，不再需要 A/B/C/D 字母轉換。
const LABELS = ['A', 'B', 'C', 'D'] as const;

const shuffleArray = <T,>(arr: T[]): T[] => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
};

const options = ref<Array<{ label: string; optionId: number; text: string }>>([]);

watch(
  currentQuestion,
  q => {
    options.value = q
      ? shuffleArray(q.options).map((o, i) => ({ label: LABELS[i]!, optionId: o.id, text: o.content }))
      : [];
  },
  { immediate: true }
);

// 未作答 → default / 正確選項 → correct / 選錯 → wrong / 其餘 → disabled
const getOptionState = (label: string): OptionState => {
  if (!answered.value || correctOptionId.value === null) return 'default';
  const opt = options.value.find(o => o.label === label);
  if (!opt) return 'default';
  if (opt.optionId === correctOptionId.value) return 'correct';
  if (opt.optionId === selectedOptionId.value) return 'wrong';
  return 'disabled';
};

// 選擇 →鎖定 → 本地驗答（零延遲）→ 1.2s 展示結果 → 0.3s 滑出 → 下一題
const handleSelect = (label: string) => {
  if (answered.value || !currentQuestion.value) return;

  const opt = options.value.find(o => o.label === label);
  if (!opt) return;

  selectedOptionId.value = opt.optionId;
  answered.value = true;

  // 同步本地驗答，回傳正確選項 ID
  correctOptionId.value = checkAnswer(currentQuestion.value.id, opt.optionId);
  saveProgress();

  // 1.2s 後開始切題過渡
  setTimeout(() => {
    isTransitioning.value = true;
    (document.activeElement as HTMLElement)?.blur();
    // 0.3s 滑出動畫完成後載入下一題
    setTimeout(() => {
      nextQuestion();
      selectedOptionId.value = null;
      answered.value = false;
      correctOptionId.value = null;
      isTransitioning.value = false;
    }, 300);
  }, 1200);
};

// 答完 10 題 → 登入使用者自動提交紀錄到後端
watch(isFinished, finished => {
  if (finished) submitResults();
});

// 重新從 API 取得 10 題
const handleRestart = async () => {
  await fetchQuestions();
};

// ── B-7-2：頁面載入時取題，若取不到（API 沒開、網路斷）就導回首頁 ──
onMounted(async () => {
  await fetchQuestions();
  // 直接在瀏覽器輸入 /start 進來，但後端沒開或取題失敗 → 導回首頁
  if (questions.value.length === 0) {
    navigateTo('/', { replace: true });
  }
});
</script>

<style lang="scss" scoped>
.quiz-page {
  position: relative;
  min-height: 100dvh;
  width: 100%;
  overflow: hidden;
  background: #020617; // slate-950

  &__bg {
    position: absolute;
    inset: 0;

    &--gradient {
      background: linear-gradient(to bottom right, #581c87, #0f172a, #1e3a5f); // purple-900 → slate-900 → blue-900
      background-size: 200% 200%;
      animation: gradient-shift 15s ease infinite;
    }

    &--radial {
      background: radial-gradient(ellipse at top, rgba(107, 33, 168, 0.2), transparent, transparent);
    }
  }

  &__content {
    position: relative;
    z-index: 10;
    display: flex;
    min-height: 100dvh;
    flex-direction: column;
    padding: 1.5rem 1rem;

    @media (min-width: 768px) {
      padding: 2.5rem 2rem;
    }
  }

  &__question-area {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 1.5rem;
    transition: all 0.5s;

    @media (min-width: 768px) {
      margin-bottom: 0;
      flex: none;
      height: 40vh;
    }

    &--transitioning {
      opacity: 0;
      transform: translateX(-2.5rem);
    }
  }

  &__options-area {
    transition: all 0.5s;

    @media (min-width: 768px) {
      flex: 1;
      display: flex;
      align-items: center;
    }

    &--transitioning {
      opacity: 0;
      transform: translateX(-2.5rem);
    }
  }

  &__options-grid {
    width: 100%;
    max-width: 56rem;
    margin: 0 auto;
    display: grid;
    grid-template-columns: 1fr;
    gap: 0.75rem;

    @media (min-width: 768px) {
      grid-template-columns: 1fr 1fr;
      gap: 1.25rem;
    }
  }
}

@keyframes gradient-shift {
  0%,
  100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}
</style>
