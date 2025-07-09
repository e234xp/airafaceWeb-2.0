<template>
  <div>
    <CRow>
      <CCol sm="12">
        <CPersonForm :form-data="$data" :enable-admin-field="false" :modify-mode="true" :can-modify="canModify"
          :on-finish="onFinish" />
      </CCol>
    </CRow>
  </div>
</template>

<script>
  import CPersonForm from './forms/PersonForm.vue';

  const dayjs = require('dayjs');

  export default {
    name: 'ModifyVisitor',
    components: { CPersonForm },
    data() {
      const selectedGroupList = [];
      const assignedGroupList = [];
      if (this.$route.params.item) {
        if (this.$route.params.item.group_list) {
          const groups = this.$route.params.item.group_list || [];

          for (let i = 0; i < groups.length; i += 1) {
            if (!((groups[i] === 'All Person') || (groups[i] === 'All Visitor'))) {
              selectedGroupList.push(groups[i]);
            }
          }
        }
        if (this.$route.params.item.assigned_group_list) {
          this.$route.params.item.assigned_group_list.forEach((g) => {
            assignedGroupList.push(g);
          });
        }
      }

      return {
        value_returnRoutePath: this.$route.params.value_returnRoutePath ? this.$route.params.value_returnRoutePath : '',
        value_returnRouteName: this.$route.params.value_returnRouteName ? this.$route.params.value_returnRouteName : '',
        value_allPerson: this.$route.params.value_allPerson ? this.$route.params.value_allPerson : [],

        value_personUuid: this.$route.params.item && this.$route.params.item.uuid ? this.$route.params.item.uuid : '',
        value_personId: this.$route.params.item && this.$route.params.item.id ? this.$route.params.item.id : '',
        value_personName: this.$route.params.item && this.$route.params.item.name ? this.$route.params.item.name : '',
        value_cardNumber: this.$route.params.item && this.$route.params.item.card_number ? this.$route.params.item.card_number : '',
        value_emailAddress: this.$route.params.item && this.$route.params.item.extra_info.email
          ? this.$route.params.item.extra_info.email
          : '',
        value_department: this.$route.params.item && this.$route.params.item.extra_info.department
          ? this.$route.params.item.extra_info.department
          : '',
        value_jobTitle: this.$route.params.item && this.$route.params.item.extra_info.title ? this.$route.params.item.extra_info.title : '',
        value_extensionNumber: this.$route.params.item && this.$route.params.item.extra_info.extension_number
          ? this.$route.params.item.extra_info.extension_number
          : '',
        value_phoneNumber: this.$route.params.item && this.$route.params.item.extra_info.phone_number
          ? this.$route.params.item.extra_info.phone_number
          : '',
        value_effectiveDate: this.$route.params.item && this.$route.params.item.begin_date > 0
          ? dayjs(this.$route.params.item.begin_date).format('YYYY-MM-DD')
          : '',
        value_expireDate: this.$route.params.item && this.$route.params.item.expire_date > 0
          ? dayjs(this.$route.params.item.expire_date).format('YYYY-MM-DD')
          : '',
        value_remarks: this.$route.params.item && this.$route.params.item.extra_info.remarks
          ? this.$route.params.item.extra_info.remarks
          : '',
        value_selectedGroupList: selectedGroupList,
        value_assignedGroupList: assignedGroupList,
        value_photoToRegisterToShow: this.$route.params.item && this.$route.params.item.register_image
          ? `data:image/jpeg;base64,${this.$route.params.item.register_image}`
          : 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAAXNSR0IArs4c6QAAAERlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAA6ABAAMAAAABAAEAAK'
          + 'ACAAQAAAABAAAAAaADAAQAAAABAAAAAQAAAAD5Ip3+AAAADUlEQVQIHWM4ceLEfwAIDANYXmnp+AAAAABJRU5ErkJggg==',
        value_photoToDisplayToShow: this.$route.params.item && this.$route.params.item.display_image
          ? `data:image/jpeg;base64,${this.$route.params.item.display_image}`
          : 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAAXNSR0IArs4c6QAAAERlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAA6ABAAMAAAABAAEAAK'
          + 'ACAAQAAAABAAAAAaADAAQAAAABAAAAAQAAAAD5Ip3+AAAADUlEQVQIHWM4ceLEfwAIDANYXmnp+AAAAABJRU5ErkJggg==',
        value_photoToRegister: this.$route.params.item && this.$route.params.item.register_image ? this.$route.params.item.register_image : '',
        value_photoToDisplay: this.$route.params.item && this.$route.params.item.display_image ? this.$route.params.item.display_image : '',
        value_asAdmin: this.$route.params.item && this.$route.params.item.as_admin ? this.$route.params.item.as_admin : false,
        flag_currentSetp: 0,
        disp_header: this.$t('ModifyVisitor'),
        disp_inputPersonInfo: this.$t('InputVisitorInfo'),
        disp_selectRegisterPhoto: this.$t('SelectRegisterPhoto'),
        disp_complete: this.$t('Complete'),

        disp_personId: this.$t('VisitorId'),
        disp_personName: this.$t('VisitorName'),
      };
    },
    created() {
      if (this.value_returnRoutePath === '') this.$router.push({ name: 'VisitorManagement' });
    },
    methods: {
      canModify() {
        return true;
      },
      onFinish(data, cb) {
        const beginDate = (data.begin_date && data.begin_date.length > 0) ? new Date(`${data.begin_date.replaceAll('-', '/')} 00:00:00`).getTime() : 0;
        const expireDate = (data.expir_date && data.expir_date.length > 0) ? new Date(`${data.expir_date.replaceAll('-', '/')} 00:00:00`).getTime() : 0;

        if (data.group_list.indexOf('All Visitor') === -1) {
          data.group_list.push('All Visitor');
        }

        const dataForModify = {
          uuid: this.value_personUuid,
          data: {
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
          },
        };
        // console.log( JSON.stringify(dataForRegister) );
        this.$globalModifyVisitor(dataForModify, (error, result) => {
          if (cb) cb(error == null, result);
          // this.$router.push({ name: this.value_returnRoutePath })
        });
      },
    },
  };
</script>