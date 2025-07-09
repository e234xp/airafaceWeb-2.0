<template>
  <section>
    <CCard>
      <CCardBody>
        <table class="table-layout">
          <tr>
            <th class="h5 w-50 table-th">
              {{ $t('WiegandBasicCOlNameIP') }}
            </th>
            <th class="h5 w-50 table-th">
              {{ $t('WiegandBasicCOlNamePort') }}
            </th>
          </tr>
          <tr class="table-tr">
            <td class="table-td">
              <CInput size="lg" class="mt-2" required :is-valid="formPass.host = checkIpAddr(form.host) === ''"
                :invalid-feedback="checkIpAddr(form.host)" v-model="form.host" />
            </td>
            <td class="table-td">
              <CInput size="lg" class="mt-2" required :is-valid="formPass.port = checkPort(form.port) === ''"
                :invalid-feedback="checkPort(form.port)" v-model.number="form.port" />
            </td>
          </tr>

          <tr>
            <th class="h5 w-50 table-th">
              {{ $t('WiegandBasicCOlNameDataFormat') }}
            </th>
            <th />
          </tr>
          <tr class="table-tr">
            <td class="table-td">
              <CSelect size="lg" class="font-control mt-2" :options="value_DataFormatBitsList" :filterable="true"
                :placeholder="$t('placeholder')" :value.sync="form.bits" />
            </td>
            <td />
          </tr>

          <tr>
            <th class="h5 w-50 table-th">
              {{ $t('WiegandBasicCOlNameIndex') }}
            </th>
            <th class="h5 w-50 table-th">
              {{ $t('WiegandBasicCOlNameSystemCode') }}
            </th>
          </tr>
          <tr class="table-tr">
            <td class="table-td">
              <CInput size="lg" class="mt-2" required :is-valid="formPass.index = checkIndex(form.index) === ''"
                :invalid-feedback="checkIndex(form.index)" v-model.number="form.index" />
            </td>
            <td class="table-td">
              <CInput size="lg" class="mt-2" required :invalid-feedback="checkSyscode(form.syscode)"
                :is-valid="formPass.syscode = checkSyscode(form.syscode) === ''" v-model.number="form.syscode" />
            </td>
          </tr>

          <tr>
            <th class="h5 w-50 table-th">
              {{ $t('SpecialCardNumber') }}
            </th>
            <th />
          </tr>
          <tr class="table-tr">
            <td class="table-td">
              <CInput size="lg" class="mt-2" v-model="form.specialCardNumber" />
            </td>
            <td />
          </tr>
        </table>

        <!-- 圖片 -->
        <CRow sm="12">
          <CCol sm="12">
            <!-- eslint-disable max-len -->
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
              <g id="Layer 2">
                <path id="Vector"
                  d="M14 27.4375C11.3423 27.4375 8.74432 26.6494 6.53453 25.1729C4.32475 23.6964 2.60243 21.5977 1.58537 19.1423C0.568322 16.6869 0.302215 13.9851 0.820704 11.3785C1.33919 8.77186 2.61899 6.37753 4.49826 4.49826C6.37753 2.61899 8.77186 1.33919 11.3785 0.820704C13.9851 0.302215 16.6869 0.568322 19.1423 1.58537C21.5977 2.60243 23.6964 4.32475 25.1729 6.53453C26.6494 8.74432 27.4375 11.3423 27.4375 14C27.4335 17.5626 26.0165 20.9782 23.4974 23.4974C20.9782 26.0165 17.5626 27.4335 14 27.4375ZM14 2.43751C11.7132 2.43751 9.47767 3.11563 7.57623 4.38614C5.67478 5.65664 4.19279 7.46246 3.31765 9.57523C2.44251 11.688 2.21353 14.0128 2.65968 16.2557C3.10582 18.4986 4.20704 20.5589 5.82408 22.1759C7.44113 23.793 9.50137 24.8942 11.7443 25.3403C13.9872 25.7865 16.312 25.5575 18.4248 24.6824C20.5376 23.8072 22.3434 22.3252 23.6139 20.4238C24.8844 18.5223 25.5625 16.2869 25.5625 14C25.5592 10.9345 24.3399 7.99541 22.1723 5.82774C20.0046 3.66007 17.0656 2.44081 14 2.43751Z"
                  fill="black" />
                <path id="Vector_2"
                  d="M14 19.9375C13.7514 19.9375 13.5129 19.8387 13.3371 19.6629C13.1613 19.4871 13.0625 19.2486 13.0625 19V12.75C13.0625 12.5014 13.1613 12.2629 13.3371 12.0871C13.5129 11.9113 13.7514 11.8125 14 11.8125C14.2486 11.8125 14.4871 11.9113 14.6629 12.0871C14.8387 12.2629 14.9375 12.5014 14.9375 12.75V19C14.9375 19.2486 14.8387 19.4871 14.6629 19.6629C14.4871 19.8387 14.2486 19.9375 14 19.9375Z"
                  fill="black" />
                <path id="Vector_3"
                  d="M14 10.25C14.6904 10.25 15.25 9.69036 15.25 9C15.25 8.30964 14.6904 7.75 14 7.75C13.3096 7.75 12.75 8.30964 12.75 9C12.75 9.69036 13.3096 10.25 14 10.25Z"
                  fill="black" />
              </g>
            </svg>
            <!-- eslint-enable max-len -->
            {{ $t('SpecialCardHint') }}
          </CCol>
        </CRow>
      </CCardBody>
    </CCard>
  </section>
</template>

<script>
  import i18n from '@/i18n';

  export default {
    name: 'Step2FormWiegand',
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
        value_DataFormatBitsList: [{ label: '26-bit', value: 26 }, { label: '34-bit', value: 34 }],
      };
    },
    methods: {
      checkIndex(value) {
        return Number.isInteger(value) && value >= 0 && value <= 100 ? '' : i18n.formatter.format('InvalidEmailFormat');
      },
      checkSyscode(value) {
        return Number.isInteger(value) && value >= 0 && value <= 255 ? '' : i18n.formatter.format('InvalidEmailFormat');
      },
    },
  };

</script>