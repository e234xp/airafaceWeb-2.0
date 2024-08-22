<template>
  <div class="profile">
    <div class="profile-content">
      <div
        class="profile-item"
        v-for="(value, key) in editableFields"
        :key="key"
      >
        <span class="profile-label lh-1">{{ key }}</span>
        <div class="profile-value lh-1">
          <span>{{ value }}</span>
        </div>
        <div
          v-if="isEdit"
          class="profile-buttons"
        >
          <button
            type="button"
            class="profile-minus-button fz-super-xLarge fw-500 lh-1"
            style="color: rgba(163, 0, 3, 1)"
          >
            -1
          </button>

          <button
            type="button"
            class="profile-plus-button fz-super-xLarge fw-500 lh-1"
            style="color: rgba(0, 133, 4, 1)"
          >
            +1
          </button>
        </div>
      </div>
    </div>

    <button
      type="button"
      class="profile-edit-button lh-1 fw-500"
      @click="toggleEdit"
    >
      {{ isEdit ? '完成' : '編輯' }}
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
  },
  data() {
    return {
      isEdit: false,
      editedPerson: {},
      editableFields: {
        果昔: '7',
        果盤: '999',
        牛奶: '3',
      },
    };
  },
  created() {
    this.editedPerson = { ...this.person };
  },
  methods: {
    toggleEdit() {
      console.log(this.isEdit);
      this.isEdit = !this.isEdit;
    },
    handleValueChange(key, value) {
      this.$set(this.editedPerson, key, Math.max(0, value));
    },
  },
};
</script>

<style lang="scss" scoped>
  $dashboard-customer: rgba(70, 58, 42, 1);
  $dashboard-customer-light: rgba(212, 195, 162, 1);

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
