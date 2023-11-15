<template>
  <div class="c-app">
    <!-- <div class="backdrop"></div> -->
    <!-- <TheSidebar/> -->
    <TheSidebar v-if="isFullScreen" />
    <CWrapper>
      <!-- <TheHeader/> -->
      <TheHeader v-if="isFullScreen" />
      <div class="c-body">
        <main class="c-main">
          <CContainer fluid>
            <transition name="fade" mode="out-in">
              <router-view :key="$route.path"></router-view>
            </transition>
          </CContainer>
        </main>
      </div>
      <!-- <TheFooter /> -->
      <TheFooter v-if="isFullScreen" />
    </CWrapper>
  </div>
</template>

<script>
// import Vue from 'vue';
// import router from '../router';
// import store from '../store';
import TheSidebar from './TheSidebar.vue';
import TheHeader from './TheHeader.vue';
import TheFooter from './TheFooter.vue';

export default {
  name: 'TheContainer',
  components: {
    TheSidebar,
    TheHeader,
    TheFooter,
  },

  computed: {
    isFullScreen() {
      return sessionStorage.getItem('displayMode') === 'Setting';
    },
  },
  created() {
    this.$webSocketsConnect({ apiSocketPath: window.apiSocketPath });
  },
  mounted() { },
  methods: {},
};
</script>

<style scoped>
  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.3s;
  }

  .fade-enter,
  .fade-leave-to {
    opacity: 0;
  }
</style>
