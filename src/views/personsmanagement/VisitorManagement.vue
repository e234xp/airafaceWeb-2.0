<template>
  <div>
    <CRow>
      <CCol sm="12">
        <CPersonManagementForm
          :form-data="$data"
          :can-delete="canDelete"
          :on-add="onAdd"
          :on-modify="onModify"
          :on-delete="onDelete"
          :on-import="onImport"
          :on-fetch-data-callback="onFetchDataCallback"
        />
      </CCol>
    </CRow>
  </div>
</template>

<script>
import CPersonManagementForm from './forms/PersonManagementForm.vue';

export default {
  name: 'VisitorManagement',
  components: { CPersonManagementForm },
  data() {
    return {
      type: 'Visitor',
      flag_keepingDownload: false,
      flag_fileImporting: false,
      value_emptyPhoto: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAAXNSR0IArs4c6QAAAERlWElmTU0AKg'
        + 'AAAAgAAYdpAAQAAAABAAAAGgAAAAAAA6ABAAMAAAABAAEAAKACAAQAAAABAAAAAaADAAQAAAABAAAAAQAAAAD5Ip3+AAAADUlEQVQIHWM4ceLEfwAIDA'
        + 'NYXmnp+AAAAABJRU5ErkJggg==',
      disp_header: this.$t('Visitor'),
      disp_id: this.$t('VisitorId'),
      disp_name: this.$t('VisitorName'),

      flag_enableAiraManager: false,
    };
  },
  async mounted() {
    const ret1 = await this.$globalGetAiraManagerSetting();
    if (!ret1.error) {
      // let data = Object.assign({}, ret1.data);
      const data = { ...ret1.data };
      this.flag_enableAiraManager = data.manager_enable;
    }
  },
  beforeRouteLeave(to, from, next) {
    this.flag_keepingDownload = false;

    if (!this.flag_fileImporting) next();
  },
  methods: {
    async downloadTableItemsAsync(sliceSize, cb) {
      const loading = this.$loading.show({ container: this.$refs.formContainer });
      let shitf = 0;
      // let reset = true;
      let thereIsMoreData = true;
      cb(null, true, false, []);
      while (this.flag_keepingDownload && thereIsMoreData) {
        const ret = await this.$globalFindVisitorWithoutPhoto('', shitf, sliceSize);
        const { data } = ret;
        const { error } = ret;
        if (error == null) {
          if (data.total_length && data.total_length > (sliceSize + shitf)) {
            thereIsMoreData = true;
            shitf += sliceSize;
          } else thereIsMoreData = false;
          if (cb) {
            const vList = [];
            const tempMore = !!thereIsMoreData;

            for (let i = 0; i < data.visitor_list.length; i += 1) {
              // const qrCanvas = this.$refs.qrcode;
              // const num = { uuid: data.visitor_list[i].uuid };
              // const jstr = JSON.stringify(num);

              // await QrCodeWithLogo.toCanvas({
              //   canvas: qrCanvas,
              //   content: jstr,
              //   width: 220,
              //   height: 220,
              //   logo: {
              //     src: '/img/logo/airaLogo.png',
              //     radius: 1,
              //   },
              // });
              // const qrCode = await qrCanvas.toDataURL();
              // vList.push({ ...data.visitor_list[i], qrCodeDisplay: `<img src='${qrCode}' width='100' height='100'>`, qrCode: qrCode.replace('data:image/png;base64,', '') });
              vList.push({ ...data.visitor_list[i], qrCodeDisplay: '', qrCode: '' });
            }
            if (!this.thereIsMoreData) loading.hide();
            cb(error, false, tempMore, vList);
          }
        } else {
          thereIsMoreData = false;
          if (cb) cb(error, true, false, []);
          this.$fire({
            title: this.$t('NetworkLoss'),
            text: '',
            type: 'error',
            timer: 3000,
            confirmButtonColor: '#20a8d8',
          });
        }
      }
    },
    async removePersonAsync(uuid, cb) {
      const ret = await this.$globalRemoveVisitor(uuid);
      const { error } = ret;
      if (error) {
        if (cb) cb(false);
        this.$fire({
          text: this.$t('OperationFailed'),
          type: 'error',
          timer: 3000,
          confirmButtonColor: '#20a8d8',
          confirmButtonText: this.$t('OK'),
        });
      } else if (cb) cb(true);
    },
    onFetchDataCallback(cb) {
      this.flag_keepingDownload = true;
      this.downloadTableItemsAsync(20000, cb);
    },
    canDelete() {
      return !(this.$globalAiraManagerSettings.manager_enable === true);
    },
    onAdd(allVisitor) {
      this.$router.push({
        name: 'AddVisitor',
        params: {
          value_allPerson: allVisitor,
          value_returnRoutePath: 'VisitorManagement',
          value_returnRouteName: this.$t('Return'),
        },
      });
    },
    onDelete(items, cb) {
      if (items && Array.isArray(items)) {
        const uuidListToDel = [];

        items.forEach((item) => uuidListToDel.push(item.uuid));
        this.$confirm('', this.$t('ConfirmToDelete'), {
          confirmButtonText: this.$t('Confirm'),
          cancelButtonText: this.$t('Cancel'),
          confirmButtonColor: '#20a8d8',
          cancelButtonColor: '#f86c6b',
        }).then(() => {
          this.removePersonAsync(uuidListToDel, cb);
        }).catch(() => {
          if (cb) cb(false);
        });
      }
    },
    async onModify(allPerson, pItem) {
      const item = pItem;
      const photoRet = await this.$globalFetchPhoto(item.uuid);
      item.register_image = photoRet.data && photoRet.data.register_image.length > 0 ? photoRet.data.register_image : '';
      item.display_image = photoRet.data && photoRet.data.display_image.length > 0 ? photoRet.data.display_image : '';

      this.$router.push({
        name: 'ModifyVisitor',
        params: {
          value_returnRoutePath: 'VisitorManagement',
          value_returnRouteName: this.$t('Return'),
          value_allPerson: allPerson,
          item,
        },
      });
    },
    onImport(flag) {
      this.flag_fileImporting = flag;
    },
  },
};
</script>
