import { useRoute } from "vue-router";
import { monitor } from '@/plugins/monitor'

export type StatisticTraceType = {
  operateType: ("$INSERT" | "$UPDATE" | "$DELETE" | "$SELECT" | "$EVALUATE") &
    string;
  dataId?: string;
  menu?: string;
  module?:
    | "铁路版块"
    | "公路版块"
    | "水运版块"
    | "国际版块"
    | "供应商版块"
    | "询价版块"
    | "任务管理";
  count?: number;
  menu2?: string;
};

export function useStatisticTrace() {
  const otherTrace = (event: string, properties: Record<string, unknown>) => {
    void monitor.track(event, properties).catch(() => undefined)
  }
  const route = useRoute();
  const currentMenuTitle = (): string => {
    const queryTitle = route.query.title
    const normalizedTitle = Array.isArray(queryTitle) ? queryTitle[0] : queryTitle
    return normalizedTitle || String(route.meta.title || document.title)
  }

  function ResourceInputTrace(
    operateType: StatisticTraceType["operateType"],
    dataId?: string,
    resourceName?: string
  ) {
    if (operateType !== "$SELECT") {
      if (operateType === "$EVALUATE") {
        otherTrace("$ResourceEvaluate", {
          operateType: resourceName,
          resourceObjectId: dataId,
          module: "资源评价"
        });
      } else {
        otherTrace("$ResourceInput", {
          operateType:
            operateType === "$DELETE"
              ? "删除"
              : operateType === "$INSERT"
              ? "新增"
              : operateType === "$UPDATE"
              ? "修改"
              : "",
          resourceObjectId: dataId,
          module: "资源操作"
        });
      }
    }
  }

  /**
   * 动态资源埋点
   * @param operateType 操作类型  "$INSERT" | "$UPDATE" | "$DELETE" | "$SELECT"
   * @param resourceTypeName 资源分类名称，用于区分个板块
   * @param menu 菜单名称，默认为 menu || route.query?.title || route.meta?.title || document.title
   * @param dataId 操作数据的Id,（查询/"$SELECT"，新增/"$INSERT"除外）
   */
  function SetTrace(
    operateType: StatisticTraceType["operateType"],
    resourceTypeName: string,
    menu?: string,
    dataId?: string,
    count?: number,
    menuEx?: string
  ) {
    let module: StatisticTraceType["module"];
    if (resourceTypeName.indexOf("国际") !== -1) {
      module = "国际版块";
    } else if (resourceTypeName.indexOf("铁路") !== -1) {
      module = "铁路版块";
    } else if (resourceTypeName.indexOf("公路") !== -1) {
      module = "公路版块";
    } else if (resourceTypeName.indexOf("水运") !== -1) {
      module = "水运版块";
    }
    if (module) {
      const param: StatisticTraceType = {
        operateType: operateType,
        module,
        menu: menu || currentMenuTitle(),
        dataId,
        count: count === undefined ? 1 : count
      };
      if (menuEx) param.menu2 = menuEx;
      otherTrace("$CRStatistic", param);
    }
    ResourceInputTrace(operateType, dataId, menu);
  }

  /**
   * 供应商模块埋点
   * @param operateType 操作类型  "$INSERT" | "$UPDATE" | "$DELETE" | "$SELECT"
   * @param menu 菜单名称，默认为 menu || route.query?.title || route.meta?.title || document.title
   * @param dataId 操作数据的Id,（查询/"$SELECT"，新增/"$INSERT"除外）
   */
  function SetSupplierTrace(
    operateType: StatisticTraceType["operateType"],
    menu?: string,
    dataId?: string
  ) {
    const module: StatisticTraceType["module"] = "铁路版块";
    const param: StatisticTraceType = {
      operateType: operateType,
      module,
      menu: menu || currentMenuTitle(),
      dataId
    };
    otherTrace("$CRStatistic", param);
  }

  /**
   * 询价模块埋点
   * @param operateType 操作类型  "$INSERT" | "$UPDATE" | "$DELETE" | "$SELECT"
   * @param menu 菜单名称，默认为 menu || route.query?.title || route.meta?.title || document.title
   * @param dataId 操作数据的Id,（查询/"$SELECT"，新增/"$INSERT"除外）
   */
  function SetEnquiryTrace(
    operateType: StatisticTraceType["operateType"],
    moduleName: string,
    menu?: string,
    dataId?: string
  ) {
    let module: StatisticTraceType["module"];
    let menuName = "";
    if (moduleName.indexOf("国际") !== -1) {
      module = "国际版块";
      menuName = "国际询价";
    } else if (moduleName.indexOf("铁路") !== -1) {
      module = "铁路版块";
      menuName = "铁路询价";
    } else if (moduleName.indexOf("公路") !== -1) {
      module = "公路版块";
      menuName = "公路询价";
    } else if (moduleName.indexOf("水路") !== -1) {
      module = "水运版块";
      menuName = "水运询价";
    }
    if (module) {
      const param: StatisticTraceType = {
        operateType: operateType,
        module,
        menu: menu === "询价任务" ? menu : menuName,
        dataId
      };
      otherTrace("$CRStatistic", param);
    }
  }
  /**
   * 任务模块埋点
   * @param operateType 操作类型  "$INSERT" | "$UPDATE" | "$DELETE" | "$SELECT"
   * @param menu 菜单名称，默认为 menu || route.query?.title || route.meta?.title || document.title
   * @param dataId 操作数据的Id,（查询/"$SELECT"，新增/"$INSERT"除外）
   */
  function SetTaskTrace(
    operateType: StatisticTraceType["operateType"],
    menu?: string,
    dataId?: string
  ) {
    const module: StatisticTraceType["module"] = "任务管理";
    const param: StatisticTraceType = {
      operateType: operateType,
      module,
      menu: menu || currentMenuTitle(),
      dataId
    };
    // 暂时取消埋点
    // otherTrace("$CRStatistic", param);
  }

  return {
    SetTrace,
    SetSupplierTrace,
    SetEnquiryTrace,
    SetTaskTrace
  };
}
