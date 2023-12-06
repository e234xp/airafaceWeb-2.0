<template>
  <div id="wrapper">
    <!-- 標題 -->

    <div>
      <h2 sm="12">
        {{ disp_headertitle }}
      </h2>
    </div>
    <!-- +-ROI -->
    <CRow
      sm="12"
      class="h5 ml-2 mb-3"
    >
      <CCol
        sm="1"
        style="display: flex; justify-content: right; align-items: right;"
      >
        <img src="/img/notify.png">
      </CCol>
      <CCol sm="10">
        {{ disp_msgLoadingVideo }}
      </CCol>
      <CCol sm="1" />
    </CRow>
    <CRow
      sm="12"
      class="h5 ml-2"
      style="text-align: center;"
    >
      <CCol sm="1" />
      <CCol sm="2">
        <span
          style="background-color: #FF6C6C;
        padding-left: 10px; padding-right: 10px; padding-bottom: 3px; margin-right: 5px; display: inline-block; line-height: 1.5;"
        >1</span>
        <CButton
          class="btn btn-primary btn-roi mr-3"
          size="sm"
          @click="addROI(0)"
        >
          {{ disp_addROI }} 1
        </CButton>
        <CButton
          class="btn btn-primary btn-roi"
          size="sm"
          @click="removeROI(0)"
        >
          {{ disp_removeROI }} 1
        </CButton>
      </CCol>
      <CCol sm="2">
        <span
          style="background-color: #FFC93E;
        padding-left: 10px; padding-right: 10px; padding-bottom: 3px; margin-right: 5px; display: inline-block; line-height: 1.5;"
        >2</span>
        <CButton
          class="btn btn-primary btn-roi mr-3"
          size="sm"
          @click="addROI(1)"
        >
          {{ disp_addROI }} 2
        </CButton>
        <CButton
          class="btn btn-primary btn-roi"
          size="sm"
          @click="removeROI(1)"
        >
          {{ disp_removeROI }} 2
        </CButton>
      </CCol>
      <CCol sm="2">
        <span
          style="background-color: #DC79FF;
        padding-left: 10px; padding-right: 10px; padding-bottom: 3px; margin-right: 5px; display: inline-block; line-height: 1.5;"
        >3</span>
        <CButton
          class="btn btn-primary btn-roi mr-3"
          size="sm"
          @click="addROI(2)"
        >
          {{ disp_addROI }} 3
        </CButton>
        <CButton
          class="btn btn-primary btn-roi"
          size="sm"
          @click="removeROI(2)"
        >
          {{ disp_removeROI }} 3
        </CButton>
      </CCol>
      <CCol sm="2">
        <span
          style="background-color: #90D678;
        padding-left: 10px; padding-right: 10px; padding-bottom: 3px; margin-right: 5px; display: inline-block; line-height: 1.5;"
        >4</span>
        <CButton
          class="btn btn-primary btn-roi mr-3"
          size="sm"
          @click="addROI(3)"
        >
          {{ disp_addROI }} 4
        </CButton>
        <CButton
          class="btn btn-primary btn-roi"
          size="sm"
          @click="removeROI(3)"
        >
          {{ disp_removeROI }} 4
        </CButton>
      </CCol>
      <CCol sm="2">
        <span
          style="background-color: #7DD2FF;
        padding-left: 10px; padding-right: 10px; padding-bottom: 3px; margin-right: 5px; display: inline-block; line-height: 1.5;"
        >5</span>
        <CButton
          class="btn btn-primary btn-roi mr-3"
          size="sm"
          @click="addROI(4)"
        >
          {{ disp_addROI }} 5
        </CButton>
        <CButton
          class="btn btn-primary btn-roi"
          size="sm"
          @click="removeROI(4)"
        >
          {{ disp_removeROI }} 5
        </CButton>
      </CCol>
      <CCol sm="1" />
    </CRow>

    <!-- ROI Image -->
    <CRow
      sm="12"
      class="h5 ml-2 mb-3"
    >
      <CCol
        sm="12"
        style="display: flex; justify-content: center; align-items: center;"
      >
        <img
          v-show="!flag_snapshotReadly"
          src="/img/noImage.png"
          width="1024"
          height="576"
        >
        <canvas
          v-show="flag_snapshotReadly"
          ref="sketchpad"
          id="canvas"
          width="1024"
          height="576"
        />
      </CCol>
    </CRow>
  </div>
</template>

<script>
import i18n from '@/i18n';

