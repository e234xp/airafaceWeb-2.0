  <template>
    <div id="wrapper">
      <!-- 標題 -->
    
      <!-- 項目 -->
      <!-- Connection -->
      <div class="mb-3">
        <h2 sm="12">{{ disp_ConnectionTitle }}</h2>
      </div>
          
      <div class="mt-3">
        <CRow sm="12">
          <CCol sm="6" class="h5">
            {{ disp_WiegandBasicIP }}
            <CInput size="lg" class="mt-2" v-model="localStep2form.ip_address"/>
          </CCol>
          <CCol sm="6" class="h5">
            {{ disp_WiegandBasicPort }}
            <CInput size="lg" class="mt-2" v-model.number="localStep2form.port"/>
          </CCol>
        </CRow>
      </div>

    </div>
  </template>
    
  <script>
    import i18n from "@/i18n";

    import Multiselect from "vue-multiselect";
    import "@/airacss/vue-multiselect.css";

    export default {
      name: "AddCamerasStep2Form",
      props:{
        step2form: Object
      },
      data() {
      return {
          localStep2form: { ...this.step2form },

          /*Connection title  */
          disp_ConnectionTitle: i18n.formatter.format("WiegandBasicTitleNameConnection"),

          /**content */
          disp_WiegandBasicIP: i18n.formatter.format("WiegandBasicCOlNameIP"),
          disp_WiegandBasicPort: i18n.formatter.format("WiegandBasicCOlNamePort"),

          /**v-model */
          value_deviceGroups: "", /**選單 */
          value_deviceGroupsList: [1,2,3]
        };
      },
      components: {
        multiselect: Multiselect,
      },
      //預設值
      created() {
        this.defaultPortValue();
        this.localStep2form.user = "admin",
        this.localStep2form.pass = "123456"
      }, 
      // 拿資料 寫入資料
      watch: {
        localStep2form: {
          handler(newValue) {
            console.log('emit updateStep2form')
            this.$emit('updateStep2form', { ...newValue });
          },
          deep: true,
        },
      },
      methods: {
        defaultPortValue() {
          this.localStep2form.port = 554;
          return this.localStep2form.port !== null && this.localStep2form.port >= 0 && this.localStep2form.port <= 65535;
        },
        // 判斷欄位空值
        isNotEmpty(value) {
          return value !== null && value !== undefined && value !== '';
        }
      },
    }
  </script>
    

  <style>
    @import url('https://unpkg.com/vue-select@latest/dist/vue-select.css');
  </style>