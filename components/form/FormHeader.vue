<template>
  <header class="FormHeader">
    <div class="FormHeader__logos">
      <img
        v-if="primaryLogo"
        :src="primaryLogo"
        alt="Logo"
        class="FormHeader__logo"
        :class="{ 'FormHeader__logo--white': primaryLogoSvgToWhite && isSvg(primaryLogo) }"
      >
      <img
        v-if="secondaryLogo"
        :src="secondaryLogo"
        alt="Company Logo"
        class="FormHeader__logo"
        :class="{ 'FormHeader__logo--white': secondaryLogoSvgToWhite && isSvg(secondaryLogo) }"
      >
    </div>
    <h1 class="FormHeader__title">{{ title }}</h1>
  </header>
</template>

<script setup lang="ts">
defineProps<{
  primaryLogo: string | null
  primaryLogoSvgToWhite?: boolean
  secondaryLogo: string | null
  secondaryLogoSvgToWhite?: boolean
  title: string
}>()

function isSvg(url: string | null): boolean {
  return !!url?.toLowerCase().includes('.svg')
}
</script>

<style>
.FormHeader {
  text-align: center;
  padding: 2rem 1rem 1.5rem;
}

.FormHeader__logos {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.FormHeader__logo {
  height: 100px;
  width: auto;
  max-width: 20rem;
  object-fit: contain;
}

.FormHeader__logo--white {
  filter: brightness(0) invert(1);
}

.FormHeader__title {
  color: var(--color-brand-white);
  font-size: 42px;
  font-weight: 700;
  line-height: 1.4;
  margin: 0;
}
</style>
