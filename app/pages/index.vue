<template>
  <OrganismGlassCard
    icon="lucide:book-open"
    title="Bible Quiz"
    subtitle="測試你的聖經知識"
    size="lg"
    show-particles
  >
    <!-- 統計預覽 -->
    <div class="home-page__stats">
      <MoleculeStatCard
        :value="totalQuestions"
        label="題目"
        color="cyan"
      />
      <MoleculeStatCard
        value="100"
        label="XP / 題"
        color="amber"
      />
    </div>

    <!-- 開始按鈕 -->
    <MoleculeGradientButton
      size="lg"
      @click="startGame"
    >
      <Icon
        name="lucide:sparkles"
        class="home-page__sparkle"
      />
      開始挑戰
      <Icon
        name="lucide:sparkles"
        class="home-page__sparkle"
      />
    </MoleculeGradientButton>

    <!-- 底部提示文字 -->
    <template #footer>
      <p class="home-page__footer-text">準備好了嗎？點擊開始測試你的聖經知識！</p>
    </template>
  </OrganismGlassCard>
</template>

<script setup lang="ts">
const totalQuestions = 10;

const startGame = () => {
  navigateTo('/start', { replace: true });
};
</script>

<style lang="scss" scoped>
.home-page {
  &__stats {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    margin-bottom: 2rem;
  }

  &__sparkle {
    width: 1.5rem;
    height: 1.5rem;
    animation: pulse-slow 3s ease-in-out infinite;

    @media (min-width: 768px) {
      width: 1.75rem;
      height: 1.75rem;
    }
  }

  &__footer-text {
    margin-top: 2rem;
    font-size: 0.875rem;
    color: $text-dim;
    text-align: center;
  }
}
</style>
