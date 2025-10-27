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
          <div class="storage-header">
            <span class="storage-label">{{ $t('StorageUsage') }}</span>
            <span class="storage-text">{{ storageUsedGB }}GB of {{ storageTotalGB }}GB</span>
          </div>
          <div class="progress-wrapper">
            <CProgress
              :value="storagePercentage"
              :color="getStorageColor()"
              height="8px"
            />
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
                <CCol
                  sm="12"
                  class="d-flex justify-content-between align-items-center"
                >
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
            <CCol
              sm="12"
              class="d-flex justify-content-between"
            >
              <CButton
                color="dark"
                size="lg"
                :disabled="!selectedDevice || isDiagnosing"
                @click="startDiagnose"
              >
                {{ $t('Diagnose') }}
              </CButton>
              <CButton
                color="dark"
                size="lg"
                :disabled="!canExportLog"
                @click="exportSysLog"
              >
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
                <div
                  v-for="(log, index) in diagnosticLogs"
                  :key="index"
                  class="log-item"
                >
                  <span class="log-message">{{ log.message }}</span>
                  <span
                    class="log-status"
                    :class="log.status === 'success' ? 'status-success' : 'status-error'"
                  >
                    {{ log.status === 'success' ? $t('Successful') : $t('Failed') }}
                  </span>
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
      storageUsedGB: 0,
      storageTotalGB: 0,
      storagePercentage: 0,
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
      if (this.diagnosticTimer) {
        clearInterval(this.diagnosticTimer);
        this.diagnosticTimer = null;
      }
    },

    async startDiagnose() {
      if (!this.selectedDevice) return;

      // Reset state
      this.isDiagnosing = true;
      this.diagnosticLogs = [];
      this.diagnosticComplete = false;
      this.diagnosticStartTime = Date.now();

      // Restart services (placeholder - actual implementation depends on your API)
      this.addLog('正在重啟服務 (dataServer, sysServer, mediaConnector)...', 'success');

      // Start diagnostic process
      this.runDiagnostics();
    },

    runDiagnostics() {
      const diagnosticSteps = [
        { message: '取得連線資訊', delay: 500 },
        { message: '攝影機連線', delay: 1000 },
        { message: '取得影像', delay: 1500 },
        { message: '人臉辨識', delay: 2000 },
        { message: '資料庫連線', delay: 2500 },
        { message: '網路連線測試', delay: 3000 },
        { message: '系統資源檢查', delay: 3500 },
        { message: '記憶體使用率', delay: 4000 },
        { message: 'CPU 使用率', delay: 4500 },
        { message: '磁碟空間檢查', delay: 5000 },
      ];

      // Clear any existing timer
      if (this.diagnosticTimer) {
        clearInterval(this.diagnosticTimer);
      }

      // Run diagnostics over 5 minutes (300 seconds)
      let stepIndex = 0;
      this.diagnosticTimer = setInterval(() => {
        const elapsed = Date.now() - this.diagnosticStartTime;

        // Check if 5 minutes have passed
        if (elapsed >= 300000) { // 5 minutes in milliseconds
          this.addLog('診斷完成', 'success');
          this.isDiagnosing = false;
          this.diagnosticComplete = true;
          clearInterval(this.diagnosticTimer);
          this.diagnosticTimer = null;
          return;
        }

        // Add diagnostic logs periodically
        if (stepIndex < diagnosticSteps.length) {
          const step = diagnosticSteps[stepIndex];
          setTimeout(() => {
            // Randomly determine success/failure (you can replace this with actual diagnostic logic)
            const isSuccess = Math.random() > 0.1; // 90% success rate
            this.addLog(step.message, isSuccess ? 'success' : 'error');
          }, step.delay);
          stepIndex += 1;
        } else {
          // Repeat some checks periodically
          const randomStep = diagnosticSteps[Math.floor(Math.random() * diagnosticSteps.length)];
          const isSuccess = Math.random() > 0.1;
          this.addLog(randomStep.message, isSuccess ? 'success' : 'error');
        }
      }, 5000); // Check every 5 seconds
    },

    addLog(message, status) {
      this.diagnosticLogs.push({
        message,
        status,
        timestamp: new Date().toLocaleTimeString('zh-TW'),
      });
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
      // Placeholder - replace with actual API call to get storage info
      // For now, using mock data
      this.storageTotalGB = 256;
      this.storageUsedGB = 89;
      this.storagePercentage = Math.round((this.storageUsedGB / this.storageTotalGB) * 100);
    },

    getStorageColor() {
      if (this.storagePercentage < 50) return 'success';
      if (this.storagePercentage < 80) return 'warning';
      return 'danger';
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
}

.storage-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.storage-label {
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
}

.storage-text {
  font-size: 16px;
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
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #e9ecef;
  font-size: 16px;
}

.log-item:last-child {
  border-bottom: none;
}

.log-message {
  color: #2c3e50;
}

.log-status {
  font-weight: 600;
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 14px;
}

.status-success {
  color: #28a745;
  background-color: #d4edda;
}

.status-error {
  color: #dc3545;
  background-color: #f8d7da;
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
