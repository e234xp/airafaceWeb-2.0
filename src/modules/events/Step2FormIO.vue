<template>
  <section>
    <!-- Brand -->
    <CCard>
      <CCardHeader>
        <span class="h3">{{ $t('I/OBoxesBasicName') }}</span>
      </CCardHeader>
      <CCardBody>
        <table class="table-layout">
          <tr>
            <th class="h5 w-50 table-th">
              {{ $t('I/OBoxesBasicCOlNameBrand') }}
            </th>
            <th class="h5 w-50 table-th">
              {{ $t('I/OBoxesBasicCOlNameModel') }}
            </th>
          </tr>
          <tr class="table-tr">
            <td class="table-td">
              <CSelect
                size="lg"
                class="font-control mt-2"
                :filterable="true"
                :value.sync="form.brand"
                :options="value_brandList"
              />
            </td>
            <td class="table-td">
              <CSelect
                size="lg"
                class="font-control mt-2"
                :filterable="true"
                :value.sync="form.model"
                :options="value_modelList"
              />
            </td>
          </tr>
        </table>
      </CCardBody>
    </CCard>

    <!-- Connection -->
    <CCard>
      <CCardHeader>
        <span class="h3">{{ $t('I/OBoxesBasicTitleNameConnection') }}</span>
      </CCardHeader>
      <CCardBody>
        <table class="table-layout">
          <tr>
            <th class="h5 w-50 table-th">
              {{ $t('I/OBoxesBasicCOlNameIP') }}
            </th>
            <th class="h5 w-50 table-th">
              {{ $t('I/OBoxesBasicCOlNamePort') }}
            </th>
          </tr>
          <tr class="table-tr">
            <td class="table-td">
              <CInput
                size="lg"
                class="mt-2"
                required
                :invalid-feedback="checkIpAddr(form.host)"
                :is-valid="formPass.host = checkIpAddr(form.host) === ''"
                v-model="form.host"
              />
            </td>
            <td class="table-td">
              <CInput
                size="lg"
                class="mt-2"
                required
                :invalid-feedback="checkPort(form.port)"
                :is-valid="formPass.port = checkPort(form.port) === ''"
                v-model.number="form.port"
              />
            </td>
          </tr>

          <tr>
            <th class="h5 w-50 table-th">
              {{ $t('I/OBoxesBasicCOlNameUserName') }}
            </th>
            <th class="h5 w-50 table-th">
              {{ $t('I/OBoxesBasicCOlNamePassword') }}
            </th>
          </tr>
          <tr class="table-tr">
            <td class="table-td">
              <CInput
                size="lg"
                class="mt-2"
                v-model="form.user"
              />
            </td>
            <td class="table-td">
              <CInput
                size="lg"
                class="mt-2"
                :type="flag_view_password ? 'text' : 'password'"
                v-model="form.pass"
              >
                <template #append-content>
                  <CButton
                    @click="viewPassword"
                    style="padding: 0.375rem 0.375rem;"
                  >
                    <CIcon
                      v-show="flag_view_password"
                      src="/img/eye-slash.png"
                    />
                    <CIcon
                      v-show="!flag_view_password"
                      src="/img/eye.png"
                    />
                  </CButton>
                </template>
              </CInput>
            </td>
          </tr>
        </table>
      </CCardBody>
    </CCard>

    <!-- Digital OutPut 1 -->
    <template v-if="form.iopoint && form.iopoint.length > 0">
      <CCard
        v-for="idx in [0, 1]"
        :key="idx"
      >
        <CCardHeader>
          <span class="h3">{{ `${$t('DigitalOutput')} #${idx + 1}` }}</span>
        </CCardHeader>
        <CCardBody>
          <table class="table-layout">
            <tr>
              <th class="h5 w-50 table-th">
                {{ $t('I/OBoxesBasicCOlNameEnable') }}
              </th>
              <th class="h5 w-50 table-th" />
            </tr>
            <tr class="table-tr">
              <td class="table-td">
                <CSwitch
                  size="lg"
                  class="ml-0 mt-2"
                  color="success"
                  shape="pill"
                  :checked="form.iopoint[idx].enable"
                  @update:checked="$set(form.iopoint[idx], 'enable', $event)"
                />
              </td>
              <td class="table-td" />
            </tr>
            <tr>
              <th class="h5 w-50 table-th">
                {{ $t('I/OBoxesBasicCOlNameValueWhenTriggered') }}
              </th>
              <th class="h5 w-50 table-th">
                {{ $t('I/OBoxesBasicCOlNameDurationWhenTriggered') }}
              </th>
            </tr>
            <tr class="table-tr">
              <td class="table-td">
                <CSelect
                  size="lg"
                  class="font-control mt-2"
                  :filterable="true"
                  :placeholder="$t('placeholder')"
                  :value.sync="form.iopoint[idx].trigger"
                  :options="value_deviceTrigger"
                  :disabled="!form.iopoint[idx].enable"
                />
              </td>
              <td class="table-td">
                <CInput
                  size="lg"
                  class="mt-2"
                  pattern="[0-9]*"
                  required
                  :disabled="!form.iopoint[idx].enable || (idx === 1 && isDurationLinked)"
                  :is-valid="form.iopoint[idx].enable ? checkDelay(form.iopoint[idx].delay) === '' : null"
                  :invalid-feedback="checkDelay(form.iopoint[idx].delay)"
                  v-model.number="form.iopoint[idx].delay"
                />
              </td>
            </tr>
          </table>
        </CCardBody>
      </CCard>
    </template>
  </section>
