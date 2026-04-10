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

          <!-- 經文提示（道具啟用後才顯示） -->
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
            class="quiz-page__item"
            :disabled="used.fiftyFifty || answered"
            @click="useFiftyFifty(currentQuestion)"
          >
            <Icon name="lucide:scissors" />
            <span>50/50</span>
          </button>
          <button
            class="quiz-page__item"
            :disabled="used.scriptureHint || answered"
            @click="useScriptureHint()"
          >
            <Icon name="lucide:book-open" />
            <span>經文</span>
          </button>
          <button
            class="quiz-page__item"
            :disabled="used.audiencePoll || answered"
            @click="useAudiencePoll(currentQuestion)"
          >
            <Icon name="lucide:users" />
            <span>投票</span>
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
              :disabled="answered"
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

// 50/50 後過濾掉被消除的選項
const visibleOptions = computed(() => options.value.filter(o => !eliminatedOptionIds.value.includes(o.optionId)));

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
    flex-direction: column;
    align-items: center;
    justify-content: center;
    margin-bottom: 1rem;
    transition: all 0.5s;

    @media (min-width: 768px) {
      margin-bottom: 0;
      flex: none;
      height: 35vh;
    }

    &--transitioning {
      opacity: 0;
      transform: translateX(-2.5rem);
    }
  }

  // ── 經文提示 ──
  &__hint {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-top: 0.75rem;
    padding: 0.5rem 1rem;
    border-radius: 0.625rem;
    background: rgba(251, 191, 36, 0.1);
    border: 1px solid rgba(251, 191, 36, 0.3);
    color: #fbbf24;
    font-size: 1rem;

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
    gap: 0.75rem;
    margin-bottom: 1rem;
    transition: all 0.5s;

    &--transitioning {
      opacity: 0;
    }
  }

  &__item {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    padding: 0.375rem 0.75rem;
    border-radius: 9999px;
    background: rgba(30, 41, 59, 0.6);
    backdrop-filter: blur(8px);
    border: 1px solid rgba($border-base, 0.5);
    color: $text-muted;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.2s;

    svg {
      width: 1rem;
      height: 1rem;
    }

    &:hover:not(:disabled) {
      color: $accent;
      border-color: rgba($accent, 0.3);
      background: rgba($accent, 0.08);
    }

    &:disabled {
      opacity: 0.3;
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
  transform: translateY(-0.5rem);
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
