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
              <CSelect size="lg" class="font-control mt-2" :filterable="true" :value.sync="form.brand"
                :options="value_brandList" />
            </td>
            <td class="table-td">
              <CSelect size="lg" class="font-control mt-2" :filterable="true" :value.sync="form.model"
                :options="value_modelList" />
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
              <CInput size="lg" class="mt-2" required :invalid-feedback="checkIpAddr(form.host)"
                :is-valid="formPass.host = checkIpAddr(form.host) === ''" v-model="form.host" />
            </td>
            <td class="table-td">
              <CInput size="lg" class="mt-2" required :invalid-feedback="checkPort(form.port)"
                :is-valid="formPass.port = checkPort(form.port) === ''" v-model.number="form.port" />
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
              <CInput size="lg" class="mt-2" v-model="form.user" />
            </td>
            <td class="table-td">
              <CInput size="lg" class="mt-2" :type="flag_view_password ? 'text' : 'password'" v-model="form.pass">
                <template #append-content>
                  <CButton @click="viewPassword" style="padding: 0.375rem 0.375rem;">
                    <CIcon v-show="flag_view_password" src="/img/eye-slash.png" />
                    <CIcon v-show="!flag_view_password" src="/img/eye.png" />
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
      <CCard v-for="idx in [0, 1]" :key="idx">
        <CCardHeader>
          <span class="h3">{{ `${$t('DigitalOutput')} #${idx + 1}` }}</span>
        </CCardHeader>
        <CCardBody>
          <table class="table-layout">
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
                <CSelect size="lg" class="font-control mt-2" :filterable="true" :placeholder="$t('placeholder')"
                  :disabled="!form.iopoint[idx].enable" :value.sync="form.iopoint[idx].trigger"
                  :options="value_deviceTrigger" />
              </td>
              <td class="table-td">
                <CInput size="lg" class="mt-2" pattern="[0-9]*" required :disabled="!form.iopoint[idx].enable"
                  :is-valid="formPass.delay = checkDelay(form.iopoint[idx].delay) === ''"
                  :invalid-feedback="checkDelay(form.iopoint[idx].delay)" v-model.number="form.iopoint[idx].delay" />
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
    methods: {
      viewPassword() {
        this.flag_view_password = !this.flag_view_password;
      },
    },
  };
</script>