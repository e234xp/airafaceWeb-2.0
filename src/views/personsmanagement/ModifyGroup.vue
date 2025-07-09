<template>
  <div>
    <CRow>
      <CCol sm="12">
        <CGroupForm :form-data="$data" :on-finish="onFinish" />
      </CCol>
    </CRow>
  </div>
</template>

<script>
  import CGroupForm from './forms/GroupForm.vue';

  export default {
    name: 'ModifyGroup',
    components: { CGroupForm },
    data() {
      return {
        value_returnRoutePath: this.$route.params.value_returnRoutePath ? this.$route.params.value_returnRoutePath : '',
        value_returnRouteName: this.$route.params.value_returnRouteName ? this.$route.params.value_returnRouteName : '',

        value_groupUuid: this.$route.params.item && this.$route.params.item.uuid ? this.$route.params.item.uuid : '',
        value_groupName: this.$route.params.item && this.$route.params.item.name ? this.$route.params.item.name : '',
        value_remarks: this.$route.params.item && this.$route.params.item.remarks ? this.$route.params.item.remarks : '',
        value_selectedPersonList: this.$route.params.item && this.$route.params.item.person_list ? this.$route.params.item.person_list : [],
        value_selectedVisitorList: this.$route.params.item && this.$route.params.item.visitor_list ? this.$route.params.item.visitor_list : [],

        disp_header: this.$t('ModifyGroup'),
        flag_modifyMode: true,
      };
    },
    created() {
      if (this.value_returnRoutePath === '') this.$router.push({ name: 'GroupManagement' });
    },
    mounted() {

    },
    methods: {
      onFinish(data, cb) {
        const dataForModify = {
          uuid: data.uuid,
          data: {
            remarks: data.remarks,
          },
        };
        let personUuidList = null;
        if (data.person_list) {
          personUuidList = [];
          data.person_list.forEach((person) => {
            personUuidList.push(person.uuid);
          });
          dataForModify.data.person_uuid_list = personUuidList;
        }

        let visitorUuidList = null;
        if (data.visitor_list) {
          visitorUuidList = [];
          data.visitor_list.forEach((visitor) => {
            visitorUuidList.push(visitor.uuid);
          });
          dataForModify.data.visitor_uuid_list = visitorUuidList;
        }
        this.$globalModifyGroup(dataForModify, (error, result) => {
          if (cb) cb(error == null, result);
        });
      },
    },
  };
</script>