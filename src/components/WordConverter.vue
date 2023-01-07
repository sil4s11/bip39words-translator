<template>
  <div class="word-info">
    <AutoComplete
      v-if="findWord"
      v-model="searchField"
      placeholder="Type word"
      :dropdown="true"
      :suggestions="filteredWords"
      :class="{ 'result-found': wordsMapFiltered[0] }"
      @complete="search($event)"
      @blur="updateStatus = !!searchField"
    />
    <InputText
      v-else
      v-model="searchField"
      type="text"
      placeholder="Type number"
      :class="{
        'result-found': wordsMapFiltered[0],
        'result-not-found': !wordsMapFiltered[0] && searchField && updateStatus,
      }"
      :maxlength="findWord ? 30 : 4"
      @blur="updateStatus = !!searchField"
    />
    <div
      v-if="showNumber"
      class="word-info__result"
      :class="{
        'result-found': wordsMapFiltered[0],
        'result-not-found': !wordsMapFiltered[0] && searchField && updateStatus,
      }"
    >
      {{ wordsMapFiltered[0] }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watchEffect } from "vue";

interface Props {
  words: Record<string, string>;
  findWord: boolean;
  suggestions?: Array<string>;
  showNumber?: boolean;
  word?: string;
}

const props = withDefaults(defineProps<Props>(), {
  suggestions: () => [],
  showNumber: true,
});

const searchField = ref("");
const updateStatus = ref(false);

watchEffect(() => (searchField.value = props.word || ""));

const search = ({ query }: { query: string }) => {
  if (!query.trim()) {
    filteredWords.value = [...props.suggestions];
    return;
  }
  filteredWords.value = props.suggestions.filter((f) => f.startsWith(query));
};

const idxMap = props.findWord ? 1 : 0;

const filteredWords = ref<Array<string>>([...props.suggestions]);

const wordsMapFiltered = computed(() => {
  const wordsEntries = Object.entries(props.words);
  const filtered = wordsEntries
    .filter(([word, number]) => {
      return props.findWord
        ? word === searchField.value
        : number === searchField.value;
    })
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
  background-color: var(--green-300) !important;
  color: black !important;

  input {
    background-color: var(--green-300) !important;
    color: black !important;
  }
}

.result-not-found {
  color: black !important;
  background-color: var(--orange-300) !important;
}

.p-autocomplete {
  border-radius: 10px;
  .p-button {
    background: #333333;
    color: white;
    border: none;
    &:focus {
      box-shadow: none;
    }
  }
}
</style>
