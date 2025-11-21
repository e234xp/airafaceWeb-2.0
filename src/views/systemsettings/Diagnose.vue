<template>
  <div>
    <CCol sm="12">
      <!-- Title -->
      <div class="h1">
        {{ $t('Diagnose') }}
      </div>

      <div style="height: 20px" />

      <!-- Instructions and Storage usage in same row -->
      <div class="d-flex justify-content-between align-items-end">
        <!-- Left side: Instructions -->
        <div class="instructions-container">
          <p class="instructions-title">
            <strong>{{ $t('ExecutionSteps') }}</strong>
          </p>
          <ol class="instructions-list">
            <li>{{ $t('ExecutionStep1') }}</li>
            <li>{{ $t('ExecutionStep2') }}</li>
            <li>{{ $t('ExecutionStep3') }}</li>
            <li>{{ $t('ExecutionStep4') }}</li>
          </ol>
        </div>

        <!-- Right side: Storage usage -->
        <div class="storage-container">
          <!-- Disk Usage -->
          <div class="storage-item">
            <div class="storage-header">
              <span class="storage-label">{{ $t('DiskUsage') }}</span>
              <span class="storage-text">{{ disk.used }}GB / {{ disk.total }}GB</span>
            </div>
            <div class="progress-wrapper">
              <CProgress :value="disk.percentage" :color="getStorageColor(disk.percentage)" height="8px" />
            </div>
          </div>

          <!-- Memory Usage -->
          <div class="storage-item">
            <div class="storage-header">
              <span class="storage-label">{{ $t('MemoryUsage') }}</span>
              <span class="storage-text">{{ memory.used }}GB / {{ memory.total }}GB</span>
            </div>
            <div class="progress-wrapper">
              <CProgress :value="memory.percentage" :color="getStorageColor(memory.percentage)" height="8px" />
            </div>
          </div>

          <!-- Swap Usage -->
          <div class="storage-item">
            <div class="storage-header">
              <span class="storage-label">{{ $t('SwapUsage') }}</span>
              <span class="storage-text">{{ swap.used }}GB / {{ swap.total }}GB</span>
            </div>
            <div class="progress-wrapper">
              <CProgress :value="swap.percentage" :color="getStorageColor(swap.percentage)" height="8px" />
            </div>
          </div>
        </div>
      </div>

      <div style="height: 20px" />

      <!-- Device Selection -->
      <CRow>
        <CCol sm="12">
          <CCard>
            <CCardBody>
              <CRow>
                <CCol sm="12" class="d-flex justify-content-between align-items-center">
                  <CCol sm="2">
                    <label class="form-label">{{ $t('Device') }}</label>
                  </CCol>
                  <CCol sm="10">
                    <CSelect
                      v-model="selectedDevice"
                      :options="deviceOptions"
                      :placeholder="$t('placeholder')"
                      size="lg"
                      @change="onDeviceChange"
                    />
                  </CCol>
                </CCol>
              </CRow>
            </CCardBody>
          </CCard>
          <!-- Action Buttons -->
          <CRow>
            <CCol sm="12" class="d-flex justify-content-between">
              <CButton color="dark" size="lg" :disabled="!selectedDevice || isDiagnosing" @click="startDiagnose">
                {{ $t('Diagnose') }}
              </CButton>
              <CButton color="dark" size="lg" :disabled="!canExportLog" @click="exportSysLog">
                {{ $t('ExportSystemLog') }}
              </CButton>
            </CCol>
          </CRow>
        </CCol>
      </CRow>

      <div style="height: 20px" />

      <!-- Diagnostic Results -->
      <CRow>
        <CCol sm="12">
          <CCard>
            <CCardBody>
              <div class="diagnostic-logs">
                <div v-for="(log, index) in diagnosticLogs" :key="index" class="log-item">
                  <div class="log-content">
                    <div class="log-header">
                      <span class="log-timestamp">{{ formatTimestamp(log.timestamp) }}</span>
                      <span class="log-service">[{{ log.serviceName }}]</span>
                      <span class="log-type" :class="getLogTypeClass(log.type)">
                        {{ log.type }}
                      </span>
                    </div>
                    <div class="log-message">
                      {{ log.message }}
                    </div>
                  </div>
                </div>
              </div>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </CCol>
  </div>
