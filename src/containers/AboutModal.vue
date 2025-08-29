<template>
  <div class="modal-main">
    <div class="about-modal">
      <div
        class="close-btn"
        @click="$emit('close')"
      >
        <CIcon
          name="cil-x"
          height="24"
        />
      </div>

      <div class="modal-header">
        <div class="logo-section">
          <img
            src="@/assets/img/aira-logo-white.svg"
            alt="AiraFace Logo"
            class="logo"
          >
        </div>
        <div class="title-section">
          <h2>{{ $t('About') }} AiraFace</h2>
        </div>
      </div>

      <div class="modal-content">
        <div class="info-section">
          <div class="info-item">
            <label>Main Service:</label>
            <span>{{ versionInfo.mainService }}</span>
          </div>
          <div class="info-item">
            <label>System Service:</label>
            <span>{{ versionInfo.systemService }}</span>
          </div>
          <div class="info-item">
            <label>Data Service:</label>
            <span>{{ versionInfo.dataService }}</span>
          </div>
          <div class="info-item">
            <label>Media Service:</label>
            <span>{{ versionInfo.mediaService }}</span>
          </div>
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
        mainService: 'Loading...',
        systemService: 'Loading...',
        dataService: 'Loading...',
        mediaService: 'Loading...',
      },
    };
  },
  created() {
    this.fetchVersionInfo();
  },
  methods: {
    async fetchVersionInfo() {
      try {
        const response = await this.$globalGetVersionInfo();
        if (response.data && response.data.version) {
          this.versionInfo = response.data.version;
        }
      } catch (error) {
        console.error('Failed to fetch version info:', error);
        this.versionInfo = {
          mainService: 'Error',
          systemService: 'Error',
          dataService: 'Error',
          mediaService: 'Error',
        };
      }
    },
  },
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
