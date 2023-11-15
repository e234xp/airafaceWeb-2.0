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
            <CInput class="mb-form-row" size="lg" type="date" :value="value_searchDate" v-model="value_searchDate"
              :invalid-feedback="disp_dateDepiction" :is-valid="handleDate"
              onfocus="this.max=new Date().toISOString().split('T')[0]" />
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
          format="HH:mm" v-model="value_clockInTime" :disabled-time="notAfterNow"></date-picker>
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
            :maxLength="maxLength" type="text" value="OtherDirections" v-model="disp_forgotClockIn" required />
          <p class="invalid-feedback" v-if="disp_forgotClockIn.length === 0">{{ disp_reasonReasonDepiction }}</p>
        </div>
      </CCol>
    </CRow>

    <!-- 儲存按鈕 -->
    <div class="d-flex ml-3 justify-content-end">
      <CButton class="btn btn-primary btn-w-normal mb-3" size="lg" @click="saveData()" :disabled="saveButtonStatus"
        ref="save">
        {{ disp_save }}
      </CButton>
    </div>

  </div>
</template>

<script>
  import i18n from '@/i18n';

  import VueSelect from 'vue-select';

// import CTableWrapper from '../../reports/ReportTable.vue';

const defaultlState = () => ({
  obj_loading: null,

  disp_save: i18n.formatter.format('Save'),
  disp_date: i18n.formatter.format('ForgetPunchDate'),
  disp_staff: i18n.formatter.format('Staff'),
  disp_name: i18n.formatter.format('PersonName'),
  disp_group: i18n.formatter.format('Group'),
  disp_clockIn: i18n.formatter.format('ClockIn'),
  disp_clockOut: i18n.formatter.format('ClockOut'),
  disp_currentRecords: i18n.formatter.format('CurrentRecords'),
  disp_time: i18n.formatter.format('Time'),
  disp_reason: i18n.formatter.format('reason'),
  disp_reasonReasonDepiction: i18n.formatter.format('ReasonDepiction'), // 事由 提示字樣*/
  disp_dateDepiction: i18n.formatter.format('DateDepiction'), // 日期 提示字樣*/
  disp_forgotClockIn: i18n.formatter.format('ForgotAttendanceRecord'),
  disp_other: i18n.formatter.format('Other'),
  disp_lessThan50words: i18n.formatter.format('lessThan50words'),
  disp_pleaseEnterName: i18n.formatter.format('PleaseEnterName'),

  flag_enableSearchButton: false,

  value_searchDate: new Date().yyyy_mm_dd(), // 單個日期 */
  value_dataItemsToShow: [], // 綁定的資料 */
  value_allTableItems: [], // api資料存放 */
  value_clockInRecords: 'ClockIn',
  value_clockInReason: 'ForgotClockIn',
  value_clockInTime: null,

  maxLength: 50,
  value_otherDirections: '',
  saveButtonStatus: false,

  // 輸入框
  selectedName: '',
  nameList: [
    { value: 'A-001', label: '李子維' },
    { value: 'A-002', label: '王明' },
    { value: 'A-003', label: '洪小龍' },
    { value: 'A-004', label: '王大明' },
    { value: 'A-005', label: '張三' },
    { value: 'A-006', label: '李四' },
    { value: 'A-007', label: '李小華' },
    { value: 'A-008', label: '李大福' },
    { value: 'A-009', label: '李小美' },
    { value: 'A-010', label: '李大華' },
  ],

  finallyList: [],

  // 跳頁
  value_tablePage: {
    currentPage: 1,
    pageSize: 10,
    totalResult: 0,
  },
});

