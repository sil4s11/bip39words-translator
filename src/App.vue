<template>
  <header>
    <h1 class="header">BIP39 Word finder</h1>
  </header>
  <main>
    <TabView>
      <TabPanel header="Word finder">
        <div class="finder-wrapper">
          <InputText type="text" v-model="searchField" />
          <div class="words-wrapper">
            <div
              v-for="(number, word) in wordsMapFiltered"
              :key="number"
              class="words-wrapper__word"
            >
              <span>{{ number }}</span>
              <span>{{ word }}</span>
            </div>
          </div>
        </div>
      </TabPanel>
      <TabPanel header="Seed (word to number)">
        <div class="block-wrapper">
          <div class="block-wrapper__block">
            <div v-for="(i, idx) in wordsNum" :key="i">
              <div class="word-number" :data-number="idx + 1">
                <WordConverter
                  :words="wordsMap"
                  :find-word="true"
                  :suggestions="suggestions"
                />
              </div>
            </div>
          </div>
          <div class="block-wrapper__block">
            <div v-for="(i, idx) in wordsNum" :key="i">
              <div class="word-number" :data-number="idx + 13">
                <WordConverter
                  :words="wordsMap"
                  :find-word="true"
                  :suggestions="suggestions"
                />
              </div>
            </div>
          </div>
        </div>
      </TabPanel>
      <TabPanel header="Seed (number to word)">
        <div class="block-wrapper">
          <div class="block-wrapper__block">
            <div v-for="(i, idx) in wordsNum" :key="i">
              <div class="word-number" :data-number="idx + 1">
                <WordConverter :words="wordsMap" :find-word="false" />
              </div>
            </div>
          </div>
          <div class="block-wrapper__block">
            <div v-for="(i, idx) in wordsNum" :key="i">
              <div class="word-number" :data-number="idx + 13">
                <WordConverter :words="wordsMap" :find-word="false" />
              </div>
            </div>
          </div>
        </div>
      </TabPanel>
    </TabView>
  </main>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { words } from "@/lib/index";
import WordConverter from "@/components/WordConverter.vue";

const wordsNum = Array(12);
const searchField = ref("");

const wordsMap = words.reduce((acc, val, idx) => {
  const wordString = (idx + 1).toString();
  const zerosToAdd = 4 - wordString.length;
  const wordPosition = `${Array(zerosToAdd).fill(0).join("")}${wordString}`;
  acc[val] = wordPosition;
  return acc;
}, {} as Record<string, string>);

const wordsMapFiltered = computed(() => {
  const wordsEntries = Object.entries(wordsMap);
  const filtered = wordsEntries.filter(([word]) =>
    word.includes(searchField.value)
  );
  return Object.fromEntries(filtered);
});

const suggestions = ref(Object.keys(wordsMap).map((word) => word));
</script>

<style scoped lang="scss">
.header {
  text-align: center;
  font-size: 20px;
  margin-bottom: 20px;
}
.finder-wrapper {
  width: 300px;
  margin: auto;

  .p-inputtext {
    width: 100%;
  }
}

.words-wrapper {
  padding: 10px;
  padding-left: 90px;
  max-height: 50vh;
  overflow: auto;
  border: 1px solid white;
  margin-top: 20px;
  border-radius: 5px;

  &__word {
    display: flex;
    align-items: center;
    gap: 1rem;
  }
}

.word-number {
  display: flex;
  align-items: center;
  gap: 1rem;
  position: relative;
  padding-left: 35px;

  &:before {
    content: attr(data-number) ".";
    position: absolute;
    left: 0;
    width: 25px;
    display: block;
    text-align: right;
  }
}

.block-wrapper {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  justify-items: center;

  &__block {
    display: flex;
    flex-direction: column;
    gap: 5px;
  }
}
</style>
