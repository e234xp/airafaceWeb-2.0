<template>
  <div>
    <CRow>
      <CCol sm="12">
        <CGroupForm
          :form-data="$data"
          :on-finish="onFinish"
        />
      </CCol>
    </CRow>
  </div>
</template>

<script>
import CGroupForm from './forms/GroupForm.vue';

export default {
  name: 'CreateGroup',
  components: { CGroupForm },
  data() {
    return {
      value_returnRoutePath: this.$route.params.value_returnRoutePath ? this.$route.params.value_returnRoutePath : '',
      value_returnRouteName: this.$route.params.value_returnRouteName ? this.$route.params.value_returnRouteName : '',
      value_group_list: this.$route.params.value_group_list ? this.$route.params.value_group_list : [],

      disp_header: this.$t('CreateGroup'),
      flag_modifyMode: false,
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
        name: data.name,
        remarks: data.remarks,
      };
      let personUuidList = null;
      if (data.person_list) {
        personUuidList = [];
        data.person_list.forEach((person) => {
          personUuidList.push(person.uuid);
        });
        dataForModify.person_uuid_list = personUuidList;
      }

      let visitorUuidList = null;
      if (data.visitor_list) {
        visitorUuidList = [];
        data.visitor_list.forEach((visitor) => {
          visitorUuidList.push(visitor.uuid);
        });
        dataForModify.visitor_uuid_list = visitorUuidList;
      }
      this.$globalCreateGroup(dataForModify, (error, result) => {
        if (cb) cb(error == null, result);
      });
    },
  },
};
</script>
