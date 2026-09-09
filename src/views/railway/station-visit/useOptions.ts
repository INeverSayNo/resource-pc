import { Ref, watch } from "vue";
import { reactive } from "vue";
import {
  BaseData,
  GetSystemBaseDataAsync
} from "@/api/dictionaryApi";
import { GetStationContact, GetStationPrivateLine } from "../station/api";
import { RailWayPrivatelLine, RailWayStationContacts } from "../station/types";
import { StationVisitRecordCrud, VisitBusinessTypeEnum } from "./types";

export function useOptions(
  stationId: Ref<string>,
  edit?: Ref<StationVisitRecordCrud>
) {
  const optionsState = reactive({
    visitTypeOptions: [] as BaseData[],
    privateLineOptions: [] as RailWayPrivatelLine[],
    hasLoadPl: false,
    contactOptions: [] as RailWayStationContacts[],
    hasLoadC: false
  });
  function getVisitType() {
    GetSystemBaseDataAsync("ResourceVisitType").then((res) => {
      optionsState.visitTypeOptions = ((res || []) as BaseData[]).map((x) => {
        x.value = x.text;
        return x;
      });
      if (edit && res?.length) {
        edit.value.visitExtendJson.visitType = res[0].text;
      }
    });
  }
  function getPrivateLine() {
    if (!optionsState.hasLoadPl) {
      GetStationPrivateLine(stationId.value).then((res) => {
        optionsState.privateLineOptions = res || [];
        optionsState.hasLoadPl = true;
        if (
          res.length === 1 &&
          edit?.value.visitExtendJson.visitBusinessType ===
            (VisitBusinessTypeEnum.PrivateLine as number)
        ) {
          edit.value.visitExtendJson.businessObjId = res[0].id;
          edit.value.visitExtendJson.businessObjName = res[0].name;
        }
      });
    }
  }
  function getContact() {
    if (!optionsState.hasLoadC) {
      GetStationContact(stationId.value).then((res) => {
        optionsState.contactOptions = res || [];
        optionsState.hasLoadC = true;
      });
    }
  }

  return {
    optionsState,
    getVisitType,
    getPrivateLine,
    getContact
  };
}