</template>

<script>
export default {
  name: 'Diagnose',
  data() {
    return {
      selectedDevice: '',
      deviceOptions: [],
      cameras: [],
      tablets: [],
      isDiagnosing: false,
      diagnosticLogs: [],
      diagnosticComplete: false,
      diagnosticTimer: null,
      diagnosticStartTime: null,
      diagnosticUuid: null,
      diagnosticExpireTime: null,
      disk: { total: 0, used: 0, free: 0, percentage: 0 },
      memory: { total: 0, used: 0, free: 0, percentage: 0 },
      swap: { total: 0, used: 0, free: 0, percentage: 0 },
    };
  },
  computed: {
    canExportLog() {
      return this.selectedDevice && this.diagnosticComplete;
    },
  },
  async mounted() {
    await this.loadDevices();
    await this.loadStorageInfo();
  },
  beforeDestroy() {
    if (this.diagnosticTimer) {
      clearInterval(this.diagnosticTimer);
    }
  },
  methods: {
    async loadDevices() {
      try {
        // Load cameras
        const cameraResult = await this.$globalFindCameras('', 0, 3000);
        if (!cameraResult.error && cameraResult.data && cameraResult.data.list) {
          this.cameras = cameraResult.data.list;
        }

        // Load tablets
        const tabletResult = await this.$globalGetTabletList('', 0, 3000);
        if (!tabletResult.error && tabletResult.data && tabletResult.data.data_list) {
          this.tablets = tabletResult.data.data_list;
        }

        // Build device options
        this.buildDeviceOptions();
      } catch (error) {
        console.error('Failed to load devices:', error);
      }
    },

    buildDeviceOptions() {
      const options = [{ value: '', label: this.$t('placeholder') }];

      // Add cameras first
      this.cameras.forEach((camera) => {
        options.push({
          value: `camera_${camera.uuid}`,
          label: `${this.$t('Cameras')} - ${camera.name || camera.uuid}`,
          device: camera,
          type: 'camera',
        });
      });

      // Add tablets
      this.tablets.forEach((tablet) => {
        options.push({
          value: `tablet_${tablet.uuid}`,
          label: `${this.$t('Tablets')} - ${tablet.name || tablet.uuid}`,
          device: tablet,
          type: 'tablet',
        });
      });

      this.deviceOptions = options;
    },

    onDeviceChange() {
      // Reset diagnostic state when device changes
      this.diagnosticLogs = [];
      this.diagnosticComplete = false;
      this.diagnosticUuid = null;
      this.diagnosticExpireTime = null;
      if (this.diagnosticTimer) {
        clearInterval(this.diagnosticTimer);
        this.diagnosticTimer = null;
      }
    },

    async startDiagnose() {
      if (!this.selectedDevice) return;

      try {
        // Show loading
        const loading = this.$loading.show();

        // Reset state
        this.isDiagnosing = true;
        this.diagnosticLogs = [];
        this.diagnosticComplete = false;
        this.diagnosticStartTime = Date.now();

        // Get device UUID from selected device
        const deviceOption = this.deviceOptions.find((opt) => opt.value === this.selectedDevice);
        if (!deviceOption || !deviceOption.device) {
          throw new Error('無法取得裝置資訊');
        }

        const deviceUuid = deviceOption.device.uuid;

        // Call setdiagnostic API
        const result = await this.$globalSetDiagnostic(deviceUuid);

        if (loading) loading.hide();

        if (result.error || !result.data) {
          throw new Error('啟動診斷失敗');
        }
        console.log(result);
        // Store diagnostic UUID and expire time
        this.diagnosticUuid = result.data.data.diagnostic_uuid;
        this.diagnosticExpireTime = result.data.data.expire;

        // Start querying diagnostic results every 10 seconds
        this.runDiagnostics();
      } catch (error) {
        console.error('Start diagnose failed:', error);
        this.isDiagnosing = false;
        this.$fire({
          title: this.$t('OperationFailed'),
          text: error.message || '啟動診斷失敗',
          type: 'error',
          timer: 3000,
          confirmButtonColor: '#20a8d8',
        });
      }
    },

    async runDiagnostics() {
      // Clear any existing timer
      if (this.diagnosticTimer) {
        clearInterval(this.diagnosticTimer);
      }

      // Query diagnostic results immediately
      await this.queryDiagnosticResults();

      // Set up interval to query every 10 seconds
      this.diagnosticTimer = setInterval(async () => {
        // Check if diagnostic session has expired
        const now = Date.now();
        if (this.diagnosticExpireTime && now >= this.diagnosticExpireTime) {
          // 10 minutes have passed, stop diagnostic
          this.isDiagnosing = false;
          this.diagnosticComplete = true;
          clearInterval(this.diagnosticTimer);
          this.diagnosticTimer = null;
          this.$fire({
            title: this.$t('Successful'),
            text: '診斷已完成',
            type: 'success',
            timer: 3000,
            confirmButtonColor: '#20a8d8',
          });
          return;
        }

        // Query diagnostic results
        await this.queryDiagnosticResults();
      }, 10000); // Query every 10 seconds
    },

    async queryDiagnosticResults() {
      console.log(this.diagnosticUuid);
      if (!this.diagnosticUuid) return;

      try {
        const result = await this.$globalQueryDiagnostic(this.diagnosticUuid);
        console.log('result.data.data', result.data.data);
        if (result.error || !result.data) {
          console.error('Query diagnostic failed:', result.error);
          return;
        }

        // Update diagnostic logs with new data
        if (Array.isArray(result.data.data) && result.data.data.length > 0) {
          console.log('222222');
          this.diagnosticLogs = result.data.data;
          console.log('logs', this.diagnosticLogs);
        }
      } catch (error) {
        console.error('Query diagnostic results failed:', error);
      }
    },

    async exportSysLog() {
      if (!this.canExportLog) return;

      try {
        // Show loading
        const loading = this.$loading.show();

        // Get the selected device info
        const deviceOption = this.deviceOptions.find((opt) => opt.value === this.selectedDevice);
        const deviceName = deviceOption ? deviceOption.label : 'device';

        // Query system logs for the last 5 minutes
        const endTime = Date.now();
        const startTime = endTime - 300000; // 5 minutes ago

        const result = await this.$globalQuerySystemLog({
          start_time: startTime,
          end_time: endTime,
          slice_shift: 0,
          slice_length: 10000,
          level_list: ['info', 'warning', 'error'],
        });

        if (loading) loading.hide();

        if (!result || result.error) {
          this.$fire({
            title: this.$t('OperationFailed'),
            text: 'Failed to export sysLog',
            type: 'error',
            timer: 3000,
            confirmButtonColor: '#20a8d8',
          });
          return;
        }

        // Create and download the log file
        const logData = result.result ? result.result.data : [];
        const logContent = this.formatLogsForExport(logData);

        // Create blob and download
        const blob = new Blob([logContent], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `syslog_${deviceName}_${new Date().toISOString().slice(0, 10)}.log`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        this.$fire({
          title: this.$t('Successful'),
          text: 'sysLog exported successfully',
          type: 'success',
          timer: 3000,
          confirmButtonColor: '#20a8d8',
        });
      } catch (error) {
        console.error('Export sysLog failed:', error);
        this.$fire({
          title: this.$t('OperationFailed'),
          text: error.message || 'Failed to export sysLog',
          type: 'error',
          timer: 3000,
          confirmButtonColor: '#20a8d8',
        });
      }
    },

    formatLogsForExport(logs) {
      let content = '=== System Log Export ===\n';
      content += `Export Date: ${new Date().toISOString()}\n`;
      content += `Device: ${this.selectedDevice}\n`;
      content += '========================\n\n';

      logs.forEach((log) => {
        const timestamp = new Date(log.timestamp).toISOString();
        content += `[${timestamp}] [${log.log_level}] ${log.data}\n`;
      });

      return content;
    },

    async loadStorageInfo() {
      try {
        const result = await this.$globalGetSpaceStatus();

        if (result.error || !result.data || !result.data.data) {
          console.error('Failed to load space status:', result.error);
          return;
        }

        const { disk, memory, swap } = result.data.data;

        // Update disk info
        if (disk) {
          this.disk.total = disk.Total || 0;
          this.disk.used = disk.Used || 0;
          this.disk.free = disk.Free || 0;
          this.disk.percentage = this.disk.total > 0
            ? Math.round((this.disk.used / this.disk.total) * 100)
            : 0;
        }

        // Update memory info
        if (memory) {
          this.memory.total = memory.Total || 0;
          this.memory.used = memory.Used || 0;
          this.memory.free = memory.Free || 0;
          this.memory.percentage = this.memory.total > 0
            ? Math.round((this.memory.used / this.memory.total) * 100)
            : 0;
        }

        // Update swap info
        if (swap) {
          this.swap.total = swap.Total || 0;
          this.swap.used = swap.Used || 0;
          this.swap.free = swap.Free || 0;
          this.swap.percentage = this.swap.total > 0
            ? Math.round((this.swap.used / this.swap.total) * 100)
            : 0;
        }
      } catch (error) {
        console.error('Load storage info failed:', error);
      }
    },

    getStorageColor(percentage) {
      if (percentage < 50) return 'success';
      if (percentage < 80) return 'warning';
      return 'danger';
    },

    formatTimestamp(timestamp) {
      if (!timestamp) return '';
      const date = new Date(parseInt(timestamp, 10));
      return date.toLocaleString('zh-TW', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      });
    },

    getLogTypeClass(type) {
      if (!type) return '';
      const typeUpper = type.toUpperCase();
      if (typeUpper === 'FATAL') return 'type-fatal';
      if (typeUpper === 'ERROR') return 'type-error';
      if (typeUpper === 'WARN') return 'type-warning';
      if (typeUpper === 'INFO') return 'type-info';
      if (typeUpper === 'DEBUG') return 'type-debug';
      if (typeUpper === 'TRACE') return 'type-trace';
      return 'type-info';
    },
  },
};
</script>

