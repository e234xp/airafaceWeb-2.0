<template>
  <div />
</template>

<script>
  export default {
    name: 'Table',
    props: {
      items: Array,
      fields: {
        type: Array,
        default() {
          return [{ label: 'ID', key: 'id' }, 'timestamp', 'name', 'status'];
        },
      },
      caption: {
        type: String,
        default: 'Table',
      },
      hover: Boolean,
      striped: Boolean,
      border: Boolean,
      fixed: Boolean,
      itemsPerPage: Number,
      itemsPerPageSelect: Object,
    },
    methods: {
    },
  };
</script>