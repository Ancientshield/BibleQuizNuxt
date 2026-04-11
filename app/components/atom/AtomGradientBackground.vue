<!--
  AtomGradientBackground — 全站統一的紫藍漸層背景 + radial 光暈。

  使用方式：放在 `position: relative` 的父層裡，會自動 absolute 填滿。
  用 Vue 3 fragment 輸出兩個 div（無 wrapper），避免多一層無用的 DOM。
-->
<template>
  <div class="gradient-bg gradient-bg--gradient" />
  <div class="gradient-bg gradient-bg--radial" />
</template>

<style lang="scss" scoped>
.gradient-bg {
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
</style>
