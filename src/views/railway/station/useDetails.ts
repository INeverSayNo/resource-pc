import { useStatisticTrace } from "@/hooks/useStatisticTrace";
import { getSystemDataShow } from "@/api/systemDataShowApi";
import { GetAddress } from "@/utils";
import { ElLoading } from "element-plus";
import { computed, onMounted, reactive } from "vue";
import { useRoute } from "vue-router";
import { GetStationById } from "./api";
import {
  ContainerType,
  PrivateLineField,
  StationDtField,
  StationTag,
  YardField,
  YardHandleScopeField
} from "./store";
import {
  DetailsRailWayStationResult,
  RailwatDetailsItemType,
  RailwayDetailsFieldType,
  RailWayGoodsYard,
  RailWayPrivatelLine,
  RailWayStation
} from "./types";
import { checkFunPermissionAsync } from "@/utils/funPermissionChecked";

type optionsType = Record<"value" | "text", string>;

type stateProps = {
  stationId: string;
  stationName: string;
  data: DetailsRailWayStationResult | undefined;
  bureauOptions: optionsType[];
  loading: boolean;
  supplierLoading: boolean;
  permissionNew: boolean;
};

const state = reactive<stateProps>({
  stationId: "",
  stationName: "",
  data: undefined,
  bureauOptions: [],
  loading: false,
  supplierLoading: false,
  permissionNew: false
});

