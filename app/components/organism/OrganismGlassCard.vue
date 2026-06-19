<template>
  <main
    class="page-card"
    :class="[`page-card--${size}`]"
  >
    <AtomGradientBackground />

    <div class="page-card__content">
      <div class="page-card__center">
        <div class="page-card__wrapper">
          <div class="page-card__body">
            <div class="page-card__icon-wrapper">
              <div class="page-card__icon">
                <Icon
                  :name="icon"
                  class="page-card__icon-svg"
                />
              </div>
            </div>

            <h1 class="page-card__title">{{ title }}</h1>

            <p
              v-if="$slots.subtitle || subtitle"
              class="page-card__subtitle"
            >
              <slot name="subtitle">{{ subtitle }}</slot>
            </p>

            <Transition name="fade">
              <div
                v-if="successMsg"
                class="page-card__success"
              >
                <Icon
                  name="lucide:circle-check"
                  class="page-card__success-icon"
                />
                <slot name="success">{{ successMsg }}</slot>
              </div>
            </Transition>

            <Transition name="fade">
              <div
                v-if="errorMsg"
                class="page-card__error"
              >
                <Icon
                  name="lucide:circle-alert"
                  class="page-card__error-icon"
                />
                {{ errorMsg }}
              </div>
            </Transition>

            <slot />
          </div>
        </div>

        <slot name="footer" />
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    icon: string;
    title: string;
    subtitle?: string;
    successMsg?: string;
    errorMsg?: string;
    showParticles?: boolean;
    size?: 'md' | 'lg';
  }>(),
  {
    size: 'md',
  }
);
</script>

<style lang="scss" scoped>
.page-card {
  position: relative;
  min-height: 100vh;
  width: 100%;
  overflow: hidden;
  background: $bg-page;

  &__content {
    position: relative;
    z-index: 10;
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    padding-top: $navbar-height;
  }

  &__center {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 0 1rem 2rem;
  }

  &__wrapper {
    position: relative;
    width: 100%;

    .page-card--md & {
      max-width: 28rem;
    }

    .page-card--lg & {
      max-width: 32rem;
    }
  }

  &__body {
    position: relative;
    border-radius: 1.5rem;
    background: $bg-card;
    border: 1px solid $border-base;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);

    .page-card--md & {
      padding: 2rem 1.75rem;

      @media (min-width: 768px) {
        padding: 2.5rem 2.25rem;
      }
    }

    .page-card--lg & {
      padding: 2rem;

      @media (min-width: 768px) {
        padding: 3rem;
      }
    }
  }

  &__icon-wrapper {
    display: flex;
    justify-content: center;
    margin-bottom: 1.25rem;

    .page-card--lg & {
      margin-bottom: 1.5rem;
    }
  }

  &__icon {
    position: relative;
    border-radius: 1rem;
    background: $primary;
    display: flex;
    align-items: center;
    justify-content: center;

    .page-card--md & {
      width: 4rem;
      height: 4rem;

      @media (min-width: 768px) {
        width: 4.5rem;
        height: 4.5rem;
        border-radius: 1.125rem;
      }
    }

    .page-card--lg & {
      width: 5rem;
      height: 5rem;

      @media (min-width: 768px) {
        width: 6rem;
        height: 6rem;
        border-radius: 1.25rem;
      }
    }
  }

  &__icon-svg {
    color: white;

    .page-card--md & {
      width: 2rem;
      height: 2rem;

      @media (min-width: 768px) {
        width: 2.25rem;
        height: 2.25rem;
      }
    }

    .page-card--lg & {
      width: 2.5rem;
      height: 2.5rem;

      @media (min-width: 768px) {
        width: 3rem;
        height: 3rem;
      }
    }
  }

  &__title {
    font-family: 'Noto Serif TC', serif;
    font-weight: 800;
    text-align: center;
    margin-bottom: 0.5rem;
    color: $text-heading;

    .page-card--md & {
      font-size: 1.75rem;

      @media (min-width: 768px) {
        font-size: 2rem;
      }
    }

    .page-card--lg & {
      font-size: 2.25rem;
      font-weight: 900;
      margin-bottom: 1rem;

      @media (min-width: 768px) {
        font-size: 3rem;
      }

      @media (min-width: 1024px) {
        font-size: 3.75rem;
      }
    }
  }

  &__subtitle {
    color: $text-muted;
    text-align: center;
    margin-bottom: 1.5rem;

    .page-card--md & {
      font-size: 0.875rem;
    }

    .page-card--lg & {
      font-size: 1.125rem;
      margin-bottom: 2rem;
    }
  }

  &__success {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
    border-radius: 0.75rem;
    background: rgba($success, 0.06);
    border: 1px solid rgba($success, 0.2);
    color: $success;
    font-size: 0.875rem;
    margin-bottom: 1.25rem;
  }

  &__success-icon {
    width: 1.125rem;
    height: 1.125rem;
    flex-shrink: 0;
    color: $success;
  }

  &__error {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
    border-radius: 0.75rem;
    background: rgba($danger, 0.06);
    border: 1px solid rgba($danger, 0.2);
    color: $danger;
    font-size: 0.875rem;
    margin-bottom: 1.25rem;
  }

  &__error-icon {
    width: 1.125rem;
    height: 1.125rem;
    flex-shrink: 0;
    color: $danger;
  }
}
</style>
