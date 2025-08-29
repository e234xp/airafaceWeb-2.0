<template>
  <div class="data-field-section">
    <div
      v-for="(item) in fields"
      :key="item.value"
      class="list-group-item"
    >
      <input
        class="form-check-input me-1"
        type="checkbox"
        :checked="isSelected(item.value)"
        :disabled="!checkImage(item.value)"
        @change="fieldChanged(item.value, $event)"
      >
      {{ $t(item.label) }}
      <CButton
        v-show="isSelected(item.value)"
        style="float:right; width: 40px; min-width:unset;"
        @click="fieldMove(item.value, -1)"
      >
        <CIcon name="cil-arrow-thick-top" />
      </CButton>
      <CButton
        v-show="isSelected(item.value)"
        style="float:right; width: 40px; min-width:unset;"
        @click="fieldMove(item.value, 1)"
      >
        <CIcon name="cil-arrow-thick-bottom" />
      </CButton>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DataFieldSection',
  props: {
    fields: {
      type: Array,
      required: true,
      default: () => [],
    },
    selected: {
      type: Object,
      required: true,
      default: () => ({}),
    },
    fieldType: {
      type: String,
      required: true,
      validator: (value) => ['event', 'person'].includes(value),
    },
  },
  emits: ['update:data'],
  data() {
    return {
      selectedKeys: [],
    };
  },
  watch: {
    selected: {
      handler() {
        this.updateSelectedKeys();
      },
      deep: true,
      immediate: true,
    },
  },
  methods: {
    updateSelectedKeys() {
      this.selectedKeys = [];
      
      if (this.fieldType === 'event') {
        // 處理辨識資料
        Object.keys(this.selected).forEach((key) => {
          if (key === 'display_image' && this.selected.display_image !== '') {
            switch (this.selected.display_image) {
              case 'captured':
                this.selectedKeys.push('captured');
                break;
              case 'register':
                this.selectedKeys.push('register');
                break;
              case 'display':
                this.selectedKeys.push('display');
                break;
              default:
                break;
            }
          } else if (this.selected[key]) {
            this.selectedKeys.push(key);
          }
        });
      } else if (this.fieldType === 'person') {
        // 處理人員資料 - 直接處理 personData 層級
        Object.keys(this.selected).forEach((key) => {
          if (this.selected[key]) {
            this.selectedKeys.push(`person.${key}`);
          }
        });
      }
    },
    isSelected(value) {
      return this.selectedKeys.indexOf(value) >= 0;
    },
    checkImage(key) {
      if (this.fieldType !== 'event') return true;
      
      const imageList = ['captured', 'register', 'display'];
      const filter = imageList.filter((item) => item !== key);
      if (filter.length === imageList.length) return true;
      return filter.every((item) => this.selectedKeys.indexOf(item) < 0);
    },
    fieldChanged(item, evt) {
      const temp = [...this.selectedKeys];
      if (evt.target.checked) {
        this.selectedKeys.push(item);
      } else {
        const idx = temp.indexOf(item);
        if (idx >= 0) {
          this.selectedKeys.splice(idx, 1);
        }
      }
      this.updateSelected();
    },
    fieldMove(item, step) {
      const idx = this.selectedKeys.findIndex((d) => d === item);
      
      if (idx < 0) return;
      if ((step === -1) && (idx === 0)) return;
      if ((step === 1) && (idx === this.selectedKeys.length - 1)) return;
      
      const nIdx = idx + step;
      const temp = this.selectedKeys[idx];
      this.selectedKeys[idx] = this.selectedKeys[nIdx];
      this.selectedKeys[nIdx] = temp;
      this.updateSelected();
    },
    updateSelected() {
      let temp = {};
      
      if (this.fieldType === 'event') {
        // 處理辨識資料
        this.selectedKeys.forEach((key) => {
          if (key === 'captured' || key === 'register' || key === 'display') {
            temp.display_image = key;
          } else {
            temp[key] = true;
          }
        });
      } else if (this.fieldType === 'person') {
        // 處理人員資料 - 直接輸出到 personData 層級
        temp = {};
        this.selectedKeys.forEach((key) => {
          const [person, value] = key.split('.');
          if (person === 'person' && value) {
            temp[value] = true;
          }
        });
      }
      
      this.$emit('update:data', temp);
    },
  },
};
</script>

<style scoped>
.data-field-section {
  /* 繼承原有的樣式 */
}

.list-group-item {
  padding-left: 30px !important;
  padding-top: 5px;
  padding-right: 30px;
  padding-bottom: 5px;
  line-height: 40px;
  font-size: 18px;
}

.form-check-input {
  margin-top: 0.8rem;
}
</style>