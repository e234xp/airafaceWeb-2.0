<template>
  <div style="overflow-y: scroll;">
    <div
      class="list-group-item"
      v-for="(item) in dataFields"
      :key="item.value"
    >
      <input
        class="form-check-input me-1"
        type="checkbox"
        value="item"
        :checked="dataSelected.indexOf(item.value) >= 0"
        :disabled="!checkImage(item.value)"
        @change="dataFieldChanged(item.value, $event)"
      >
      {{ $t(item.label) }}
      <CButton
        style="float:right; width: 40px; min-width:unset;"
        v-show="dataSelected.indexOf(item.value) >= 0"
        @click="dataFieldMove(item.value, -1)"
      >
        <CIcon name="cil-arrow-thick-top" />
      </CButton>
      <CButton
        style="float:right; width: 40px; min-width:unset;"
        v-show="dataSelected.indexOf(item.value) >= 0"
        @click="dataFieldMove(item.value, 1)"
      >
        <CIcon name="cil-arrow-thick-bottom" />
      </CButton>
    </div>
    <div
      class="list-group-item"
      v-for="(item) in personFields"
      :key="item.value"
    >
      <input
        class="form-check-input me-1"
        type="checkbox"
        value="item"
        :checked="personSelected.indexOf(item.value) >= 0"
        :disabled="!checkImage(item.value)"
        @change="personFieldChanged(item.value, $event)"
      >
      {{ $t(item.label) }}
      <CButton
        style="float:right; width: 40px; min-width:unset;"
        v-show="personSelected.indexOf(item.value) >= 0"
        @click="personFieldMove(item.value, -1)"
      >
        <CIcon name="cil-arrow-thick-top" />
      </CButton>
      <CButton
        style="float:right; width: 40px; min-width:unset;"
        v-show="personSelected.indexOf(item.value) >= 0"
        @click="personFieldMove(item.value, 1)"
      >
        <CIcon name="cil-arrow-thick-bottom" />
      </CButton>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DataFieldList',
  props: {
    dataFields: {
      type: Array,
      required: true,
      default: () => [],
    },
    personFields: {
      type: Array,
      required: true,
      default: () => [],
    },
    data: {
      type: Object,
      required: true,
      default: () => ({}),
    },
  },
  emits: ['update:data'],
  data() {
    return {
      dataSelected: [],
      personSelected: [],
    };
  },
  watch: {
    data: {
      handler() {
        this.dataSelected = [];
        this.personSelected = [];
        Object.keys(this.data).forEach((key) => {
          if (key === 'display_image' && this.data.display_image !== '') {
            switch (this.data.display_image) {
              case 'captured':
                this.dataSelected.push('captured');
                break;
              case 'register':
                this.dataSelected.push('register');
                break;
              case 'display':
                this.dataSelected.push('display');
                break;
              default:
                break;
            }
          } else if (key === 'person' && this.data.person) {
            const personKeyList = Object.keys(this.data.person);
            personKeyList.forEach((personKey) => {
              if (this.data.person[personKey]) {
                this.personSelected.push(`person.${[personKey]}`);
              }
            });
          } else if (this.data[key]) {
            this.dataSelected.push(key);
          }
        });
      },
      deep: true,
      immediate: true,
    },
  },
  methods: {
    checkImage(key) {
      const imageList = ['captured', 'register', 'display'];
      const filter = imageList.filter((item) => item !== key);
      if (filter.length === imageList.length) return true;
      return filter.every((item) => this.dataSelected.indexOf(item) < 0);
    },
    dataFieldChanged(item, evt) {
      console.log(item, evt.target.checked, this.dataSelected);
      const temp = this.dataSelected.map((d) => d);
      if (evt.target.checked) {
        this.dataSelected.push(item);
      } else {
        const idx = temp.indexOf(item);
        if (idx >= 0) {
          this.dataSelected.splice(idx, 1);
        }
      }
      this.updateSelected();
    },
    dataFieldMove(item, step) {
      console.log('dataFieldMove 1', this.dataSelected);

      const idx = this.dataSelected.findIndex((d) => d === item);

      console.log('dataFieldMove 2', idx, this.dataSelected.length);

      if (idx < 0) return;
      if ((step === -1) && (idx === 0)) return;
      if ((step === 1) && (idx === this.dataSelected.length - 1)) return;

      console.log('dataFieldMove 3', idx);

      const nIdx = idx + step;
      const temp = this.dataSelected[idx];
      this.dataSelected[idx] = this.dataSelected[nIdx];
      this.dataSelected[nIdx] = temp;
      this.updateSelected();
    },
    personFieldChanged(item, evt) {
      const temp = this.personSelected.map((d) => d);
      if (evt.target.checked) {
        this.personSelected.push(item);
      } else {
        const idx = temp.indexOf(item);
        if (idx >= 0) {
          this.personSelected.splice(idx, 1);
        }
      }
      this.updateSelected();
    },
    personFieldMove(item, step) {
      const idx = this.personSelected.findIndex((d) => d === item);

      if (idx < 0) return;
      if ((step === -1) && (idx === 0)) return;
      if ((step === 1) && (idx === this.personSelected.length - 1)) return;

      const nIdx = idx + step;
      const temp = this.personSelected[idx];
      this.personSelected[idx] = this.personSelected[nIdx];
      this.personSelected[nIdx] = temp;
      this.updateSelected();
    },
    updateSelected() {
      const temp = {};
      this.dataSelected.forEach((key) => {
        if (key === 'captured' || key === 'register' || key === 'display') {
          temp.display_image = key;
        } else {
          temp[key] = true;
        }
      });
      this.personSelected.forEach((key) => {
        const [person, value] = key.split('.');
        if (!temp[person]) {
          temp[person] = {};
        }
        temp[person][value] = true;
      });
      this.$emit('update:data', temp);
    },
  },
};
</script>

<style scoped>
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
