<template>
  <div class="person px-2 py-2" :class="status">
    <div class="regristedFace">
      <img v-show="photoImage != undefined" class="regristedFace-image" :src="`data:image/jpeg;base64,${photoImage}`" />
    </div>
    <div class="areaA oneline">{{ areaA }}</div>
    <div class="info position-relative" :style="statusBackground">
      <!-- VIP Star Decoration -->
      <div v-show="group === 'VIP'" class="vip position-absolute overflow-hidden">
        <div class="vip-inner">
          <svg width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-star-fill" fill="currentColor"
            xmlns="http://www.w3.org/2000/svg">
            <path
              d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.283.95l-3.523 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z" />
          </svg>
        </div>
      </div>
      <div :class="{ 'areaB-padding-top': !periodTime }" class="areaB areaWidth oneline">
        {{ areaB }}
      </div>
      <div class="row cardrow justify-content-between align-items-end">
        <div :class="[!entryTime ? 'areaWidth' : 'areaCWidth']" class="areaC oneline">
          {{ areaC }}
        </div>
        <div class="entry">{{ entryTime }}</div>
      </div>

      <div v-show="periodTime" class="period align-items-center">
        <span class="statusIcon"></span>
        {{ periodTime }}
      </div>
    </div>
  </div>
</template>
<script>
  import i18n from '@/i18n';
  export default {
    name: 'COccupancy',
    props: {
      personId: String,
      status: String,
      // employeeNo: String,
      // fullname: String,
      group: String,
      // department: String,
      photoImage: String,
      entryTime: String,
      leaveTime: String,
      periodTime: String,
      display: Boolean,
      areaA: String,
      areaB: String,
      areaC: String,
      statusBackgroundColors: Object,
    },

    computed: {
      statusBackground() {
        return this.statusBackgroundColors[this.status];
      },
    },
  };
</script>

<style lang='scss' scoped>
  // card background color
  .person {
    &.NORMAL {
      opacity: 0.43;
    }

    &.NORMAL .info {
      background-image: linear-gradient(to bottom, #7e8e8f, #647576);
    }
  }

  .person {
    float: left;
    width: 100%;
    height: 100%;
    color: white;

    .regristedFace {
      float: left;
      width: 12.4rem;
      height: 12.4rem;
      margin-right: 10px;
      position: relative;
      z-index: 2;

      img {
        width: 100%;
        height: 100%;
        border-radius: 4px;
      }
    }

    .areaA {
      font-size: 1.4rem;
      height: 2.4rem;
      overflow: hidden;
    }

    .areaB {
      text-shadow: 0 -1px 0 rgba(0, 0, 0, 0.3);
      font-size: 1.8rem;
      font-weight: 600;
      display: inline-block;
    }

    .areaC {
      text-shadow: 0 -1px 0 rgba(0, 0, 0, 0.3);
      font-family: Arial;
      font-size: 2rem;
      font-weight: normal;
      color: white;
      display: inline-block;
      padding-left: 0;
    }

    .areaWidth {
      width: calc(100% - 1.2rem);
    }

    .areaCWidth {
      width: calc(100% - 6.5rem);
    }

    .entry {
      font-size: 1.2rem;
      padding-bottom: 0.3rem;
    }

    .info {
      position: relative;
      border-radius: 0.4rem;
      box-shadow: 0 0.2rem 0.4rem 0 rgba(0, 0, 0, 0.3);
      margin-left: 2.8rem;
      width: calc(100% - 2.8rem);
      height: calc(100% - 2.3rem);
      padding: 0.6rem 0.6rem 0 10.5rem;

      &::after {
        content: '';
        position: absolute;
        border-radius: 0.4rem;
        width: 100%;
        height: 100%;
        left: 0;
        top: 0;
        display: inline-block;
        opacity: 0.25;
      }
    }

    .cardrow {
      margin-left: 0px;
      margin-right: 0px;
      padding-bottom: 0.3rem;
    }

    .period {
      padding-left: 0.6rem;
      font-size: 1.6rem;
      padding-top: 0.9rem;
      display: flex;
    }

    .statusIcon {
      width: 2.4rem;
      height: 2.4rem;
      margin-right: 1rem;
      float: left;
      background-image: url('/img/capacity/normal.png');
      background-repeat: no-repeat;
      background-size: cover;
    }

    .oneline {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .areaB-padding-top {
      padding-top: 13%;
    }

    &.ABNORMAL {
      .period {
        border-top: 1px solid hsla(0, 0%, 100%, 0.15);
      }
    }

    &.DEPARTED {
      .period {
        border-top: 1px solid hsla(0, 0%, 100%, 0.2);
      }
    }
  }

  // 5 X 5
  .person.times5 {
    .regristedFace {
      width: 14rem;
      height: 14rem;
    }

    .areaB {
      margin-top: 1.6rem;
    }

    .info {
      padding-left: 12.3rem;
    }

    .areaB-padding-top {
      padding-top: 9%;
    }

    .period {
      padding-top: 1.1rem;
    }
  }

  // 6 X 6
  .person.times6 {}

  // 7 X 7
  .person.times7 {
    .regristedFace {
      width: 9.8rem;
      height: 9.8rem;
    }

    .areaB {
      margin-bottom: 0;
    }

    .areaCWidth {
      width: calc(100% - 1.2rem);
    }

    .info {
      padding-left: 8rem;
    }

    .entry,
    .period {
      display: none;
    }

    .areaB {
      padding-top: 9%;
    }
  }

  // 8 X 8
  .person.times8 {
    .regristedFace {
      width: 8rem;
      height: 8rem;
    }

    .areaB {
      margin-bottom: 0;
      font-size: 1.6rem;
    }

    .areaC {
      font-size: 1.8rem;
    }

    .areaCWidth {
      width: calc(100% - 1.2rem);
    }

    .cardrow {
      margin-top: -0.3rem;
    }

    .info {
      padding-left: 6rem;
    }

    .entry,
    .period {
      display: none;
    }

    .areaB {
      padding-top: 8%;
    }
  }

  .vip {
    position: absolute;
    color: #fff;
    right: 0;
    top: 0;
    border-radius: 0 0.4rem 0 0;
    z-index: 0;
  }

  .vip-inner {
    position: relative;
    width: 0;
    height: 0;
    border-style: solid;
    border-width: 0 3.2rem 3.2rem 0;
    border-color: transparent #ffc972 transparent transparent;
  }

  .vip-inner svg {
    position: absolute;
    top: 0.3rem;
    left: 1.5rem;
    z-index: 5;
    font-size: 1.2rem;
  }

  @media (max-width: 1366px) {
    .person {
      .regristedFace {
        width: 12.4rem;
        height: 12.4rem;
      }
    }

    .person.times6 {
      .entry {
        display: none;
      }
    }

    .person.times7,
    .person.times8 {

      .entry,
      .period {
        display: none;
      }
    }
  }
</style>