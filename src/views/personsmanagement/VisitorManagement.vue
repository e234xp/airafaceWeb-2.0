<template>
  <div>
    <CRow>
      <CCol sm="12">
        <CPersonManagementForm :formData="$data" :canDelete="canDelete" :onAdd="onAdd" :onModify="onModify"
          :onDelete="onDelete" :onImport="onImport" :onFetchDataCallback="onFetchDataCallback" />
      </CCol>
    </CRow>
    <canvas ref="qrcode" id="qrcode" style="display: none;"></canvas>
  </div>
</template>

<script>
import i18n from '@/i18n';
import QrCodeWithLogo from 'qr-code-with-logo';
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
      disp_header: i18n.formatter.format('Visitor'),
      disp_id: i18n.formatter.format('VisitorId'),
      disp_name: i18n.formatter.format('VisitorName'),

      flag_enableAiraManager: false,
    };
  },
  async mounted() {
    const self = this;

    const ret1 = await self.$globalGetAiraManagerSetting();
    if (!ret1.error) {
      // let data = Object.assign({}, ret1.data);
      const data = { ...ret1.data };
      self.flag_enableAiraManager = data.manager_enable;
    }
  },
  beforeRouteLeave(to, from, next) {
    this.flag_keepingDownload = false;

    if (!this.flag_fileImporting) next();
  },
  methods: {
    async downloadTableItemsAsync(sliceSize, cb) {
      const self = this;
      let shitf = 0;
      let reset = true;
      let thereIsMoreData = true;
      while (self.flag_keepingDownload && thereIsMoreData) {
        const ret = await self.$globalFindVisitorWithoutPhoto('', shitf, sliceSize);
        const { data } = ret;
        const { error } = ret;
        if (error == null) {
          if (data.total_length && data.total_length > (sliceSize + shitf)) {
            thereIsMoreData = true;
            shitf += sliceSize;
          } else thereIsMoreData = false;
          if (cb) {
            // const vList = [];
            const tempReset = !!reset;
            const tempMore = !!thereIsMoreData;
            data.visitor_list.forEach(async (item) => {
              const qrCanvas = this.$refs.qrcode;
              const num = { uuid: item.uuid };
              const jstr = JSON.stringify(num);

              await QrCodeWithLogo.toCanvas({
                canvas: qrCanvas,
                content: jstr,
                width: 220,
                height: 220,
                logo: {
                  src: '/img/logo/airaLogo.png',
                  radius: 1,
                },
              });
              // console.log(qrCanvas.toDataURL());
              cb(error, tempReset, tempMore, [{ ...item, qrCode: `<img src='${qrCanvas.toDataURL()}' width='100' height='100'>` }]);
              // vList.push({ ...item, qrCode: `<img src='${qrCanvas.toDataURL()}' width='100' height='100'>` });
            });
            // console.log(vList);
            // cb(error, reset, thereIsMoreData, vList);
          }
          reset = false;
        } else {
          thereIsMoreData = false;
          if (cb) cb(error, true, false, []);
          self.$fire({
            title: i18n.formatter.format('NetworkLoss'),
            text: '',
            type: 'error',
            timer: 3000,
            confirmButtonColor: '#20a8d8',
          });
        }
      }
    },
    async removePersonAsync(uuid, cb) {
      const self = this;
      const ret = await self.$globalRemoveVisitor(uuid);
      const { error } = ret;
      if (error) {
        if (cb) cb(false);
        self.$fire({
          text: i18n.formatter.format('OperationFailed'),
          type: 'error',
          timer: 3000,
          confirmButtonColor: '#20a8d8',
          confirmButtonText: i18n.formatter.format('OK'),
        });
      } else if (cb) cb(true);
    },
    onFetchDataCallback(cb) {
      const self = this;
      self.flag_keepingDownload = true;
      self.downloadTableItemsAsync(2500, cb);
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
          value_returnRouteName: i18n.formatter.format('Return'),
        },
      });
    },
    onDelete(items, cb) {
      const self = this;
      if (items && Array.isArray(items)) {
        const uuidListToDel = [];
        items.forEach((item) => uuidListToDel.push(item.uuid));
        self.$confirm('', i18n.formatter.format('ConfirmToDelete'), 'question', {
          confirmButtonText: i18n.formatter.format('Confirm'),
          cancelButtonText: i18n.formatter.format('Cancel'),
          confirmButtonColor: '#20a8d8',
          cancelButtonColor: '#f86c6b',
        }).then(() => {
          self.removePersonAsync(uuidListToDel, cb);
        }).catch(() => {
          if (cb) cb(false);
        });
      }
    },
    async onModify(allPerson, pItem) {
      const item = pItem;
      const self = this;
      const photoRet = await self.$globalFetchPhoto(item.uuid);
      item.register_image = photoRet.data && photoRet.data.register_image.length > 0 ? photoRet.data.register_image : '';
      item.display_image = photoRet.data && photoRet.data.display_image.length > 0 ? photoRet.data.display_image : '';

      this.$router.push({
        name: 'ModifyVisitor',
        params: {
          value_returnRoutePath: 'VisitorManagement',
          value_returnRouteName: i18n.formatter.format('Return'),
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
