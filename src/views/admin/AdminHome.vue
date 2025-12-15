<template>
  <div class="about">
    <v-header />
    <v-sidebar :items="roleSidebar.items" />
    <div class="content-box" :class="{ 'content-collapse': collapse }">
      <div class="top-bar">
        <custom-breadcrumb />
        <v-tags></v-tags>
      </div>
      <div class="content">
        <router-view v-slot="{ Component }">
          <transition name="move" mode="out-in">
            <keep-alive :include="tagsList">
              <component :is="Component" />
            </keep-alive>
          </transition>
        </router-view>
      </div>
    </div>
  </div>
</template>
<script>
import { computed, reactive } from "vue";
import { useStore } from "vuex";
import vHeader from "../../components/Header.vue";
import vSidebar from "../../components/Sidebar.vue";
import vTags from "../../components/Tags.vue";
import CustomBreadcrumb from "../../components/Breadcrumb.vue";
import request from "../../utils/request";
export default {
  components: {
    vHeader,
    vSidebar,
    vTags,
    CustomBreadcrumb,
  },
  setup() {
    const roleSidebar = reactive({
      items: [
        {
          icon: "",
          index: "",
          sid: "",
          title: "",
          subs: [
            {
              title: "",
              sid: "",
            },
          ],
        },
      ],
    });
    const query = reactive({
      id: ""
    });
    // 查询操作
    query.id = localStorage.getItem("ms_role");
    if (query.id) {
      request.get("/parking/role/sidebar/querySidebarById", {
        params: query,
      }).then((res) => {
        console.log(res);
        roleSidebar.items = res.data;
      });
    }
    const store = useStore();
    const tagsList = computed(() =>
      store.state.tagsList.map((item) => item.name)
    );
    const collapse = computed(() => store.state.collapse);
    return {
      roleSidebar,
      tagsList,
      collapse,
      query,
    };
  },
};
</script>

<style scoped>
.top-bar {
  flex-shrink: 0;
}
</style>