export default {
  name: 'ChangeAttendanceForm',
  props: {
    onFinish: { type: Function, default: () => null },
  },
  components: {
    'v-select': VueSelect,
  },
  data() {
    return defaultlState();
  },
  watch: {
    selectedName(newValue) {
      if (this.selectedName === null) { this.value_dataItemsToShow = []; }
      this.selectedName = newValue;
      // 有值做事
      if (this.selectedName) {
        this.autoSearch(); // 值被改變查
      }
    },
    value_searchDate(newValue) {
      this.value_searchDate = newValue;
      this.autoSearch();
    },
  },
  async created() {
    // 顯示今天當預設日期
    const self = this;

    // parma_videoGroupList
    self.flag_enableSearchButton = true;

    // 上下班時間
    self.value_clockInTime = new Date();
  },
  mounted() {
    this.formatNameList();
  },
  methods: {
    notAfterNow(date) {
      date.setFullYear(
        this.value_searchDate.slice(0, 4),
        +this.value_searchDate.slice(5, 7) - 1,
        this.value_searchDate.slice(8, 10),
      );

      return date > new Date();
    },

    handleDate() {
      const selectDate = this.value_searchDate;
      const Today = new Date().yyyy_mm_dd();
      if (Today < selectDate) {
        this.saveButtonStatus = true;
        this.$refs.save.style.cursor = 'auto';
      } else {
        this.saveButtonStatus = false;
      }
    },
    // headerCellStyle(row, column, rowIndex, columnIndex) {
    headerCellStyle() {
      return 'fontSize: 18px';
    },
    // cellStyle(row, column, rowIndex, columnIndex) {
    cellStyle() {
      return 'fontSize:18px;';
    },

    async formatNameList() {
      const self = this;
      const ret1 = await self.$globalFindPersonWithoutPhoto('', 0, 3000);
      const personLists = ret1.data.person_list;
      const handleData = personLists.map(({ id, name, uuid }) => ({ label: `${name}(${id})`, value: uuid }));

      this.finallyList = handleData;
    },

    async saveData(cb) {
      const self = this;
      const personDatas = await self.$globalFindPersonWithoutPhoto('', 0, 3000);
      const personData = personDatas.data.person_list;

      if (!this.selectedName) return;

      // 找名字相符的 匹配到 拿個人全部資料出來 (這裡面少一段防呆 如果沒選人名就擋 不然會有error)
      const selectMatch = personData.filter((item) => {
        const str = this.selectedName.label; // 選到的人
        const selectValue = str.substring(0, str.indexOf('(')); // '處理人名 ken(1234)'
        return item.name === selectValue;
      });

      const token = self.$globalServerTokenInfo();

      /* 這邊要去處理  沒選人名或是配不到人名 要做什麼事 */
      if (selectMatch.length === 0) return;
      const parameter = selectMatch[0];

      let verifyMode; // 5 or 6
      let verifyModeString = ''; // 上、下班
      if (this.value_clockInRecords === 'ClockIn') {
        verifyMode = 5;
        verifyModeString = 'MANUAL_CLOCK_IN';
      } else if (this.value_clockInRecords === 'ClockOut') {
        verifyMode = 6;
        verifyModeString = 'MANUAL_CLOCK_OUT';
      }

      const searchDate = new Date(this.value_searchDate); // 日期
      const clockInTime = new Date(this.value_clockInTime); // 時間

      // 设置 searchDate 的时、分、秒为 clockInTime 的对应部分
      searchDate.setHours(clockInTime.getHours());
      searchDate.setMinutes(clockInTime.getMinutes());
      searchDate.setSeconds(clockInTime.getSeconds());
      searchDate.setSeconds(0);
      searchDate.setMilliseconds(0);

      // console.log('searchDate',new Date(searchDate)) //Tue Jun 20 2023 14:55:00 GMT+0800 (台北標準時間)
      // const Abc = new Date(searchDate).HHMMSS() //Abc 14:55:00 看要用哪種顯示

      // console.log('Abc',Abc);
      // 轉換為 UTC
      const utcTimestamp = searchDate.getTime();
      // console.log('utcTimestamp',utcTimestamp);

      const submitData = {
        verify_mode: verifyMode,
        verify_mode_string: verifyModeString,
        verify_uuid: uuidv4(),
        uuid: parameter.uuid,
        id: parameter.id,
        name: parameter.name,
        card_facility_code: parameter.card_facility_code,
        card_number: parameter.card_number,
        group_list: parameter.group_list,
        timestamp: utcTimestamp,
        temperature: 0,
        modifier: token.username,
        modifier_time: new Date().valueOf(),
        remark: this.disp_forgotClockIn,
      };

      // 加入成功訊息
      try {
        await self.$globalManualClockin(submitData);
        console.log('補打卡成功');

        await this.showNotificationAndGoBack(true);
        this.$router.back(-1);
      } catch (error) {
        console.error('補打卡失败', error);
        // 顯示錯誤提示並返回上一頁
        await this.showNotificationAndGoBack(false);
        this.$router.back(-1);
      }
      if (cb) cb();

      // self.$globalManualClockin( submitData, ( error, result ) => {
      //   if( cb ) cb( error == null, result );
      //   this.$router.back(-1);
      //   console.log('補打卡成功');
      // });
    },

    // 彈跳提示字樣
    showNotificationAndGoBack(pass) {
      const self = this;
      return new Promise((resolve) => {
        self.$fire({
          text: pass
            ? i18n.formatter.format('Successful')
            : i18n.formatter.format('OperationFailed'),
          type: pass ? 'success' : 'error',
          timer: 3000,
          onClose: resolve, // 在提示關閉時執行 resolve
        });
      });
    },

    autoSearch() {
      console.log(1, this.selectedName);
      if (this.selectedName === '' || this.selectedName === null) return;

      const startTime = new Date(`${this.value_searchDate} 00:00:00`).getTime();
      const endTime = new Date(`${this.value_searchDate} 23:59:59`).getTime();

      const data = {
        uuid_list: this.selectedName ? [this.selectedName.value] : [],
        start_time: startTime,
        end_time: endTime,
        slice_shift: 0,
        slice_length: 1000,
      };

      this.queryPersonResult(data.uuid_list, data.start_time, data.end_time, data.slice_shift, data.slice_length);
    },

    queryPersonResult(uuidList, startTime, endTime, sliceShift, sliceLength) {
      const self = this;
      self.$globalManualClockinResult(uuidList, startTime, endTime, sliceShift, sliceLength)
        .then((result) => {
          if (result.data.data.length !== 0) {
            self.value_allTableItems = result.data.data;

            console.log(self.value_allTableItems);
            console.log(this.selectedName, this.selectedName.value);

            self.value_dataItemsToShow = this.processFields(self.value_allTableItems);
          } else if (result.data.data.length === 0) {
            this.value_dataItemsToShow = [];
          }
        }).catch((err) => {
          console.error(err);
        });
    },

    // 處理每一個Fields
    processFields(sourceData) {
      /* api回來會有多筆資料，去跑每一筆顯示在畫面上，但欄位先處理完再丟進array */
      const modifyFieldsData = [];
      for (let i = 0; i < sourceData.length; i += 1) {
        // 各欄位資料處理
        const userName = sourceData[i].name;

        let groupList = [];
        try {
          if (!Array.isArray(sourceData[i].group_list)) {
            groupList = JSON.parse(sourceData[i].group_list);
          }
        }
        catch (ex) {
          groupList = [];
        }
        groupList = groupList.join('\n');

        // 第三欄時間處理
        const timestamp = new Date(sourceData[i].timestamp);
        const formattedDateTime = timestamp.toLocaleString();
        // console.log(formattedDateTime); //2023/5/12 上午10:55:58
        const [dateString, timeString] = formattedDateTime.split(' ');

        const modifierDT = sourceData[i].modifier_time;

        // const modifierTime = new Date(sourceData[i].modifier_time);
        // let formattedModifierTime = modifierTime.toLocaleString();
        // console.log(sourceData[i].modifier_time,'A'); //修改時間

        // 上下班欄位的時間
        let clockIn;
        let clockOut;
        const modeString = sourceData[i].verify_mode_string;

        if (modeString === 'MANUAL_CLOCK_IN') {
          clockIn = timeString;
          clockOut = '';
        } else if (modeString === 'MANUAL_CLOCK_OUT') {
          clockIn = '';
          clockOut = timeString;
        }
        modifyFieldsData.push(
          {
            userName,
            groupList,
            dateString,
            clockIn,
            clockOut,
            modifierTime: modifierDT,
          },
        );
        // return sourceData[i] = {userName:userName, groupList:groupList, dateString:dateString, clockIn:clockIn, clockOut:clockOut} //印出兩次第一次是空陣列 第二次才有值
        // console.log('tableArray',self.value_dataItemsToShow) // ['Frank', 'Group-1\nGroup-2\nAll Person', '2023/5/12', '上午10:55:58', '']
      }

      // 比較修改時間 找出最後一筆修改的資料
      const arr = [];

      const clockInArr = modifyFieldsData.filter((item) => item.clockIn !== '');
      const clockOutArr = modifyFieldsData.filter((item) => item.clockOut !== '');
      console.log('in', clockInArr, 'out ', clockOutArr);

      // 找上and下班最後一筆 修改
      const inArr = this.findLatestModifiedTime(clockInArr);
      const outArr = this.findLatestModifiedTime(clockOutArr);
      console.log('inArr', inArr, 'outArr ', outArr);

      // 因為找到最後一筆了 直接[0] 一開始有filter到資料再找clockIn，一開始是[] 就給空的
      const inTime = clockInArr.length > 0 ? inArr[0].clockIn : ''; // 上班時間
      const outTime = clockOutArr.length > 0 ? outArr[0].clockOut : ''; // 下班時間

      // 使用淺層複製創建資料  inArr[0] 是物件  inArr是陣列
      // const newData = Object.assign({}, modifyFieldsData[0]);
      const newData = { ...modifyFieldsData[0] };
      console.log('合併assign', newData);

      // 修改newData 的 clock 屬性值 抓上下班時間 [0]是上班 [1]下班
      newData.clockIn = inTime; // 上班時間
      newData.clockOut = outTime; // 下班時間
      console.log('合併', newData);

      // 暫時先把 上班跟下班都顯示在畫面上 目前有正確拿到
      // arr.push(...inArr,...outArr,newData) // 這邊目前是上班、下班、上下班
      arr.push(newData); // 這邊是正確資料 測試過沒問題之後 就把這打開
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

      // 方法3
      // const toShow = modifyFieldsData.reduce((latest, current) => {
      //   if (current.modifierTime > latest.modifierTime) {
      //     return current;
      //   } else {
      //     return latest;
      //   }
      // });

      // return [toShow];
    },
    // 找到最晚的修改時間 預設第一筆arr[0]
    findLatestModifiedTime(arr) {
      const result = [];
      let firstItem = arr[0];

      for (let i = 1; i < arr.length; i += 1) {
        if (arr[i].modifierTime > firstItem.modifierTime) {
          firstItem = arr[i];
        }
      }

      result.push(firstItem);
      return result;
    },

  },
};
</script>

<style>
  @import url('https://unpkg.com/vue-select@latest/dist/vue-select.css');
</style>
