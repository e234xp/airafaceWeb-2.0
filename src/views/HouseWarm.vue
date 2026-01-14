<template>
  <div class="house-warm">
    <!-- Header -->
    <div class="header">
      <div class="logo">
        <img src="@/assets/img/aira-logo-white.svg" alt="aira" class="logo-aira" />
        <span class="logo-text">城智科技</span>
      </div>
      <div class="header-right">
        <div class="time">
          {{ currentTime }}
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="main-content">
      <h1 class="welcome-title">Welcome</h1>
      <p class="welcome-subtitle">請輸入以下資訊</p>

      <div class="form-container">
        <div class="form-row">
          <label class="form-label">公司名稱</label>
          <input
            v-model="formData.companyName"
            type="text"
            class="form-input"
            :class="{ 'input-error': touched.companyName && !formData.companyName.trim() }"
            @blur="touched.companyName = true"
          />
        </div>
        <p v-if="touched.companyName && !formData.companyName.trim()" class="error-message">請輸入公司名稱</p>

        <div class="form-row">
          <label class="form-label">姓 名</label>
          <input
            v-model="formData.name"
            type="text"
            class="form-input"
            :class="{ 'input-error': touched.name && !formData.name.trim() }"
            @blur="touched.name = true"
          />
        </div>
        <p v-if="touched.name && !formData.name.trim()" class="error-message">請輸入姓名</p>

        <button class="submit-btn" :disabled="!isFormValid" @click="handleSubmit">確認</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'HouseWarm',
  data() {
    return {
      currentTime: '',
      timer: null,
      formData: {
        companyName: '',
        name: '',
      },
      touched: {
        companyName: false,
        name: false,
      },
    };
  },
  computed: {
    isFormValid() {
      return this.formData.companyName.trim() && this.formData.name.trim();
    },
  },
  mounted() {
    this.updateTime();
    this.timer = setInterval(this.updateTime, 1000);
  },
  beforeDestroy() {
    if (this.timer) {
      clearInterval(this.timer);
    }
  },
  methods: {
    updateTime() {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      this.currentTime = `${hours}:${minutes}`;
    },
    async handleSubmit() {
      const visitorId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const visitor = {
        id: visitorId,
        name: this.formData.name,
        group_list: ['All Visitor'],
        extra_info: { department: this.formData.companyName },
      };

      try {
        const { error, data } = await this.$globalCreateVisitor(visitor);
        if (error) {
          console.error('建立訪客失敗:', error);
          this.$fire({
            text: '新增失敗',
            type: 'error',
            timer: 3000,
          });
          return;
        }
        console.log('建立訪客成功:', data);
        this.$fire({
          text: '新增成功',
          type: 'success',
          timer: 3000,
        });
        // 清空表單
        this.formData.companyName = '';
        this.formData.name = '';
        this.touched.companyName = false;
        this.touched.name = false;
      } catch (err) {
        console.error('API 呼叫錯誤:', err);
        this.$fire({
          text: '系統錯誤',
          type: 'error',
          timer: 3000,
        });
      }
    },
  },
};
</script>

<style scoped>
.house-warm {
  min-height: 100vh;
  width: 100%;
  background-image: url('~@/assets/img/houseWarm.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  display: flex;
  flex-direction: column;
  font-family: 'Microsoft JhengHei', 'PingFang TC', sans-serif;
}

/* Header Styles */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 2.5rem;
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.logo-aira {
  height: 3rem;
  width: auto;
}

.logo-text {
  font-size: 2.5rem;
  color: #fff;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-icon {
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 50%;
  border: 0.125rem solid rgba(255, 255, 255, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.875rem;
}

.time {
  font-size: 4rem;
  color: #fff;
  font-weight: 400;
}

/* Main Content Styles */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1.25rem;
}

.welcome-title {
  font-family: 'Noto Sans', sans-serif;
  font-size: 7rem;
  line-height: 0.8em;
  margin-bottom: 3rem;
  color: white;
  font-style: italic;
  font-weight: 200;
  letter-spacing: -0.03125rem;
  text-shadow: 0 0 0.75rem #ff00b0, 0 0 0.375rem #47eaff;
}

.welcome-subtitle {
  font-family: 'Noto Sans', sans-serif;
  font-size: 3rem;
  line-height: 0.8em;
  margin-bottom: 4rem;
  color: white;
  font-weight: 200;
  letter-spacing: -0.03125rem;
  text-shadow: 0 0 0.75rem #ff00b0, 0 0 0.375rem #47eaff;
}

/* Form Styles */
.form-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
  width: 100%;
  max-width: 31.25rem;
}

.form-row {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  width: 100%;
}

.form-label {
  font-size: 2rem;
  color: #fff;
  width: 10rem;
  flex-shrink: 0;
  text-align: right;
  letter-spacing: 0.25rem;
}

.form-input {
  flex: 1;
  height: 3rem;
  border-radius: 0.5rem;
  border: none;
  padding: 0 1.25rem;
  font-size: 1rem;
  background-color: #fff;
  outline: none;
}

.form-input:focus {
  box-shadow: 0 0 0.625rem rgba(255, 255, 255, 0.5);
}

.form-input.input-error {
  border: 0.125rem solid #ff6b6b;
  box-shadow: 0 0 0.5rem rgba(255, 107, 107, 0.5);
}

.error-message {
  color: #ff6b6b;
  font-size: 0.875rem;
  margin: -0.5rem 0 0.5rem 11.25rem;
  text-align: left;
  width: 100%;
}

.submit-btn {
  margin-top: 1.25rem;
  width: 15rem;
  height: 3rem;
  border-radius: 1.5rem;
  border: 0.25rem solid white;
  background: linear-gradient(90deg, #6b7fd7 0%, #a78bda 50%, #e091b5 100%);
  color: #fff;
  font-size: 1.5rem;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.submit-btn:hover {
  transform: scale(1.02);
  box-shadow: 0 0.25rem 1.25rem rgba(167, 139, 218, 0.5);
}

.submit-btn:active {
  transform: scale(0.98);
}

.submit-btn:disabled {
  cursor: not-allowed;
}

.submit-btn:disabled:hover {
  transform: none;
  box-shadow: none;
}
</style>
