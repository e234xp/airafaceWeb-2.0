<template>
  <div class="data-field-section">
    <!-- 已選欄位按選擇順序顯示 -->
    <div
      v-for="(selectedKey, index) in displaySelectedKeys"
      :key="`selected-${selectedKey}`"
      class="list-group-item selected-item"
    >
      <input
        class="form-check-input me-1"
        type="checkbox"
        :checked="true"
        :disabled="!checkImage(getOriginalKey(selectedKey))"
        @change="fieldChanged(getOriginalKey(selectedKey), $event)"
      >
      {{ getFieldLabel(selectedKey) }}
      <CButton
        v-show="index > 0"
        style="float:right; width: 40px; min-width:unset;"
        @click="fieldMove(getOriginalKey(selectedKey), -1)"
      >
        <CIcon name="cil-arrow-thick-top" />
      </CButton>
      <CButton
        v-show="index < displaySelectedKeys.length - 1"
        style="float:right; width: 40px; min-width:unset;"
        @click="fieldMove(getOriginalKey(selectedKey), 1)"
      >
        <CIcon name="cil-arrow-thick-bottom" />
      </CButton>
    </div>
    
    <!-- 未選欄位 -->
    <div
      v-for="(item) in unselectedFields"
      :key="`unselected-${item.value}`"
      class="list-group-item unselected-item"
    >
      <input
        class="form-check-input me-1"
        type="checkbox"
        :checked="false"
        :disabled="!checkImage(item.value)"
        @change="fieldChanged(item.value, $event)"
      >
      {{ $t(item.label) }}
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
  computed: {
    displaySelectedKeys() {
      return this.selectedKeys.map(key => {
        // 如果是人員欄位，移除 person. 前綴以便顯示
        if (this.fieldType === 'person' && key.startsWith('person.')) {
          return key.replace('person.', '');
        }
        return key;
      });
    },
    unselectedFields() {
      return this.fields.filter(field => !this.isSelected(field.value));
    },
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
        if (this.selected.selectedFields && Array.isArray(this.selected.selectedFields)) {
          // 處理陣列格式的已選欄位，保持順序（包含所有欄位類型）
          this.selected.selectedFields.forEach(field => {
            this.selectedKeys.push(field);
          });
        } else {
          // 處理舊格式，轉換為新的統一格式
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
            } else if (this.selected[key] === true) {
              this.selectedKeys.push(key);
            }
          });
        }
      } else if (this.fieldType === 'person') {
        // 處理人員資料
        if (this.selected.selectedFields && Array.isArray(this.selected.selectedFields)) {
          // 處理陣列格式的已選欄位，保持順序
          this.selected.selectedFields.forEach(field => {
            this.selectedKeys.push(`person.${field}`);
          });
        } else {
          // 處理舊格式的布林值欄位
          Object.keys(this.selected).forEach((key) => {
            if (this.selected[key] === true) {
              this.selectedKeys.push(`person.${key}`);
            }
          });
        }
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
      // 檢查其他圖片類型是否已被選取
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
      
      // 創建新陣列來確保 Vue 響應式更新
      const newSelectedKeys = [...this.selectedKeys];
      const temp = newSelectedKeys[idx];
      newSelectedKeys[idx] = newSelectedKeys[nIdx];
      newSelectedKeys[nIdx] = temp;
      
      // 使用 Vue.set 或直接替換整個陣列來確保響應式更新
      this.selectedKeys = newSelectedKeys;
      this.updateSelected();
    },
    updateSelected() {
      let temp = {};
      
      if (this.fieldType === 'event') {
        // 處理辨識資料 - 所有欄位統一使用陣列保持順序
        const eventArray = [];
        this.selectedKeys.forEach((key) => {
          eventArray.push(key);
        });
        if (eventArray.length > 0) {
          temp.selectedFields = eventArray;
        }
      } else if (this.fieldType === 'person') {
        // 處理人員資料 - 使用陣列保持順序
        const personArray = [];
        this.selectedKeys.forEach((key) => {
          const [person, value] = key.split('.');
          if (person === 'person' && value) {
            personArray.push(value);
          }
        });
        if (personArray.length > 0) {
          temp.selectedFields = personArray;
        }
      }
      
      this.$emit('update:data', temp);
    },
    getOriginalKey(displayKey) {
      // 如果是人員欄位，需要加回 person. 前綴
      if (this.fieldType === 'person') {
        return `person.${displayKey}`;
      }
      return displayKey;
    },
    getFieldLabel(displayKey) {
      // 根據 displayKey 找到對應的欄位標籤
      const field = this.fields.find(f => {
        if (this.fieldType === 'person') {
          return f.value === `person.${displayKey}`;
        }
        return f.value === displayKey;
      });
      return field ? this.$t(field.label) : displayKey;
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

.selected-item {
  background-color: #e3f2fd;
  border-left: 3px solid #2196f3;
}

.unselected-item {
  background-color: #f8f9fa;
  opacity: 0.7;
}

.form-check-input {
  margin-top: 0.8rem;
}
</style>