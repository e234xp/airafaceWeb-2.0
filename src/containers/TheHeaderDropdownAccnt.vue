<template>
  <CDropdown inNav>
    <template #toggler>
      <CHeaderNavLink>
        <div v-if="flag_login">
          <i class="fas fa-user"></i>
          {{ value_username }}
        </div>
      </CHeaderNavLink>
    </template>
    <CDropdownItem @click="logout()">
      <CIcon name="cil-lock-locked" /> Logout
    </CDropdownItem>
  </CDropdown>
</template>

<script>
export default {
  name: 'TheHeaderDropdownAccnt',
  data() {
    return {
      flag_login: false,
      value_username: '',
    };
  },
  created() {
    const self = this;
    const erverTokenInfo = self.$globalServerTokenInfo();
    self.value_username = '';
    self.flag_login = (erverTokenInfo && erverTokenInfo.token.length > 0);
    if (self.flag_login) self.value_username = erverTokenInfo.username;
  },
  watch: {
    // $route (to, from) {
    $route() {
      const self = this;
      const erverTokenInfo = self.$globalServerTokenInfo();
      self.value_username = '';
      self.flag_login = (erverTokenInfo && erverTokenInfo.token.length > 0);
      if (self.flag_login) self.value_username = erverTokenInfo.username;
    },
  },
  methods: {
    logout() {
      const self = this;
      self.flag_login = false;
      self.value_username = '';
      self.$globalLogout();
    },
  },
};
</script>
