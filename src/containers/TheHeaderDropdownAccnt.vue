<template>
  <div>
    <CDropdown in-nav>
      <template #toggler>
        <CHeaderNavLink>
          <div v-if="flag_login">
            <i class="fas fa-user" />
            {{ value_username }}
          </div>
        </CHeaderNavLink>
      </template>
      <CDropdownItem @click="logout()">
        <CIcon name="cil-lock-locked" />{{ $t("Logout") }}
      </CDropdownItem>
      <CDropdownItem @click="showAboutModal = true">
        <CIcon name="cil-info" />{{ $t("About") }}
      </CDropdownItem>
    </CDropdown>

    <AboutModal
      v-if="showAboutModal"
      @close="showAboutModal = false"
    />
  </div>
</template>

<script>
import AboutModal from './AboutModal.vue';

export default {
  name: 'TheHeaderDropdownAccnt',
  components: {
    AboutModal,
  },
  data() {
    return {
      flag_login: false,
      value_username: '',
      showAboutModal: false,
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
