<script>
export default {
  data() {
    return {
      personData: [
        {
          // uuid:"", v-for 的 key
          name: "Scarlet Watson",
          temperature: 38,
          temperatureStatus: 1, // 0: 體溫正常 | 1: 異常體溫 | 2: 無體溫資料
          enterTime: "11:20", // 入場時間?
          image: "/img/frank.b8c3ceb4.png",
          status: 2, // 0: 有到 | 1: 未到 | 2: 有到異常
        },
        {
          name: "John Potter",
          temperature: 31,
          temperatureStatus: 0, // 0: 體溫正常 | 1: 異常體溫 | 2: 無體溫資料
          enterTime: "12:30", // 入場時間?
          image: "/img/frank.b8c3ceb4.png",
          status: 1, // 0: 有到 | 1: 未到 | 2: 有到異常
        },
        {
          name: "Mary Lin",
          temperature: 32.5,
          temperatureStatus: 0, // 0: 體溫正常 | 1: 異常體溫 | 2: 無體溫資料
          enterTime: "09:30", // 入場時間?
          image: "",
          status: 0, // 0: 有到 | 1: 未到 | 2: 有到異常
        },
        {
          // uuid:"", v-for 的 key
          name: "Scarlet Watson",
          temperature: 38,
          temperatureStatus: 1, // 0: 體溫正常 | 1: 異常體溫 | 2: 無體溫資料
          enterTime: "11:20", // 入場時間?
          image: "",
          status: 2, // 0: 有到 | 1: 未到 | 2: 有到異常
        },
        {
          name: "John Potter",
          temperature: 31,
          temperatureStatus: 0, // 0: 體溫正常 | 1: 異常體溫 | 2: 無體溫資料
          enterTime: "12:30", // 入場時間?
          image: "",
          status: 1, // 0: 有到 | 1: 未到 | 2: 有到異常
        },
        {
          name: "Mary Lin",
          temperature: 32.5,
          temperatureStatus: 0, // 0: 體溫正常 | 1: 異常體溫 | 2: 無體溫資料
          enterTime: "09:30", // 入場時間?
          image: "",
          status: 0, // 0: 有到 | 1: 未到 | 2: 有到異常
        },
        {
          // uuid:"", v-for 的 key
          name: "Scarlet Watson",
          temperature: 38,
          temperatureStatus: 1, // 0: 體溫正常 | 1: 異常體溫 | 2: 無體溫資料
          enterTime: "11:20", // 入場時間?
          image: "",
          status: 2, // 0: 有到 | 1: 未到 | 2: 有到異常
        },
        {
          name: "John Potter",
          temperature: 31,
          temperatureStatus: 0, // 0: 體溫正常 | 1: 異常體溫 | 2: 無體溫資料
          enterTime: "12:30", // 入場時間?
          image: "",
          status: 1, // 0: 有到 | 1: 未到 | 2: 有到異常
        },
        {
          name: "Mary Lin",
          temperature: 32.5,
          temperatureStatus: 0, // 0: 體溫正常 | 1: 異常體溫 | 2: 無體溫資料
          enterTime: "09:30", // 入場時間?
          image: "",
          status: 0, // 0: 有到 | 1: 未到 | 2: 有到異常
        },
        {
          // uuid:"", v-for 的 key
          name: "Scarlet Watson",
          temperature: 38,
          temperatureStatus: 1, // 0: 體溫正常 | 1: 異常體溫 | 2: 無體溫資料
          enterTime: "11:20", // 入場時間?
          image: "",
          status: 2, // 0: 有到 | 1: 未到 | 2: 有到異常
        },
        {
          name: "John Potter",
          temperature: 31,
          temperatureStatus: 0, // 0: 體溫正常 | 1: 異常體溫 | 2: 無體溫資料
          enterTime: "12:30", // 入場時間?
          image: "",
          status: 1, // 0: 有到 | 1: 未到 | 2: 有到異常
        },
        {
          name: "Mary Lin",
          temperature: 32.5,
          temperatureStatus: 0, // 0: 體溫正常 | 1: 異常體溫 | 2: 無體溫資料
          enterTime: "09:30", // 入場時間?
          image: "",
          status: 0, // 0: 有到 | 1: 未到 | 2: 有到異常
        },

        {
          // uuid:"", v-for 的 key
          name: "Scarlet Watson",
          temperature: 38,
          temperatureStatus: 1, // 0: 體溫正常 | 1: 異常體溫 | 2: 無體溫資料
          enterTime: "11:20", // 入場時間?
          image: "",
          status: 2, // 0: 有到 | 1: 未到 | 2: 有到異常
        },
        {
          name: "John Potter",
          temperature: 31,
          temperatureStatus: 0, // 0: 體溫正常 | 1: 異常體溫 | 2: 無體溫資料
          enterTime: "12:30", // 入場時間?
          image: "",
          status: 1, // 0: 有到 | 1: 未到 | 2: 有到異常
        },
        {
          name: "Mary Lin",
          temperature: 32.5,
          temperatureStatus: 0, // 0: 體溫正常 | 1: 異常體溫 | 2: 無體溫資料
          enterTime: "09:30", // 入場時間?
          image: "",
          status: 0, // 0: 有到 | 1: 未到 | 2: 有到異常
        },
        {
          // uuid:"", v-for 的 key
          name: "Scarlet Watson",
          temperature: 38,
          temperatureStatus: 1, // 0: 體溫正常 | 1: 異常體溫 | 2: 無體溫資料
          enterTime: "11:20", // 入場時間?
          image: "",
          status: 2, // 0: 有到 | 1: 未到 | 2: 有到異常
        },
        {
          name: "John Potter",
          temperature: 31,
          temperatureStatus: 0, // 0: 體溫正常 | 1: 異常體溫 | 2: 無體溫資料
          enterTime: "12:30", // 入場時間?
          image: "",
          status: 1, // 0: 有到 | 1: 未到 | 2: 有到異常
        },
        {
          name: "Mary Lin",
          temperature: 32.5,
          temperatureStatus: 0, // 0: 體溫正常 | 1: 異常體溫 | 2: 無體溫資料
          enterTime: "09:30", // 入場時間?
          image: "",
          status: 0, // 0: 有到 | 1: 未到 | 2: 有到異常
        },
        {
          // uuid:"", v-for 的 key
          name: "Scarlet Watson",
          temperature: 38,
          temperatureStatus: 1, // 0: 體溫正常 | 1: 異常體溫 | 2: 無體溫資料
          enterTime: "11:20", // 入場時間?
          image: "",
          status: 2, // 0: 有到 | 1: 未到 | 2: 有到異常
        },
      ],
      chartData: [
        // 用陣列
        {
          startTime: 0,
          in: 20,
          out: 15,
          present: 20,
        },
        {
          startTime: 1,
          in: 6,
          out: 8,
          present: 7,
        },
        {
          startTime: 0,
          in: 20,
          out: 15,
          present: 20,
        },
        {
          startTime: 1,
          in: 6,
          out: 8,
          present: 7,
        },
        {
          startTime: 0,
          in: 20,
          out: 15,
          present: 20,
        },
        {
          startTime: 1,
          in: 6,
          out: 8,
          present: 7,
        },
        {
          startTime: 0,
          in: 20,
          out: 15,
          present: 20,
        },
        {
          startTime: 1,
          in: 6,
          out: 8,
          present: 7,
        },
        {
          startTime: 0,
          in: 20,
          out: 15,
          present: 20,
        },
        {
          startTime: 1,
          in: 6,
          out: 8,
          present: 7,
        },
        {
          startTime: 0,
          in: 20,
          out: 15,
          present: 20,
        },
        {
          startTime: 1,
          in: 6,
          out: 8,
          present: 7,
        },
        {
          startTime: 0,
          in: 20,
          out: 15,
          present: 20,
        },
        {
          startTime: 1,
          in: 6,
          out: 8,
          present: 7,
        },
        {
          startTime: 0,
          in: 20,
          out: 15,
          present: 20,
        },
        {
          startTime: 1,
          in: 6,
          out: 8,
          present: 7,
        },
        {
          startTime: 0,
          in: 20,
          out: 15,
          present: 20,
        },
        {
          startTime: 1,
          in: 6,
          out: 8,
          present: 7,
        },
        {
          startTime: 0,
          in: 20,
          out: 15,
          present: 20,
        },
        {
          startTime: 1,
          in: 6,
          out: 8,
          present: 7,
        },
        {
          startTime: 0,
          in: 20,
          out: 15,
          present: 20,
        },
        {
          startTime: 1,
          in: 6,
          out: 8,
          present: 7,
        },
        {
          startTime: 0,
          in: 20,
          out: 15,
          present: 20,
        },
        {
          startTime: 1,
          in: 6,
          out: 8,
          present: 7,
        },
      ],
      chartDataPresent: [
        13,
        12,
        11,
        12,
        12,
        11,
        10,
        13,
        10,
        11,
        11,
        12,
        13,
        12,
        11,
        12,
        12,
        11,
        10,
        13,
        10,
        11,
        11,
        12,
      ],
    };
  },
  methods: {
    getPersonData() {
      return this.personData;
    },
    setupPersonData() {
      let seed = [
        {
          // uuid:"", v-for 的 key
          name: "Scarlet Watson",
          temperature: 38,
          temperatureStatus: 1, // 0: 體溫正常 | 1: 異常體溫 | 2: 無體溫資料
          enterTime: "11:20", // 入場時間?
          image: "/img/frank.b8c3ceb4.png",
          status: 2, // 0: 有到 | 1: 未到 | 2: 有到異常
        },
        {
          name: "John Potter",
          temperature: 31,
          temperatureStatus: 0, // 0: 體溫正常 | 1: 異常體溫 | 2: 無體溫資料
          enterTime: "12:30", // 入場時間?
          image: "/img/frank.b8c3ceb4.png",
          status: 1, // 0: 有到 | 1: 未到 | 2: 有到異常
        },
        {
          name: "Mary Lin",
          temperature: 32.5,
          temperatureStatus: 0, // 0: 體溫正常 | 1: 異常體溫 | 2: 無體溫資料
          enterTime: "09:30", // 入場時間?
          image: "",
          status: 0, // 0: 有到 | 1: 未到 | 2: 有到異常
        },
        {
          // uuid:"", v-for 的 key
          name: "Scarlet Watson",
          temperature: 38,
          temperatureStatus: 1, // 0: 體溫正常 | 1: 異常體溫 | 2: 無體溫資料
          enterTime: "11:20", // 入場時間?
          image: "",
          status: 2, // 0: 有到 | 1: 未到 | 2: 有到異常
        },
      ];
      let data = [];
      let data1 = [];
      for (let i = 0; i < 7; i++) {
        data1 = [];
        for (let j = 0; j < 4; j++) {
          let item = {};
          item.name = seed[j].name;
          item.temperature = seed[j].temperature;
          item.temperatureStatus = seed[j].temperatureStatus;
          item.enterTime = seed[j].enterTime;
          item.image = seed[j].image;
          item.status = seed[j].status;
          item.name += "." + i;
          data1.push(item);
        }
        let data2 = [];
        for (let k = 0; k < 6; k++) {
          data2 = data2.concat(data1);
        }
        data = data.concat(data2);
      }

      this.personData = data;
    },
    setupColors() {
      let enterDataColors = [];
      for (let i = 0; i < 24; i++) {
        if (i > 10) {
          enterDataColors[i] = "transparent";
        } else {
          enterDataColors[i] = self.chartEnterColor;
        }
      }
      let leaveDataColors = [];
      for (let i = 0; i < 24; i++) {
        if (i > 10) {
          leaveDataColors[i] = "transparent";
        } else {
          leaveDataColors[i] = self.chartLeaveColor;
        }
      }
    },
  },
};
</script>
