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
        <div class="flex justify-content-center mb-2">
          <SelectButton v-model.number="wordsNum" :options="[12, 24]" />
        </div>
        <div class="block-wrapper">
          <div class="block-wrapper__block">
            <div v-for="(i, idx) in Array(12)" :key="i">
              <div class="word-number" :data-number="idx + 1">
                <WordConverter
                  :word="shareToConvert[idx]"
                  :words="wordsMap"
                  :find-word="true"
                  :suggestions="suggestions"
                />
              </div>
            </div>
          </div>
          <div v-if="wordsNum === 24" class="block-wrapper__block">
            <div v-for="(i, idx) in Array(12)" :key="i">
              <div class="word-number" :data-number="idx + 13">
                <WordConverter
                  :word="shareToConvert[idx]"
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
        <div class="flex justify-content-center mb-2">
          <SelectButton v-model.number="wordsNum" :options="[12, 24]" />
        </div>
        <div class="block-wrapper">
          <div class="block-wrapper__block">
            <div v-for="(i, idx) in Array(12)" :key="i">
              <div class="word-number" :data-number="idx + 1">
                <WordConverter :words="wordsMap" :find-word="false" />
              </div>
            </div>
          </div>
          <div v-if="wordsNum === 24" class="block-wrapper__block">
            <div v-for="(i, idx) in Array(12)" :key="i">
              <div class="word-number" :data-number="idx + 13">
                <WordConverter :words="wordsMap" :find-word="false" />
              </div>
            </div>
          </div>
        </div>
      </TabPanel>
      <TabPanel header="Shares">
        <div class="flex gap-3">
          <div class="flex-1">
            <div class="title">Seed to shares</div>
            <TextareaField v-model="seed" class="seed-box" :autoResize="true" />
            <div
              class="mt-2 flex align-items-center justify-content-center gap-4"
            >
              <h5 id="single">Shares</h5>
              <SelectButton v-model.number="numShares" :options="options" />
              <PrimeButton
                label="Generate"
                class="p-button-outlined p-button-success"
                @click="generateShares"
              />
            </div>
            <div v-show="shares.length" class="title">Shares</div>
            <div
              v-show="shares.length"
              class="flex flex-column gap-2 shares-wrapper"
            >
              <div
                v-for="share in shares"
                :key="share"
                class="shares-wrapper__share"
              >
                {{ share }}
                <i class="pi pi-check" @click="setWordsToConvert(share)"></i>
              </div>
            </div>
          </div>

          <div class="flex-1">
            <div class="title">Shares to seed</div>
            <TextareaField
              v-model="recoverShares[0]"
              class="seed-box"
              :autoResize="true"
              @change="recoverSeed"
            />
            <TextareaField
              v-model="recoverShares[1]"
              class="seed-box"
              :autoResize="true"
              @change="recoverSeed"
            />
            <div>{{ recoveredSeed }}</div>
          </div>
        </div>
      </TabPanel>
    </TabView>
  </main>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from "vue";
import { words } from "@/lib/index";
import WordConverter from "@/components/WordConverter.vue";
import { splitMnemonic, recoverMnemonic } from "shamir-bip39";

onMounted(() => {
  seed.value =
    "jelly better achieve collect unaware mountain thought cargo oxygen act hood bridge";
  // generateShares();
});

const wordsNum = ref(12);
const searchField = ref("");
const seed = ref("");
const recoverShares = ref(["", ""]);
const recoveredSeed = ref("");

const numShares = ref(3);
const options = ref([3, 5]);

const shares = ref<string[]>([]);
const shareToConvert = ref<string[]>([]);

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

const generateShares = () => {
  try {
    const newShares = splitMnemonic(
      seed.value,
      numShares.value,
      numShares.value === 5 ? 3 : 2
    );
    shares.value = Object.values(newShares).map((val) => val);
  } catch (error) {
    console.log(error);
  }
};

const setWordsToConvert = (share: string) => {
  // debugger;
  shareToConvert.value = share.split(" ");
};

const recoverSeed = () => {
  const lala = recoverShares.value.reduce<Record<string, string>>(
    (acc, val, idx) => {
      acc[(1 + idx).toString()] = val;
      return acc;
    },
    {}
  );
  recoveredSeed.value = recoverMnemonic(lala);
};
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
  gap: 1rem;

  &__block {
    display: flex;
    flex-direction: column;
    gap: 5px;
  }
}

.seed-box {
  width: 100%;
  height: 100px;
}

.title {
  font-size: 20px;
  font-weight: 700;
}

.shares-wrapper {
  counter-reset: share-counter;
  &__share {
    padding-left: 1rem;
    position: relative;

    &:before {
      counter-increment: share-counter;
      content: counter(share-counter) ".";
      position: absolute;
      left: 0;
    }
  }
}
</style>
