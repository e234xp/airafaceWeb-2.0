<template>
  <div class="modal-main">
    <div class="about-modal">
      <div class="close-btn" @click="$emit('close')">
        <CIcon name="cil-x" height="24" />
      </div>
      
      <div class="modal-header">
        <div class="logo-section">
          <img src="@/assets/img/aira-logo-white.svg" alt="AiraFace Logo" class="logo" />
        </div>
        <div class="title-section">
          <h2>AiraFace</h2>
          <p class="subtitle">人臉辨識系統</p>
        </div>
      </div>

      <div class="modal-content">
        <div class="info-section">
          <div class="info-item">
            <label>版本:</label>
            <span>{{ versionInfo.version }}</span>
          </div>
          <div class="info-item">
            <label>建置日期:</label>
            <span>{{ versionInfo.buildDate }}</span>
          </div>
          <div class="info-item">
            <label>系統版本:</label>
            <span>{{ versionInfo.systemVersion }}</span>
          </div>
          <div class="info-item">
            <label>API 版本:</label>
            <span>{{ versionInfo.apiVersion }}</span>
          </div>
        </div>

        <div class="company-info">
          <p class="copyright">© 2024 AiraFace Technology</p>
          <p class="description">先進 AI 驅動的人臉辨識解決方案</p>
        </div>
      </div>

      <div class="modal-footer">
        <div class="confirm-btn" @click="$emit('close')">
          {{ $t('OK') }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AboutModal',
  emits: ['close'],
  data() {
    return {
      versionInfo: {
        version: '2.0.1',
        buildDate: '2024-01-15',
        systemVersion: '2.0.1.4',
        apiVersion: '1.2.3'
      }
    };
  },
  created() {
    // TODO: 未來可以從後端 API 取得版本資訊
    // this.fetchVersionInfo();
  },
  methods: {
    async fetchVersionInfo() {
      try {
        // 未來的 API 呼叫
        // const response = await this.$globalGetSystemVersion();
        // this.versionInfo = response.data;
      } catch (error) {
        console.error('Failed to fetch version info:', error);
      }
    }
  }
};
</script>

<style lang="scss" scoped>
@import '@/assets/scss/variables.scss';

.modal-main {
  position: fixed;
  inset: 0;
  backdrop-filter: blur(8px);
  background: rgba(0, 0, 0, 0.5);
  z-index: 99;
  display: flex;
  justify-content: center;
  align-items: center;
}

.about-modal {
  position: relative;
  width: 480px;
  max-width: 90vw;
  border-radius: 8px;
  border: 2px solid #B4BFC0;
  background: #fff;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  overflow: hidden;
}

.close-btn {
  position: absolute;
  top: 16px;
  right: 16px;
  color: #666;
  cursor: pointer;
  z-index: 1;
  
  &:hover {
    color: #333;
  }
}

.modal-header {
  background: linear-gradient(135deg, #007bff, #0056b3);
  color: white;
  padding: 32px 40px 24px;
  display: flex;
  align-items: center;
  gap: 20px;
}

.logo-section {
  .logo {
    width: 64px;
    height: 64px;
    object-fit: contain;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    padding: 8px;
  }
}

.title-section {
  h2 {
    margin: 0;
    font-size: 28px;
    font-weight: bold;
  }
  
  .subtitle {
    margin: 4px 0 0;
    font-size: 14px;
    opacity: 0.9;
  }
}

.modal-content {
  padding: 32px 40px;
}

.info-section {
  margin-bottom: 24px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
  
  &:last-child {
    border-bottom: none;
  }
  
  label {
    font-weight: 600;
    color: #333;
    font-size: 14px;
  }
  
  span {
    color: #666;
    font-size: 14px;
    font-family: monospace;
  }
}

.company-info {
  text-align: center;
  color: #666;
  
  .copyright {
    font-size: 14px;
    margin: 0 0 8px;
    font-weight: 600;
  }
  
  .description {
    font-size: 12px;
    margin: 0;
    opacity: 0.8;
  }
}

.modal-footer {
  padding: 0 40px 32px;
  display: flex;
  justify-content: center;
}

.confirm-btn {
  cursor: pointer;
  padding: 10px 32px;
  font-size: 14px;
  font-weight: 500;
  text-align: center;
  border-radius: 6px;
  border: none;
  background: #007bff;
  color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: background 0.2s;
  
  &:hover {
    background: #0056b3;
  }
}
</style>