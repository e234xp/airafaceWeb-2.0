<template>
  <div
    class="face-card"
  >
    <div style="width: 80px; height: 80px; position: relative;">
      <img
        :src="`data:image/png;base64,${image}`"
        style="width: 100%; height: 100%; border-radius: 2px;"
      >
    </div>
    <div style="display: flex; flex-direction: column; justify-content: space-between; color: white; width: calc(100% - 96px); height: 100%;">
      <div
        class="fz-xxxl fw-700"
        v-if="name !== ''"
      >
        {{ name }}
      </div>
      <div
        class="fz-md"
        v-if="depart !== ''"
      >
        {{ depart }}
      </div>
      <div class="fz-md fw-700">
        {{ parseTime(time) }}
      </div>
      <div
        class="fz-md ack-btn"
        @click.stop="onAck"
        v-if="name === '' && depart === ''"
      >
        <CIcon name="cil-pen" />
      </div>
    </div>
    <!-- <div
      style="position: absolute; top: 12px; right: 12px"
      v-if="selected"
    >
      <CIcon name="cil-check" size="2xl" style="color: white" />
    </div> -->
    <input
      class="card-checkbox"
      style="position: absolute; top: 12px; right: 12px; width: 16px; height: 16px;"
      type="checkbox"
      :checked="selected"
    >
  </div>
</template>

<script>
import { defaultPhotoImage } from '@/utils';
import dayjs from 'dayjs';

export default {
  name: 'FaceCard',

  props: {
    name: {
      type: String,
      default: '',
    },
    image: {
      type: String,
      default: defaultPhotoImage,
    },
    depart: {
      type: String,
      default: '',
    },
    time: {
      type: Number,
      default: 0,
    },
    count: {
      type: Number,
      default: 0,
    },
    selected: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      // Add your data here.
    };
  },

  methods: {
    parseTime(time) {
      return dayjs(time).format('HH:mm:ss');
    },
    onAck() {
      this.$emit('ack');
    },
  },
};
</script>

<style lang="scss" scoped>
@import '@/assets/scss/variables.scss';

[type='present'] {
  background: $dashboard-present;
}

[type='absent'] {
  background: $dashboard-absent;
  opacity: 0.8;
}

[type='unknown'] {
  cursor: pointer;
  background: $dashboard-unknown;
  .card-checkbox {
    display: block;
  }
}

[type='unknown']:hover {
  background: $dashboard-danger-light;
  .ack-btn {
    display: block;
  }
}

.face-card {
  position: relative;
  border-radius: 12px;
  display: flex;
  padding: 12px;
  gap: 16px;
  align-items: center;
}

.card-checkbox {
  display: none;
}

.ack-btn {
  cursor: pointer;
  width: 42px;
  margin-left: calc(100% - 42px);
  line-height: 24px;
  text-align: center;
  border-radius: 4px;
  border: 1px solid #FFF;
  background: $guard-btn-bg;
  box-shadow: 0px 4px 4px 0px rgba(0, 0, 0, 0.10);
  display: none;

  &:hover {
    background: $guard-btn-bg-hover;
  }
}
</style>
