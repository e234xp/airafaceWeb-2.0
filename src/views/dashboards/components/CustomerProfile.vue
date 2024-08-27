<template>
  <div class="profile">
    <div class="profile-content">
      <div
        class="profile-item"
        v-for="(value, key) in editableFields"
        :key="key"
      >
        <span class="profile-label lh-1">{{ $t(key.charAt(0).toUpperCase() + key.slice(1)) }}</span>
        <div class="profile-value lh-1">
          <span :class="fields[key] > value ? 'red' : fields[key] < value ? 'green' : ''">{{ value }}</span>
        </div>
        <div
          v-if="isEdit"
          class="profile-buttons"
        >
          <button
            type="button"
            class="profile-minus-button red"
            @click="handleValueChange(key, Number(value) - 1)"
          >
            -1
          </button>

          <button
            type="button"
            class="profile-plus-button green"
            @click="handleValueChange(key, Number(value) + 10)"
          >
            +10
          </button>
        </div>
      </div>
    </div>

    <div
      v-if="isEdit"
      class="profile-total"
    >
      <p class="profile-total-title text-center lh-1">
        {{ $t('ThisChange') }}
      </p>
      <div
        class="profile-total-content"
      >
        <div
          v-for="(value, key) in editableFields"
          :key="key"
          class="profile-total-content-item"
        >
          <p class="profile-total-text text-center mb-0 lh-1">
            {{ $t(key.charAt(0).toUpperCase() + key.slice(1)) }}
          </p>
          <p
            style="font-size:5.25rem"
            class="profile-total-text text-center mb-0 lh-1"
            :class="Number(value)- Number(fields[key]) < 0 ? 'red' : Number(value)- Number(fields[key]) > 0 ? 'green' : ''"
          >
            {{ Number(value)- Number(fields[key]) }}
          </p>
        </div>
      </div>
    </div>

    <button
      type="button"
      class="profile-edit-button lh-1 fw-500"
      @click="toggleEdit"
    >
      {{ isEdit ? $t('Complete') : $t('Modify') }}
    </button>
  </div>
</template>

<script>
export default {
  name: 'CustomerProfile',
  props: {
    zoomRatio: {
      type: Number,
      default: 1,
    },
    person: {
      type: Object,
      required: true,
    },
    fields: {
      type: Object,
      required: true,
      default: () => ({}),
    },
  },
  data() {
    return {
      isEdit: false,
      editedPerson: {},
      editableFields: {},
    };
  },
  created() {
    this.editedPerson = { ...this.person };
  },
  methods: {
    toggleEdit() {
      if (this.isEdit) {
        this.$emit('save', this.editableFields);
      }

      this.isEdit = !this.isEdit;
    },
    handleValueChange(key, value) {
      this.$set(this.editableFields, key, Math.max(0, value));
    },
  },
  watch: {
    fields: {
      handler(newVal) {
        this.editableFields = { ...newVal };
      },
      immediate: true,
    },
  },
};
</script>
