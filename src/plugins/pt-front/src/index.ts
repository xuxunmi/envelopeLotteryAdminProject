import type { App } from 'vue';
import PtTable from './exports/PtTable'
import PtMenuLi from "./exports/PtMenuLi";

const components: any = {
  PtTable,
  PtMenuLi
};

export { PtTable, PtMenuLi };

const install = (app: App, options?: Record<string, unknown>) => {
  // console.log('install', components);
  for (const key of Object.keys(components)) {
    app.use((components as any)[key], options);
  }
};

export default {
  install
};
