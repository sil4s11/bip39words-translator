import { createApp } from "vue";
import App from "./App.vue";

// import "./assets/main.css";
import "./styles/main.scss";

import PrimeVue from "primevue/config";
import InputText from "primevue/inputtext";
import TabView from "primevue/tabview";
import TabPanel from "primevue/tabpanel";

const app = createApp(App);

app.use(PrimeVue);
app.component("InputText", InputText);
app.component("TabView", TabView);
app.component("TabPanel", TabPanel);

app.mount("#app");
