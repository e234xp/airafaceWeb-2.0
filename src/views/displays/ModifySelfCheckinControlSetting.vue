<template>
  <div>
    <CRow>
      <CCol sm="12">
        <SelfCheckinControlSettingForm ref="form" :form="form" :list="list" @submit="onSubmit" />
      </CCol>
    </CRow>
  </div>
</template>

<script>

  import SelfCheckinControlSettingForm from './forms/SelfCheckinControlSettingForm.vue';

  export default {
    name: 'ModifySelfCheckinControlSetting',
    components: { SelfCheckinControlSettingForm },
    data: () => ({
      form: {
        step1Background: '',
        step2Background: '',
        step3Background: '',
        logo: '',
        entryChannel: {
          label: '',
          value: '',
        },
      },
      list: [],
    }),
    async created() {
      await this.$globalGetDisplaySetting((err, data) => {
        if (data.SELFCHECKIN) {
          this.form = {
            ...this.form,
            ...data.SELFCHECKIN,
          };
          // console.log(this.form);
        }
      });
      const { data } = await this.$globalGetTabletList('', 0, 3000);
      this.list.push(...data.data_list.map((item) => ({ label: item.identity, value: `${item.code || ''}/${item.uuid || ''}` })));
      // const cam = await this.$globalFindCameras('', 0, 3000);
      // this.list.push(...cam.data.list.map((item) => ({ label: item.name, value: item.uuid || '' })));
    },
    methods: {
      onSubmit(data) {
        this.$globalSetDisplaySetting({ SELFCHECKIN: data }, (err, result) => {
          if (err || result.message !== 'ok') {
            this.$message.error(this.$t('Failed'));
          } else {
            this.$refs.form.done();
            this.$message.success(this.$t('Successful'));
          }
        });
      },
    },
  };
</script>

<style scoped>
  /* Your component styles go here */
</style>