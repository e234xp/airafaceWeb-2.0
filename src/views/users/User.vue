<template>
  <CRow>
    <CCol col="12" lg="6">
      <CCard>
        <CCardHeader>
          User id: {{ $route.params.id }}
        </CCardHeader>
        <CCardBody>
          <CDataTable striped small fixed :items="visibleData" :fields="fields" />
        </CCardBody>
        <CCardFooter>
          <CButton color="primary" @click="goBack">
            Back
          </CButton>
        </CCardFooter>
      </CCard>
    </CCol>
  </CRow>
</template>

<script>
  import usersData from './UsersData';

  export default {
    name: 'User',
    beforeRouteEnter(to, from, next) {
      next((vm) => {
        // eslint-disable-next-line no-param-reassign
        vm.usersOpened = from.fullPath.includes('users');
      });
    },
    data() {
      return {
        usersOpened: null,
      };
    },
    computed: {
      fields() {
        return [
          { key: 'key', label: this.username, _style: 'width:150px' },
          { key: 'value', label: '', _style: 'width:150px;' },
        ];
      },
      userData() {
        const { id } = this.$route.params;
        const user = usersData.find((_user, index) => index + 1 == id);
        const userDetails = user ? Object.entries(user) : [['id', 'Not found']];
        return userDetails.map(([key, value]) => ({ key, value }));
      },
      visibleData() {
        return this.userData.filter((param) => param.key !== 'username');
      },
      username() {
        return this.userData.filter((param) => param.key === 'username')[0].value;
      },
    },
    methods: {
      goBack() {
        if (this.usersOpened) {
          this.$router.go(-1);
        } else {
          this.$router.push({ path: '/users' });
        }
      },
    },
  };
</script>