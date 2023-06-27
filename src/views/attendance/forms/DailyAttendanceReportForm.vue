<template>
	<div>
		<div>
			<CCol sm="12">
				<div class="h1 mb-5">{{ disp_header }}</div>
			</CCol>
		</div>
		<div>
			<CCol sm="12">
				<CCol sm="12">
					<CRow class="flex-row-reverse">
						<CInput v-model.lazy="value_searchingFilter" style="width: 300px" size="lg"
							:placeholder="disp_search">
							<template #prepend-content>
								<CIcon name="cil-search" />
							</template>
						</CInput>
					</CRow>
					<!-- 上方按鈕群組 -->
					<CRow class="justify-content-between buttons-group">
						<!-- 左邊按鈕群組 返回全部 全部 正常... v-if="showDetailData()控制detail頁要不要出現-->
						<div class="d-flex buttons-group-left">
							<div v-if="showDetailData()">
								<CButton class="btn btn-outline-primary fz-md mr-2 mb-3 btn-rwd p-0"
									@click="clickOnReturnToAll()">
									<!-- <i class="fa fa-arrow-left"></i> -->
									<div class="btn-rwd-icon w-100 h-100 btn-p-md" data-coreui-toggle="tooltip"
										title="back to all records">
										<i class="bi bi-reply"></i>
									</div>
									<div class="btn-rwd-text btn-p-md">{{ disp_return }}</div>
								</CButton>
							</div>
							<div v-if="showAllData()">
								<CButton class="btn btn-outline-primary fz-md mr-2 mb-3 btn-rwd p-0"
									@click="clickOnReturnToAll()">
									<div class="btn-rwd-icon w-100 h-100 btn-p-md" data-coreui-toggle="tooltip"
										title="show all records">
										<CIcon size="sm" name="cilPeople" />
									</div>
									<div class="btn-rwd-text btn-p-md">{{ value_showAllPerson }}</div>
								</CButton>
							</div>

							<div v-if="showAllData()">
								<CButton class="btn btn-outline-success fz-md mr-2 mb-3 btn-rwd p-0"
									@click="clickOnShowGoodRecordsPerson()">
									<div data-coreui-toggle="tooltip" title="show good records"
										class="btn-rwd-icon w-100 h-100 btn-p-md">
										<i class="bi bi-person-fill"></i>
									</div>
									<div class="btn-rwd-text btn-p-md">
										{{ value_showGoodRecordsPerson }}
									</div>
								</CButton>
							</div>

							<div v-if="showAllData()">
								<CButton class="btn btn-outline-danger fz-md mr-2 mb-3 btn-rwd p-0"
									@click="clickOnShowLatePerson()">
									<div data-coreui-toggle="tooltip" title="show late records"
										class="btn-rwd-icon w-100 h-100 btn-p-md">
										<i class="bi bi-alarm-fill"></i>
									</div>
									<div class="btn-rwd-text btn-p-md">
										{{ value_showLatePerson }}
									</div>
								</CButton>
							</div>

							<div v-if="showAllData()">
								<CButton class="btn btn-outline-danger fz-md mr-2 mb-3 btn-rwd p-0"
									@click="clickOnShowLeaveEarlyPerson()">
									<div data-coreui-toggle="tooltip" title="show leave early records"
										class="btn-rwd-icon w-100 h-100 btn-p-md">
										<i class="bi bi-clock-history"></i>
									</div>
									<div class="btn-rwd-text btn-p-md">
										{{ value_showLeaveEarlyPerson }}
									</div>
								</CButton>
							</div>

							<div v-if="showAllData()">
								<CButton class="btn btn-outline-secondary fz-md mr-2 mb-3 btn-rwd p-0"
									@click="clickOnShowNoRecordPerson()">
									<div data-coreui-toggle="tooltip" title="show people with no records"
										class="btn-rwd-icon w-100 h-100 btn-p-md">
										<CIcon size="sm" name="cilUserX" />
									</div>
									<div class="btn-rwd-text btn-p-md">{{ value_showNoRecordPerson }}</div>
								</CButton>
							</div>
						</div>
						<!-- 右邊按鈕群組 -->
						<div class="d-flex">
							<!-- 今日 昨日 選擇 -->
							<div>
								<CButtonGroup v-if="showAllData()">
									<CButton class="btn btn-outline-primary fz-md nowrap-hidden"
										v-for="(value, key) in [0, 1, 2]" :key="key"
										:pressed="value === value_selectedDate ? true : false"
										@click="selectMonthType(value)">
										{{ value_selectedDateName[value] }}
									</CButton>
								</CButtonGroup>
							</div>
							<date-picker :lang="this.$globalDatePickerLanguage" style="visibility: hidden; width: 0px"
								type="date" ref="datePicker" @change="datePickerDatachange()"
								v-model="value_datePicked"></date-picker>

							<!-- 匯出 -->
							<div>
								<CButton class="btn btn-outline-primary fz-md ml-2 nowrap-hidden"
									@click="value_attendanceDataListToReview == null ? flag_masterCollapse = !flag_masterCollapse : flag_detailCollapse = !flag_detailCollapse">
									{{ disp_export }}
								</CButton>
							</div>
						</div>
					</CRow>
				</CCol>
			</CCol>
		</div>
		<CCard v-if="showAllData()" class="mt-3">
			<CCardBody>
				<div>
					<div id="dailyAttendanceReportForm">
						<vxe-table :data="value_dataItemsToShow" stripe align="center" :cell-style="cellStyle"
							:header-cell-style="headerCellStyle" ref="attMainTable" @checkbox-all="selectAllEvent"
							@checkbox-change="selectChangeEvent">
							<vxe-table-column type="checkbox" width="6%" align="center"></vxe-table-column>

							<vxe-table-column :show-overflow="ellipsisMode" field="person" :title="disp_person"
								type="html" width="10%" align="left"></vxe-table-column>
							<vxe-table-column :show-overflow="ellipsisMode" field="groups" :title="disp_group_list"
								type="html" width="12%" align="left"></vxe-table-column>
							<vxe-table-column :show-overflow="ellipsisMode" field="clockDate" :title="disp_clockDate"
								width="12%"></vxe-table-column>
							<vxe-table-column :show-overflow="ellipsisMode" field="working_time"
								:title="disp_working_time" width="14%"></vxe-table-column>
							<vxe-table-column :show-overflow="ellipsisMode" field="over_time" :title="disp_over_time"
								width="14%"></vxe-table-column>
							<vxe-table-column :show-overflow="ellipsisMode" field="clockinToShow" :title="disp_clockin"
								type="html" width="15%" align="left"></vxe-table-column>
							<!-- <vxe-table-column :show-overflow="ellipsisMode" field="clockin_temperature" :title="disp_clockin_temperature" width="8%"></vxe-table-column> -->
							<vxe-table-column :show-overflow="ellipsisMode" field="clockoutToShow"
								:title="disp_clockout" type="html" width="15%" align="left"></vxe-table-column>
							<!-- 下班時間 -->
							<!-- <vxe-table-column :show-overflow="ellipsisMode" field="clockout_temperature" :title="disp_clockout_temperature" width="8%"></vxe-table-column> -->

							<vxe-table-column field="attendanceStatus" :title="disp_dailyAttendanceStatus" type="html"
								min-width="300" />
							<vxe-table-column field="details" title="" width="60" type="html"></vxe-table-column>
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
            ]" :current-page="value_tablePage.currentPage" :page-size="value_tablePage.pageSize"
						:total="value_tablePage.totalResult" @page-change="handlePageChange">
					</vxe-pager>
				</div>
				<div>{{disp_dailyAttendanceRemark}}</div>
			</CCardBody>
		</CCard>

		<!-- 詳細頁面標題 -->
		<CCard v-if="showDetailData()">
			<CCardBody>
				<div>
					<div>
						<vxe-table :data="value_dataItemsToShowDetailData" stripe align="center" :cell-style="cellStyle"
							:header-cell-style="headerCellStyle">
							<vxe-table-column :show-overflow="ellipsisMode" field="id" :title="disp_id"
								width="12%"></vxe-table-column>
							<vxe-table-column :show-overflow="ellipsisMode" field="nameToShow" :title="disp_name"
								width="12%"></vxe-table-column>
							<vxe-table-column :show-overflow="ellipsisMode" field="groups" :title="disp_group_list"
								width="15%"></vxe-table-column>
							<vxe-table-column :show-overflow="ellipsisMode" field="clockMode" :title="disp_clockingMode"
								width="12%"></vxe-table-column>
							<vxe-table-column :show-overflow="ellipsisMode" field="clockTime" :title="disp_clockTime"
								width="12%"></vxe-table-column>
							<vxe-table-column :show-overflow="ellipsisMode" field="temperature"
								:title="disp_temperature" width="12%"></vxe-table-column>
							<vxe-table-column field="showimage" :title="disp_face_image" type="html"></vxe-table-column>
							<vxe-table-column :show-overflow="ellipsisMode" field="card_number" :title="disp_cardnumber"
								width="12%"></vxe-table-column>
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
            ]" :current-page="value_tablePageForDetailData.currentPage"
						:page-size="value_tablePageForDetailData.pageSize"
						:total="value_tablePageForDetailData.totalResult" @page-change="handlePageChangeForDetailData">
					</vxe-pager>
				</div>
			</CCardBody>
		</CCard>

		<!-- 匯出的modal -->
		<CModal :show.sync="flag_masterCollapse">
			<template #header>
				<div class="alertModal_Title">{{ disp_ExportSetting }}</div>
			</template>
			<CRow>
				<CCol col="3" class="pt-2 label">{{ disp_FileType }}</CCol>
				<CCol col="9">
					<CSelect size="lg" :value.sync="value_fileType" :options="[`.txt`, `.csv`, `.xlsx`]" />
				</CCol>
			</CRow>
			<CRow>
				<CCol col="3" class="pt-2 label">{{ disp_txtSeparator }}</CCol>
				<CCol col="9">
					<CSelect size="lg" :disabled="value_fileType == '.xlsx'" :value.sync="value_txtSeparator" :options="[
              { label: `comma (,)`, value: ',' },
              { label: `space (_)`, value: 'S' },
              { label: `tab (\\t)`, value: 'T' },
              { label: `semicolon (;)`, value: ';' },
              { label: `customize (TBD)`, value: '' },
            ]" />
					<CInput v-model="value_separator" v-show="value_txtSeparator ==''" type="text" size="lg" />
				</CCol>
			</CRow>
			<CRow>
				<CCol col="3" class="pt-2 label">{{ disp_Snapshot }}</CCol>
				<CCol col="9">
					<CSelect size="lg" :value.sync="value_snapshotFileType" :disabled="value_fileType != '.xlsx'"
						:options="[`Excluded`, `Embaded`, `Files`]" />
				</CCol>
			</CRow>

			<CRow>
				<CCol col="3" class="pt-2 label">{{ disp_Fields }}
				</CCol>
				<CCol col="9">
					<ul class="list-group">
						<li class="list-group-item" v-for="(item, index) in value_masterexportFields">
							<input class="form-check-input me-1" type="checkbox" value="item" checked
								@change="fieldChanged('MASTER', item, $event)"> {{ value_masterfieldsforExport.find(
							(field) =>
							{return field.key == item}).value }}
							<CButton style="float:right;width: 40px; min-width:unset;"
								@click="fieldMove('MASTER', item, -1)">
								<CIcon name="cil-arrow-thick-top" />
							</CButton>
							<CButton style="float:right;width: 40px; min-width:unset;"
								@click="fieldMove('MASTER', item, 1)">
								<CIcon name="cil-arrow-thick-bottom" />
							</CButton>
						</li>

						<li class="list-group-item" v-for="(item, index) in value_masternotinExportList">
							<input class="form-check-input me-1" type="checkbox" value="item"
								@change="fieldChanged('MASTER', item, $event)"> {{ value_masterfieldsforExport.find(
							(field) =>
							{return
							field.key == item}).value}}
						</li>
					</ul>

				</CCol>
			</CRow>
			<template #footer-wrapper>
				<footer class="modal-footer">
					<CButton class="ml-1 btn-temp" color="secondary" @click="flag_masterCollapse=false">
						{{disp_Cancel}}
					</CButton>
					<CButton class="ml-1 btn-temp" color="primary" @click="clickOnExport" style="min-width: unset;">
						{{ disp_Apply }}
					</CButton>

				</footer>
			</template>
		</CModal>

		<CModal :show.sync="flag_detailCollapse">
			<template #header>
				<div class="alertModal_Title">{{ disp_ExportSetting }}</div>
			</template>
			<CRow>
				<CCol col="3" class="pt-2 label">{{ disp_FileType }}</CCol>
				<CCol col="9">
					<CSelect size="lg" :value.sync="value_fileType" :options="[`.txt`, `.csv`, `.xlsx`]" />
				</CCol>
			</CRow>
			<CRow>
				<CCol col="3" class="pt-2 label">{{ disp_txtSeparator }}</CCol>
				<CCol col="9">
					<CSelect size="lg" :disabled="value_fileType == '.xlsx'" :value.sync="value_txtSeparator" :options="[
              { label: `comma (,)`, value: ',' },
              { label: `space (_)`, value: 'S' },
              { label: `tab (\\t)`, value: 'T' },
              { label: `semicolon (;)`, value: ';' },
              { label: `customize (TBD)`, value: '' },
            ]" />
					<CInput v-model="value_separator" v-show="value_txtSeparator ==''" type="text" size="lg" />
				</CCol>
			</CRow>
			<CRow>
				<CCol col="3" class="pt-2 label">{{ disp_Snapshot }}</CCol>
				<CCol col="9">
					<CSelect size="lg" :value.sync="value_snapshotFileType" :disabled="value_fileType != '.xlsx'"
						:options="[`Excluded`, `Embaded`, `Files`]" />
				</CCol>
			</CRow>

			<CRow>
				<CCol col="3" class="pt-2 label">{{ disp_Fields }}
				</CCol>
				<CCol col="9">
					<ul class="list-group">
						<li class="list-group-item" v-for="(item, index) in value_detailexportFields">
							<input class="form-check-input me-1" type="checkbox" value="item" checked
								@change="fieldChanged('DETAIL', item, $event)"> {{ value_detailfieldsforExport.find(
							(field) =>
							{return field.key == item}).value }}
							<CButton style="float:right;width: 40px; min-width:unset;"
								@click="fieldMove('DETAIL', item, -1)">
								<CIcon name="cil-arrow-thick-top" />
							</CButton>
							<CButton style="float:right;width: 40px; min-width:unset;"
								@click="fieldMove('DETAIL', item, 1)">
								<CIcon name="cil-arrow-thick-bottom" />
							</CButton>
						</li>

						<li class="list-group-item" v-for="(item, index) in value_detailnotinExportList">
							<input class="form-check-input me-1" type="checkbox" value="item"
								@change="fieldChanged('DETAIL', item, $event)"> {{ value_detailfieldsforExport.find(
							(field) =>
							{return
							field.key == item}).value}}
						</li>
					</ul>

				</CCol>
			</CRow>
			<template #footer-wrapper>
				<footer class="modal-footer">
					<CButton class="ml-1 btn-temp" color="secondary" @click="flag_detailCollapse=false">
						{{disp_Cancel}}
					</CButton>
					<CButton class="ml-1 btn-temp" color="primary" @click="clickOnExport" style="min-width: unset;">
						{{ disp_Apply }}
					</CButton>

				</footer>
			</template>
		</CModal>
	</div>