</template>

<script>

export default {
  name: 'Step2FormIO',
  props: {
    checkPort: {
      type: Function,
      required: true,
      default: () => '',
    },
    checkIpAddr: {
      type: Function,
      required: true,
      default: () => '',
    },
    checkDelay: {
      type: Function,
      required: true,
      default: () => '',
    },
    isNotEmptyValidator: {
      type: Function,
      required: true,
      default: () => '',
    },
    form: {
      type: Object,
      required: true,
      default: () => ({}),
    },
    formPass: {
      type: Object,
      required: true,
      default: () => ({}),
    },
  },
  data() {
    return {
      value_deviceGroupsList: ['A', 'B'],
      value_brandList: ['airaIO box'],
      value_modelList: ['TCP-KP-C2'],
      value_deviceDefaultValue: [{ label: '0', value: false }, { label: '1', value: true }],
      value_deviceTrigger: [{ label: '0', value: false }, { label: '1', value: true }],

      flag_view_password: false,
    };
  },
  computed: {
    // 停用的接點不參與驗證，否則欄位已經 disabled 卻擋著不讓進下一步
    isDelayValid() {
      return (this.form.iopoint || []).every((point) => !point.enable || this.checkDelay(point.delay) === '');
    },

    // 兩個接點都啟用、而且觸發時的值相同時，等於是同一組輸出，
    // 持續時間只由接點 1 控制，接點 2 跟著走
    isDurationLinked() {
      const points = this.form.iopoint || [];
      if (points.length < 2) return false;

      return (
        Boolean(points[0].enable)
        && Boolean(points[1].enable)
        && this.toTriggerValue(points[0].trigger) === this.toTriggerValue(points[1].trigger)
      );
    },

    primaryDelay() {
      const points = this.form.iopoint || [];
      return points.length > 0 ? points[0].delay : null;
    },
  },
  watch: {
    // formPass.delay 是兩個接點共用的一個 key，寫在 template 裡會被後畫的那張卡片蓋掉，
    // 改由這裡統一寫入
    isDelayValid: {
      handler(valid) {
        this.formPass.delay = valid;
      },
      immediate: true,
    },

    isDurationLinked: {
      handler() {
        this.syncLinkedDelay();
      },
      immediate: true,
    },

    primaryDelay() {
      this.syncLinkedDelay();
    },
  },
  methods: {
    viewPassword() {
      this.flag_view_password = !this.flag_view_password;
    },

    // 觸發值可能是 boolean，舊資料也可能存成 0 / 1 或字串，統一成 boolean 再比較
    toTriggerValue(value) {
      return value === true || value === 1 || value === '1' || value === 'true';
    },

    syncLinkedDelay() {
      if (!this.isDurationLinked) return;

      this.$set(this.form.iopoint[1], 'delay', this.form.iopoint[0].delay);
    },
  },
};
</script>
