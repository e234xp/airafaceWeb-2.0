<template>
  <div>
    <CCard>
      <CCardBody>
        <CCol sm="2" class="h5">{{ disp_staff }}</CCol>
        <CRow>
          <CCol sm="4">
            <!-- {{ selectedName }} -->
            <v-select v-model="selectedName" :options="finallyList" :text="'label'" :value="'value'" :filterable="true"
              :placeholder="disp_pleaseEnterName" class="font-control">

            </v-select>
          </CCol>
        </CRow>

        <div style="height: 35px"></div>

        <!-- 日期 -->
        <CCol sm="2" class="h5">{{ disp_date }}</CCol>
        <CRow>
          <CCol sm="4">
            <CInput size="lg" type="date" :value="value_searchDate" v-model="value_searchDate" />
          </CCol>
        </CRow>
        <div style="height: 35px"></div>

      </CCardBody>
    </CCard>

    <CCol sm="2" class="h5 font-weight-bold">{{ disp_currentRecords }}</CCol>

    <!-- 下方資料 -->
    <CCard>
      <CCardBody>
        <div>
          <vxe-table :data="value_dataItemsToShow" stripe align="center" :cell-style="cellStyle"
            :header-cell-style="headerCellStyle" ref="mainTable">

            <vxe-table-column field="userName" :title="disp_name" align="center" width="auto">
            </vxe-table-column>

            <vxe-table-column field="groupList" :title="disp_group" align="center" width="auto"></vxe-table-column>

            <vxe-table-column field="dateString" :title="disp_date" width="auto" align="center">
            </vxe-table-column>

            <vxe-table-column field="clockIn" :title="disp_clockIn" width="auto" align="center">
            </vxe-table-column>

            <vxe-table-column field="clockOut" :title="disp_clockOut" width="auto" align="center">
            </vxe-table-column>

          </vxe-table>
        </div>
      </CCardBody>
    </CCard>

    <!-- 新紀錄 -->
    <CRow>
      <!-- <CCol sm="2" class="h5 font-weight-bold">{{ disp_newRecords }}</CCol> -->
      <CCol sm="4" class="form-inline">
        <div class="form-check" style="padding-right: 40px">
          <input class="form-check-input" type="radio" name="Records" id="flexRadioDefault1" value="ClockIn"
            v-model="value_clockInRecords" />
          <label class="form-check-label h5" for="flexRadioDefault1">
            {{disp_clockIn}}</label>
        </div>
        <div class="form-check" style="padding-right: 40px">
          <input class="form-check-input" type="radio" name="Records" id="flexRadioDefault2" value="ClockOut"
            v-model="value_clockInRecords" />
          <label class="form-check-label h5" for="flexRadioDefault2">
            {{disp_clockOut}}</label>
        </div>
      </CCol>
    </CRow>

    <div style="height: 35px"></div>

    <!-- 時間 -->
    <CRow style="display: block;">
      <CCol sm="2" class="h5 font-weight-bold">{{ disp_time}}</CCol>
      <CCol sm="4" class="form-inline">
        <date-picker :lang="this.$globalDatePickerLanguage" class="w-100 gray-rounded-date-picker" type="time"
          format="HH:mm" v-model="value_clockInTime" />
      </CCol>
      <!-- {{ value_clockInTime }} -->
    </CRow>

    <div style="height: 35px"></div>

    <!-- 備註 -->
    <CRow class="d-block">
      <CCol sm="2" class="h5 font-weight-bold">{{ disp_reason }}</CCol>

      <CCol sm="12" class="form-block">
        <div class="mt-2 mb-2">
          <input :class="{'is-invalid': disp_forgotClockIn.length === 0}" class="form-control col-12"
            valid-feedback="ok" :maxLength="maxLength" type="text" value="OtherDirections" v-model="disp_forgotClockIn"
            required />
          <p class="invalid-feedback" v-if="disp_forgotClockIn.length === 0">{{ disp_reasonReasonDepiction }}</p>
        </div>
      </CCol>
    </CRow>

    <!-- 儲存按鈕 -->
    <div class="d-flex ml-3 justify-content-end">
      <CButton class="btn btn-outline-primary btn-w-normal mb-3" size="lg" @click="saveData()">
        {{ disp_save }}
      </CButton>
    </div>

  </div>
</template>



