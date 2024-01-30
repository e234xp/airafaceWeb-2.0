<template>
  <div>
    <CRow>
      <CCol sm="12">
        <CPersonForm
          :form-data="$data"
          :enable-admin-field="false"
          :modify-mode="false"
          :can-modify="canModify"
          :on-finish="onFinish"
        />
      </CCol>
    </CRow>
  </div>
</template>

<script>
import i18n from '@/i18n';
import CPersonForm from './forms/PersonForm.vue';

export default {
  name: 'AddVisitor',
  components: { CPersonForm },
  data() {
    return {
      value_returnRoutePath: this.$route.params.value_returnRoutePath ? this.$route.params.value_returnRoutePath : '',
      value_returnRouteName: this.$route.params.value_returnRouteName ? this.$route.params.value_returnRouteName : '',
      value_allPerson: this.$route.params.value_allPerson ? this.$route.params.value_allPerson : [],

      flag_currentSetp: 0,
      disp_header: i18n.formatter.format('AddVisitor'),
      disp_inputPersonInfo: i18n.formatter.format('InputVisitorInfo'),
      disp_selectRegisterPhoto: i18n.formatter.format('SelectRegisterPhoto'),
      disp_complete: i18n.formatter.format('Complete'),

      disp_personId: i18n.formatter.format('VisitorId'),
      disp_personName: i18n.formatter.format('VisitorName'),

      value_personId: '',
      value_personName: '',

      value_assignedGroupList: null,
    };
  },
  created() {
    if (this.value_returnRoutePath === '') this.$router.push({ name: 'VisitorManagement' });
  },
  methods: {
    canModify() {
      return !(this.$globalAiraManagerSettings.manager_enable === true);
    },
    onFinish(data, cb) {
      const self = this;
      const beginDate = (data.begin_date && data.begin_date.length > 0) ? new Date(`${data.begin_date.replaceAll('-', '/')} 00:00:00`).getTime() : 0;
      const expireDate = (data.expir_date && data.expir_date.length > 0) ? new Date(`${data.expir_date.replaceAll('-', '/')} 00:00:00`).getTime() : 0;

      if (data.group_list.indexOf('All Visitor') === -1) {
        data.group_list.push('All Visitor');
      }

      const dataForRegister = {
        id: `${data.id}`,
        name: `${data.name}`,
        card_number: `${data.card_number}`,
        begin_date: beginDate || 0,
        expire_date: expireDate || 0,
        group_list: data.group_list || [],
        card_facility_code: '',
        display_image: `${data.display_image}`,
        register_image: `${data.register_image}`,
        as_admin: false,
        extra_info: {
          title: `${data.title}`,
          department: `${data.department}`,
          email: `${data.email}`,
          phone_number: `${data.phone_number}`,
          extension_number: `${data.extension_number}`,
          remarks: `${data.remarks}`,
        },
      };
      // console.log( JSON.stringify(dataForRegister) );
      self.$globalCreateVisitor(dataForRegister, (error, result) => {
        if (cb) cb(error == null, result);
        // self.$router.push({ name: self.value_returnRoutePath })
      });
    },
  },
};
</script>