export function useDetails(needInit = true) {
  const route = useRoute();
  state.stationId = (route.query?.id || "").toString();
  state.stationName = (route.query?.name || "").toString();
  const { SetTrace } = useStatisticTrace();
  function GetStationId() {
    return (route.query?.id || "").toString();
  }

  /** 基础信息显示 */
  function GetBaseInfShowData(station: RailWayStation) {
    const keys = Object.keys(station);
    return StationDtField.filter((col) => {
      if (keys.includes(col.field)) {
        const child = col.children?.some((x) => {
          !!station[x.field];
        });
        return (
          (col.checkValue && !!station[col.field]) || !col.checkValue || child
        );
      }
      return false;
    }).map((col) => {
      let value =
        col.field === "address"
          ? GetAddress(station[col.field])?.address || ""
          : col.isBoolean
          ? station[col.field] === true
            ? "是"
            : "否"
          : station[col.field];
      if (col.children?.length) {
        const cv = (col.children as any[])
          .filter((x) => keys.includes(x.field))
          .map((x) => {
            return {
              value: station[x.field],
              clipboard: x.clipboard,
              suffix: x.suffix
            };
          });
        value = cv;
      }
      const show: RailwayDetailsFieldType = {
        label: col.label,
        value,
        class: col.class,
        colspan: col.colspan,
        suffix: col.suffix
      };
      return show;
    });
  }

  /** 货场显示字段信息 */
  function GetYardShowData(yard: RailWayGoodsYard) {
    const keys = Object.keys(yard);
    return YardField.filter((col) => keys.includes(col.field)).map((col) => {
      const show: RailwayDetailsFieldType = {
        label: col.label,
        value: col.isBoolean
          ? yard[col.field] === true
            ? "是"
            : "否"
          : yard[col.field],
        colspan: col.colspan
      };
      /** 收费标准 */
      if (col.field === "yardChargeItem") {
        if (yard.yardChargeItem?.length) {
          const children: RailwatDetailsItemType[] = [];
          yard.yardChargeItem.forEach((d) => {
            let value = `${d.chargeType}`;
            if (d.freeTime !== undefined) {
              value += `，免费：${d.freeTime}${d.freeTimeUnit}`;
            }
            if (d.overdueFee !== undefined) {
              value += `，超期：${d.overdueFee}${d.overdueFeeUnit}`;
            }
            if (d.chargeRemark) {
              value += `，${d.chargeRemark}`;
            }
            children.push({
              value,
              class: "theme-danger"
            });
          });
          show.children = children;
        }
      }
      /** 货场办理范围 */
      if (col.field === "handleScope") {
        const children: RailwatDetailsItemType[] = [];
        const fieldData = yard.handleScope || {};
        const keys = Object.keys(fieldData);
        YardHandleScopeField.forEach((icol) => {
          if (fieldData != null && keys.includes(icol.field)) {
            const value = fieldData[icol.field];
            if (!icol.isBoolean && value) {
              children.push({
                value: value,
                class:
                  icol.field === "scope"
                    ? value.indexOf("仅办理") !== -1 ||
                      value.indexOf("不办理") === -1
                      ? "success"
                      : "danger"
                    : ""
              });
            }
            if (icol.isBoolean) {
              children.push({
                value:
                  value.toString() === "true"
                    ? `√${icol.label}`
                    : `×${icol.label}`,
                class: value.toString() === "true" ? "success" : "danger"
              });
            }
          }
        });
        show.children = children;
      }
      /** 集装箱发送到达 */
      if (
        col.field === "containerSendHS" ||
        col.field === "containerArriveHS"
      ) {
        const colValue = yard[col.field];
        show.children = GetContainerScope(colValue);
      }
      /** 危险品办理限制 */
      if (col.field === "danger") {
        if (yard.danger?.length) {
          const children: RailwatDetailsItemType[] = [];
          yard.danger.forEach((d) => {
            let value = `类型：${d.type}`;
            if (d.fsInfo) {
              value += `，发送：${d.fsInfo}`;
            }
            if (d.ddInfo) {
              value += `，到达：${d.ddInfo}`;
            }
            children.push({
              value,
              class: "success"
            });
          });
          show.children = children;
        }
      }
      return show;
    });
  }

  /** 专用线显示字段信息 */
  function GetPrivateLineShowData(line: RailWayPrivatelLine) {
    const showData: RailwayDetailsFieldType[] = [];
    PrivateLineField.forEach((col) => {
      const { field, label, isBoolean, children, ...other } = col;
      const value = isBoolean
        ? line[field] === true
          ? "是"
          : "否"
        : line[field];
      const item: RailwayDetailsFieldType = {
        label: label,
        value: value,
        ...other
      };
      if (children && children.length) {
        item.children = [];
        item.children = children.map((c) => {
          const { field, isClip, ...other } = c;
          return {
            value: line[field],
            isClip: isClip,
            ...other
          };
        });
      }
      if (field === "address") {
        item.value = GetAddress(line[col.field])?.address || "";
      }
      if (field === "overrun") {
        if (!item.children) item.children = [];
        item.children.push({
          value: line.overrun ? "√超限" : "×超限",
          class: line.overrun ? "success" : "danger"
        });
        item.children.push({
          value: line.overweight ? "√超重" : "×超重",
          class: line.overweight ? "success" : "danger"
        });
      }
      /** 集装箱发送到达 */
      if (
        col.field === "containerSendHS" ||
        col.field === "containerArriveHS"
      ) {
        const colValue = line[col.field];
        item.children = GetContainerScope(colValue);
      }
      showData.push(item);
    });
    return showData;
  }

  /** 集装箱发送到达 */
  function GetContainerScope(value: string) {
    const colAry = value?.split(",") || [];
    const children: RailwatDetailsItemType[] = [];
    colAry.forEach((x) => {
      const typeName = ContainerType.find((y) => y.field === x)?.label || "";
      if (typeName) {
        children.push({
          value: `√${typeName}`,
          class: "success"
        });
      }
    });
    return children;
  }

  function loadBureau() {
    getSystemDataShow("RailwayBureauSelect", "", 0, 0, "", true).then((res) => {
      if (res?.length) {
        state.bureauOptions = res.map((item) => {
          item.text = `${item.label}局`;
          return item;
        });
      }
    });
  }

  function loadData() {
    console.log('load')
    if (route.query?.id && needInit) {
      loadBureau();
      const loading = ElLoading.service({ text: "数据加载中..." });
      GetStationById(route.query.id.toString(), true)
        .then((res) => {
          res.station.railwayBureauName =
            state.bureauOptions.find(
              (x) => x.value === res.station.railwayBureauCode
            )?.text || "";
          res.station.AddressFormat = GetAddress(res.station.address);
          if (res.zyxList?.length) {
            res.zyxList.forEach((z) => {
              if (z.address) {
                try {
                  z.addressFormat = JSON.parse(z.address);
                } catch (error) {
                  //
                }
              }
            });
          }
          state.data = res;
        })
        .finally(() => {
          SetTrace("$SELECT", "铁路版块", "全国铁路站点");
          loading.close();
        });
    }
  }
  const getStationTag = computed(() => {
    if (!state.data?.station) return [];
    const title = getStationTagTitle(state.data.station).map((item) => ({
      ...item,
      isExist: false,
      isRight: false
    }));
    const other = getOtherStationTag(state.data.station).map((item) => ({
      ...item,
      isShow: false
    }));
    return [...title, ...other];
  });
  
  const getStationTagTitle = (station: RailWayStation) => {
    const list = [
      {
        name: "核心站点",
        isShow: `${station.stationLevelName}` === "核心站点"
      },
      {
        name: "普通站点",
        isShow: `${station.stationLevelName}` === "普通站点"
      },
      {
        name: "重要站点",
        isShow: `${station.stationLevelName}` === "重要站点"
      },
      {
        name: "待开发站点",
        isShow: `${station.stationLevelName}` === "待开发站点"
      },
      {
        name: "进出口岸",
        isShow: (station.scopeOfBusiness || "").includes("进出口")
      },
      {
        name: "国铁站",
        isShow: station.stationNatureName === "国铁站"
      },
      {
        name: "编组站",
        isShow: station.stationNatureName === "编组站"
      },
      {
        name: "地铁站",
        isShow: station.stationNatureName === "地方铁路站"
      }
    ];
    return list.filter((item) => item.isShow);
  };

  const getOtherStationTag = (station: RailWayStation) => {
    const list = [
      // {
      //   name: "有驻站人员",
      //   isExist: `${station.isStationary}` === "true",
      //   isRight: true
      // },
      // {
      //   name: "无驻站人员",
      //   isExist: `${station.isStationary}` === "false",
      //   isRight: false
      // },
      {
        name: "有优价",
        isExist: `${station.hasPricePolicy}` === "true",
        isRight: true
      },
      {
        name: "无优价",
        isExist: `${station.hasPricePolicy}` === "false",
        isRight: false
      },
      // {
      //   name: "已签订发运协议",
      //   isExist: `${station.isAgreement}` === "true",
      //   isRight: true
      // },
      // {
      //   name: "未签发运协议",
      //   isExist: `${station.isAgreement}` === "false",
      //   isRight: false
      // },
      {
        name: "有接取送达供应商",
        isExist: station.tags?.includes("有接取送达"),
        isRight: true
      },
      {
        name: "无接取送达供应商",
        isExist: !station.tags?.includes("有接取送达"),
        isRight: false
      },
      {
        name: "有代理发运供应商",
        isExist: `${station.hasProxySupplier}` === "true",
        isRight: true
      },
      {
        name: "无代理发运供应商",
        isExist: `${station.hasProxySupplier}` === "false",
        isRight: false
      }
    ];
    return list
      .filter((item) => item.isExist)
      .sort((a, b) => {
        if (a.isRight && !b.isRight) return -1;
        if (!a.isRight && b.isRight) return 1;
        return 0;
      });
  };

  onMounted(() => {
    checkFunPermissionAsync(route.path, "newPrivateLine").then((res) => {
      state.permissionNew = !!res;
    });
  });

  return {
    state,
    GetStationId,
    GetBaseInfShowData,
    GetYardShowData,
    GetPrivateLineShowData,
    GetContainerScope,
    loadData,
    getStationTag
  };
}
