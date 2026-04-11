<template>
  <main class="quiz-page">
    <!-- 動態漸層背景 -->
    <AtomGradientBackground />

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
            <AtomBibleRefPill
              v-if="hintVisible && currentQuestion.bibleRef"
              :text="currentQuestion.bibleRef"
              class="quiz-page__hint"
            />
          </Transition>
        </section>

        <!-- 道具列（答題前才能用） -->
        <div
          class="quiz-page__items"
          :class="{ 'quiz-page__items--transitioning': isTransitioning }"
        >
          <MoleculeQuizItem
            icon="lucide:scissors"
            label="刪去法"
            color="red"
            :used="used.eliminate"
            :burst="justUsed.eliminate"
            :disabled="answered"
            @use="handleUseItem('eliminate')"
          />
          <MoleculeQuizItem
            icon="lucide:book-open"
            label="經文提示"
            color="amber"
            :used="used.scriptureHint"
            :burst="justUsed.scriptureHint"
            :disabled="answered"
            @use="handleUseItem('scriptureHint')"
          />
          <MoleculeQuizItem
            icon="lucide:bar-chart-2"
            label="歷史投票"
            color="cyan"
            :used="used.audiencePoll"
            :burst="justUsed.audiencePoll"
            :disabled="answered"
            @use="handleUseItem('audiencePoll')"
          />
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
  useEliminate,
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
const justUsed = reactive({ eliminate: false, scriptureHint: false, audiencePoll: false });

const handleUseItem = (item: 'eliminate' | 'scriptureHint' | 'audiencePoll') => {
  if (item === 'eliminate') useEliminate(currentQuestion.value);
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

  // ── 經文提示定位（grid 第 3 行，間隙正中間） ──
  &__hint {
    grid-row: 3;
    place-self: center;
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

// ── 經文提示進出動畫 ──
.hint-enter-active,
.hint-leave-active {
  transition: all 0.3s ease;
}

.hint-enter-from,
.hint-leave-to {
  opacity: 0;
  transform: translateY(0.5rem);
}
</style>
