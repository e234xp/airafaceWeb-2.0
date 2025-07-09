<template>
  <div class="modal-main">
    <div>
      <div class="close-btn" @click="$emit('close')">
        <CIcon name="cil-x" height="24" />
      </div>
      <img :src="`data:image/png;base64,${persons[0].face_image}`"
        style="width: 240px; height: 240px; border-radius: 8px;" v-if="persons.length === 1">
      <!-- <div
        style="width: 240px; height: 240px; background: black;"
        v-if="persons.length === 1"
      /> -->
      <div style="width: 240px; color: white" class="fz-xxxl fw-700" v-else>
        {{ $t('batchCommand') }}
      </div>
      <div style="width: calc(100% - 240px); color: white">
        <div class="fz-md" style="display: flex; line-height: 18px;">
          <template v-if="persons.length === 1">
            <div style="display: flex; align-items: center;">
              <CIcon name="cil-clock" height="20" width="20" />
              <div>{{ parseTime(persons[0].timestamp) }}</div>
            </div>
          </template>
          <template v-else>
            <div>{{ $t('Selected') }} <span class="hint fz-xl fw-700">{{ persons.length }}</span> {{ $t('items') }}
            </div>
          </template>
        </div>
        <div v-if="persons.length === 1">
          <div style="color: #B4BFC0; margin-bottom: 8px;">
            {{ $t('similarPerson') }}：
          </div>
          <div style="display: flex; flex-wrap: wrap; gap: 8px" v-if="persons[0].near">
            <img :src="`data:image/png;base64,${persons[0].near.register_image}`"
              style="width: 100px; height: 100px; border-radius: 4px;">
            <div>
              <div>#{{ persons[0].near.id }}</div>
              <div>{{ persons[0].near.name }}</div>
              <div>{{ $t('similarRate') }}<span>{{ (persons[0].verify_score * 100).toFixed(0) }}</span>%</div>
            </div>
          </div>
          <div v-else>
            --
          </div>
        </div>
        <div>
          <div style="color: #B4BFC0; margin-bottom: 8px;">
            {{ $t('confirmedAs') }}：
          </div>
          <CInputRadioGroup :checked="type" @update:checked="type = $event" :options="typeOptions" />
        </div>
        <div v-if="!direct">
          <div style="color: #B4BFC0; margin-bottom: 8px;">
            {{ $t('command') }}：
          </div>
          <CInput style="margin-bottom: unset;" v-model="remark" />
          <div style="display: flex; justify-content: flex-end; margin-top: 4px">
            <div>{{ $t('RemarkTemplate') }}：</div>
            <div class="remark-template" @click="onRemarkTemplate(opt.value)" v-for="opt in templateOptions"
              :key="opt.value">
              {{ opt.label }}
            </div>
          </div>
        </div>
        <div style="width: 100%; display: flex; gap: 20px">
          <div class="cancel-btn" style="width: 50%;" @click="$emit('close')">
            {{ $t('Cancel') }}
          </div>
          <div class="confirm-btn" style="width: 50%;" @click="onConfirm">
            {{ $t('Confirm') }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import dayjs from 'dayjs';
  import i18n from '@/i18n';

  export default {
    name: 'GuardAckModal',
    emits: ['close', 'confirm'],
    data() {
      return {
        message: 'Welcome to GuardAckModal component!',
        remark: '',
        typeOptions: [
          { value: 'opt1', label: i18n.formatter.format('Stranger') },
          { value: 'opt2', label: i18n.formatter.format('Visitor') },
          { value: 'opt3', label: i18n.formatter.format('Employee') },
        ],
        templateOptions: [
          { value: i18n.formatter.format('RemarksTemplate1'), label: i18n.formatter.format('RemarksTemplateTitle1') },
          { value: i18n.formatter.format('RemarksTemplate2'), label: i18n.formatter.format('RemarksTemplateTitle2') },
        ],
        type: 'opt1',
      };
    },
    props: {
      persons: {
        type: Array,
        default: () => [],
      },
      direct: {
        type: Boolean,
        default: false,
      },
    },
    methods: {
      parseTime(time) {
        return dayjs(time).format('HH:mm:ss');
      },
      onConfirm() {
        const result = `${dayjs().format('YYYYMMDD')}-${this.$store.state.serverToken.username}-${this.typeOptions.find((item) => item.value === this.type).label}-${this.remark}`;// {now}-{user}-{type}-{remark}
        this.$emit('confirm', result);
      },
      onRemarkTemplate(val) {
        this.remark = val;
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
    z-index: 99;
    display: flex;
    justify-content: center;
    align-items: center;

    >div {
      position: relative;
      width: 756px;
      // height: 500px;
      border-radius: 8px;
      border: 2px solid #B4BFC0;
      background: #3F4849;
      display: flex;
      gap: 32px;
      padding: 40px;

      >div {
        >div {
          border-top: 1px solid #8A9192;
          padding: 18px 0;
        }

        >div:first-child {
          border-top: unset;
          padding: 0 0 18px 0;
        }

        >div:last-child {
          padding: 18px 0 0 0;
        }
      }
    }
  }

  .close-btn {
    position: absolute;
    top: 16px;
    right: 16px;
    color: white;
    cursor: pointer;
  }

  .cancel-btn {
    cursor: pointer;
    padding: 6px 0;
    font-size: 14px;
    font-style: normal;
    font-weight: 400;
    line-height: normal;
    text-align: center;
    border-radius: 4px;
    border: 1px solid #FFF;
    background: $guard-btn-bg;
    box-shadow: 0px 4px 4px 0px rgba(0, 0, 0, 0.10);

    &:hover {
      background: $guard-btn-bg-hover;
    }
  }

  .confirm-btn {
    cursor: pointer;
    padding: 6px 0;
    font-size: 14px;
    font-style: normal;
    font-weight: 400;
    line-height: normal;
    text-align: center;
    border-radius: 4px;
    border: 1px solid #FFF;
    background: $guard-primary-btn-bg;
    box-shadow: 0px 4px 4px 0px rgba(0, 0, 0, 0.10);

    &:hover {
      background: $guard-primary-btn-bg-hover;
    }
  }

  .form-control {
    background: black !important;
  }

  .hint {
    color: $dashboard-unknown;
  }

  .remark-template {
    padding: 0 4px;
    cursor: pointer;
    background: $theme-black;
    color: $no-content-bg;
    border-radius: 4px;
    margin-right: 4px;

    &:hover {
      color: $primary;
    }
  }

  .form-check-input {
    margin-top: unset !important;
  }
</style>