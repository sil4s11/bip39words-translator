import { createApp } from "vue";
import App from "./App.vue";

import "./styles/main.scss";
import "/node_modules/primeflex/primeflex.css";

import PrimeVue from "primevue/config";
import InputText from "primevue/inputtext";
import TabView from "primevue/tabview";
import TabPanel from "primevue/tabpanel";
import AutoComplete from "primevue/autocomplete";
import Textarea from "primevue/textarea";
import SelectButton from "primevue/selectbutton";
import Button from "primevue/button";
import Toast from "primevue/toast";
import ToastService from "primevue/toastservice";

const app = createApp(App);

app.use(PrimeVue);
app.use(ToastService);
app.component("InputText", InputText);
app.component("TabView", TabView);
app.component("TabPanel", TabPanel);
app.component("AutoComplete", AutoComplete);
app.component("TextareaField", Textarea);
app.component("SelectButton", SelectButton);
app.component("PrimeButton", Button);
app.component("PrimeToast", Toast);

app.mount("#app");
