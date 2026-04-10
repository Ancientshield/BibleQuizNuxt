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

        <!-- 題目區 -->
        <section
          class="quiz-page__question-area"
          :class="{ 'quiz-page__question-area--transitioning': isTransitioning }"
        >
          <MoleculeQuestionCard :content="currentQuestion.content" />

          <!-- 經文提示（grid 同層，不影響題目位置） -->
          <Transition name="hint">
            <p
              v-if="hintVisible && currentQuestion.bibleRef"
              class="quiz-page__hint"
            >
              <Icon name="lucide:book-open" />
              {{ currentQuestion.bibleRef }}
            </p>
          </Transition>
        </section>

        <!-- 道具列（答題前才能用） -->
        <div
          class="quiz-page__items"
          :class="{ 'quiz-page__items--transitioning': isTransitioning }"
        >
          <button
            :class="[
              'quiz-page__item quiz-page__item--fifty',
              { 'quiz-page__item--used': used.fiftyFifty, 'quiz-page__item--burst': justUsed.fiftyFifty },
            ]"
            :disabled="used.fiftyFifty || answered"
            @click="handleUseItem('fiftyFifty')"
          >
            <span class="quiz-page__item-glow" />
            <Icon name="lucide:scissors" />
            <span class="quiz-page__item-label">刪去法</span>
          </button>
          <button
            :class="[
              'quiz-page__item quiz-page__item--scripture',
              { 'quiz-page__item--used': used.scriptureHint, 'quiz-page__item--burst': justUsed.scriptureHint },
            ]"
            :disabled="used.scriptureHint || answered"
            @click="handleUseItem('scriptureHint')"
          >
            <span class="quiz-page__item-glow" />
            <Icon name="lucide:book-open" />
            <span class="quiz-page__item-label">經文提示</span>
          </button>
          <button
            :class="[
              'quiz-page__item quiz-page__item--poll',
              { 'quiz-page__item--used': used.audiencePoll, 'quiz-page__item--burst': justUsed.audiencePoll },
            ]"
            :disabled="used.audiencePoll || answered"
            @click="handleUseItem('audiencePoll')"
          >
            <span class="quiz-page__item-glow" />
            <Icon name="lucide:bar-chart-2" />
            <span class="quiz-page__item-label">歷史投票</span>
          </button>
        </div>

        <!-- 選項區 -->
        <section
          class="quiz-page__options-area"
          :class="{ 'quiz-page__options-area--transitioning': isTransitioning }"
        >
          <div class="quiz-page__options-grid">
            <MoleculeOptionButton
              v-for="option in visibleOptions"
              :key="`${currentIndex}-${option.label}`"
              :label="option.label"
              :text="option.text"
              :state="getOptionState(option.label)"
              :disabled="answered || eliminatedOptionIds.includes(option.optionId)"
              :eliminated="eliminatedOptionIds.includes(option.optionId)"
              :poll-percentage="pollData?.[option.optionId]"
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

definePageMeta({ layout: 'default' });

// ── 核心答題邏輯 ──
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

// ── 道具 ──
const {
  used,
  eliminatedOptionIds,
  hintVisible,
  pollData,
  useFiftyFifty,
  useScriptureHint,
  useAudiencePoll,
  resetForNextQuestion,
  resetAll,
} = useQuizItems();

// ── UI 狀態 ──
const selectedOptionId = ref<number | null>(null);
const answered = ref(false);
const correctOptionId = ref<number | null>(null);
const isTransitioning = ref(false);

// ── 道具使用特效 ──
const justUsed = reactive({ fiftyFifty: false, scriptureHint: false, audiencePoll: false });

const handleUseItem = (item: 'fiftyFifty' | 'scriptureHint' | 'audiencePoll') => {
  if (item === 'fiftyFifty') useFiftyFifty(currentQuestion.value);
  else if (item === 'scriptureHint') useScriptureHint();
  else useAudiencePoll(currentQuestion.value);

  justUsed[item] = true;
  setTimeout(() => (justUsed[item] = false), 600);
};

// ── 選項 shuffle ──
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

// 刪去法：不過濾，全部顯示（被消除的由 MoleculeOptionButton 反灰）
const visibleOptions = computed(() => options.value);

// 選項狀態
const getOptionState = (label: string): OptionState => {
  if (!answered.value || correctOptionId.value === null) return 'default';
  const opt = options.value.find(o => o.label === label);
  if (!opt) return 'default';
  if (opt.optionId === correctOptionId.value) return 'correct';
  if (opt.optionId === selectedOptionId.value) return 'wrong';
  return 'disabled';
};

// 選擇 → 驗答 → 展示 → 切題
const handleSelect = (label: string) => {
  if (answered.value || !currentQuestion.value) return;

  const opt = options.value.find(o => o.label === label);
  if (!opt) return;

  selectedOptionId.value = opt.optionId;
  answered.value = true;
  correctOptionId.value = checkAnswer(currentQuestion.value.id, opt.optionId);
  saveProgress();

  setTimeout(() => {
    isTransitioning.value = true;
    (document.activeElement as HTMLElement)?.blur();
    setTimeout(() => {
      nextQuestion();
      resetForNextQuestion();
      selectedOptionId.value = null;
      answered.value = false;
      correctOptionId.value = null;
      isTransitioning.value = false;
    }, 300);
  }, 1200);
};

// 結算 → 提交紀錄
watch(isFinished, finished => {
  if (finished) submitResults();
});

// 再玩一次
const handleRestart = async () => {
  resetAll();
  await fetchQuestions();
};