export default {
  name: 'ModifyCamerasStep2Form',
  props: {
    step1form: { type: Object, default: () => { } },
    step2form: { type: Object, default: () => { } },
    defaultValues: { type: Object, default: () => { } },
    isFieldPassed: { type: Function, default: () => null },
  },
  emits: ['updateStep2form'],
  data() {
    return {
      localStep1form: {},
      localStep2form: {},

      // Basic title
      disp_headertitle: i18n.formatter.format('VideoDeviceBasic'),
      disp_addROI: i18n.formatter.format('AddROI'),
      disp_removeROI: i18n.formatter.format('RemoveROI'),

      disp_msgLoadingVideo: i18n.formatter.format('msgLoadingVideo'),

      flag_snapshotReadly: false,

      // canvas
      activeIndex: 1,
      strokeStyle: ['#FF6C6C', '#FFC93E', '#DC79FF', '#90D678', '#7DD2FF'],
      canvas: null,
      ctx: null,
      image: null,
      ratio: 1,
      startPoint: { x: 0, y: 0 },
      endPoint: { x: 0, y: 0 },
    };
  },
  components: {

  },
  computed: {

  },
  watch: {
    localStep2form: {
      handler(newValue) {
        this.$emit('updateStep2form', { ...newValue });
      },
      deep: true,
    },
    defaultValues: {
      handler(newValue) {
        Object.entries(newValue).forEach(([key, value]) => {
          if (!Object.keys(this.step2form).includes(key)) return;
          this.localStep2form[key] = value;
        });
      },
      deep: true,
      immediate: true,
    },
  },

  created() {
    this.localStep1form = { ...this.step1form };
    this.localStep2form = { ...this.step2form };
  },

  mounted() {
    const self = this;

    self.flag_snapshotReadly = false;

    console.log('mounted', self.localStep1form);
    // {
    //   connection_info: "/media/video1"
    //   ip_address: "asdfasfd"
    //   name: "Camera-1"
    //   pass: "123456"
    //   port: 554
    //   stream_type: "rtsp"
    //   user: "admin"
    // }

    self.canvas = document.getElementById('canvas');
    self.ctx = self.canvas.getContext('2d');
    self.image = document.createElement('img');

    self.image.onload = () => {
      self.ratio = self.image.width / self.canvas.width;
      self.canvas.height = self.image.height / self.ratio;

      self.ctx.drawImage(self.image, 0, 0, self.canvas.width, self.canvas.height);

      // load ROI Info
      for (let i = 0; i < self.localStep2form.roi.length; i += 1) {
        const roi = self.localStep2form.roi[i];

        if (roi.w >= 1) {
          self.ctx.beginPath();
          self.ctx.lineWidth = 5;
          self.ctx.strokeStyle = self.strokeStyle[i];
          self.ctx.rect(roi.x, roi.y, roi.w, roi.h);
          self.ctx.closePath();
          self.ctx.stroke();
        }
      }

      self.flag_snapshotReadly = true;
    };

    let valueUrl = '';
    if (self.localStep1form.stream_type === 'rtsp') {
      valueUrl = `${self.localStep1form.stream_type}`
      + `://${self.localStep1form.user}:${self.localStep1form.pass}`
      + `@${self.localStep1form.ip_address}:${self.localStep1form.port}`
      + `${self.localStep1form.connection_info}`;
      // const valueUrl = 'rtsp://admin:Az-123456@192.168.10.171:554/media/video1';
    } else if (self.localStep1form.stream_type === 'sdp') {
      valueUrl = `${self.localStep1form.stream_type}`
      + '://'
      + `${self.localStep1form.connection_info}`;
      // const valueUrl = 'sdp://v=0\no=99999999 1537 1537 IN IP4 192.168.10.21\ns=192.168.10.21\nc=IN IP4 239.255.10.21\nt=0 0\nm=video 5555 RTP/AVP 102\na=rtpmap:102 H264/90000\na=fmtp:102 profile-level-id=428014;packetization-mode=1; sprop-parameter-sets=gOYAAAAAAAB4v/UWJ2QAH6wa0AoAt02QAAADABAAAAMDzrQAXcACAK97hHihFQ==,gOYAAQAAAABH3kLzKO4NJIk="
    }

    const params = {
      uuid: '12345678-1234-1234-1234-123456789012',
      url: valueUrl,
    };

    console.log('params', params);
    self.$globalCameraSnapshot(params, (err, data) => {
      if (!err) {
        self.image.src = `data:image/jpg;base64,${data.base64}`;
      }
    });

    let isMouseActive = false;
    self.canvas.addEventListener('mousedown', (e) => {
      isMouseActive = true;

      self.removeROI(self.activeIndex);

      self.startPoint = { x: e.offsetX, y: e.offsetY };
      self.ctx.beginPath();
      self.ctx.lineWidth = 5;
    });

    self.canvas.addEventListener('mousemove', (e) => {
      if (!isMouseActive) {
        return;
      }
      console.log('mousemove 1', self.activeIndex);

      self.removeROI(self.activeIndex);

      self.endPoint = { x: e.offsetX, y: e.offsetY };

      self.ctx.beginPath();
      console.log('mousemove 2', self.activeIndex);

      let { x } = self.startPoint;
      if (self.endPoint.x < self.startPoint.x) {
        x = self.endPoint.x;
      }

      let { y } = self.startPoint;
      if (self.endPoint.y < self.startPoint.y) {
        y = self.endPoint.y;
      }

      const w = Math.abs(self.endPoint.x - self.startPoint.x);
      const h = Math.abs(self.endPoint.y - self.startPoint.y);

      self.ctx.strokeStyle = self.strokeStyle[self.activeIndex];
      self.ctx.rect(x, y, w, h);
      self.ctx.closePath();
      self.ctx.stroke();

      self.localStep2form.roi[self.activeIndex] = {
        x, y, w, h,
      };
      console.log('ROI', self.localStep2form.roi);
    });

    self.canvas.addEventListener('mouseup', (e) => {
      console.log('mouseup', e.offsetX, e.offsetY);

      isMouseActive = false;
    });
  },
  methods: {
    addROI(idx) {
      const self = this;
      self.activeIndex = idx;
    },

    removeROI(idx) {
      const self = this;
      self.activeIndex = idx;

      self.localStep2form.roi[self.activeIndex] = {};

      self.ctx.drawImage(self.image, 0, 0, self.canvas.width, self.canvas.height);

      for (let i = 0; i < self.localStep2form.roi.length; i += 1) {
        const roi = self.localStep2form.roi[i];

        if (roi.w >= 1) {
          self.ctx.beginPath();
          self.ctx.strokeStyle = self.strokeStyle[i];
          self.ctx.rect(roi.x, roi.y, roi.w, roi.h);
          self.ctx.closePath();
          self.ctx.stroke();
        }
      }
    },
  },
};
</script>

<style>
  .btn-roi {
    min-width: unset !important;
  }
</style>
