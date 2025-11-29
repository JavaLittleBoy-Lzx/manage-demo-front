<template>
  <div>
    <div class="crumbs">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item>
          <i class="el-icon-pie-chart"></i> 统计
        </el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="container">
      <div class="schart-box">
        <div class="content-title">设备租赁情况统计</div>
        <schart class="schart" canvasId="line" :options="options2"></schart>
      </div>
    </div>
  </div>
</template>

<script>
import Schart from "vue-schart";
import request from "@/utils/request";
import { ref } from "vue";

export default {
  name: "basecharts",
  components: {
    Schart,
  },
  // data
  setup() {

    const options2 = ref({});
    const getQueryRental = () => {
      request.get("/parking/rental/queryRental").then((res) => {
        if (
          res.data.allAccentRent != null &&
          res.data.typeName != null &&
          res.data.rentalNum != null
        ) {
          options2.value = {
            type: "line",
            title: {
              text: "最近3个月各类设备租赁趋势图",
            },
            bgColor: "#fbfbfb",
            labels: res.data.typeName,
            datasets: [
              {
                label: "租赁设备类型数量(台)",
                data: res.data.rentalNum,
              },
              {
                label: "租赁设备类型价格(万元)",
                data: res.data.allAccentRent,
              },
            ],
          };
        } else {
          options2.value = {
            type: "line",
            title: {
              text: "最近3个月各类设备租赁趋势图",
            },
            bgColor: "#fbfbfb",
            labels: [
              "生产设备",
              "电气设备",
              "特种设备",
              "精密设备",
              "动力设备",
              "压力设备",
            ],
            datasets: [
              {
                label: "租赁设备类型数量(台)",
                data: [0, 0, 0, 0, 0, 0],
              },
              {
                label: "租赁设备类型价格(万元)",
                data: [0, 0, 0, 0, 0, 0],
              },
            ],
          };
        }
      });
    };
    getQueryRental();
    return {
      options2,
    };
  },
};
</script>
<style scoped>
.schart-box {
  display: inline-block;
  margin: 20px;
}
.schart {
  width: 600px;
  height: 400px;
}
.content-title {
  clear: both;
  font-weight: 400;
  line-height: 50px;
  margin: 10px 0;
  font-size: 22px;
  color: #1f2f3d;
}
</style>