// 頁面載入
onMounted(async () => {
  await fetchQuestions();
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
  background: $bg-page;
  padding-top: $navbar-height;

  &__bg {
    position: absolute;
    inset: 0;

    &--gradient {
      background: linear-gradient(to bottom right, #581c87, $bg-dark, #1e3a5f);
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
    height: calc(100dvh - #{$navbar-height});
    flex-direction: column;
    padding: 1rem 1rem;

    @media (min-width: 768px) {
      padding: 1.5rem 2rem;
    }
  }

  &__question-area {
    flex: 1;
    display: grid;
    grid-template-rows: 1fr auto 1fr;
    justify-items: center;
    margin-bottom: 0.5rem;
    transition: all 0.5s;

    // 題目卡在第 2 行（中間），上下 1fr 等分 → 永遠置中
    > :first-child {
      grid-row: 2;
    }

    @media (min-width: 768px) {
      flex: none;
      height: 28vh;
    }

    &--transitioning {
      opacity: 0;
      transform: translateX(-2.5rem);
    }
  }

  // ── 經文提示（grid 第 3 行，間隙正中間） ──
  &__hint {
    grid-row: 3;
    place-self: center;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.5rem 1.25rem;
    border-radius: 9999px;
    background: rgba(251, 191, 36, 0.1);
    border: 1px solid rgba(251, 191, 36, 0.3);
    color: #fbbf24;
    font-size: 1rem;
    white-space: nowrap;

    svg {
      width: 1rem;
      height: 1rem;
      flex-shrink: 0;
    }
  }

  // ── 道具列 ──
  &__items {
    display: flex;
    justify-content: center;
    gap: 1rem;
    margin-bottom: 0.75rem;
    transition: all 0.5s;

    &--transitioning {
      opacity: 0;
    }
  }

  &__item {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
    padding: 0.75rem 1.25rem;
    border-radius: 1rem;
    background: rgba(15, 23, 42, 0.7);
    backdrop-filter: blur(12px);
    border: 1.5px solid;
    cursor: pointer;
    transition: all 0.25s ease;
    overflow: hidden;

    svg {
      width: 1.5rem;
      height: 1.5rem;
      filter: drop-shadow(0 0 4px currentColor);
      transition: all 0.25s;
    }

    &:hover:not(:disabled) {
      transform: translateY(-2px);

      svg {
        transform: scale(1.15);
        filter: drop-shadow(0 0 8px currentColor);
      }
    }

    &:active:not(:disabled) {
      transform: scale(0.92);
    }

    // ── 呼吸光暈底層 ──
    &-glow {
      position: absolute;
      inset: -1px;
      border-radius: inherit;
      opacity: 0;
      transition: opacity 0.3s;
      pointer-events: none;
    }

    &:not(:disabled) &-glow {
      opacity: 1;
      animation: item-breathe 2.5s ease-in-out infinite;
    }

    // ── 道具名稱 ──
    &-label {
      font-size: 1rem;
      font-weight: 600;
      letter-spacing: 0.02em;
    }

    // ── 50/50：火紅色系 ──
    &--fifty {
      border-color: rgba(#f43f5e, 0.4);
      color: #fb7185;

      .quiz-page__item-glow {
        background: radial-gradient(ellipse at center, rgba(#f43f5e, 0.15), transparent 70%);
      }

      &:hover:not(:disabled) {
        border-color: rgba(#f43f5e, 0.6);
        box-shadow:
          0 0 20px rgba(#f43f5e, 0.2),
          inset 0 0 12px rgba(#f43f5e, 0.06);
      }
    }

    // ── 經文：金黃色系 ──
    &--scripture {
      border-color: rgba(#fbbf24, 0.4);
      color: #fbbf24;

      .quiz-page__item-glow {
        background: radial-gradient(ellipse at center, rgba(#fbbf24, 0.12), transparent 70%);
      }

      &:hover:not(:disabled) {
        border-color: rgba(#fbbf24, 0.6);
        box-shadow:
          0 0 20px rgba(#fbbf24, 0.2),
          inset 0 0 12px rgba(#fbbf24, 0.06);
      }
    }

    // ── 投票：青藍色系 ──
    &--poll {
      border-color: rgba(#22d3ee, 0.4);
      color: #22d3ee;

      .quiz-page__item-glow {
        background: radial-gradient(ellipse at center, rgba(#22d3ee, 0.15), transparent 70%);
      }

      &:hover:not(:disabled) {
        border-color: rgba(#22d3ee, 0.6);
        box-shadow:
          0 0 20px rgba(#22d3ee, 0.2),
          inset 0 0 12px rgba(#22d3ee, 0.06);
      }
    }

    // ── 使用瞬間爆發動畫 ──
    &--burst {
      animation: item-burst 0.6s ease-out;
    }

    // ── 已使用：灰化 + 刪除線 ──
    &--used {
      border-color: rgba($border-base, 0.2) !important;
      color: rgba($text-muted, 0.3) !important;
      background: rgba(15, 23, 42, 0.4);
      box-shadow: none !important;

      svg {
        filter: none;
      }

      .quiz-page__item-label {
        text-decoration: line-through;
      }
    }

    &:disabled {
      cursor: not-allowed;
    }
  }

  // ── 選項區 ──
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

// ── Transitions ──
.hint-enter-active,
.hint-leave-active {
  transition: all 0.3s ease;
}

.hint-enter-from,
.hint-leave-to {
  opacity: 0;
  transform: translateY(0.5rem);
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

// 道具呼吸光暈
@keyframes item-breathe {
  0%,
  100% {
    opacity: 0.4;
  }
  50% {
    opacity: 1;
  }
}

// 道具使用爆發
@keyframes item-burst {
  0% {
    transform: scale(1);
    filter: brightness(1);
  }
  30% {
    transform: scale(1.15);
    filter: brightness(1.6);
  }
  100% {
    transform: scale(1);
    filter: brightness(1);
  }
}
</style>
