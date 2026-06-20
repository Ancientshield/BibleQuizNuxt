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

        <!-- 有解釋時：答完顯示操作按鈕 -->
        <Transition name="fade-up">
          <div
            v-if="showActionButtons"
            class="quiz-page__actions"
          >
            <button
              class="quiz-page__explain-btn"
              @click="handleShowExplanation"
            >
              <Icon name="lucide:lightbulb" />
              解釋
            </button>
            <button
              class="quiz-page__next-btn"
              @click="handleNextQuestion"
            >
              下一題
              <Icon name="lucide:arrow-right" />
            </button>
          </div>
        </Transition>
      </template>

      <!-- ===== 結算畫面 ===== -->
      <LazyOrganismResultBoard
        v-else-if="isFinished"
        :score="score"
        :total="questions.length"
        @restart="handleRestart"
      />
    </div>
    <!-- 解釋彈窗 -->
    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="showExplanationModal"
          class="explanation-overlay"
          @click.self="showExplanationModal = false"
        >
          <div class="explanation-card">
            <button
              class="explanation-card__close"
              @click="showExplanationModal = false"
            >
              <Icon name="lucide:x" />
            </button>
            <h3 class="explanation-card__title">
              <Icon name="lucide:lightbulb" />
              解釋
            </h3>
            <p class="explanation-card__text">{{ currentQuestion?.explanation }}</p>
            <button
              class="explanation-card__next"
              @click="handleNextQuestion"
            >
              下一題
              <Icon name="lucide:arrow-right" />
            </button>
          </div>
        </div>
      </Transition>
    </Teleport>
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
  hasSavedProgress,
  restoreProgress,
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
const showActionButtons = ref(false);
const showExplanationModal = ref(false);

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

// 每切換一題就重新洗牌，避免正確答案固定在同一個位置被記憶作弊。
// 用 watch 不用 computed：洗牌有副作用，computed 每次重算會讓選項位置一直跳動。
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

/**
 * 決定每個選項目前應該顯示什麼視覺狀態。
 * template 會用回傳值做 class binding 切換 default / correct / wrong / disabled 四種樣式。
 *
 * 狀態邏輯：
 *   default  — 還沒作答或找不到正確答案（初始狀態，玩家可以自由 hover / 點擊）
 *   correct  — 答題後，這個選項是正確答案（綠底 + 打勾，無論玩家有沒有選中都會亮）
 *   wrong    — 答題後，這個選項是玩家選的但答錯（紅底 + 叉叉）
 *   disabled — 答題後的其他選項（沒選中也不是正解，變灰色）
 *
 * 為什麼要同時處理 correct 和 wrong：
 *   答錯時要同時顯示「正確答案是哪個（綠）」和「你選錯的是哪個（紅）」，
 *   讓玩家一眼看懂對錯和正解，這是學習體驗的重點。
 *
 * 為什麼檢查 correctOptionId 是 null：
 *   理論上 checkAnswer 一定會回傳正解，但它的型別是 number | null（找不到題目時回 null），
 *   這裡多一層防護，避免渲染時出現奇怪狀態。
 */
const getOptionState = (label: string): OptionState => {
  if (!answered.value || correctOptionId.value === null) return 'default';
  const opt = options.value.find(o => o.label === label);
  if (!opt) return 'default';
  if (opt.optionId === correctOptionId.value) return 'correct';
  if (opt.optionId === selectedOptionId.value) return 'wrong';
  return 'disabled';
};

/**
 * 選項被點擊後的完整流程：驗答 → 鎖定 UI → 展示對錯 → 淡出 → 切題 → 重置。
 *
 * 時間軸：
 *   0ms    玩家點選項
 *   0ms    本地驗答（checkAnswer 從 questions 找 correct 選項）
 *   0ms    設定 answered=true 鎖住按鈕，答對/答錯顏色立刻顯示
 *   0ms    寫入 localStorage（斷線也不會丟進度）
 *   1200ms 進入 isTransitioning 狀態 → 題目卡和選項淡出移動
 *   1200ms 把焦點從剛才的按鈕上移開（避免鍵盤焦點殘留）
 *   1500ms 推進到下一題、清掉道具當題狀態、重置所有本題 UI 狀態
 *
 * 為什麼用兩層 setTimeout：
 *   1200ms 讓玩家看清楚對錯反饋（太快切題會看不到正確答案）。
 *   300ms 是淡出動畫的時間（跟 SCSS transition 0.3s 對齊）。
 *
 * 為什麼一進來就檢查 answered：防止使用者在展示期間快速再點別的選項。
 */
const advanceToNext = () => {
  nextQuestion();
  resetForNextQuestion();
  selectedOptionId.value = null;
  answered.value = false;
  correctOptionId.value = null;
  isTransitioning.value = false;
  showActionButtons.value = false;
  showExplanationModal.value = false;
};

