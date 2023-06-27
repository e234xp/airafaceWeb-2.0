<template>
  <div class="ChangeAttendanceClockIn">
    <CButton class="btn btn-outline-primary btn-w-normal mb-3" size="lg" 
       @click="changeAttendance()">
      {{ disp_change }}
    </CButton>
    <div>
      <CCol sm="12">
        <div class="h1">{{ disp_header }}</div>
      </CCol>
      <div style="height: 35px"></div>
    </div>

    <CCard>
      <CCardBody>
        <CRow>
          <CCol sm="2" class="h5">{{ disp_selectDatetimeRange }}</CCol>
          <CCol sm="4">
            <date-picker style="width: 100%" :lang="this.$globalDatePickerLanguage" v-model="value_searchDatetimeRange"
              type="datetime" range :placeholder="disp_selectDatetimeRange" @change="datePickerDataChange()">
            </date-picker>
          </CCol>
          <CCol sm="2" class="h5">{{ disp_name }}</CCol>
          <CCol sm="4">
            <CInput size="lg" v-model="value_keyword" style="width: 100%" />
          </CCol>
        </CRow>
        <Col class="d-md-flex justify-content-md-end">
          <CButton class="btn btn-outline-primary btn-w-normal mb-3" size="lg" 
          :disabled="!flag_enableSearchButton" @click="clickOnSearch()">
          {{ disp_search }}
          </CButton>
        </Col>
      </CCardBody>
    </CCard>

    <!-- 下方資料 -->
    <CCard>
      <CCardBody>
        <!-- {{ value_dataItemsToShow }} -->
        <div id="ChangeAttendanceClockIn">
          <vxe-table :data="value_dataItemsToShow"  stripe align="center" :cell-style="cellStyle"
            :header-cell-style="headerCellStyle" ref="mainTable" :auto-resize="true" keep-source
              highlight-current-row>
            
            <vxe-table-column :show-overflow="ellipsisMode" field="verify_mode_string" :title="disp_subject" align="center" width="auto">
            </vxe-table-column>

            <vxe-table-column :show-overflow="ellipsisMode" field="name" :title="disp_name" align="center" width="auto"></vxe-table-column>

            <vxe-table-column :show-overflow="ellipsisMode" field="timestamp" :title="disp_dateTime" width="auto" align="center">
            </vxe-table-column>

            <vxe-table-column :show-overflow="ellipsisMode" field="remark" :title="disp_reason" width="auto" align="center">
            </vxe-table-column>
            
            <vxe-table-column :show-overflow="ellipsisMode" field="modifier" :title="disp_modifier" width="auto" align="center">
            </vxe-table-column>
            
          </vxe-table>
        </div>

        <vxe-pager :layouts="[
            'PrevJump',
            'PrevPage',
            'Number',
            'NextPage',
            'NextJump',
            'FullJump',
            'Total',
          ]" 
          :current-page="value_tablePage.currentPage" 
          :page-size="value_tablePage.pageSize"
          :total="value_tablePage.totalResult" 
          @page-change="handlePageChange">
        </vxe-pager>
      </CCardBody>
    </CCard>
  </div>
</template>

<script>
import { mapState } from "vuex";
import TableObserver from "@/utils/TableObserver.vue";
import i18n from "@/i18n";

import Multiselect from "vue-multiselect";
import "@/airacss/vue-multiselect.css";
import CTableWrapper from "../reports/ReportTable.vue";




