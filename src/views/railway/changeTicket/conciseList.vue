<script lang="ts" setup>
import { PropType, reactive, ref, watch, computed } from "vue";
import DcGap from "@/components/Gap/index.vue";
import DcIcon from "@/components/icon/index.vue";
import FileDownView from "@/components/Common/FileDownView.vue";
import ChangeTicketEditForm from "./editForm.vue";
import { QueryChangeTicketPage } from "./api";
import { transportType, changeType } from "./enum";
import type { ChangeTicketDetail, EnumItem } from "./type";
import { GetFileListByIds } from "@/api/fileApi";
import { FileAttach } from "@/utils/base-entity";
import { GETFILE_URL } from "@/request";
import { DcDate } from "@dczy/tie-tools";

const props = defineProps({
  stationId: {
    type: String as PropType<string>,
    default: ""
  },
  stationName: {
    type: String as PropType<string>,
    default: ""
  }
});

const changeTicketList = ref<Array<ChangeTicketDetail>>([]);

function getChangeTicketList() {
  QueryChangeTicketPage(props.stationId)
    .then((res) => {
      if (res.isSuccessful) {
        changeTicketList.value = res.data || [];
      }
    })
    .finally(() => {
      // loading.value = false;
    });
}

function getTransportTypeName(item: ChangeTicketDetail, type: string) {
  return (
    item.transportTypeName ||
    transportType.getArray().find((e) => e.value === type)?.label ||
    "暂无"
  );
}

function getChangeType(item: ChangeTicketDetail) {
  return changeType.getSelf(item.changeType).label;
}

watch(
  () => props.stationId,
  (id) => {
    id && getChangeTicketList();
  }
);

const loadingFile = ref(false);
const changeTicketFiles = ref<
  Array<{ files: FileAttach[]; changeTicketId: string }>
>([]);
const hasFile = computed(() => (id: string) => {
  return changeTicketFiles.value.some((item) => item.changeTicketId === id);
});
const getFile = computed(() => (id: string) => {
  return (
    changeTicketFiles.value.find((item) => item.changeTicketId === id)?.files ||
    []
  );
});
const getFileUrl = (url: string) => {
  return `${GETFILE_URL}${url}`;
};
function expandRow(
  row: ChangeTicketDetail,
  expanded: Array<ChangeTicketDetail>
) {
  if (!expanded.length) {
    return;
  }
  if (row.fileAttachIds && !hasFile.value(row.id)) {
    loadingFile.value = true;
    GetFileListByIds(row.fileAttachIds.split(","))
      .then((res) => {
        if (Array.isArray(res)) {
          changeTicketFiles.value.push({
            changeTicketId: row.id,
            files: res
          });
        }
      })
      .finally(() => {
        loadingFile.value = false;
      });
  }
}

//#region 编辑 & 新增
const showEditForm = ref(false);
const isEdit = ref(false);
const changeTicketId = ref("");
function editChangeTicket(row: ChangeTicketDetail) {
  showEditForm.value = true;
  changeTicketId.value = row.id;
  isEdit.value = true;
}

function addChangeTicket() {
  isEdit.value = false;
  changeTicketId.value = "";
  showEditForm.value = true;
}

