<template>
  <div>
    <div
      class="fz-md"
      style="margin-bottom: 12px;"
    >
      {{ name }}
    </div>
    <div style="position: relative; width: 100%; padding-top: 56%;">
      <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background-color: black; border-radius: 20px;" />
    </div>
  </div>
</template>

<script>
export default {
  name: 'CameraVideo',
  props: {
    url: {
      type: String,
      default: '',
    },
    name: {
      type: String,
      default: '',
    },
  },
};
</script>

<style scoped>

</style>