const defaultlState = () => {
  return {
    obj_loading: null,

    value_dataItemsToShow: [],  /* 綁定的資料 */
    value_allTableItems: [], /**api資料存放 */

    disp_header: i18n.formatter.format("ClockIn"),
    disp_selectDatetimeRange: i18n.formatter.format("ForgotClockInDateTime"),
    disp_name: i18n.formatter.format("KeywordName"),
    disp_search: i18n.formatter.format("Search"),
    disp_change: i18n.formatter.format("AttendanceLogChange"),

    disp_subject: i18n.formatter.format("SubjectName"),
    disp_name: i18n.formatter.format("PersonName"),
    disp_dateTime: i18n.formatter.format("ChangeAttendanceTime"),
    disp_reason: i18n.formatter.format("reason"),
    disp_modifier: i18n.formatter.format("Modifier"),


    // 下方內容資料轉換顯示
    disp_clockIn: i18n.formatter.format("ClockIn"),
    disp_clockOut: i18n.formatter.format("ClockOut"),
    dis_manually_clock_in: i18n.formatter.format("ForgotAttendanceRecord"),


    value_searchDatetimeRange: [],
    value_keyword: "", /* 輸入框的KEYWORD */
    flag_enableSearchButton: false,


    /*跳頁 */
    value_tablePage: {
        currentPage: 1, /*當前頁 */
        pageSize: 1, /**每頁顯示的紀錄數 */
        totalResult: 1, /**總數 */
    },
    
  }
}

