import { createApp } from "vue";
import App from "./App.vue";

import "./styles/main.scss";
import "primeflex/primeflex.css";
import 'primevue/resources/themes/lara-dark-teal/theme.css'; //icons
import 'primevue/resources/primevue.min.css'; //core css
import 'primeicons/primeicons.css'; //icons

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
import Tooltip from 'primevue/tooltip';


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

app.directive('tooltip', Tooltip);

app.mount("#app");
