<template>
  <DcGap class="bar">
    基础信息
    <span class="desc">阅读({{ station?.viewCount || 0 }})</span>
    <span v-if="station?.id" class="bar-btn fr" @click="showEdit = true">
      <DAliIcon name="edit" />
      编辑
    </span>
    <span v-else class="bar-btn fr" @click="showEdit = true">
      <DAliIcon name="plus" />
      新增
    </span>
  </DcGap>
  <div class="base-info">
    <el-row>
      <el-col :span="8">
        <span class="label">港口全称</span>
        <span class="value">
          {{ station.portName }}
        </span>
      </el-col>
      <el-col :span="8">
        <span class="label">港口分类</span>
        <span class="value">
          {{ station.portType }}
        </span>
      </el-col>

      <el-col :span="8">
        <span class="label">地址</span>
        <span class="value">
          {{ station.address }}
        </span>
      </el-col>
    </el-row>
    <el-row>
      <div class="wrapper">
        <input id="exp1" class="exp" type="checkbox" />
        <div class="text">
          <label v-if="station?.portSynopsis" class="btn" for="exp1" />
          <p
            style="
              padding: 0;
              margin: 0;
              display: inline;
              line-height: 30px;
              font-size: 14px;
              color: #969799;
            "
            >港口简介 </p
          ><p style="padding: 0; margin: 0; display: inline; line-height: 30px; font-size: 14px">{{
            station?.portSynopsis
          }}</p>
        </div>
      </div>
    </el-row>

    <!-- <span class="label">备注</span> -->
    <!-- <span class="value">
          {{ station.portSpecification }}
        </span> -->
    <!-- <dc-more :content="station.portSpecification"  :style="style"></dc-more> -->
    <el-row>
      <div class="wrapper">
        <input id="exp2" class="exp" type="checkbox" />
        <div class="text">
          <label v-if="station?.portSpecification" class="btn" for="exp2" />
          <p
            style="
              padding: 0;
              margin: 0;
              display: inline;
              line-height: 30px;
              font-size: 14px;
              color: #969799;
            "
            >备注 </p
          ><p style="padding: 0; margin: 0; display: inline; line-height: 30px; font-size: 14px">{{
            station?.portSpecification
          }}</p>
        </div>
      </div>
    </el-row>
    <el-row>
      <!-- <el-col :span="8">
        <span class="label">港口分级</span>
        <span class="value">
          {{ station.portScale }}
        </span>
      </el-col>
      
      <el-col :span="8">
        <span class="label">省市区</span>
        <span class="value">
          {{ renderCity(station.portAddress) }}
        </span>
      </el-col> -->
      <!-- <el-col :span="8">
        <span class="label">我司归属区域名称</span>
        <span class="value">
          {{ station.areaName }}
        </span>
      </el-col> -->
      <el-col :span="8">
        <span class="label">负责区域/人员</span>
        <span class="value">
          <span>
            {{ station.areaName }}/{{ station.areaUserName }}
            <span
              style="color: #409eff"
              v-html="createPrivatePhone(station.areaUserTel).outerHTML"
            />
          </span>
        </span>
      </el-col>
    </el-row>
  </div>
  <EditForm
    v-model="showEdit"
    :station="station"
    :carrying-capacity-list="carryingCapacityList"
    :file-attach="fileAttach"
    @success="handleSuccess"
  ></EditForm>
</template>

<script lang="ts">
  import { reactive, defineComponent, ref } from 'vue'
  import DcGap from '@/components/Gap/index.vue'
  import EditForm from './baseInfoForm.vue'
  import DcMore from '@/components/More/index.vue'
  export default defineComponent({
    components: {
      DcGap,
      EditForm
    },
    props: {
      station: {
        type: Object as any,
        default: () => {}
      },
      carryingCapacityList: {
        type: Array as any,
        default: () => [] as any
      },
      fileAttach: {
        type: Array as any,
        default: () => []
      }
    },
    emits: ['reload'],
    setup(props, { emit }) {
      const showEdit = ref(false)
      const showData = ref<any>([])
      function handleSuccess() {
        emit('reload')
      }
      function renderCity(value: any) {
        if (value) {
          const zxs = ['重庆市', '北京市', '天津市', '上海市']
          return zxs.includes(value)
            ? value
            : value
                .replace('重庆市,', '')
                .replace('北京市,', '')
                .replace('天津市,', '')
                .replace('上海市,', '')
        } else {
          return ''
        }
      }
      const lineClamp = ref(1)
      const style = reactive({
        backgroundColor: '#fffff',
        width: '100%'
      })
      return {
        showData,
        showEdit,
        handleSuccess,
        renderCity,
        lineClamp,
        style
      }
    }
  })
</script>

<style lang="less" scoped>
  @import url('../style.less');

  .wrapper {
    display: flex;
    overflow: hidden;
    line-height: 1.6;
    font-size: 12px;
  }

  .text {
    overflow: hidden;
    text-overflow: ellipsis;
    text-align: justify;

    /* display: flex; */
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    position: relative;
  }

  .text::before {
    content: '';
    height: calc(100% - 24px);
    float: right;
  }

  .text::after {
    content: '';
    width: 999vw;
    height: 999vw;
    position: absolute;
    margin-left: -100px;
    font-size: 14px;
    line-height: 30px;
  }

  .btn {
    float: right;
    clear: both;
    margin-left: 10px;
    font-size: 14px;
    color: #1989fa;
    cursor: pointer;

    /* margin-top: -30px; */
  }

  .exp {
    display: none;
  }

  .exp:checked + .text {
    -webkit-line-clamp: 999;
  }

  .exp:checked + .text::after {
    visibility: hidden;
  }
  // .btn::before{
  //   content:'展开';
  //   font-size: 14px;
  // }
  .exp:checked + .text .btn::before {
    content: '收起';
    font-size: 14px;
  }
</style>
