<template>
  <div class="score-ring">
    <svg
      class="score-ring__svg"
      viewBox="0 0 120 120"
    >
      <defs>
        <linearGradient
          id="score-ring-gradient"
          x1="0%"
          y1="0%"
          x2="100%"
          y2="0%"
        >
          <stop
            offset="0%"
            :stop-color="$primary"
          />
          <stop
            offset="100%"
            :stop-color="$accent"
          />
        </linearGradient>
      </defs>

      <circle
        cx="60"
        cy="60"
        r="52"
        fill="none"
        :stroke="$bgSubtle"
        stroke-width="8"
      />
      <circle
        cx="60"
        cy="60"
        r="52"
        fill="none"
        stroke="url(#score-ring-gradient)"
        stroke-width="8"
        stroke-linecap="round"
        :stroke-dasharray="circumference"
        :stroke-dashoffset="ringOffset"
        class="score-ring__progress"
      />
    </svg>

    <div
      class="score-ring__shine"
      :style="{
        '--progress-deg': `${progressDeg}deg`,
        maskImage: maskSvg,
        WebkitMaskImage: maskSvg,
        visibility: shineVisible ? 'visible' : 'hidden',
      }"
    >
      <div
        class="score-ring__shine-beam"
        :style="{ transform: `rotate(${shineRotation}deg)`, transition: shineTransition }"
      />
    </div>

    <div class="score-ring__text">
      <span class="score-ring__score">{{ score }}</span>
      <span class="score-ring__divider">/{{ total }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  score: number;
  total: number;
}>();

const $primary = '#6b4c2a';
const $accent = '#b8860b';
const $bgSubtle = '#f3ede4';

const circumference = 2 * Math.PI * 52;

const ringOffset = computed(() => circumference * (1 - props.score / props.total));
const progressDeg = computed(() => (props.score / props.total) * 360);

const maskSvg = computed(() => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><circle cx="60" cy="60" r="52" fill="none" stroke="white" stroke-width="8" stroke-linecap="round" transform="rotate(-90 60 60)" stroke-dasharray="${circumference}" stroke-dashoffset="${ringOffset.value}"/></svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
});

const shineRotation = ref(0);
const shineVisible = ref(false);
const shineTransition = ref('none');
let shineTimer: ReturnType<typeof setTimeout>;

function runShine() {
  shineTransition.value = 'none';
  shineRotation.value = 0;
  shineVisible.value = true;

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      shineTransition.value = 'transform 1s ease-in-out';
      shineRotation.value = progressDeg.value;

      shineTimer = setTimeout(() => {
        shineVisible.value = false;
        shineTimer = setTimeout(runShine, 2000);
      }, 1000);
    });
  });
}

onMounted(() => {
  runShine();
});

onUnmounted(() => {
  clearTimeout(shineTimer);
});
</script>

<style lang="scss" scoped>
.score-ring {
  position: relative;
  width: 9rem;
  height: 9rem;
  border-radius: 50%;

  @media (min-width: 768px) {
    width: 11rem;
    height: 11rem;
  }

  &__svg {
    position: relative;
    width: 100%;
    height: 100%;
    transform: rotate(-90deg);
  }

  &__progress {
    transition: stroke-dashoffset 1.2s ease-out;
  }

  &__shine {
    position: absolute;
    inset: 0;
    pointer-events: none;
    overflow: hidden;
    mask-size: 100% 100%;
    -webkit-mask-size: 100% 100%;
    mask-repeat: no-repeat;
    -webkit-mask-repeat: no-repeat;
  }

  &__shine-beam {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background: conic-gradient(
      transparent 0deg,
      rgba($accent, 0.1) calc(var(--progress-deg) * 0.1),
      rgba($accent, 0.35) calc(var(--progress-deg) * 0.2),
      rgba($accent, 0.1) calc(var(--progress-deg) * 0.3),
      transparent calc(var(--progress-deg) * 0.4),
      transparent 360deg
    );
    filter: blur(3px);
  }

  &__text {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: none;
  }

  &__score {
    font-size: 2.75rem;
    font-weight: 900;
    color: $text-heading;
    line-height: 1;
    font-family: 'Noto Serif TC', serif;

    @media (min-width: 768px) {
      font-size: 3.5rem;
    }
  }

  &__divider {
    font-size: 1.25rem;
    font-weight: 600;
    color: $text-muted;
    margin-top: 0.75rem;

    @media (min-width: 768px) {
      font-size: 1.5rem;
      margin-top: 1rem;
    }
  }
}
</style>