const handleSelect = (label: string) => {
  if (answered.value || !currentQuestion.value) return;

  const opt = options.value.find(o => o.label === label);
  if (!opt) return;

  selectedOptionId.value = opt.optionId;
  answered.value = true;
  correctOptionId.value = checkAnswer(currentQuestion.value.id, opt.optionId);
  saveProgress();

  if (currentQuestion.value.explanation) {
    setTimeout(() => {
      showActionButtons.value = true;
    }, 800);
  } else {
    setTimeout(() => {
      isTransitioning.value = true;
      (document.activeElement as HTMLElement)?.blur();
      setTimeout(advanceToNext, 300);
    }, 1200);
  }
};

const handleShowExplanation = () => {
  showExplanationModal.value = true;
};

const handleNextQuestion = () => {
  isTransitioning.value = true;
  (document.activeElement as HTMLElement)?.blur();
  setTimeout(advanceToNext, 300);
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

// 頁面載入：先檢查有沒有中斷的進度，有就問使用者要繼續還是重新開始
onMounted(async () => {
  if (hasSavedProgress()) {
    const shouldResume = window.confirm('發現未完成的測驗，要繼續上次的進度嗎？\n（取消會重新開始一局）');
    if (shouldResume && restoreProgress()) {
      return;
    }
  }

  await fetchQuestions();
  if (questions.value.length === 0) {
    navigateTo('/', { replace: true });
  }
});
</script>

<style lang="scss" scoped>
.quiz-page {
  position: relative;
  min-height: 100vh;
  min-height: 100svh;
  min-height: 100dvh;
  width: 100%;
  overflow-x: hidden;
  background: $bg-page;
  padding-top: $navbar-height;

  &__content {
    position: relative;
    z-index: 10;
    display: flex;
    min-height: calc(100svh - #{$navbar-height});
    min-height: calc(100dvh - #{$navbar-height});
    flex-direction: column;
    padding: 0.75rem 1rem;
    padding-bottom: calc(0.75rem + env(safe-area-inset-bottom));

    @media (min-width: 768px) {
      padding: 1.5rem 2rem;
      padding-bottom: calc(1.5rem + env(safe-area-inset-bottom));
    }
  }

  &__question-area {
    flex: 1 1 auto;
    display: grid;
    grid-template-rows: minmax(0.25rem, 1fr) auto minmax(0.25rem, 1fr);
    justify-items: center;
    min-height: 0;
    margin-bottom: 0.25rem;
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
    gap: 0.5rem;
    margin-bottom: 0.5rem;
    transition: all 0.5s;

    @media (min-width: 390px) {
      gap: 0.75rem;
    }

    @media (min-width: 768px) {
      gap: 1rem;
      margin-bottom: 0.75rem;
    }

    &--transitioning {
      opacity: 0;
    }
  }

  // ── 選項區 ──
  &__options-area {
    flex: 0 0 auto;
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
    gap: 0.5rem;

    @media (min-width: 768px) {
      grid-template-columns: 1fr 1fr;
      gap: 1.25rem;
    }
  }

  // ── 操作按鈕列（解釋 + 下一題） ──
  &__actions {
    display: flex;
    justify-content: center;
    gap: 0.75rem;
    margin-top: 0.75rem;
  }

  &__explain-btn,
  &__next-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
    padding: 0.625rem 1.25rem;
    border-radius: 0.75rem;
    font-weight: 600;
    font-size: 0.9375rem;
    border: none;
    cursor: pointer;
    transition: all 0.25s;

    &:hover {
      transform: scale(1.03);
    }

    &:active {
      transform: scale(0.97);
    }
  }

  &__explain-btn {
    background: rgba($accent, 0.15);
    color: $accent;
    border: 1px solid rgba($accent, 0.3);
  }

  &__next-btn {
    background: $primary;
    color: white;
  }
}

// ── 解釋彈窗 ──
.explanation-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.5);
  padding: 1rem;
}

.explanation-card {
  position: relative;
  max-width: 32rem;
  width: 100%;
  max-height: 80vh;
  overflow-y: auto;
  background: $bg-card;
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);

  &__close {
    position: absolute;
    top: 0.75rem;
    right: 0.75rem;
    width: 2rem;
    height: 2rem;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    border: none;
    background: $bg-subtle;
    color: $text-dim;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      background: $border-base;
      color: $text-primary;
    }
  }

  &__title {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: $accent;
    font-size: 1.125rem;
    font-weight: 700;
    margin-bottom: 1rem;
  }

  &__text {
    color: $text-primary;
    font-size: 1rem;
    line-height: 1.7;
    white-space: pre-wrap;
  }

  &__next {
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
    margin-top: 1.25rem;
    padding: 0.625rem 1.25rem;
    border-radius: 0.75rem;
    background: $primary;
    color: white;
    font-weight: 600;
    font-size: 0.9375rem;
    border: none;
    cursor: pointer;
    transition: all 0.25s;

    &:hover {
      opacity: 0.9;
      transform: scale(1.03);
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

// ── 操作按鈕淡入動畫 ──
.fade-up-enter-active,
.fade-up-leave-active {
  transition: all 0.3s ease;
}

.fade-up-enter-from,
.fade-up-leave-to {
  opacity: 0;
  transform: translateY(0.5rem);
}

// ── 彈窗動畫 ──
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;

  .explanation-card {
    transform: scale(0.95) translateY(1rem);
  }
}
</style>
