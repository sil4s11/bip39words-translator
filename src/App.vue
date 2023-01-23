<template>
  <header>
    <h1 class="header">BIP39 Utils</h1>
  </header>
  <main>
    <TabView v-model:activeIndex="activeTab">
      <!-- Finder -->
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
            <span v-if="!Object.keys(wordsMapFiltered).length">
              No words found
            </span>
          </div>
        </div>
      </TabPanel>
      <!-- Word to number -->
      <TabPanel header="Seed (word to number)">
        <div class="flex justify-content-center mb-2">
          <SelectButton
            v-model.number="wordsNum"
            :options="[12, 24]"
            :unselectable="false"
          />
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
      <!-- Number to word -->
      <TabPanel header="Seed (number to word)">
        <div class="flex justify-content-center mb-2">
          <SelectButton
            v-model.number="wordsNum"
            :options="[12, 24]"
            :unselectable="false"
          />
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
      <!-- Shares tab -->
      <TabPanel header="Shares">
        <!-- // Generate shares -->
        <div class="flex justify-content-center mb-2 gap-3">
          <SelectButton
            v-model="optionShare"
            :options="optionsShares"
            :unselectable="false"
          />
          <SelectButton
            v-model.number="numShares"
            :options="options"
            :unselectable="false"
            @change="updateRecoverShares"
          />
          <SelectButton
            v-if="optionShare === 'Generate'"
            v-model.number="wordsNum"
            :options="[12, 24]"
            :unselectable="false"
          />
        </div>
        <div class="flex gap-3">
          <div v-if="optionShare === 'Generate'" class="flex-1 share-option">
            <div class="title">Seed to shares</div>
            <TextareaField
              v-model.trim="seed"
              class="seed-box"
              :autoResize="true"
              @change="validateWords(seed)"
            />
            <div
              class="mt-2 flex align-items-center justify-content-center gap-4"
            >
              <PrimeButton
                label="Generate"
                class="p-button-outlined p-button-success"
                :disabled="invalidSeedShare"
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
                <i
                  class="ml-1 pi pi-file-import shares-wrapper__share__icon"
                  v-tooltip.top="'Convert to number'"
                  @click="setWordsToConvert(share)"
                ></i>
              </div>
            </div>
          </div>

          <!-- Recover seed -->
          <div v-if="optionShare === 'Recover'" class="flex-1 share-option">
            <div class="title">Shares to seed</div>
            <div
              v-for="(_, idx) in recoverShares"
              :key="idx"
              class="share-wrapper"
            >
              <InputText
                v-model="recoverShares[idx].number"
                type="number"
                placeholder="Type number"
                :min="1"
                :max="numShares"
              />
              <TextareaField
                v-model.trim="recoverShares[idx].value"
                class="seed-box"
                :autoResize="true"
              />
            </div>
            <div
              class="mt-2 flex align-items-center justify-content-center gap-4"
            >
              <PrimeButton
                label="Recover"
                class="p-button-outlined p-button-success"
                :disabled="!isValidShares"
                @click="recoverSeed"
              />
            </div>
            <div v-if="recoveredSeed">
              <div class="title">Seed</div>
              <div class="recoveredSeed">{{ recoveredSeed }}</div>
            </div>
          </div>
        </div>
      </TabPanel>
    </TabView>
    <PrimeToast position="bottom-right" />
  </main>
  <footer class="footer-wrapper">
    <a
      href="https://github.com/sil4s11/bip39words-translator"
      target="_blank"
      class="footer-wrapper__icon"
    >
      <i class="pi pi-github"></i>
    </a>
  </footer>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import WordConverter from "@/components/WordConverter.vue";
import { words } from "@/lib/index";
import { splitMnemonic, recoverMnemonic } from "shamir-bip39";
import { useToast } from "primevue/usetoast";

const toast = useToast();

const activeTab = ref(0);

const wordsNum = ref(12);
const searchField = ref("");
const seed = ref("");
const recoverShares = ref([
  { number: "1", value: "" },
  { number: "2", value: "" },
]);
const recoveredSeed = ref("");
const invalidSeedShare = ref(true);

