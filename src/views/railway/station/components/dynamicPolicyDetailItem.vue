<script lang="tsx">
import { computed, defineComponent, PropType } from "vue";
import { RailwayNatureEnum } from "../../good-price-policy/types";
import { RailwayPolicyItemNew } from "../types";
export default defineComponent({
  name: "DynamicPolicyDetailItem",
  props: {
    item: {
      type: Object,
      required: true
    },
    policyDetail: {
      type: Object as PropType<RailwayPolicyItemNew>,
      required: true
    }
  },
  emits: ["showSenderInfo"],
  render() {
    const { item, policyDetail, $emit } = this;
    const handleShowSendInfo = (senderName: string) => {
      if (senderName.indexOf("公司") === -1) return
      $emit("showSenderInfo", senderName);
    };

    const hasValidArray = (arr: any[]) => {
      return Array.isArray(arr) && arr != null && arr.length > 0;
    };
    const senderList = computed(() => {
      if (!policyDetail.sender) return [];
      return policyDetail.sender.split(",");
    });

    switch (item.name) {
      case "xfkey":
        return (
          <div>
            <span>{policyDetail.xfkey}</span>
            {RailwayNatureEnum.getSelf(policyDetail.railwayNatureType || 0) && (
              <span class='theme-success'>
                【
                {
                  RailwayNatureEnum.getSelf(policyDetail.railwayNatureType || 0)
                    ?.label
                }
                】
              </span>
            )}
            {!(policyDetail.isUsed || policyDetail.isUsed == null) && (
              <span class='theme-danger'>
                (
                {policyDetail.isUsed || policyDetail.isUsed == null
                  ? ""
                  : "不可用"}
                )
              </span>
            )}
          </div>
        );
      case "coefficient":
        return (
          <div>
            <span class='theme-danger'>
              <DAliIcon
                class="fs-12"
                name={(policyDetail.coefficient || 0) > 0 ? 'top' : 'bottom'}
              />
              {Math.abs(policyDetail.coefficient || 0)}%
            </span>
          </div>
        );
      case "sender":
        return (
          <div>
            {hasValidArray(senderList.value) ? (
              senderList.value.map((sender) => (
                <span
                  class='theme-color cu-pointer'
                  onClick={() => handleShowSendInfo(sender)}
                >
                  {sender}, 
                </span>
              ))
            ) : (
              <span></span>
            )}
          </div>
        );
      case "goodsName":
        return (
          <p>
            {Array.isArray(policyDetail.goods) ? (
              <span>
                {policyDetail.goods
                  .map((e) => `(${e.code})${e.name}`)
                  .join(",")}
              </span>
            ) : (
              <></>
            )}
          </p>
        );
      case "station":
        return (
          <div>
            <span> {policyDetail.station.map((e) => e.name).join(",")}</span>
            <div>
              {hasValidArray(policyDetail.excludeStation) ? (
                <div class='theme-danger'>
                  不含:
                  {policyDetail.excludeStation.map((e) => e.name).join(",")}
                </div>
              ) : (
                <span></span>
              )}
            </div>
          </div>
        );
      case "arrivalStation":
        return (
          <div>
            <p>{policyDetail.arrivalStation.map((e) => e.name).join(",")}</p>
            {hasValidArray(policyDetail.arrivalExcludeStation) ? (
              <div class='theme-danger'>
                不含:
                {policyDetail.arrivalExcludeStation
                  .map((e) => e.name)
                  .join(",")}
              </div>
            ) : (
              <span></span>
            )}
          </div>
        );
      case "bureau":
        return (
          <div>
            {policyDetail.bureau.map((e) => e.name).join(",")}
            {hasValidArray(policyDetail.excludeBureau) ? (
              <div class='theme-danger'>
                不含: {policyDetail.excludeBureau.map((e) => e.name).join(",")}
              </div>
            ) : (
              <span></span>
            )}
          </div>
        );
      case "arrivalBureau":
        return (
          <div>
            {policyDetail.arrivalBureau.map((e) => e.name).join(",")}
            {hasValidArray(policyDetail.arrivalExcludeBureau) ? (
              <div class='theme-danger'>
                不含:{" "}
                {policyDetail.arrivalExcludeBureau.map((e) => e.name).join(",")}
              </div>
            ) : (
              <span></span>
            )}
          </div>
        );
      case "province":
        return (
          <div>
            {policyDetail.province.map((e) => e.name).join(",")}
            {hasValidArray(policyDetail.excludeProvince) ? (
              <div class='theme-danger'>
                不含:{" "}
                {policyDetail.excludeProvince.map((e) => e.name).join(",")}
              </div>
            ) : (
              <span></span>
            )}
          </div>
        );
      case "arrivalProvince":
        return (
          <div>
            {policyDetail.arrivalProvince.map((e) => e.name).join(",")}
            {hasValidArray(policyDetail.arrivalExcludeProvince) ? (
              <div class='theme-danger'>
                不含:{" "}
                {policyDetail.arrivalExcludeProvince
                  .map((e) => e.name)
                  .join(",")}
              </div>
            ) : (
              <span></span>
            )}
          </div>
        );
      default:
        return null;
    }
  }
});
</script>
