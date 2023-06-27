<template>
  <div>
    <CRow>
      <CCol sm="12">
        <CPersonManagementForm :formData="$data" :canDelete="canDelete" :onAdd="onAdd" :onModify="onModify" :onDelete="onDelete"
          :onImport="onImport" :onFetchDataCallback="onFetchDataCallback" />
      </CCol>
    </CRow>
  </div>
</template>

<script>

import CPersonManagementForm from './forms/PersonManagementForm.vue'

import i18n from "../../i18n"
export default {
  name: 'VisitorManagement',
  components: { CPersonManagementForm },
  data () {
    return {
      type: "Visitor",
      flag_keepingDownload : false,
        flag_fileImporting: false ,
      value_emptyPhoto : 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAAXNSR0IArs4c6QAAAERlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAA6ABAAMAAAABAAEAAKACAAQAAAABAAAAAaADAAQAAAABAAAAAQAAAAD5Ip3+AAAADUlEQVQIHWM4ceLEfwAIDANYXmnp+AAAAABJRU5ErkJggg==',
      disp_header: i18n.formatter.format("Visitor"),
      disp_id : i18n.formatter.format("VisitorId"),
      disp_name : i18n.formatter.format("VisitorName"),
    };
  },
  created() {
  },
  updated() {
  },
  beforeRouteLeave (to, from , next) {
    this.flag_keepingDownload = false;
      if (!this.flag_fileImporting)
    next();
  },
  methods: {
    async downloadTableItemsAsync( sliceSize, cb ) {
      const self = this;
      let shitf = 0;
      let reset = true;
      let thereIsMoreData = true;
      while( self.flag_keepingDownload && thereIsMoreData ) {
        let ret = await self.$globalFindVisitorWithoutPhoto( "", shitf, sliceSize );
        const data = ret.data;
        const error = ret.error;
        if( error == null ) {
          if( data.total_length && data.total_length > ( sliceSize + shitf ) ) {
            thereIsMoreData = true;
            shitf += sliceSize;
          }
          else thereIsMoreData = false;
          if( cb ) cb( error, reset, thereIsMoreData, data.visitor_list );
          reset = false;
        }
        else {
          thereIsMoreData = false;
          if( cb ) cb( error, true, false, [] );
          self.$fire({
            title: i18n.formatter.format("NetworkLoss"),
            text: "",
            type: "error",
            timer: 3000,
            confirmButtonColor: "#20a8d8"
          });
        }
      }
    },
    async removePersonAsync( uuid, cb ) {
      const self = this;
      let ret = await self.$globalRemoveVisitor( uuid );
      const error = ret.error;
      if( error ) {
        if( cb ) cb( false );
        self.$fire({
          text: i18n.formatter.format("OperationFailed"),
          type: "error",
          timer: 3000,
          confirmButtonColor: "#20a8d8",
          confirmButtonText: i18n.formatter.format("OK")
        });
      }
      else if( cb ) cb( true );
    },
    onFetchDataCallback ( cb ) {
      const self = this;
      self.flag_keepingDownload = true;
      self.downloadTableItemsAsync( /* sliceSize */ 3000, cb );
    },
    canDelete() {
      return true;
    },
    onAdd ( allVisitor ) {
      this.$router.push({ 
        name: 'AddVisitor', params : { 
        value_allPerson: allVisitor,
        value_returnRoutePath :"VisitorManagement", 
        value_returnRouteName : i18n.formatter.format("Return")
        }
      });
    },
    onDelete ( items, cb ) {
      const self = this;
      if( items && Array.isArray(items) ) {
        let uuidListToDel = [];
        items.forEach( item => {
          uuidListToDel.push( item.uuid );
        });
        
        self.$confirm( "", i18n.formatter.format("ConfirmToDelete"), "question", {
          confirmButtonText: i18n.formatter.format("Cancel"),
          cancelButtonText: i18n.formatter.format("Cancel"),
          confirmButtonColor: "#20a8d8",
          cancelButtonColor: "#f86c6b"
        }).then( (v) => {
          
          self.removePersonAsync( uuidListToDel, cb );
        }).catch( (e) => {
          if( cb ) cb( false );
        });
      }
    },
    async onModify ( item ) {
      const self = this;
      let photoRet = await self.$globalFetchPhoto( item.uuid );
      item["register_image"] = photoRet.data && photoRet.data.register_image.length > 0 ? photoRet.data.register_image : "";
      item["display_image"] = photoRet.data && photoRet.data.display_image.length > 0 ? photoRet.data.display_image : "";
      
      this.$router.push({ name: 'ModifyVisitor', params : { 
          value_returnRoutePath :"VisitorManagement",
          value_returnRouteName : i18n.formatter.format("Return"),
          item : item,
        }
      });
      },
      onImport(flag) {
        this.flag_fileImporting = flag;
      }
  }
}
</script>