//#endregion
</script>
<template>
  <div>
    <DcGap class="bar">
      换装信息
      <span class="bar-btn fr" @click="addChangeTicket">
        <DAliIcon name="plus" class="" />
        新增
      </span>
    </DcGap>

    <el-table
      :data="changeTicketList"
      highlight-current-row
      border
      :max-height="360"
      @expand-change="expandRow"
    >
      <el-table-column type="expand">
        <template #default="{ row }">
          <div class="expand-container">
            <el-row>
              <el-col span="24">
                <div class="file-attach-wrap">
                  <p class="label">附件信息：</p>
                  <div v-if="loadingFile">
                    <span>附件加载中...</span>
                  </div>
                  <div v-else>
                    <div v-if="!hasFile(row.id)" class="no-data-wrap">
                      <DAliIcon
                        name="no-data"
                      ></DAliIcon>
                      <span class="label">暂无附件</span>
                    </div>
                    <template v-else>
                      <div class="file-attach-list">
                        <el-image
                          v-for="(file, idx) in getFile(row.id)"
                          :key="idx"
                          :preview-src-list="[getFileUrl(file.filePath || '')]"
                          style="width: 100px; height: 100px"
                          :src="getFileUrl(file.filePath || '')"
                          fit="cover"
                        />
                      </div>
                    </template>
                  </div>
                </div>
              </el-col>
            </el-row>
          </div>
        </template>
      </el-table-column>
      <el-table-column
        prop="transportTypeName"
        label="运输方式"
        align="center"
        width="360"
      >
        <template #default="{ row }">
          <p>
            <span>{{ getTransportTypeName(row, row.transportType) }}</span>
          </p>
        </template>
      </el-table-column>
      <el-table-column
        prop="changeType"
        label="换装方式"
        align="center"
        width="140"
      >
        <template #default="{ row }">
          <p>
            <span>{{ getChangeType(row) }}</span>
          </p>
        </template>
      </el-table-column>
      <el-table-column
        prop="changeCost"
        label="换装费用"
        align="center"
        width="140"
      >
        <template #default="{ row }">
          <p>
            <span>
              <i class="price">￥{{ row.changeCost }}</i>
              {{ row.unit }}
            </span>
          </p>
        </template>
      </el-table-column>
      <el-table-column
        prop="elapsedTime"
        label="换装耗时"
        align="center"
        width="140"
      >
        <template #default="{ row }">
          <p>
            <span>{{ row.elapsedTime }}</span>
            <span>天</span>
          </p>
        </template>
      </el-table-column>

      <el-table-column
        prop="contacts"
        label="联系人"
        align="center"
        width="200"
      >
        <template #default="{ row }">
          <p>
            <span>{{ row.contacts }}</span>
            <span
              v-if="row.phone"
              v-clipboard:value="row.phone"
              v-html="createPrivatePhone(row.phone).outerHTML"
            ></span>
          </p>
        </template>
      </el-table-column>

      <el-table-column prop="remark" label="换装说明" align="center">
        <template #default="{ row }">
          <el-tooltip
            class="box-item"
            effect="dark"
            :content="row.remark"
            placement="top-start"
          >
            <span>{{ row.remark }}</span>
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column
        prop="createTime"
        label="更新人/时间"
        align="center"
        width="200"
      >
        <template #default="{ row }">
          <span class="mr-05">
            {{ row.lastModifierName || row.creatorName }}
          </span>
          <span>
            {{
              DcDate.format(
                row.lastModificationTime || row.creationTime,
                "YYYY-MM-DD"
              )
            }}
          </span>
        </template>
      </el-table-column>
      <el-table-column
        prop="oper"
        fixed="right"
        label="操作"
        align="center"
        width="100"
      >
        <template #default="{ row }">
          <div>
            <el-button
              link
              type="warning"
              @click="editChangeTicket(row)"
            >
              编辑
            </el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>
  </div>
  <ChangeTicketEditForm
    v-if="showEditForm"
    :change-ticket-id="changeTicketId"
    :station-id="stationId"
    :station-name="stationName"
    v-model:visible="showEditForm"
    :is-edit="isEdit"
    @reload="getChangeTicketList"
  ></ChangeTicketEditForm>
</template>

<style lang="less" scoped>
.expand-container {
  font-size: 14px;
  line-height: 1.8;
}

i {
  font-style: normal;
}

.label {
  color: #969799;
}

.mr-02 {
  margin-left: 0.2rem;
}

.affiliation-name {
  display: flex;
  align-items: center;
  justify-content: center;

  & > :first-child {
    margin-right: 0.2rem;
  }
}

.price {
  color: #ff976a;
  font-weight: 600;
  font-size: 14px;
}

.file-attach-wrap {
  display: flex;
  align-items: flex-start;
}

.file-attach-list {
  display: flex;
  flex-wrap: wrap;

  & > div {
    margin-right: 0.4rem;
    margin-bottom: 0.4rem;
  }
}

.no-data-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;

  & > span {
    font-size: 12px;
  }
}

.price {
  color: #ff976a;
}
</style>