const numShares = ref(3);
const options = ref([3, 5]);

const optionShare = ref("Generate");
const optionsShares = ["Generate", "Recover"];

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
    toast.add({
      severity: "warn",
      summary: "Invalid mnemonic",
      detail: `That combination is not correct, please check the seed`,
      life: 3000,
    });
  }
};
const updateRecoverShares = () => {
  if (numShares.value === 3) {
    recoverShares.value.pop();
  } else if (numShares.value === 5) {
    recoverShares.value.push({ number: "3", value: "" });
  }
};

const setWordsToConvert = (share: string) => {
  shareToConvert.value = share.split(" ");
  activeTab.value = 1;
};

const validateWords = (wordsString: string) => {
  const wordsArray = wordsString.split(" ");
  const isValid = wordsArray.every((word) => words.includes(word));
  const hasCorrectLenght = wordsArray.length === wordsNum.value;

  invalidSeedShare.value = !isValid || !hasCorrectLenght;

  if (!isValid) {
    toast.add({
      severity: "warn",
      summary: "Invalid word",
      detail: "The seed has some unvalid words",
      life: 3000,
    });
  } else if (!hasCorrectLenght) {
    toast.add({
      severity: "warn",
      summary: "Incorrect length",
      detail: `The seed should have ${wordsNum.value} words`,
      life: 3000,
    });
  }
};

const isValidShares = computed(() => {
  const validNumbers =
    recoverShares.value.map((d) => d.number).length ===
    Array.from(new Set(recoverShares.value.map((d) => d.number))).length;
  const validWords = recoverShares.value.every((share, _, shares) => {
    const isFilled = share.value;
    const wordsArray = share.value.split(" ");
    const isValid = wordsArray.every((word) => words.includes(word));
    const hasSameLength = shares.every(
      (s) => s.value.split(" ").length === wordsArray.length
    );

    return isFilled && isValid && hasSameLength;
  });

  return validNumbers && validWords;
});

const recoverSeed = () => {
  const isValidShares = recoverShares.value.every((d) => d.value);
  if (!isValidShares) return;

  const formattedShares = recoverShares.value.reduce<Record<string, string>>(
    (acc, val) => {
      acc[val.number] = val.value;
      return acc;
    },
    {}
  );
  try {
    recoveredSeed.value = recoverMnemonic(formattedShares);
  } catch (error) {
    toast.add({
      severity: "warn",
      summary: "Invalid mnemonic",
      detail: `That combination is not correct, please check the shares`,
      life: 3000,
    });
  }
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
  column-gap: 1rem;
  row-gap: 5px;
  margin-top: 1rem;

  &__block {
    display: flex;
    flex-direction: column;
    gap: 5px;
  }
}

.seed-box {
  width: 100%;
  height: 100px !important;
}

.title {
  font-size: 20px;
  font-weight: 700;
}

.shares-wrapper {
  counter-reset: share-counter;

  &__share {
    padding-left: 1.2rem;
    position: relative;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 20px;
    border: 1px solid black;
    padding: 10px 30px;
    border-radius: 10px;
    transition: all 0.2s;
    background-color: var(--surface-0);

    &:before {
      counter-increment: share-counter;
      content: counter(share-counter) ".";
      position: absolute;
      left: 10px;
    }

    &:hover {
      background-color: var(--surface-50);
    }

    &__icon {
      cursor: pointer;
    }
  }
}

.share-wrapper {
  display: flex;
  gap: 4px;
  align-items: flex-start;
}

.share-option {
  max-width: 70vw;
  margin: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.recoveredSeed {
  padding: 10px 20px;
  border: 1px solid black;
  padding: 10px 30px;
  border-radius: 10px;
  transition: all 0.2s;
  background-color: var(--surface-0);
  margin-top: 0.5rem;

  &:hover {
    background-color: var(--surface-50);
  }
}
</style>