export default {
  name: "ChangeAttendanceClockIn",
  components: {
    // CTableWrapper
  },
  data() {
    return Object.assign({}, defaultlState(), this.formData);
  },
  mixins: [TableObserver],
  created() {
    const self = this;
    let endTime = new Date();
    endTime.setHours(23, 59, 59, 999);
    let endTimeTimestamp = endTime.getTime();
    let startTimeTimestamp = endTimeTimestamp - 86400000 + 1;

    self.value_searchDatetimeRange[0] = new Date(startTimeTimestamp);
    self.value_searchDatetimeRange[1] = endTime;
    self.flag_enableSearchButton = true;
   
  },
  computed: {
    ...mapState(["ellipsisMode"]),
  },
  methods: { 
    handlePageChange({ currentPage, pageSize }) {
      const self = this;
      this.value_tablePage.currentPage = currentPage;
      this.value_tablePage.pageSize = pageSize;
      this.value_dataItemsToShow = this.generateFilteredData(this.value_allTableItems);
      this.resizeOneTable();
    },

    // 取得個人uuid
    async getPersonDetail() {
      const self = this;
      let personDatas = await self.$globalFindPersonWithoutPhoto("", 0, 3000) // error and data
      let personData = personDatas.data.person_list //拿回整包 全部人的list

      let selectMatch = personData.filter((item) => {
        return item.name === this.value_keyword;
      })
      //如果有選return uuid
      if(selectMatch && selectMatch.length > 0) return selectMatch[0].uuid
    },

    async clickOnSearch() {
      const self = this;
      console.log(1)
      let startTime = this.value_searchDatetimeRange[0].getTime();
      let endTime = this.value_searchDatetimeRange[1].getTime();
      let uuid = await this.getPersonDetail();
      // ken uuid '7d51d996-bde4-4003-8c72-7e3869ee8c8a' 
      let data = {
        uuid_list: uuid ? [uuid] : [],
        start_time: startTime,
        end_time: endTime,
        slice_shift: 0,
        slice_length: 1000,
      };
       //直接把資料拿回來沒加.data是一個物件 不能做filter， generateFilteredData是去filter資料，所以要在這邊就把正確資料接出來
      let personResult = (await this.queryPersonResult(data.uuid_list, data.start_time, data.end_time, data.slice_shift, data.slice_length)).data.data;
      this.value_allTableItems = self.processFields(personResult);
      self.value_dataItemsToShow = self.generateFilteredData(this.value_allTableItems);
    },

    //api 查資料
    async queryPersonResult(uuid_list, start_time, end_time, slice_shift, slice_length) {
      const self = this;
      let personResult;
      try {
        personResult = await self.$globalManualClockinResult(uuid_list, start_time, end_time, slice_shift, slice_length);
      } catch (err) {
        console.error(err);
      }
      return personResult
    },

    // 處理每一個Fields
    processFields(sourceData) {
      console.log("原始資料",sourceData)
      /* api回來會有多筆資料，去跑每一筆顯示在畫面上，但欄位先處理完再丟進array */
      let modifyFieldsData = [];
      //資料
      let value_handleFields = [
          "verify_mode_string",
          "name",
          "timestamp",
          "remark",
          "modifier"
        ]

      sourceData.forEach(item => {
        let verifyModeString;  //第一個變數
        // 第一欄位處理
        if (item[value_handleFields[0]] === "MANUAL_CLOCK_IN") {
          verifyModeString = item[value_handleFields[0]] = this.disp_clockIn;
        } else if (item[value_handleFields[0]] === "MANUAL_CLOCK_OUT") {
          verifyModeString = item[value_handleFields[0]] = this.disp_clockOut;
        }

        // 第二欄位處理
        let userName = `${item.name}\n${item.id}`;
            
        // 第二欄位處理
        // let groupList = item.group_list;
        // groupList = groupList.join('\n');

        // 第三欄位處理
        let timestamp = item.timestamp; // 抓修改時間存起來

        const date = new Date(timestamp); // 轉時間 Thu Jun 08 2023 23:59:59 GMT+0800 (台北標準時間)
        let formattedDate //第三個變數
        // avoid date errors
        if (!isNaN(date)) {
          formattedDate= date.toLocaleString(); // 轉格式
        } else {
          formattedDate = timestamp;
        }

        // 第四欄位處理 
        // const remark = item.remark; // 這一欄有改過所以要重新寫
        // console.log(remark,"這一欄有改過所以要重新寫")
        const remark = item[value_handleFields[3]] || "" ;
        // if (remark === "manually clock in") {
        //   remark = this.dis_manually_clock_in; //如果是忘記打卡 顯示忘記打卡
        // } else {
        //   remark = item[value_handleFields[3]] || "" ; //否則顯示其他 其他應該是自己打得所以吐回原資料
        // }

        // 第五欄位處理
        
        let modifier_time =  item["modifier_time"]; //抓修改時間存起來
        const modifierDate  = new Date(modifier_time); //轉時間
        const formattedDateTime = modifierDate.toLocaleString(); //轉格式 
        
        let modifierData = [ item["modifier"] , formattedDateTime]; // 組人名跟時間
        let modifier = `${modifierData[0]}\n${modifierData[1]}`;
        // item["modifier"] = `${modifierData[0]}\n${modifierData[1]}`;

        modifyFieldsData.push({verify_mode_string:verifyModeString, name:userName, timestamp:formattedDate, remark:remark, modifier:modifier})
      
        console.log(modifyFieldsData,"更動資料");
      });
      return modifyFieldsData;
    },

    // 表格資料處理及搜尋
    generateFilteredData(sourceData, filter) {
      const self = this;

      //關鍵字搜尋  item.name裡面看有沒有找到filter
      const filteredItems = self.value_keyword.length == 0 ? sourceData : sourceData.filter((item) => {
              return (
                item.name.toLowerCase().indexOf(self.value_keyword.toLowerCase()) > -1
              );
            });

      self.value_tablePage.totalResult = filteredItems.length; /**總筆數 */


      const sliceList = filteredItems.slice(
        (self.value_tablePage.currentPage - 1) * self.value_tablePage.pageSize,
        self.value_tablePage.currentPage * self.value_tablePage.pageSize
      );
      console.log(sliceList,"sliceListABCS")
      return Object.assign([], sliceList);
    },

    headerCellStyle(row, column, rowIndex, columnIndex) {
      return "fontSize: 18px";
    },
      cellStyle(row, column, rowIndex, columnIndex) {
      return "fontSize:18px;";
    },
    datePickerDataChange() {
      const self = this;
      self.flag_enableSearchButton = true;
    },
    changeAttendance() {
      this.$router.push("ChangeAttendance");
    },

    
  }
 
}

</script>