<style scoped>
/* Instructions */
.instructions-container {
  flex: 1;
  padding-right: 40px;
}

.instructions-title {
  font-size: 18px;
  color: #2c3e50;
  margin-bottom: 10px;
}

.instructions-list {
  font-size: 18px;
  color: #2c3e50;
  margin: 0;
  padding-left: 20px;
  line-height: 1.8;
}

.instructions-list li {
  margin-bottom: 5px;
}

/* Storage usage */
.storage-container {
  min-width: 400px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.storage-item {
  width: 100%;
}

.storage-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.storage-label {
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
}

.storage-text {
  font-size: 14px;
  color: #5a6169;
}

.progress-wrapper {
  background-color: #d9d9d9;
  border-radius: 4px;
  padding: 2px;
}

.gap-3 {
  gap: 1rem;
}

.diagnostic-logs {
  height: 500px;
  overflow-y: auto;
}

.log-item {
  padding: 12px 16px;
  border-bottom: 1px solid #e9ecef;
}

.log-item:last-child {
  border-bottom: none;
}

.log-content {
  display: flex;
  flex-direction: row;
  gap: 16px;
  align-items: center;
}

.log-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  min-width: 450px;
  flex-shrink: 0;
}

.log-timestamp {
  color: #6c757d;
  font-weight: 500;
  width: 150px;
  flex-shrink: 0;
}

.log-service {
  color: #495057;
  font-weight: 600;
  width: 150px;
  flex-shrink: 0;
}

.log-type {
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 3px;
  font-size: 12px;
  width: 60px;
  flex-shrink: 0;
  text-align: center;
}

.type-info {
  color: #0c5460;
  background-color: #d1ecf1;
}

.type-debug {
  color: #383d41;
  background-color: #d6d8db;
}

.type-warning {
  color: #856404;
  background-color: #fff3cd;
}

.type-error {
  color: #8b2e22;
  background-color: #ffc9c9;
}

.type-fatal {
  color: #721c24;
  background-color: #f8d7da;
}

.type-trace {
  color: #004085;
  background-color: #cce5ff;
}

.log-message {
  color: #2c3e50;
  font-size: 15px;
  flex: 1;
  text-align: right;
}

/* Custom select styling */
.form-label {
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
}

/* Disabled button cursor */
.btn:disabled,
.btn.disabled {
  cursor: not-allowed !important;
}
</style>
