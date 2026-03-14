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
  width: 100%;
  text-align: center;
}

@media (max-width: 768px) {
  .FormHeader__logo { height: 70px; }
  .FormHeader__title { font-size: 32px; }
}

@media (max-width: 480px) {
  .FormHeader { padding: 1.25rem 1rem 1rem; }
  .FormHeader__logos { gap: 1rem; margin-bottom: 1rem; flex-wrap: nowrap; }
  .FormHeader__logo { height: 50px; max-width: 10rem; }
  .FormHeader__title { font-size: 26px; line-height: 1.3; }
}
</style>