</template>
<script>
	import { mapState } from "vuex";
	import TableObserver from "@/utils/TableObserver.vue";
	import * as coreui from "@coreui/coreui";
	import i18n from "@/i18n";
	import FileSaver from "file-saver";
	import Excel from "exceljs/dist/exceljs.min.js";

	import JsZip from "jszip";

	Date.prototype.yyyy_mm_dd = function () {
		var mm = this.getMonth() + 1; // getMonth() is zero-based
		var dd = this.getDate();
		return [
			this.getFullYear() + "-",
			(mm > 9 ? "" : "0") + mm + "-",
			(dd > 9 ? "" : "0") + dd,
		].join("");
	};

	Date.prototype.MMddHHMM = function () {
		var mm = this.getMonth() + 1;
		var dd = this.getDate();

		var HH = this.getHours();
		var MM = this.getMinutes();

		return [
			(mm > 9 ? "" : "0") + mm + "/",
			(dd > 9 ? "" : "0") + dd + " ",
			(HH > 9 ? "" : "0") + HH + ":",
			(MM > 9 ? "" : "0") + MM,
		].join("");
	};

	Date.prototype.MMdd = function () {
		var mm = this.getMonth() + 1;
		var dd = this.getDate();

		return [(mm > 9 ? "" : "0") + mm + "-", (dd > 9 ? "" : "0") + dd].join("");
	};

	Date.prototype.HHMMSS = function () {
		var HH = this.getHours();
		var MM = this.getMinutes();
		var SS = this.getSeconds();

		return [
			(HH > 9 ? "" : "0") + HH + ":",
			(MM > 9 ? "" : "0") + MM + ":",
			(SS > 9 ? "" : "0") + SS,
		].join("");
	};

	Date.prototype.yyyymmdd = function () {
		var mm = this.getMonth() + 1; // getMonth() is zero-based
		var dd = this.getDate();

		return [this.getFullYear(), (mm > 9 ? "" : "0") + mm, (dd > 9 ? "" : "0") + dd].join(
			""
		);
	};

	const defaultlState = () => {
		return {
			obj_loading: null,

			flag_downloadingExecl: false,
			flag_masterCollapse: false,
			flag_detailCollapse: false,
			excelExecutionAmounts: 0,
			excelCounter: 0,
			exportNo: 0,

			value_emptyPhoto:
				"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAAXNSR0IArs4c6QAAAERlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAA6ABAAMAAAABAAEAAKACAAQAAAABAAAAAaADAAQAAAABAAAAAQAAAAD5Ip3+AAAADUlEQVQIHWM4ceLEfwAIDANYXmnp+AAAAABJRU5ErkJggg==",
			value_dataItemsToShow: [],
			value_allTableItems: [],
			value_tablePage: {
				currentPage: 1,
				pageSize: 7,
				totalResult: 0,
			},
			value_tablePageForDetailData: {
				currentPage: 1,
				pageSize: 10,
				totalResult: 0,
			},
			value_searchingFilter: "",

			disp_id: i18n.formatter.format("PersonId"),
			disp_name: i18n.formatter.format("PersonName"),
			disp_person: i18n.formatter.format("Person"),

			disp_department: i18n.formatter.format("Department"),
			disp_clockDate: i18n.formatter.format("Date"),
			disp_clockin: i18n.formatter.format("ClockInTime"),
			disp_clockin_temperature: i18n.formatter.format("Temperature"),
			disp_clockout: i18n.formatter.format("ClockOutTime"),
			disp_clockout_temperature: i18n.formatter.format("Temperature"),
			disp_working_time: i18n.formatter.format("WorkingTime"),
			disp_over_time: i18n.formatter.format("Overtime"),
			disp_cardnumber: i18n.formatter.format("CardNumber"),
			disp_group_list: i18n.formatter.format("Group"),
			disp_face_image: i18n.formatter.format("CapturedPhoto"),

			disp_search: i18n.formatter.format("Search"),
			disp_export: i18n.formatter.format("Export"),
			disp_clockTime: i18n.formatter.format("ClockTime"),
			disp_clockingMode: i18n.formatter.format("ClockingMode"),
			disp_temperature: i18n.formatter.format("Temperature"),
			disp_return: i18n.formatter.format("ReturnToAll"),
			disp_header: "none", //i18n.formatter.format("None"),
			disp_dailyAttendanceStatus: i18n.formatter.format("DailyAttendanceStatus"),
			disp_dailyAttendanceRemark: i18n.formatter.format("WorkingHousCalculatingTip"),

			disp_ExportSetting: i18n.formatter.format("ExportSetting"),

			disp_FileType: i18n.formatter.format("FileType"),
			disp_txtSeparator: i18n.formatter.format("txtSeparator"),
			disp_Snapshot: i18n.formatter.format("CapturedPhoto"),
			disp_Fields: i18n.formatter.format("FieldName"),

			disp_Cancel: i18n.formatter.format("Cancel"),
			disp_Apply: i18n.formatter.format("Apply"),

			value_fileType: ".xlsx",
			value_txtSeparator: ",",
			value_separator: "",
			value_snapshotFileType: "",

			value_masterfieldsforExport: [
				{ key: "id", value: i18n.formatter.format("PersonId") },
				{ key: "name", value: i18n.formatter.format("PersonName") },
				{ key: "group_list", value: i18n.formatter.format("Group") },
				{ key: "timestamp", value: i18n.formatter.format("Date") },
				{ key: "workingTime", value: i18n.formatter.format("WorkingTime") },
				{ key: "overTime", value: i18n.formatter.format("Overtime") },
				{ key: "clockinTime", value: i18n.formatter.format("ClockInTime") },
				{ key: "clockinTemperature", value: i18n.formatter.format("Temperature") },
				{ key: "clocoutTime", value: i18n.formatter.format("ClockOutTime") },
				{ key: "clockoutTemperature", value: i18n.formatter.format("Temperature") }
			],

			value_masterexportFields: [
				"id",
				"name",
				"group_list",
				"timestamp",
				"workingTime",
				"overTime",
				"clockinTime",
				"clockinTemperature",
				"clocoutTime",
				"clockoutTemperature"
			],

			value_masternotinExportList: [

			],

			value_detailfieldsforExport: [
				{ key: "id", value: i18n.formatter.format("PersonId") },
				{ key: "name", value: i18n.formatter.format("PersonName") },
				{ key: "group_list", value: i18n.formatter.format("Group") },
				{ key: "mode", value: i18n.formatter.format("ClockingMode") },
				{ key: "clockTime", value: i18n.formatter.format("ClockTime") },
				{ key: "temperature", value: i18n.formatter.format("Temperature") },
				{ key: "face_image", value: i18n.formatter.format("CapturedPhoto") },
				{ key: "cardno", value: i18n.formatter.format("CardNumber") }
			],

			value_detailexportFields: [
				"id",
				"name",
				"group_list",
				"mode",
				"clockTime",
				"temperature",
				"face_image",
				"cardno"
			],

			value_detailnotinExportList: [

			],

			// 0 : no status, 1 : show on time, 2 : leave on time, 3 : too late to show, 4 : too early to leave, 5 : no show // e74d7c
			value_attendanceStatusColor: [
				"#fff",
				"#57bd37",
				"#57bd37",
				"#ee7447",
				"#ee7447",
				"#d8cde3",
			],

			value_specifiedDate: new Date(),
			value_attendanceDataListToReview: null,
			value_dataItemsToShowDetailData: [],
			value_selectedDate: 0,
			value_selectedDateNameType2: i18n.formatter.format("Select"),
			value_selectedDateName: [
				i18n.formatter.format("Today"),
				i18n.formatter.format("Yesterday"),
				i18n.formatter.format("Select"),
			],
			value_datePicked: null,
			value_showAllPerson: "",
			value_showLatePerson: "",
			value_showLeaveEarlyPerson: "",
			value_showNoRecordPerson: "",
			value_showGoodRecordsPerson: "",
			value_workingHourSettings: {
				defined_clockin_time_hour: 9,
				defined_clockin_time_min: 0,
				defined_clockin_time_late_enabled: true, //
				defined_clockin_time_buffer_mins: 15,
				defined_clockin_adjustment_enabled: false, //
				defined_clockout_time_hour: 18,
				defined_clockout_time_min: 0,
				defined_clockout_time_early_leave_enabled: true, //
				defined_clockout_time_buffer_mins: 15,
				defined_clockout_adjustment_enabled: false, //
				defined_overtime_enabled: true, //
				defined_overtime_time_hour: 19, //
				defined_overtime_time_min: 0, //
				defined_overtime_minimum_min: 0, //
				defined_break_time_mins: 60, //
				specified_holidays: [{ date_time: 0 }],
				specified_non_holidays: [{ date_time: 0 }],
			},
		};
	};
	export default {
		name: "DailyAttendanceReportForm",
		props: {
			formData: Object,
			onFetchPersonDataCallback: { type: Function },
			onFetchPersonAttendanceDataCallback: { type: Function },
		},
		data() {
			return Object.assign({}, defaultlState(), this.formData);
		},
		created() { },
		mixins: [TableObserver],
		mounted() {
			const self = this;
			self.$globalGetAttendanceSettings(function (err, data) {
				if (!err) {
					self.value_workingHourSettings = data; //Object.assign( {},  data );
					self.refreshTableItems();
				}
			});

			this.initToggles();
		},
		computed: {
			...mapState(["ellipsisMode"]),
		},

		updated() {
			const self = this;
			if (self.showAllData()) {
				self.value_dataItemsToShow.forEach((item) => {
					const detailsButtonId = "actionOnDetails_" + item.uuid;
					document.getElementById(detailsButtonId).addEventListener("click", function () {
						self.clickOnDetails(item);
					});
				});
			}
		},

		watch: {
			value_searchingFilter: function (value) {
				const self = this;
				self.value_tablePage.currentPage = 1;
				self.value_tablePageForDetailData.currentPage = 1;
				if (this.showAllData())
					this.value_dataItemsToShow = this.generateFilteredData(
						this.value_allTableItems,
						this.value_searchingFilter
					);
				else
					this.value_dataItemsToShowDetailData = this.generateFilteredDataForDetailData(
						this.value_attendanceDataListToReview,
						this.value_searchingFilter
					);
			},
		},
		methods: {
			datePickerDatachange() {
				const self = this;
				//console.log(self.value_datePicked )
				self.value_specifiedDate = self.value_datePicked;
				self.value_selectedDateName[2] = self.value_specifiedDate.yyyy_mm_dd();
				self.refreshTableItems();
			},
			selectMonthType(type) {
				const self = this;
				self.value_selectedDate = type;

				/* 當我選今日or昨日 最後一個都要是選擇*/
				switch (type) {
					case 0:
						{
							const today = new Date();
							self.value_specifiedDate = today;
							self.value_selectedDateName[2] = self.value_selectedDateNameType2;

							self.refreshTableItems();
						}
						break;
					case 1:
						{
							const today = new Date();
							const yesterday = new Date(today);
							yesterday.setDate(yesterday.getDate() - 1);

							self.value_specifiedDate = yesterday;
							self.value_selectedDateName[2] = self.value_selectedDateNameType2;

							self.refreshTableItems();
						}
						break;
					case 2:
						{
							self.$refs.datePicker.openPopup();
						}
						break;
				}
			},
			fieldChanged(mode, item, evt) {
				const self = this;

				if (evt.target.checked) {
					if (mode == "MASTER") {
						let idx1 = self.value_masterexportFields.indexOf(item);
						let idx2 = self.value_masternotinExportList.indexOf(item);

						if (idx1 < 0)
							self.value_masterexportFields.push(item);

						if (idx2 >= 0)
							self.value_masternotinExportList.splice(idx2, 1);

						if (self.value_masterexportFields.length >= 1) {
							let popped = self.value_masterexportFields.pop();
							self.value_masterexportFields.push(popped);
						}

						if (self.value_masternotinExportList.length >= 1) {
							let popped = self.value_masternotinExportList.pop();
							self.value_masternotinExportList.push(popped);
						}
					}
					else if (mode == "DETAIL") {
						let idx1 = self.value_detailexportFields.indexOf(item);
						let idx2 = self.value_detailnotinExportList.indexOf(item);

						if (idx1 < 0)
							self.value_detailexportFields.push(item);

						if (idx2 >= 0)
							self.value_detailnotinExportList.splice(idx2, 1);

						if (self.value_detailexportFields.length >= 1) {
							let popped = self.value_detailexportFields.pop();
							self.value_detailexportFields.push(popped);
						}

						if (self.value_detailnotinExportList.length >= 1) {
							let popped = self.value_detailnotinExportList.pop();
							self.value_detailnotinExportList.push(popped);
						}
					}
				}
				else {
					if (mode == "MASTER") {
						let idx1 = self.value_masterexportFields.indexOf(item);
						let idx2 = self.value_masternotinExportList.indexOf(item);

						// add to unchecked list
						if (idx2 < 0)
							self.value_masternotinExportList.push(item);

						// remove to checked list
						if (idx1 >= 0)
							self.value_masterexportFields.splice(idx1, 1);

						// refresh
						if (self.value_masterexportFields.length >= 1) {
							let popped = self.value_masterexportFields.pop();
							self.value_masterexportFields.push(popped);
						}

						if (self.value_masternotinExportList.length >= 1) {
							let popped = self.value_masternotinExportList.pop();
							self.value_masternotinExportList.push(popped);
						}
					}
					else if (mode == "DETAIL") {
						let idx1 = self.value_detailexportFields.indexOf(item);
						let idx2 = self.value_detailnotinExportList.indexOf(item);

						// add to unchecked list
						if (idx2 < 0)
							self.value_detailnotinExportList.push(item);

						// remove to checked list
						if (idx1 >= 0)
							self.value_detailexportFields.splice(idx1, 1);

						// refresh
						if (self.value_detailexportFields.length >= 1) {
							let popped = self.value_detailexportFields.pop();
							self.value_detailexportFields.push(popped);
						}

						if (self.value_detailnotinExportList.length >= 1) {
							let popped = self.value_detailnotinExportList.pop();
							self.value_detailnotinExportList.push(popped);
						}
					}
				}
			},

			fieldMove(mode, item, step) {
				const self = this;

				if (mode == "MASTER") {
					let idx = self.value_masterexportFields.indexOf(item);

					if ((step == -1) && (idx == 0)) return;
					if ((step == 1) && (idx == self.value_masterexportFields.length - 1)) return;

					let temp = self.value_masterexportFields[idx];
					self.value_masterexportFields[idx] = self.value_masterexportFields[idx + step];
					self.value_masterexportFields[idx + step] = temp;

					if (self.value_masterexportFields.length >= 1) {
						let popped = self.value_masterexportFields.pop();
						self.value_masterexportFields.push(popped);
					}
				}
				else if (mode == "DETAIL") {
					let idx = self.value_detailexportFields.indexOf(item);

					if ((step == -1) && (idx == 0)) return;
					if ((step == 1) && (idx == self.value_detailexportFields.length - 1)) return;

					let temp = self.value_detailexportFields[idx];
					self.value_detailexportFields[idx] = self.value_detailexportFields[idx + step];
					self.value_detailexportFields[idx + step] = temp;

					if (self.value_detailexportFields.length >= 1) {
						let popped = self.value_detailexportFields.pop();
						self.value_detailexportFields.push(popped);
					}
				}
			},

			showAllData() {
				return null == this.value_attendanceDataListToReview; // ? "d-block" : "d-none";
			},
			showDetailData() {
				//return true;//null != this.value_attendanceDataListToReview ? "d-block" : "d-none";
				return null != this.value_attendanceDataListToReview;
			},
			clickOnReturnToAll() {
				const self = this;
				self.value_searchingFilter = "";
				self.value_attendanceDataListToReview = null;
				self.value_dataItemsToShowDetailData = [];
				self.value_tablePage = {
					currentPage: 1,
					pageSize: 7,
					totalResult: 0,
				};
				self.value_dataItemsToShow = self.generateFilteredData(
					self.value_allTableItems,
					self.value_searchingFilter
				);
				setTimeout(() => {
					self.observeTableSize();
				}, 500);
			},
			clickOnShowLatePerson() {
				const self = this;
				self.value_searchingFilter = "";
				self.value_tablePage = {
					currentPage: 1,
					pageSize: 7,
					totalResult: 0,
				};
				if (self.value_allTableItems.length > 0) {
					let ss = self.value_allTableItems.filter((a) => {
						return a.late > 0;
					});
					self.value_dataItemsToShow = self.generateFilteredData(
						ss,
						self.value_searchingFilter
					);
				}
			},
			clickOnShowLeaveEarlyPerson() {
				const self = this;
				self.value_searchingFilter = "";
				self.value_tablePage = {
					currentPage: 1,
					pageSize: 7,
					totalResult: 0,
				};
				if (self.value_allTableItems.length > 0) {
					let ss = self.value_allTableItems.filter((a) => {
						return a.early > 0;
					});
					self.value_dataItemsToShow = self.generateFilteredData(
						ss,
						self.value_searchingFilter
					);
				}
			},
			clickOnShowNoRecordPerson() {
				const self = this;
				self.value_searchingFilter = "";
				self.value_tablePage = {
					currentPage: 1,
					pageSize: 7,
					totalResult: 0,
				};
				if (self.value_allTableItems.length > 0) {
					let ss = self.value_allTableItems.filter((a) => {
						return a.no_record > 0;
					});
					self.value_dataItemsToShow = self.generateFilteredData(
						ss,
						self.value_searchingFilter
					);
				}
			},
			clickOnShowGoodRecordsPerson() {
				const self = this;
				self.value_searchingFilter = "";
				self.value_tablePage = {
					currentPage: 1,
					pageSize: 7,
					totalResult: 0,
				};
				if (self.value_allTableItems.length > 0) {
					let ss = self.value_allTableItems.filter((a) => {
						return a.late == 0 && a.early == 0 && a.no_record == 0;
					});
					self.value_dataItemsToShow = self.generateFilteredData(
						ss,
						self.value_searchingFilter
					);
				}
			},
			clickOnDetails(item) {
				this.value_searchingFilter = "";
				this.value_tablePageForDetailData = {
					currentPage: 1,
					pageSize: 10,
					totalResult: 0,
				};
				if (item.attendance_data_list && item.attendance_data_list.length > 0) {
					this.value_attendanceDataListToReview = item.attendance_data_list;
					this.value_dataItemsToShowDetailData = this.generateFilteredDataForDetailData(
						this.value_attendanceDataListToReview,
						this.value_searchingFilter
					);
				}
			},
			async clickOnExport() {
				let self = this;

				self.flag_downloadingExecl = true;

				if (self.showDetailData()) {
					self.clickOnExportDetail();
					return;
				}

				switch (self.value_fileType) {
					case ".xlsx": self.exportMaterToExcel(); break;
					case ".txt": self.exportMasterToTXTCSV(); break;
					case ".csv": self.exportMasterToTXTCSV(); break;
				}

				self.flag_downloadingExecl = false;
			},

			exportMaterToExcel() {
				let self = this;

				var zip = new JsZip();

				let snapshotFolder = zip.folder("snapshot");

				var workbook = new Excel.Workbook();
				var worksheet = null;

				self.exportNo = 0;
				self.excelCounter = 0;

				if (self.value_attendanceDataListToReview == null) {
					worksheet = workbook.addWorksheet(self.value_specifiedDate.MMdd());

					let columns = [{ header: "No", key: "No", width: 10 }];

					for (let i = 0; i < self.value_masterexportFields.length; i++) {
						switch (self.value_masterexportFields[i]) {
							case "id": columns.push({ header: self.disp_id, key: "id", width: 10 }); break;
							case "name": columns.push({ header: self.disp_name, key: "nameToShow", width: 10 }); break;
							case "group_list": columns.push({ header: self.disp_group_list, key: "groups", width: 10 }); break;
							case "timestamp": columns.push({ header: self.disp_clockDate, key: "clockDate", width: 10 }); break;
							case "workingTime": columns.push({ header: self.disp_working_time, key: "working_time", width: 10 }); break;
							case "overTime": columns.push({ header: self.disp_over_time, key: "over_time", width: 10 }); break;
							case "clockinTime": columns.push({ header: self.disp_clockin, key: "clockin", width: 10 }); break;
							case "clockinTemperature": columns.push({ header: self.disp_clockin_temperature, key: "clockin_temperature", width: 10 }); break;
							case "clocoutTime": columns.push({ header: self.disp_clockout, key: "clockout", width: 10 }); break;
							case "clockoutTemperature": columns.push({ header: self.disp_clockout_temperature, key: "clockout_temperature", width: 10 }); break;
						}
					}

					worksheet.columns = columns;
					self.excelExecutionAmounts = self.value_allTableItems.length;

					let d = self.value_specifiedDate.getDate() - 1;
					for (let idx = 0; idx < self.value_allTableItems.length; idx++) {
						self.exportNo++;
						self.excelCounter++;

						var item = self.value_allTableItems[idx];

						{
							item["nameToShow"] = item.name;

							item["clockin"] = "";
							item["clockin_temperature"] = "";
							item["clockout"] = "";
							item["clockout_temperature"] = "";

							if (item.attendance_data_list && item.attendance_data_list.length >= 1) {
								let inRecord = item.attendance_data_list.filter(r => r.verify_mode == 3);
								if (inRecord.length == 0)
									inRecord = item.attendance_data_list.filter(r => r.verify_mode == 1 || r.verify_mode == 2);

								if (inRecord.length >= 1) {
									item["clockin"] = new Date(item.attendance_data_list[0].timestamp).HHMMSS();
									item["clockin_temperature"] = item.attendance_data_list[0].temperature;
								}

								let outRecord = item.attendance_data_list.filter(r => r.verify_mode == 4);
								if ((outRecord.length == 0) && (item.attendance_data_list.length >= 2))
									outRecord = item.attendance_data_list.filter(r => r.verify_mode == 1 || r.verify_mode == 2);

								if (outRecord.length >= 1) {
									item["clockout"] = new Date(
										item.attendance_data_list[item.attendance_data_list.length - 1].timestamp
									).HHMMSS();
									item["clockout_temperature"] =
										item.attendance_data_list[item.attendance_data_list.length - 1].temperature;
								}
							}

							const attendanceStatusData = self.generateAttendanceStatusData_V2(
								self.value_workingHourSettings,
								item
							);

							item["working_time"] = self.formatDurationTime(
								attendanceStatusData.attendance_data.working_time[d]
							);
							item["over_time"] = self.formatDurationTime(
								attendanceStatusData.attendance_data.over_time[d]
							);
						}

						worksheet.addRow({
							No: self.exportNo,
							id: item.id,
							nameToShow: item.nameToShow,
							groups: eval(item.group_list).join(", "),
							clockDate: self.value_specifiedDate.MMdd().replace("-", "/"),
							working_time: item.working_time,
							over_time: item.over_time,
							clockin: item.clockin,
							clockin_temperature: item.clockin_temperature,
							clockout: item.clockout,
							clockout_temperature: item.clockout_temperature
						});
					}

					if (workbook != null) {
						workbook.xlsx.writeBuffer().then((data) => {
							var filename = `Daily_Attendance_${self.value_specifiedDate
								.MMdd()
								.replace("-", "")}.xlsx`;

							var blob = new Blob([data], {
								type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
							});

							zip.file(filename, blob);

							zip.generateAsync({ type: "blob" }).then(function (content) {
								FileSaver.saveAs(
									content,
									`Daily_Attendance_${self.value_specifiedDate.MMdd().replace("-", "")}.zip`
								);
							});
						});
					}
				}
			},

			exportMasterToTXTCSV() {
				let self = this;

				var zip = new JsZip();

				let separator = self.value_txtSeparator == "" ? self.value_separator : self.value_txtSeparator;
				if (separator == "S") separator = " ";
				if (separator == "T") separator = "\t";

				let data = "";
				data += ("No" + separator + self.value_masterexportFields.join(separator) + '\r\n');

				self.exportNo = 0;

				let d = self.value_specifiedDate.getDate() - 1;
				for (let idx = 0; idx < self.value_allTableItems.length; idx++) {
					self.exportNo++;
					var item = self.value_allTableItems[idx];

					{
						item["nameToShow"] = item.name;

						item["clockin"] = "";
						item["clockin_temperature"] = "";
						item["clockout"] = "";
						item["clockout_temperature"] = "";

						if (item.attendance_data_list && item.attendance_data_list.length >= 1) {
							let inRecord = item.attendance_data_list.filter(r => r.verify_mode == 3);
							if (inRecord.length == 0)
								inRecord = item.attendance_data_list.filter(r => r.verify_mode == 1 || r.verify_mode == 2);

							if (inRecord.length >= 1) {
								item["clockin"] = new Date(item.attendance_data_list[0].timestamp).HHMMSS();
								item["clockin_temperature"] = item.attendance_data_list[0].temperature;
							}

							let outRecord = item.attendance_data_list.filter(r => r.verify_mode == 4);
							if ((outRecord.length == 0) && (item.attendance_data_list.length >= 2))
								outRecord = item.attendance_data_list.filter(r => r.verify_mode == 1 || r.verify_mode == 2);

							if (outRecord.length >= 1) {
								item["clockout"] = new Date(
									item.attendance_data_list[item.attendance_data_list.length - 1].timestamp
								).HHMMSS();
								item["clockout_temperature"] =
									item.attendance_data_list[item.attendance_data_list.length - 1].temperature;
							}
						}

						item["late"] = 0;
						item["early"] = 0;
						item["no_record"] = 0;

						const attendanceStatusData = self.generateAttendanceStatusData_V2(
							self.value_workingHourSettings,
							item
						);

						item["working_time"] = self.formatDurationTime(
							attendanceStatusData.attendance_data.working_time[d]
						);
						item["over_time"] = self.formatDurationTime(
							attendanceStatusData.attendance_data.over_time[d]
						);
					}

					let ln = [self.exportNo];
					for (let i = 0; i < self.value_masterexportFields.length; i++) {
						switch (self.value_masterexportFields[i]) {
							case "id": ln.push(item.id); break;
							case "name": ln.push(item.nameToShow); break;
							case "group_list": ln.push(eval(item.group_list).join(", ")); break;
							case "timestamp": ln.push(self.value_specifiedDate.MMdd().replace("-", "/")); break;
							case "workingTime": ln.push(item.working_time); break;
							case "overTime": ln.push(item.over_time); break;
							case "clockinTime": ln.push(item.clockin); break;
							case "clockinTemperature": ln.push(item.clockin_temperature); break;
							case "clocoutTime": ln.push(item.clockout); break;
							case "clockoutTemperature": ln.push(item.clockout_temperature); break;
						}
					}
					data += (ln.join(separator) + '\r\n');
				}

				let filename = '';
				var blob = null;

				if (self.value_fileType == ".txt") {
					filename = `Daily_Attendance_${self.value_specifiedDate.MMdd().replace("-", "")}.txt`
					blob = new Blob([data], {
						type: "text/plain;charset=utf-8"
					});
				}
				else if (self.value_fileType == ".csv") {
					filename = `Daily_Attendance_${self.value_specifiedDate.MMdd().replace("-", "")}.csv`
					blob = new Blob([data], {
						type: "text/csv;charset=utf-8"
					});
				}

				zip.file(filename, blob);

				zip.generateAsync({ type: "blob" }).then(function (content) {
					FileSaver.saveAs(
						content,
						`Daily_Attendance_${self.value_specifiedDate.MMdd().replace("-", "")}.zip`
					);
				});
			},

			clickOnExportDetail() {
				let self = this;

				switch (self.value_fileType) {
					case ".xlsx": self.exportDetailToExcel(); break;
					case ".txt": self.exportDetailToTXTCSV(); break;
					case ".csv": self.exportDetailToTXTCSV(); break;
				}
			},

			async exportDetailToExcel() {
				let self = this;

				var zip = new JsZip();

				let snapshotFolder = zip.folder("snapshot");

				var workbook = new Excel.Workbook();
				var worksheet = null;

				self.exportNo = 0;
				self.excelCounter = 0;

				var company = "";
				var personId = "";
				var personName = "";

				if (self.value_attendanceDataListToReview.length >= 1) {
					personId = self.value_attendanceDataListToReview[0].id;
					personName = self.value_attendanceDataListToReview[0].name;
				}

				worksheet = workbook.addWorksheet(self.value_specifiedDate.MMdd());

				let columns = [{ header: "No", key: "No", width: 10 }];

				for (let i = 0; i < self.value_detailexportFields.length; i++) {
					switch (self.value_detailexportFields[i]) {
						case "id": columns.push({ header: self.disp_id, key: "id", width: 10 }); break;
						case "name": columns.push({ header: self.disp_name, key: "nameToShow", width: 10 }); break;
						case "group_list": columns.push({ header: self.disp_group_list, key: "groups", width: 10 }); break;
						case "mode": columns.push({ header: self.disp_clockingMode, key: "clockMode", width: 10 }); break;
						case "clockTime": columns.push({ header: self.disp_clockTime, key: "clockTime", width: 10 }); break;
						case "temperature": columns.push({ header: self.disp_temperature, key: "temperature", width: 10 }); break;
						case "face_image": columns.push({ header: self.disp_face_image, key: "face_image", width: 10 }); break;
						case "cardno": columns.push({ header: self.disp_cardnumber, key: "card_number", width: 10 }); break;
					}
				}

				worksheet.columns = columns;
				self.excelExecutionAmounts = self.value_attendanceDataListToReview.length;

				for (let idx = 0; idx < self.value_attendanceDataListToReview.length; idx++) {
					self.exportNo++;
					self.excelCounter++;

					{
						self.value_attendanceDataListToReview[idx]["nameToShow"] =
							self.value_attendanceDataListToReview[idx].name;
						let d = new Date(self.value_attendanceDataListToReview[idx].timestamp);
						self.value_attendanceDataListToReview[idx]["clockTime"] = d.MMddHHMM();

						switch (self.value_attendanceDataListToReview[idx].verify_mode) {
							case 1:
								self.value_attendanceDataListToReview[idx]["clockMode"] = i18n.formatter.format("ClockModeCard");
								break;
							case 2:
								self.value_attendanceDataListToReview[idx]["clockMode"] = i18n.formatter.format("ClockModePass");
								break;
							case 3:
								self.value_attendanceDataListToReview[idx]["clockMode"] = i18n.formatter.format("ClockModeClockIn");
								break;
							case 4:
								self.value_attendanceDataListToReview[idx]["clockMode"] = i18n.formatter.format("ClockModeClockOut");
								break;
							case 5:
								self.value_attendanceDataListToReview[idx]["clockMode"] = i18n.formatter.format("ClockModeManualClockIn");
								break;
							case 6:
								self.value_attendanceDataListToReview[idx]["clockMode"] = i18n.formatter.format("ClockModeManualClockOut");
								break;
							default:
								self.value_attendanceDataListToReview[idx]["clockMode"] = i18n.formatter.format("None");
								break;
						}
						self.value_attendanceDataListToReview[idx]["groups"] = eval(
							self.value_attendanceDataListToReview[idx].group_list
						).join(", ");
					}

					worksheet.addRow({
						No: self.exportNo,
						id: self.value_attendanceDataListToReview[idx].id,
						nameToShow: self.value_attendanceDataListToReview[idx].nameToShow,
						card_number: self.value_attendanceDataListToReview[idx].card_number,
						groups: self.value_attendanceDataListToReview[idx].groups,
						temperature: self.value_attendanceDataListToReview[idx].temperature,
						clockMode: self.value_attendanceDataListToReview[idx].clockMode,
						clockTime: self.value_attendanceDataListToReview[idx].clockTime,
					});

					let pos = self.value_masterexportFields.indexOf('face_image');
					if (pos >= 0) {
						if (self.value_snapshotFileType == 'Embaded' || self.value_snapshotFileType == 'Files') {
							if (self.value_attendanceDataListToReview[idx].face_image_id) {
								let imageRet = await self.$globalFetchVerifyPhoto(
									self.value_attendanceDataListToReview[idx].face_image_id
								);

								if (imageRet && imageRet.data) {
									if (self.value_snapshotFileType == 'Embaded') {
										var photoId = workbook.addImage({
											base64: imageRet.data.face_image,
											extension: "jpeg",
										});
										worksheet.addImage(
											photoId,
											String.fromCharCode(64 + pos) + worksheet.rowCount + ":" + String.fromCharCode(64 + pos) + worksheet.rowCount
										);
										worksheet.lastRow.height = 60;
									}

									if (self.value_snapshotFileType == 'Files') {
										let fileTime = self.value_attendanceDataListToReview[idx].clockTime
											.replace("/", "_")
											.replace(" ", "_")
											.replace(":", "_");
										snapshotFolder.file(
											self.exportNo + "_" + fileTime + ".jpeg",
											imageRet.data.face_image,
											{ base64: true }
										);
									}
								}
							}
						}
					}
				}

				if (workbook != null) {
					workbook.xlsx.writeBuffer().then((data) => {
						var filename = `Attendance_${self.value_specifiedDate
							.MMdd()
							.replace("-", "")}_${personName}.xlsx`;

						var blob = new Blob([data], {
							type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
						});

						zip.file(filename, blob);

						zip.generateAsync({ type: "blob" }).then(function (content) {
							FileSaver.saveAs(
								content,
								`Attendance_${self.value_specifiedDate.MMdd().replace("-", "")}_${personName}.zip`
							);
						});
					});
				}

				self.flag_downloadingExecl = false;
			},

			exportDetailToTXTCSV() {
				let self = this;

				var zip = new JsZip();

				let separator = self.value_txtSeparator == "" ? self.value_separator : self.value_txtSeparator;
				if (separator == "S") separator = " ";
				if (separator == "T") separator = "\t";

				var company = "";
				var personId = "";
				var personName = "";

				if (self.value_attendanceDataListToReview.length >= 1) {
					personId = self.value_attendanceDataListToReview[0].id;
					personName = self.value_attendanceDataListToReview[0].name;
				}

				let data = "";
				data += ("No" + separator + self.value_detailexportFields.join(separator) + '\r\n');

				self.exportNo = 0;

				for (let idx = 0; idx < self.value_attendanceDataListToReview.length; idx++) {
					self.exportNo++;
					var item = self.value_attendanceDataListToReview[idx];

					{
						item["nameToShow"] = item.name;
						let d = new Date(item.timestamp);
						item["clockTime"] = d.MMddHHMM();

						switch (item.verify_mode) {
							case 1:
								item["clockMode"] = i18n.formatter.format("ClockModeCard");
								break;
							case 2:
								item["clockMode"] = i18n.formatter.format("ClockModePass");
								break;
							case 3:
								item["clockMode"] = i18n.formatter.format("ClockModeClockIn");
								break;
							case 4:
								item["clockMode"] = i18n.formatter.format("ClockModeClockOut");
								break;
							case 5:
								item["clockMode"] = i18n.formatter.format("ClockModeManualClockIn");
								break;
							case 6:
								item["clockMode"] = i18n.formatter.format("ClockModeManualClockOut");
								break;
							default:
								item["clockMode"] = i18n.formatter.format("None");
								break;
						}
						item["groups"] = eval(item.group_list).join(", ");
					}

					let ln = [self.exportNo];
					for (let i = 0; i < self.value_detailexportFields.length; i++) {
						switch (self.value_detailexportFields[i]) {
							case "id": ln.push(item.id); break;
							case "name": ln.push(item.nameToShow); break;
							case "group_list": ln.push(eval(item.group_list).join(", ")); break;
							case "mode": ln.push(item.clockMode); break;
							case "clockTime": ln.push(item.clockTime); break;
							case "temperature": ln.push(item.temperature); break;
							case "cardno": ln.push(item.card_number); break;
							case "face_image": ln.push(""); break;
						}
					}
					data += (ln.join(separator) + '\r\n');
				}

				let filename = '';
				var blob = null;

				if (self.value_fileType == ".txt") {
					filename = `Attendance_${self.value_specifiedDate.MMdd().replace("-", "")}_${personName}.txt`
					blob = new Blob([data], {
						type: "text/plain;charset=utf-8"
					});
				}
				else if (self.value_fileType == ".csv") {
					filename = `Attendance_${self.value_specifiedDate.MMdd().replace("-", "")}_${personName}.csv`
					blob = new Blob([data], {
						type: "text/csv;charset=utf-8"
					});
				}

				zip.file(filename, blob);

				zip.generateAsync({ type: "blob" }).then(function (content) {
					FileSaver.saveAs(
						content,
						`Attendance_${self.value_specifiedDate.MMdd().replace("-", "")}_${personName}.zip`
					);
				});
			},


			headerCellStyle(row, column, rowIndex, columnIndex) {
				return "fontSize:18px";
			},
			cellStyle(row, column, rowIndex, columnIndex) {
				return "padding: 0 0 0 0;fontSize:18px;";
			},
			formatBase64ToImgTag(desireWidth, desireHeight, base64ImageString) {
				const self = this;
				if (base64ImageString.length > 0)
					return `<img width="${desireWidth}" height="${desireHeight}" src="data:image/jpeg;base64,${base64ImageString}">`;
				return `<img width="${desireWidth}" height="${desireHeight}" src="${self.value_emptyPhoto}">`;
			},

			formatDurationTime(timestamp) {
				let ret = timestamp;

				let t = Math.floor(ret / 1000);
				let s = t - 60 * Math.floor(t / 60);
				t -= s;
				t = t / 60;

				let m = 0;
				if (t > 0) {
					m = t - 60 * Math.floor(t / 60);
					t -= m;
				}

				let h = 0;
				if (t > 0) h = Math.floor(t / 60);

				if (h <= 0 && m <= 0) ret = "";
				else {
					ret = h + ":";
					ret += m >= 10 ? m : "0" + m;
				}

				return ret;
			},
			generateFilteredData(sourceData, filter) {
				console.log("資料檢視", sourceData.slice(0, 10))
				const self = this;
				const filteredItems =
					filter.length == 0 ? sourceData : sourceData.filter((item) => {

						return (
							item.id.toLowerCase().indexOf(filter.toLowerCase()) > -1 ||
							item.name.toLowerCase().indexOf(filter.toLowerCase()) > -1 ||
							item.extra_info.department.toLowerCase().indexOf(filter.toLowerCase()) >
							-1
						);
					});

				self.value_tablePage.totalResult = filteredItems.length;

				let i = self.value_specifiedDate.getDate() - 1;

				filteredItems.forEach((item) => {
					item["late"] = 0;
					item["early"] = 0;
					item["no_record"] = 0;
					item["working_time"] = "";
					item["over_time"] = "";

					item["attendanceStatusData"] = self.generateAttendanceStatusData_V2(
						self.value_workingHourSettings,
						item
					);
					item["attendanceStatus"] = self.generateAttendanceStatusTable(
						item["attendanceStatusData"]
					);

					item["working_time"] = self.formatDurationTime(
						item["attendanceStatusData"].attendance_data.working_time[i]
					);
					item["over_time"] = self.formatDurationTime(
						item["attendanceStatusData"].attendance_data.over_time[i]
					);
				});
				const sliceList = filteredItems.slice(
					(self.value_tablePage.currentPage - 1) * self.value_tablePage.pageSize,
					self.value_tablePage.currentPage * self.value_tablePage.pageSize
				);
				sliceList.forEach((item) => {
					const detailsButtonId = "actionOnDetails_" + item.uuid;
					item["details"] = [
						`<div align="center">`,
						`<button type="submit" class="btn btn-outline-primary btn-detail"`,
						`id="${detailsButtonId}">`,
						`<i class="fa fa-list"/>`,
						`</button>`,
						`</div>`,
					].join("");

					item["person"] = item.name + "<br>" + item.id;
					item["groups"] = eval(item.group_list).join("<br>");

					item["clockDate"] = self.value_specifiedDate.MMdd().replace("-", "/");

					item["clockin"] = "";
					item["clockin_temperature"] = "";
					item["clockout"] = "";
					item["clockout_temperature"] = "";

					if (item.attendance_data_list) {
						item.attendance_data_list.sort(function (a, b) {
							return a.timestamp - b.timestamp;
						});

						if (item.attendance_data_list.length >= 1) {
							let inRecord = item.attendance_data_list.filter(r => r.verify_mode == 3);
							if (inRecord.length == 0)
								inRecord = item.attendance_data_list.filter(r => r.verify_mode == 1 || r.verify_mode == 2);

							if (inRecord.length >= 1) {
								item["clockin"] = new Date(item.attendance_data_list[0].timestamp).HHMMSS();
								item["clockin_temperature"] = item.attendance_data_list[0].temperature;
							}

							let outRecord = item.attendance_data_list.filter(r => r.verify_mode == 4);
							if ((outRecord.length == 0) && (item.attendance_data_list.length >= 2))
								outRecord = item.attendance_data_list.filter(r => r.verify_mode == 1 || r.verify_mode == 2);

							if (outRecord.length >= 1) {
								item["clockout"] = new Date(
									item.attendance_data_list[item.attendance_data_list.length - 1].timestamp
								).HHMMSS();
								item["clockout_temperature"] =
									item.attendance_data_list[item.attendance_data_list.length - 1].temperature;
							}
						}

						item["clockinToShow"] = item["clockin"] + "<br>" + item["clockin_temperature"];
						item["clockoutToShow"] = item["clockout"] + "<br>" + item["clockout_temperature"];
					}
				});
				self.value_showAllPerson =
					i18n.formatter.format("AllPerson") + " : " + self.value_allTableItems.length;
				self.value_showLatePerson = i18n.formatter.format("LatePerson") + " : " +
					self.value_allTableItems.filter((p) => {
						return p.late > 0;
					}).length;
				self.value_showLeaveEarlyPerson =
					i18n.formatter.format("LeaveEarly") +
					" : " +
					self.value_allTableItems.filter((p) => {
						return p.early > 0;
					}).length;
				self.value_showNoRecordPerson =
					i18n.formatter.format("NoRecord") +
					" : " +
					self.value_allTableItems.filter((p) => {
						return p.no_record > 0;
					}).length;
				self.value_showGoodRecordsPerson =
					i18n.formatter.format("GoodRecords") +
					" : " +
					self.value_allTableItems.filter((p) => {
						return p.early == 0 && p.late == 0 && p.no_record == 0;
					}).length;

				return Object.assign([], sliceList);
			},
			generateFilteredDataForDetailData(sourceData, filter) {
				const self = this;
				const filteredItems =
					filter.length == 0
						? sourceData
						: sourceData.filter((item) => {
							return (
								item.id.toLowerCase().indexOf(filter.toLowerCase()) > -1 ||
								item.name.toLowerCase().indexOf(filter.toLowerCase()) > -1
							);
						});
				self.value_tablePageForDetailData.totalResult = filteredItems.length;
				const sliceList = filteredItems.slice(
					(self.value_tablePageForDetailData.currentPage - 1) *
					self.value_tablePageForDetailData.pageSize,
					self.value_tablePageForDetailData.currentPage *
					self.value_tablePageForDetailData.pageSize
				);
				sliceList.forEach((item) => {
					item["nameToShow"] = item.name;
					let d = new Date(item.timestamp);
					item["clockTime"] = d.MMddHHMM();

					switch (item.verify_mode) {
						case 1:
							item["clockMode"] = i18n.formatter.format("ClockModeCard");
							break;
						case 2:
							item["clockMode"] = i18n.formatter.format("ClockModePass");
							break;
						case 3:
							item["clockMode"] = i18n.formatter.format("ClockModeClockIn");
							break;
						case 4:
							item["clockMode"] = i18n.formatter.format("ClockModeClockOut");
							break;
						case 5:
							item["clockMode"] = i18n.formatter.format("ClockModeManualClockIn");
							break;
						case 6:
							item["clockMode"] = i18n.formatter.format("ClockModeManualClockOut");
							break;
						default:
							item["clockMode"] = i18n.formatter.format("None");
							break;
					}
					item["groups"] = eval(item.group_list).join(", ");

					let showimageId = item.face_image_id
						? item.face_image_id.f + item.face_image_id.uuid
						: "";
					if (showimageId.length > 0) {
						item[
							"showimage"
						] = `<img id='${showimageId}' src='data:image/jpeg;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAAXNSR0IArs4c6QAAAERlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAA6ABAAMAAAABAAEAAKACAAQAAAABAAAAAaADAAQAAAABAAAAAQAAAAD5Ip3+AAAADUlEQVQIHWM4ceLEfwAIDANYXmnp+AAAAABJRU5ErkJggg==' width='100' height='100'>`;
						self.$globalFetchVerifyPhoto(item.face_image_id, function (error, data) {
							if (error == null && data) {
								item["imageb64"] = data.face_image;

								var ele = document.getElementById(showimageId);
								if (ele) ele.src = `data:image/jpeg;base64,${data.face_image}`;
							}
						});
					} else
						item[
							"showimage"
						] = `<img src='data:image/jpeg;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAAXNSR0IArs4c6QAAAERlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAA6ABAAMAAAABAAEAAKACAAQAAAABAAAAAaADAAQAAAABAAAAAQAAAAD5Ip3+AAAADUlEQVQIHWM4ceLEfwAIDANYXmnp+AAAAABJRU5ErkJggg==' width='100' height='100'>`;
					item["imageb64"] = "";
				});
				return Object.assign([], sliceList);
			},
			refreshTableItems(cb) {
				const self = this;

				if (self.onFetchPersonDataCallback) {
					self.obj_loading = self.$loading.show({ container: self.$refs.formContainer });
					self.onFetchPersonDataCallback(function (
						errorOnPersonTable,
						resetPersonTable,
						morePersonItem,
						personTableItems
					) {
						if (!errorOnPersonTable) {
							if (resetPersonTable) {
								self.value_allTableItems = [];
								self.value_dataItemsToShow = [];
							}
							if (personTableItems) {
								self.value_allTableItems = self.value_allTableItems.concat(
									personTableItems
								);
							}
							if (!morePersonItem) {
								let uuidList = [];
								self.value_allTableItems.forEach((person) => {
									uuidList.push(person.uuid);
								});

								self.onFetchPersonAttendanceDataCallback(
									self.value_specifiedDate,
									uuidList,
									function (errorOnPersonVr, resetPersonVr, morePersonVr, personVrItems) {
										if (personVrItems && personVrItems.length > 0) {
											//console.log(personVrItems )
											self.value_allTableItems.forEach((person) => {
												const dataListOnUuid = personVrItems.filter((vr) => {
													return vr.uuid == person.uuid;
												});
												dataListOnUuid.forEach((d) => {
													if (!person["attendance_data_list"])
														person["attendance_data_list"] = [];
													if (
														!person.attendance_data_list.find(
															(att) => att.verify_uuid == d.verify_uuid
														)
													) {
														person["attendance_data_list"].push({
															id: d.id,
															name: d.name,
															verify_uuid: d.verify_uuid,
															timestamp: d.timestamp,
															temperature: d.temperature == 0 ? "" : d.temperature + "°C",
															verify_mode: d.verify_mode,
															verify_mode_string: d.verify_mode_string,
															verify_score: d.verify_score,
															card_number: d.card_number,
															group_list: d.group_list,
															face_image_id: d.face_image_id,
														});

														console.log("person", person, person["attendance_data_list"]);
													}
												});
											});
										}
										if (!morePersonVr || errorOnPersonVr) {
											self.value_dataItemsToShow = self.generateFilteredData(
												self.value_allTableItems,
												self.value_searchingFilter
											);
											if (self.obj_loading) self.obj_loading.hide();
											if (cb) cb();
										}
									}
								);
							}
							self.observeTableSize();
							// self.generateFilteredData(self.value_allTableItems, []);
						} else {
							if (self.obj_loading) self.obj_loading.hide();
							if (cb) cb();
						}
					});
				} else if (cb) cb();
			},
			handlePageChange({ currentPage, pageSize }) {
				this.value_tablePage.currentPage = currentPage;
				this.value_tablePage.pageSize = pageSize;
				this.value_dataItemsToShow = this.generateFilteredData(
					this.value_allTableItems,
					this.value_searchingFilter
				);
				this.resizeOneTable();
			},
			handlePageChangeForDetailData({ currentPage, pageSize }) {
				this.value_tablePageForDetailData.currentPage = currentPage;
				this.value_tablePageForDetailData.pageSize = pageSize;
				this.value_dataItemsToShowDetailData = this.generateFilteredDataForDetailData(
					this.value_attendanceDataListToReview,
					this.value_searchingFilter
				);
				this.resizeOneTable();
			},
			selectAllEvent({ checked, records }) {
				// console.log(checked ? '所有勾选事件' : '所有取消事件', records)
			},
			selectChangeEvent({ checked, records }) {
				// console.log(checked ? '勾选事件' : '取消事件', records)
			},
			getSelectEvent() {
				let selectRecords = this.$refs.attMainTable.getCheckboxRecords();
				//console.log(selectRecords);
			},

			generateAttendanceStatusData_V2(workingHourSettings, item) {
				//////////////////////////////////////////////////
				const defined_clockin_time_hour = workingHourSettings.defined_clockin_time_hour;
				const defined_clockin_time_min = workingHourSettings.defined_clockin_time_min || 0;
				const defined_clockin_time_buffer_mins =
					workingHourSettings.defined_clockin_time_buffer_mins || 30;
				const defined_clockin_time_late_enabled =
					workingHourSettings.defined_clockin_time_late_enabled || true;
				const defined_clockin_adjustment_enabled =
					workingHourSettings.defined_clockin_adjustment_enabled || false;

				const defined_clockout_time_hour = workingHourSettings.defined_clockout_time_hour;
				const defined_clockout_time_min =
					workingHourSettings.defined_clockout_time_min || 0;
				const defined_clockout_time_buffer_mins =
					workingHourSettings.defined_clockout_time_buffer_mins || 30;
				const defined_clockout_time_early_leave_enabled =
					workingHourSettings.defined_clockout_time_early_leave_enabled || true;
				const defined_clockout_adjustment_enabled =
					workingHourSettings.defined_clockout_adjustment_enabled || false;

				const defined_overtime_enabled =
					workingHourSettings.defined_overtime_enabled || true;
				const defined_overtime_time_hour = workingHourSettings.defined_overtime_time_hour;
				const defined_overtime_time_min =
					workingHourSettings.defined_overtime_time_min || 0;
				const defined_overtime_minimum_min =
					workingHourSettings.defined_overtime_minimum_min || 0;

				const defined_break_time_min = workingHourSettings.defined_break_time_mins || 60;

				const specified_holidays = workingHourSettings.specified_holidays;
				const specified_non_holidays = workingHourSettings.specified_non_holidays;
				//////////////////////////////////////////////////
				const self = this;
				const attRecList = item.attendance_data_list ? item.attendance_data_list : [];

				// 0 : no status, 1 : show on time, 2 : leave on time, 3 : too late to show, 4 : too early to leave, 5 : no show, 6 : no entry, 7: no leave, 8: overtime
				const _STATUS_NONE = 0;
				const _STATUS_SHOW_ON_TIME = 1;
				const _STATUS_LEAVE_ON_TIME = 2;
				const _STATUS_LATE = 3;
				const _STATUS_EARLY = 4;
				const _STATUS_NO_SHOW = 5;

				const msDay = 86400000;
				const msHour = 3600000;
				const msMin = 60000;
				//console.log("defined_clockin_time_hour",defined_clockin_time_hour )
				const clockInTime =
					defined_clockin_time_hour * msHour + defined_clockin_time_min * msMin;
				const clockInTimeBuffer = defined_clockin_time_buffer_mins * msMin;
				const clockOutTime =
					defined_clockout_time_hour * msHour + defined_clockout_time_min * msMin;
				const clockOutTimeBuffer = defined_clockout_time_buffer_mins * msMin;

				const breakTime = defined_break_time_min * msMin;
				const overTime =
					defined_overtime_time_hour * msHour + defined_overtime_time_min * msMin;
				const overTimeBuffer = defined_overtime_minimum_min * msMin;

				const startTimeOfMonth = new Date(
					self.value_specifiedDate.getFullYear(),
					self.value_specifiedDate.getMonth(),
					1,
					0,
					0,
					0,
					0
				);
				const endTimeOfMonth = new Date(
					self.value_specifiedDate.getFullYear(),
					self.value_specifiedDate.getMonth() + 1,
					1,
					0,
					0,
					0,
					0
				);
				const daysOnMonth = (endTimeOfMonth - startTimeOfMonth) / msDay;

				let returnData = {
					date: {
						days: daysOnMonth,
						monthly_holiday_index: [],
					},
					attendance_data: {
						clock_in_status: [],
						clock_out_status: [],
						working_time: [],
						over_time: [],
					},
				};
				let idxSpecifiedDateToCheck = self.value_specifiedDate.getDate() - 1;
				for (let i = 0; i < daysOnMonth; i++) {
					const tDayStart = new Date(startTimeOfMonth.getTime() + i * msDay);
					const tDayStartTs = tDayStart.getTime();
					const tDayEndTs = tDayStartTs + msDay - 1;
					const timeToCheckClockIn = tDayStartTs + clockInTime < Date.now();
					const timeToCheckClockOut = tDayStartTs + clockOutTime < Date.now();
					const timeToCheckOverTime = tDayStartTs + overTime < Date.now();

					let holiday = false;
					for (let j = 0; j < specified_holidays.length; j++) {
						if (
							specified_holidays[j].date_time >= tDayStartTs &&
							specified_holidays[j].date_time <= tDayEndTs
						) {
							holiday = true;
							break;
						}
					}
					if (holiday == false) {
						const dayIdx = tDayStart.getDay();
						if (dayIdx == 0 || dayIdx == 6) holiday = true;
					}
					for (let k = 0; k < specified_non_holidays.length; k++) {
						if (
							specified_non_holidays[k].date_time >= tDayStartTs &&
							specified_non_holidays[k].date_time <= tDayEndTs
						) {
							holiday = false;
							break;
						}
					}
					if (holiday) returnData.date.monthly_holiday_index.push(1);
					else returnData.date.monthly_holiday_index.push(0);

					if (attRecList) {
						let passModeRecord = attRecList.filter((attRec) => {
							return (
								attRec.timestamp >= tDayStartTs &&
								attRec.timestamp <= tDayEndTs &&
								(attRec.verify_mode == 0 || attRec.verify_mode == 1 || attRec.verify_mode == 2)
							);
						});
						let clockInModeRecord = attRecList.filter((attRec) => {
							return (
								attRec.timestamp >= tDayStartTs &&
								attRec.timestamp <= tDayEndTs &&
								attRec.verify_mode == 3
							);
						});
						let clockOutModeRecord = attRecList.filter((attRec) => {
							return (
								attRec.timestamp >= tDayStartTs &&
								attRec.timestamp <= tDayEndTs &&
								attRec.verify_mode == 4
							);
						});
						let manualClockInRecord = attRecList.filter((attRec) => {
							return (
								attRec.timestamp >= tDayStartTs &&
								attRec.timestamp <= tDayEndTs &&
								attRec.verify_mode == 5
							);
						});
						let manualClockOutRecord = attRecList.filter((attRec) => {
							return (
								attRec.timestamp >= tDayStartTs &&
								attRec.timestamp <= tDayEndTs &&
								attRec.verify_mode == 6
							);
						});

						passModeRecord.sort(function (a, b) {
							return a.timestamp - b.timestamp;
						});
						clockInModeRecord.sort(function (a, b) {
							return a.timestamp - b.timestamp;
						});
						clockOutModeRecord.sort(function (a, b) {
							return a.timestamp - b.timestamp;
						});
						manualClockInRecord.sort(function (a, b) {
							return a.timestamp - b.timestamp;
						});
						manualClockOutRecord.sort(function (a, b) {
							return a.timestamp - b.timestamp;
						});

						let clockInStatus = _STATUS_NONE;
						let clockOutStatus = _STATUS_NONE;

						let clockInTimeStamp = 0;
						let clockOutTimeStamp = 0;
						let overTimeStartStamp = 0;
						let overTimeEndStamp = 0;
						if (!item["late"]) item["late"] = 0;
						if (!item["early"]) item["early"] = 0;
						if (!item["no_record"]) item["no_record"] = 0;
						// 0 : no status, 1 : show on time, 2 : leave on time, 3 : too late to show, 4 : too early to leave, 5 : no show, 6: overTime
						if (manualClockInRecord.length > 0) {
							const firstClockInRec = manualClockInRecord[manualClockInRecord.length - 1];
							console.log("firstClockInRec", firstClockInRec);

							clockInTimeStamp = firstClockInRec.timestamp;
							if (
								defined_clockin_adjustment_enabled &&
								firstClockInRec.timestamp < tDayStartTs + clockInTime
							)
								clockInTimeStamp = tDayStartTs + clockInTime;

							if (defined_clockin_time_late_enabled) {
								if (
									firstClockInRec.timestamp <=
									tDayStartTs + clockInTime + clockInTimeBuffer
								) {
									// show on time
									clockInStatus = _STATUS_SHOW_ON_TIME;
								} else {
									// too late to show
									clockInStatus = _STATUS_LATE;
								}
							} else {
								// show on time
								clockInStatus = _STATUS_SHOW_ON_TIME;
							}

							console.log("firstClockInRec", clockInTimeStamp, clockInStatus);
						}
						else {
							if (clockInModeRecord.length > 0) {
								const firstClockInRec = clockInModeRecord[0];
								console.log("firstClockInRec", firstClockInRec);

								clockInTimeStamp = firstClockInRec.timestamp;
								if (
									defined_clockin_adjustment_enabled &&
									firstClockInRec.timestamp < tDayStartTs + clockInTime
								)
									clockInTimeStamp = tDayStartTs + clockInTime;

								if (defined_clockin_time_late_enabled) {
									if (
										firstClockInRec.timestamp <=
										tDayStartTs + clockInTime + clockInTimeBuffer
									) {
										// show on time
										clockInStatus = _STATUS_SHOW_ON_TIME;
									} else {
										// too late to show
										clockInStatus = _STATUS_LATE;
									}
								} else {
									// show on time
									clockInStatus = _STATUS_SHOW_ON_TIME;
								}

								console.log("firstClockInRec", clockInTimeStamp, clockInStatus);
							}
						}

						if (manualClockOutRecord.length > 0) {
							const lastClockOutRec = manualClockOutRecord[manualClockOutRecord.length - 1];
							console.log("lastClockOutRec", lastClockOutRec);

							clockOutTimeStamp = lastClockOutRec.timestamp;
							if (
								defined_clockout_adjustment_enabled &&
								lastClockOutRec.timestamp > tDayStartTs + clockOutTime
							)
								clockOutTimeStamp = tDayStartTs + clockOutTime;

							if (defined_clockout_time_early_leave_enabled) {
								if (
									lastClockOutRec.timestamp >=
									tDayStartTs + clockOutTime - clockOutTimeBuffer
								) {
									// leave on time
									clockOutStatus = _STATUS_LEAVE_ON_TIME;
								} else {
									// too early to leave
									clockOutStatus = _STATUS_EARLY;
								}
							} else {
								// leave on time
								clockOutStatus = _STATUS_LEAVE_ON_TIME;
							}
							console.log("lastClockOutRec", clockOutTimeStamp, clockOutStatus);

							if (defined_overtime_enabled) {
								if (lastClockOutRec.timestamp >= tDayStartTs + overTime + overTimeBuffer) {
									// over time
									// clockOutStatus = _STATUS_OVER_TIME;

									overTimeStartStamp = tDayStartTs + overTime + overTimeBuffer;
									overTimeEndStamp = lastClockOutRec.timestamp;

									if (overTimeEndStamp > tDayEndTs) overTimeEndStamp = tDayEndTs;

									console.log("overtime", overTimeStartStamp, overTimeEndStamp);

								}
							}
						}
						else {
							if (clockOutModeRecord.length > 0) {
								const lastClockOutRec = clockOutModeRecord[clockOutModeRecord.length - 1];
								console.log("lastClockOutRec", lastClockOutRec);

								clockOutTimeStamp = lastClockOutRec.timestamp;
								if (
									defined_clockout_adjustment_enabled &&
									lastClockOutRec.timestamp > tDayStartTs + clockOutTime
								)
									clockOutTimeStamp = tDayStartTs + clockOutTime;

								if (defined_clockout_time_early_leave_enabled) {
									if (
										lastClockOutRec.timestamp >=
										tDayStartTs + clockOutTime - clockOutTimeBuffer
									) {
										// leave on time
										clockOutStatus = _STATUS_LEAVE_ON_TIME;
									} else {
										// too early to leave
										clockOutStatus = _STATUS_EARLY;
									}
								} else {
									// leave on time
									clockOutStatus = _STATUS_LEAVE_ON_TIME;
								}
								console.log("lastClockOutRec", clockOutTimeStamp, clockOutStatus);

								if (defined_overtime_enabled) {
									if (lastClockOutRec.timestamp >= tDayStartTs + overTime + overTimeBuffer) {
										// over time
										// clockOutStatus = _STATUS_OVER_TIME;

										overTimeStartStamp = tDayStartTs + overTime + overTimeBuffer;
										overTimeEndStamp = lastClockOutRec.timestamp;

										if (overTimeEndStamp > tDayEndTs) overTimeEndStamp = tDayEndTs;

										console.log("overtime", overTimeStartStamp, overTimeEndStamp);

									}
								}
							}
						}

						// 0 : no status, 1 : show on time, 2 : leave on time, 3 : too late to show, 4 : too early to leave, 5 : no show, 6: overTime
						if (clockInStatus == _STATUS_NONE) {
							if (passModeRecord.length > 0) {
								// 拿第一筆當作上班打卡的資料
								const firstRec = passModeRecord[0];
								console.log("firstRec", firstRec);

								clockInTimeStamp = firstRec.timestamp;
								if (
									defined_clockin_adjustment_enabled &&
									firstRec.timestamp < tDayStartTs + clockInTime
								)
									clockInTimeStamp = tDayStartTs + clockInTime;
								if (defined_clockin_time_late_enabled) {
									if (firstRec.timestamp <= tDayStartTs + clockInTime + clockInTimeBuffer) {
										// show on time
										clockInStatus = _STATUS_SHOW_ON_TIME;
									} else {
										// too late to show
										clockInStatus = _STATUS_LATE;
									}
								} else {
									// show on time
									clockInStatus = _STATUS_SHOW_ON_TIME;
								}
							} else if (!holiday && timeToCheckClockIn) {
								clockInStatus = _STATUS_NO_SHOW; // no show
							}
							//console.log("timeToCheckClockIn", timeToCheckClockIn )
						}

						if (timeToCheckClockOut && clockOutStatus == _STATUS_NONE) {
							// 如有剩下的資料, 當作下班打卡資料
							if (passModeRecord.length > 0) {
								const recForClockOut = passModeRecord[passModeRecord.length - 1];
								console.log("recForClockOut", recForClockOut);

								clockOutTimeStamp = recForClockOut.timestamp;
								if (
									defined_clockout_adjustment_enabled &&
									recForClockOut.timestamp > tDayStartTs + clockOutTime
								)
									clockOutTimeStamp = tDayStartTs + clockOutTime;

								if (defined_clockout_time_early_leave_enabled) {
									if (
										recForClockOut.timestamp >=
										tDayStartTs + clockOutTime - clockOutTimeBuffer
									) {
										// leave on time
										clockOutStatus = _STATUS_LEAVE_ON_TIME;
									} else {
										// too early to leave
										clockOutStatus = _STATUS_EARLY;
									}
								} else {
									// leave on time
									clockOutStatus = _STATUS_LEAVE_ON_TIME;
								}

								if (defined_overtime_enabled) {
									if (recForClockOut.timestamp >= tDayStartTs + overTime + overTimeBuffer) {
										// over time
										// clockOutStatus = _STATUS_OVER_TIME;

										overTimeStartStamp = tDayStartTs + overTime + overTimeBuffer;
										overTimeEndStamp = recForClockOut.timestamp;

										if (overTimeEndStamp > tDayEndTs) overTimeEndStamp = tDayEndTs;
									}
								}
							} else if (!holiday) {
								clockOutStatus = _STATUS_NO_SHOW; // no show
							}
						}

						if (i == idxSpecifiedDateToCheck && clockInStatus == _STATUS_LATE) item.late++;
						if (i == idxSpecifiedDateToCheck && clockOutStatus == _STATUS_EARLY)
							item.early++;
						if (
							i == idxSpecifiedDateToCheck &&
							(clockInStatus == _STATUS_NO_SHOW || clockOutStatus == _STATUS_NO_SHOW)
						)
							item.no_record++;

						returnData.attendance_data.clock_in_status.push(clockInStatus);
						returnData.attendance_data.clock_out_status.push(clockOutStatus);
						// console.log("workingTime", clockOutTimeStamp, clockInTimeStamp, breakTime);

						let workingTime = 0;
						if ((clockOutTimeStamp > 0) && (clockInTimeStamp > 0))
							workingTime = clockOutTimeStamp - clockInTimeStamp - breakTime;

						returnData.attendance_data.working_time.push(workingTime > 0 ? workingTime : 0);

						returnData.attendance_data.over_time.push(
							overTimeEndStamp - overTimeStartStamp > 0
								? overTimeEndStamp - overTimeStartStamp
								: 0
						);
					}
				}

				return returnData;
			},
			generateAttendanceStatusTable(attendanceData) {
				const self = this;
				const tableBordderSize = "1";
				const tableBordderColor = "#979899";
				const cellBgColor = "#fff";
				const holidayColorOnHeader = "#e0e0e0";
				const workdayColorOnHeader = "#fff";

				const attendanceNoStatusColor = cellBgColor;

				let headerDataString = "";
				let bodyDataStringClockIn = "";
				let bodyDataStringClockOut = "";

				let colorToAppend = "";
				let i = self.value_specifiedDate.getDate() - 1;
				const isHoliday = attendanceData.date.monthly_holiday_index[i];
				if (isHoliday) colorToAppend = holidayColorOnHeader;
				else colorToAppend = workdayColorOnHeader;

				headerDataString += `<th style="text-align:center;opacity: 1.0;width:150px;font-size: 10px;border: 1px solid ${tableBordderColor}; 
				text-overflow: ellipsis; overflow: hidden; font-family:Arial;padding: 0px 0px; color: #606266; background-color:${colorToAppend}">`;
				headerDataString += `<div style="height:25px;margin:-5px 0px">${self.value_specifiedDate.yyyy_mm_dd()}</div>`;
				headerDataString += "</th>";

				let clockInStatusColor = attendanceNoStatusColor; // no show
				if (!isHoliday) {
					clockInStatusColor =
						self.value_attendanceStatusColor[
						attendanceData.attendance_data.clock_in_status[i]
						];
				} else if (attendanceData.attendance_data.clock_in_status[i] != 5) {
					clockInStatusColor =
						self.value_attendanceStatusColor[
						attendanceData.attendance_data.clock_in_status[i]
						];
				}
				bodyDataStringClockIn += `<td style="opacity: 1.0;border: 1px solid ${tableBordderColor};"><div style="height:12px;background-color:${clockInStatusColor};"/></td>`;

				let clockOutStatusColor = attendanceNoStatusColor; // no show
				if (!isHoliday) {
					clockOutStatusColor =
						self.value_attendanceStatusColor[
						attendanceData.attendance_data.clock_out_status[i]
						];
				} else if (attendanceData.attendance_data.clock_out_status[i] != 5) {
					clockOutStatusColor =
						self.value_attendanceStatusColor[
						attendanceData.attendance_data.clock_out_status[i]
						];
				}
				bodyDataStringClockOut += `<td style="opacity: 1.0;border: 1px solid ${tableBordderColor};"><div style="height:12px;background-color:${clockOutStatusColor};"/></td>`;

				return [
					`<div align="center" style="height:58px;">`,
					`<table style="border:${tableBordderSize}px solid ${tableBordderColor};margin:10px"> `,
					`<thead">`,
					`<tr>${headerDataString}</tr> `,
					`</thead>`,
					`<tbody>`,
					`<tr>${bodyDataStringClockIn}</tr>`,
					`<tr>${bodyDataStringClockOut}</tr>`,
					`</tbody>`,
					`</table>`,
					`</div>`,
				].join("");
			},
			initToggles() {
				const tooltipTriggerList = document.querySelectorAll(
					'[data-coreui-toggle="tooltip"]'
				);
				const tooltipList = [...tooltipTriggerList].map(
					(tooltipTriggerEl) => new coreui.Tooltip(tooltipTriggerEl)
				);
			},
		},
	};
</script>

<style>
	.alertModal_Title {
		font-size: 2.4rem;
	}

	.list-group-item {
		padding-left: 30px !important;
		padding-top: 5px;
		padding-right: 30px;
		padding-bottom: 5px;
		line-height: 40px;
		font-size: 18px;
	}

	.form-check-input {
		margin-top: 0.8rem;
	}
</style>