<template>
  <div style="border-radius: 8px; height: 48px; display: flex; gap: 8px; align-items: center; background: rgba(0, 0, 0, 0.20); margin-bottom: 16px; user-select: none;">
    <div
      class="hint"
      style="width: 12px; height: 100%; border-top-left-radius: 8px; border-bottom-left-radius: 8px;"
    />
    <div
      class="fz-xxxl"
      style="color: white;"
    />
    <div
      class="fz-xxxl"
      style="width: calc(100% - 220px); color: white;"
    >
      <slot />
    </div>
    <div style="margin-left: auto; display: flex; gap: 12px; margin-right: 20px; align-items: center;">
      <div
        :class="[total < 2 || (index === 0) ? 'disabled' : 'hover']"
        style="padding-top: 4px;"
        @click="onPrev"
      >
        <i
          class="fas fa-chevron-left"
          style="width: 24px; height: 24px;"
        />
      </div>
      <div
        :class="[total < 2 || (index === (total - 1)) ? 'disabled' : 'hover']"
        style="padding-top: 4px;"
        @click="onNext"
      >
        <i
          class="fas fa-chevron-right"
          style="width: 24px; height: 24px;"
        />
      </div>
      <div
        class="fz-md hover"
        style="color: white; display: flex; align-items: center;"
        @click="onExpand"
        v-if="expand"
      >
        <span>{{ $t('fold') }}</span>
        <CIcon
          name="cil-chevron-top"
        />
      </div>
      <div
        class="fz-md hover"
        style="color: white; display: flex; align-items: center;"
        @click="onExpand"
        v-else
      >
        <span>{{ $t('Extend') }}</span>
        <CIcon
          name="cil-chevron-bottom"
        />
        <!-- <i
          class="fas fa-chevron-down"
          style="width: 16px; height: 16px;"
        /> -->
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'GuardRegionTitle',

  props: {
    index: {
      type: Number,
      default: 0,
    },
    total: {
      type: Number,
      default: 0,
    },
    expand: {
      type: Boolean,
      default: false,
    },
  },

  methods: {
    onPrev() {
      this.$emit('prev');
    },

    onNext() {
      this.$emit('next');
    },

    onExpand() {
      this.$emit('expand');
    },
  },
};
</script>

<style lang="scss" scoped>
@import '@/assets/scss/variables.scss';

[type='present'] .hint {
  background: $dashboard-present;
}

[type='absent'] .hint {
  background: $dashboard-absent;
}

[type='unknown'] .hint {
  background: $dashboard-unknown;
}

.disabled {
  color: white;
  opacity: 0.3;
  cursor: unset !important;
  pointer-events: none !important;
}

.hover {
  color: white;
  cursor: pointer;
  &:hover {
    color: $primary !important;
  }
}
</style>
