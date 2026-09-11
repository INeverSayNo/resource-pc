
import { computed, onMounted, ref } from "vue";
import {  IApplicationItem } from "../types";
import { GetApplicationList, GetApplicationModuleList } from "../api";

const applicationList = ref<IApplicationItem[]>([]);
export default function useApplications(
  options = {
    immediateQuery: true
  }
) {
  const { immediateQuery } = options;
  const getAllApplications = async () => {
    const [err, data] = await GetApplicationList();
    if (err || !data || !Array.isArray(data.result.items)) return;
    const [dczyApplication] = data.result.items;
    const [err1, modules] = await GetApplicationModuleList({
      applicationId: dczyApplication.id, maxResultCount: 999,
      skipCount: 0
    });
    if (err1 || !modules || !Array.isArray(modules.result?.items)) return;

    applicationList.value = data.result.items
      .map((app) => {
        const appModules = modules.result.items.filter(
          (module) => module.applicationId === app.id
        );
        return {
          ...app,
          modules: appModules
        };
      })
      .filter((e) => e.modules.length);
  };

  const getMatchApplicationModule = computed(
    () =>
      (id: string, isLabel = false) => {
        for (const app of applicationList.value) {
          const matchModule = app.modules?.find((mod) => mod.id === id);
          if (matchModule)
            return isLabel ? `${app.name}-${matchModule.name}` : matchModule;
        }
      }
  );

  onMounted(() => {
    if (immediateQuery) getAllApplications();
  });

  return {
    applicationList,
    getMatchApplicationModule
  };
}