<script>
  import { mapState } from "vuex";
  import TableObserver from "@/utils/TableObserver.vue";
  import i18n from "@/i18n";

  import Multiselect from "vue-multiselect";
  import "@/airacss/vue-multiselect.css";
  import CTableWrapper from "../../reports/ReportTable.vue";

  import VueSelect from 'vue-select';

  const defaultlState = () => {
    return {
      obj_loading: null,
      disp_save: i18n.formatter.format("Save"),

      // disp_selectDatetimeRange: i18n.formatter.format("ForgotClockInDateTime"),
      disp_date: i18n.formatter.format("ForgetPunchDate"),
      disp_staff: i18n.formatter.format("Staff"),

      disp_name: i18n.formatter.format("PersonName"),
      disp_group: i18n.formatter.format("Group"),
      // disp_dateTime: i18n.formatter.format("Time"),
      disp_clockIn: i18n.formatter.format("ClockIn"),
      disp_clockOut: i18n.formatter.format("ClockOut"),


      disp_currentRecords: i18n.formatter.format("CurrentRecords"),
      // disp_newRecords: i18n.formatter.format("NewRecords"),

      disp_time: i18n.formatter.format("Time"),

      disp_reason: i18n.formatter.format("reason"),
      disp_reasonReasonDepiction: i18n.formatter.format("ReasonDepiction"), /* 事由 提示字樣*/
      disp_forgotClockIn: i18n.formatter.format("ForgotAttendanceRecord"),
      disp_other: i18n.formatter.format("Other"),

      disp_lessThan50words: i18n.formatter.format("lessThan50words"),
      disp_pleaseEnterName: i18n.formatter.format("PleaseEnterName"),

      flag_enableSearchButton: false,

      value_searchDate: new Date().yyyy_mm_dd(), /**單個日期 */


      value_dataItemsToShow: [], /* 綁定的資料 */
      value_allTableItems: [], /**api資料存放 */

      value_clockInRecords: "ClockIn",
      value_clockInReason: "ForgotClockIn",

      value_clockInTime: null,

      maxLength: 50,
      value_otherDirections: '',

      /*輸入框 */
      selectedName: '',
      nameList: [{ value: "A-001", label: "李子維" },
      { value: "A-002", label: "王明" },
      { value: "A-003", label: "洪小龍" },
      { value: "A-004", label: "王大明" },
      { value: "A-005", label: "張三" },
      { value: "A-006", label: "李四" },
      { value: "A-007", label: "李小華" },
      { value: "A-008", label: "李大福" },
      { value: "A-009", label: "李小美" },
      { value: "A-010", label: "李大華" }],

      finallyList: [],


      /*跳頁 */
      value_tablePage: {
        currentPage: 1,
        pageSize: 10,
        totalResult: 0,
      },
    }
  }

  function debounce(func, delay) {
    let timeoutId;

    return function () {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(func, delay);
    };
  }


  export default {
    name: "ChangeAttendanceForm",
    props: {

      onFinish: { type: Function },
    },
    components: {
      CTableWrapper,
      'v-select': VueSelect
    },
    data() {
      return defaultlState();
    },
    watch: {
      selectedName(newValue, oldValue) {
        if (this.selectedName === null) { this.value_dataItemsToShow = []; }
        this.selectedName = newValue;
        // 有值做事
        if (!!this.selectedName) {
          this.autoSearch(); //值被改變查
        }
      },
      value_searchDate(newValue, oldValue) {
        this.value_searchDate = newValue;
        this.autoSearch();
      }

    },
    created() {
      /*顯示今天當預設日期 */
      const self = this;
      self.flag_enableSearchButton = true;

      // 上下班時間
      self.value_clockInTime = new Date();
    },
    mounted() {
      this.formatNameList();
    },
    methods: {
      headerCellStyle(row, column, rowIndex, columnIndex) {
        return "fontSize: 18px";
      },
      cellStyle(row, column, rowIndex, columnIndex) {
        return "fontSize:18px;";
      },
      makeid(length) {
        let result = "";
        let characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        let charactersLength = characters.length;
        for (let i = 0; i < length; i++) {
          result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
      },

      /* 日期 */
      datePickerDataChange() {
        const self = this;
        self.flag_enableSearchButton = true;
      },
      /**組人名 and 員編 */
      async formatNameList() {
        const self = this;
        let ret1 = await self.$globalFindPersonWithoutPhoto("", 0, 3000); /**get data */
        let personLists = ret1.data.person_list; /**拿回所有person_list */
        const handleData = personLists.map(({ id, name, uuid }) => ({ label: `${name}(${id})`, value: uuid })); /**去把personLists id跟name拿出來轉換成label、value 因為套件要用 */

        this.finallyList = handleData
        // handleData.forEach((person) => {
        //   return this.finallyList.push(`${person.label}(${person.value})`) ;
        // });
      },

      async saveData(cb) {
        const self = this;
        /**get data */
        let personDatas = await self.$globalFindPersonWithoutPhoto("", 0, 3000)
        let personData = personDatas.data.person_list //拿回整包 全部人的list

        if (!this.selectedName) return  //如果沒選return

        //找名字相符的 匹配到 拿個人全部資料出來 (這裡面少一段防呆 如果沒選人名就擋 不然會有error)
        let selectMatch = personData.filter((item) => {
          let str = this.selectedName.label; //選到的人
          let selectValue = str.substring(0, str.indexOf("("));  //"處理人名 ken(1234)"
          return item.name === selectValue;
        })

        let token = self.$globalServerTokenInfo();

        /* 這邊要去處理  沒選人名或是配不到人名 要做什麼事 */
        if (selectMatch.length === 0) return;
        const parameter = selectMatch[0]

        let verifyMode; // 5 or 6
        let verifyModeString = ""; // 上、下班
        if (this.value_clockInRecords === "ClockIn") {
          verifyMode = 5;
          verifyModeString = "MANUAL_CLOCK_IN";
        } else if (this.value_clockInRecords === "ClockOut") {
          verifyMode = 6;
          verifyModeString = "MANUAL_CLOCK_OUT";
        }



        const searchDate = new Date(this.value_searchDate); //日期
        const clockInTime = new Date(this.value_clockInTime); //時間

        // 设置 searchDate 的时、分、秒为 clockInTime 的对应部分
        searchDate.setHours(clockInTime.getHours());
        searchDate.setMinutes(clockInTime.getMinutes());
        searchDate.setSeconds(clockInTime.getSeconds());
        searchDate.setSeconds(0);
        searchDate.setMilliseconds(0);

        //console.log("searchDate",new Date(searchDate)) //Tue Jun 20 2023 14:55:00 GMT+0800 (台北標準時間)
        //const Abc = new Date(searchDate).HHMMSS() //Abc 14:55:00 看要用哪種顯示

        //console.log("Abc",Abc);
        // 轉換為 UTC
        const utcTimestamp = searchDate.getTime();
        //console.log("utcTimestamp",utcTimestamp);


        const submitData = {
          verify_uuid: self.makeid(32),
          timestamp: utcTimestamp,
          verify_mode: verifyMode,
          verify_mode_string: verifyModeString,
          uuid: parameter.uuid,
          id: parameter.id,
          name: parameter.name,
          card_facility_code: parameter.card_facility_code,
          card_number: parameter.card_number,
          group_list: parameter.group_list, /*這邊格式不確定 */
          temperature: 0,
          modifier: token.username,
          modifier_time: new Date().valueOf(),
          remark: this.disp_forgotClockIn
        };

        // 加入成功訊息
        try {
          await self.$globalManualClockin(submitData);
          console.log("補打卡成功");

          await this.showNotificationAndGoBack(true, i18n);
          this.$router.back(-1);
        } catch (error) {
          console.error("補打卡失败", error);
          // 顯示錯誤提示並返回上一頁
          await this.showNotificationAndGoBack(false, i18n);
          this.$router.back(-1);
        }
        if (cb) cb();

        // self.$globalManualClockin( submitData, ( error, result ) => {
        //   if( cb ) cb( error == null, result );
        //   this.$router.back(-1);
        //   console.log("補打卡成功");
        // });
      },

      // 彈跳提示字樣
      showNotificationAndGoBack(pass, i18n) {
        self = this;
        return new Promise((resolve) => {
          self.$fire({
            text: pass
              ? i18n.formatter.format("Successful")
              : i18n.formatter.format("OperationFailed"),
            type: pass ? "success" : "error",
            timer: 3000,
            onClose: resolve, // 在提示關閉時執行 resolve
          });
        });
      },


      // 搜尋時間跟人名 拿資料回來顯示
      autoSearch() {
        console.log(1, this.selectedName)
        //只選日期的時候 return
        if (this.selectedName === '' || this.selectedName === null) return;
        // console.log(2)
        let start_time = this.value_searchDate + " 00:00:00";
        let end_time = this.value_searchDate + " 23:59:59";

        let startTime = new Date(start_time).getTime();
        let endTime = new Date(end_time).getTime();

        console.log("查看日期", startTime)

        let data = {
          uuid_list: this.selectedName.value ? [this.selectedName.value] : [],
          start_time: startTime,
          end_time: endTime,
          slice_shift: 0,
          slice_length: 1000,
        };

        this.queryPersonResult(data.uuid_list, data.start_time, data.end_time, data.slice_shift, data.slice_length);

      },

      queryPersonResult(uuid_list, start_time, end_time, slice_shift, slice_length) {
        const self = this;
        // 拿資料
        self.$globalManualClockinResult(uuid_list, start_time, end_time, slice_shift, slice_length)
          .then((result) => {
            if (result.data.data.length !== 0) {

              self.value_allTableItems = result.data.data; //這邊拿到的是一整包 所以 還要去filter
              console.log(self.value_allTableItems, "原始資料")
              self.value_dataItemsToShow = this.processFields(self.value_allTableItems); // 處理完的資料 顯示在畫面上 這邊只會有五個欄位的資料
            }
          }).catch((err) => {
            console.error(err)
          });
      },

      // 處理每一個Fields
      processFields(sourceData) {
        /* api回來會有多筆資料，去跑每一筆顯示在畫面上，但欄位先處理完再丟進array */
        let modifyFieldsData = [];
        for (let i = 0; i < sourceData.length; i++) {
          // 各欄位資料處理
          let userName = sourceData[i].name;

          // 第二欄位處理
          let groupList = sourceData[i].group_list;
          groupList = groupList.join('\n');

          //第三欄時間處理
          let timestamp = new Date(sourceData[i].timestamp);
          let formattedDateTime = timestamp.toLocaleString();
          //console.log(formattedDateTime); //2023/5/12 上午10:55:58
          const [dateString, timeString] = formattedDateTime.split(' ');

          let modifierDT = sourceData[i].modifier_time
          //   console.log(modifierDT,"AABBA")
          let modifierTime = new Date(sourceData[i].modifier_time)
          let formattedModifierTime = modifierTime.toLocaleString();
          //console.log(sourceData[i].modifier_time,"A"); //修改時間

          //上下班欄位的時間
          let clockIn;
          let clockOut;
          let modeString = sourceData[i].verify_mode_string;

          if (modeString === "MANUAL_CLOCK_IN") {
            clockIn = timeString;
            clockOut = "";
          } else if (modeString === "MANUAL_CLOCK_OUT") {
            clockIn = "";
            clockOut = timeString;
          }
          modifyFieldsData.push({ userName: userName, groupList: groupList, dateString: dateString, clockIn: clockIn, clockOut: clockOut, modifierTime: modifierDT })
          //return sourceData[i] = {userName:userName, groupList:groupList, dateString:dateString, clockIn:clockIn, clockOut:clockOut} //印出兩次第一次是空陣列 第二次才有值
          //console.log("tableArray",self.value_dataItemsToShow) // ['Frank', 'Group-1\nGroup-2\nAll Person', '2023/5/12', '上午10:55:58', '']
          // console.log(modifyFieldsData,"更動資料");
        }

        // 比較修改時間 找出最後一筆修改的資料
        let latestObj = modifyFieldsData[0]; //陣列第0筆是一個物件
        let arr = []

        for (let i = 1; i < modifyFieldsData.length; i++) {
          console.log(modifyFieldsData[i].modifierTime, "第" + i + "筆")
          console.log(modifyFieldsData[i])
          if (modifyFieldsData[i].modifierTime > latestObj.modifierTime) {
            latestObj = modifyFieldsData[i]
          }
        }
        arr.push(latestObj)
        return arr;

        // 方法2
        // let arr = []
        // const latest = (()=>{
        //   let tmp = null;

        //   modifyFieldsData.forEach((item,idx)=>{
        //     if(idx === 0) tmp = item
        //     if(item.modifierTime > tmp.modifierTime){
        //       tmp = item;
        //     }
        //   })
        //   arr.push(tmp)
        //   return arr;
        // })()
        // return latest

        //方法3
        // const toShow = modifyFieldsData.reduce((latest, current) => {
        //   if (current.modifierTime > latest.modifierTime) {
        //     return current;
        //   } else {
        //     return latest;
        //   }
        // });

        // return [toShow];

      }

    }
  }

</script>

<style>
  @import url('https://unpkg.com/vue-select@latest/dist/vue-select.css');
</style>