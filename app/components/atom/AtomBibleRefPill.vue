<template>
  <component
    :is="href ? 'a' : 'p'"
    :href="href || undefined"
    :target="href ? '_blank' : undefined"
    :rel="href ? 'noopener noreferrer' : undefined"
    class="bible-ref"
    :class="[`bible-ref--${shape}`, { 'bible-ref--link': !!href }]"
    @click.stop
  >
    <Icon
      name="lucide:book-open"
      class="bible-ref__icon"
    />
    <span class="bible-ref__text">
      <slot>{{ text }}</slot>
    </span>
    <Icon
      v-if="href"
      name="lucide:external-link"
      class="bible-ref__external"
    />
  </component>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    text?: string;
    shape?: 'pill' | 'card';
  }>(),
  {
    shape: 'pill',
  }
);

const href = computed(() => buildFhlReadUrl(props.text));
</script>

<style lang="scss" scoped>
.bible-ref {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: $accent;
  font-size: 1rem;
  text-decoration: none;
  transition:
    background 0.2s ease,
    border-color 0.2s ease,
    color 0.2s ease,
    transform 0.2s ease;

  &__icon,
  &__external {
    width: 1rem;
    height: 1rem;
    flex-shrink: 0;
  }

  &__external {
    width: 0.875rem;
    height: 0.875rem;
    opacity: 0.7;
  }

  &--pill {
    justify-content: center;
    padding: 0.5rem 1.25rem;
    border-radius: 9999px;
    background: rgba($accent, 0.08);
    border: 1px solid rgba($accent, 0.25);
    white-space: nowrap;
  }

  &--card {
    padding: 0.5rem 0.75rem;
    border-radius: 0.5rem;
    background: rgba($accent, 0.06);
    border: 1px solid rgba($accent, 0.15);
  }

  &--link {
    cursor: pointer;

    &:hover {
      color: $accent-light;
      background: rgba($accent, 0.14);
      border-color: rgba($accent, 0.4);
      transform: translateY(-1px);

      .bible-ref__external {
        opacity: 1;
      }
    }

    &:active {
      transform: translateY(0);
    }

    &:focus-visible {
      outline: 2px solid rgba($accent, 0.5);
      outline-offset: 2px;
    }
  }
}
</style>
