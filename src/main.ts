import { createApp } from "vue";
import App from "./App.vue";

import "./styles/main.scss";

import PrimeVue from "primevue/config";
import InputText from "primevue/inputtext";
import TabView from "primevue/tabview";
import TabPanel from "primevue/tabpanel";
import AutoComplete from "primevue/autocomplete";

const app = createApp(App);

app.use(PrimeVue);
app.component("InputText", InputText);
app.component("TabView", TabView);
app.component("TabPanel", TabPanel);
app.component("AutoComplete", AutoComplete);

app.mount("#app");
