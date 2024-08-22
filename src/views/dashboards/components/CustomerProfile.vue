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
            class="profile-minus-button red fz-super-xLarge fw-500 lh-1"
            @click="handleValueChange(key, Number(value) - 1)"
          >
            -1
          </button>

          <button
            type="button"
            class="profile-plus-button green fz-super-xLarge fw-500 lh-1"
            @click="handleValueChange(key, Number(value) + 1)"
          >
            +1
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

<style lang="scss" scoped>
  $dashboard-customer: rgba(70, 58, 42, 1);
  $dashboard-customer-light: rgba(212, 195, 162, 1);

  $red: rgba(163, 0, 3, 1);
  $green: rgba(0, 133, 4, 1);

  .red {
    color: $red !important;
  }

  .green {
    color: $green !important;
  }

  .profile-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 2.5rem;
  }

  .profile-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    gap: 3.75rem;
  }

  .profile-label {
    font-weight: 500;
    font-size: 5rem;
    color: $dashboard-customer;
  }

  .profile-value {
    text-align: center;
    font-weight: 500;
    font-size: 7.5rem;
    color: rgba(34, 34, 34, 1);
  }

  .profile-buttons {
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 1.5rem;
  }

  .profile-plus-button,
  .profile-minus-button {
    flex: 1;
    border: 4px solid $dashboard-customer;
    padding: 0.75rem 0;
    border-radius: 1.25rem;
    background-color: transparent;
  }

  .profile-total {
    margin-top: 3.125rem;
    border: 4px solid white;
    border-radius: 1.25rem;
    padding: 2.25rem 0;
  }

  .profile-total-text {
    font-size: 3rem;
    font-weight: 500;
    color: $dashboard-customer;
  }

  .profile-total-title {
    @extend .profile-total-text;
    margin-bottom: 2rem;
  }

  .profile-total-content {
    display: flex;
    align-items: center;
    gap: 1.5rem;
  }

  .profile-total-content-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 2.5rem;
  }

  .profile-edit-button {
    position: absolute;
    left: 50%;
    bottom: 2rem;
    transform: translateX(-50%);
    width: 20rem;
    border-radius: 1.25rem;
    border: 4px solid $dashboard-customer;
    color: white;
    background-color: $dashboard-customer;
    padding: 1.375rem;
    font-size: 3rem;
    cursor: pointer;
  }
</style>
