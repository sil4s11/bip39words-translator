<template>
  <div class="word-info">
    <InputText
      v-model="searchField"
      type="text"
      :placeholder="placeholder"
      :class="{ 'result-found': wordsMapFiltered[0] }"
    />
    <div
      class="word-info__result"
      :class="{ 'result-found': wordsMapFiltered[0] }"
    >
      {{ wordsMapFiltered[0] }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";

interface Props {
  words: Record<string, string>;
  findWord: boolean;
}

const props = defineProps<Props>();

const searchField = ref("");

const idxMap = props.findWord ? 1 : 0;
const placeholder = props.findWord ? "Type word" : "Type number";

const wordsMapFiltered = computed(() => {
  const wordsEntries = Object.entries(props.words);
  const filtered = wordsEntries
    .filter(([word, number]) =>
      props.findWord ? word === searchField.value : number === searchField.value
    )
    .map((entry) => entry[idxMap]);

  return filtered;
});
</script>

<style lang="scss">
.word-info {
  display: flex;
  align-items: center;
  gap: 1rem;

  &__result {
    border: 1px solid white;
    border-radius: 6px;
    width: 100px;
    height: 45px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    letter-spacing: 1px;
    transition: all 0.2s;
  }
}

.result-found {
  background-color: green !important;
}
</style>
