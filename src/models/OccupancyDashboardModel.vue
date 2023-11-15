<script>
  // 0: 有到 | 1: 未到 | 2: 有到異常
  export default {
    data() {
      return {
        groupData: [],
        personData: [],
        verifyData: [],

        // hourlyPersonInData: new Map(),
        // hourlyPersonOutData: new Map(),
        // hourlyPresentData: new Map(),

        lastRecordTimestamp: 0
      };
    },
    methods: {
      getPersonData() {
        return this.personData;
      },

      getVerifyData() {
        return this.verifyData;
      },

      // getHourlyPresentData() {
      //   let PersonIn = Array(24).fill(0);
      //   let PersonOut = Array(24).fill(0);
      //   let PersonPresent = Array(24).fill(0);

      //   this.hourlyPersonInData.forEach((v, k, m) => {
      //     PersonIn[k] += v.length;
      //   });

      //   this.hourlyPersonOutData.forEach((v, k, m) => {
      //     PersonOut[k] += v.length * -1;
      //   });

      //   this.hourlyPresentData.forEach((v, k, m) => {
      //     PersonPresent[k] += v.length;
      //   });

      //   return {
      //     PersonIn,
      //     PersonOut,
      //     PersonPresent
      //   };
      // },

      // get Group Info
      async setupGroupData() {
        let self = this;
        self.groupData = [];

        let ret = await self.$globalGetGroupList();
        const list = ret.group_list;
        const error = ret.error;

        if (error == null) {
          list.forEach(g => {
            self.groupData.push(
              {
                uuid: g.uuid,
                groupName: g.name,
                person_list: g.person_list,
                persons: [],
                total: 0,
                present: 0,
              }
            );
          });
        }

        return self.groupData;
      },

      // get Person Info
      async setupPersonData() {
        console.log("============  setupPersonData");
        let self = this;
        self.personData = [];
        let shitf = 0;
        let thereIsMoreData = true;

        // {
        // begin_date: 1684480861863
        // card_facility_code: ""
        // card_number: 84325746
        // create_date: 1684480861863
        // display_image: ""
        // expire_date: 0
        // extra_info: {}
        // group_list: ["All Person", "Group-1", "Group-2" ]
        // id: "A-0012"
        // last_modify_date: 1684480861863
        // last_modify_date_by_manager: 1684480861863
        // name: "Jack"
        // register_image: ""
        // uuid: "AD07D87F-7396-46D5-BBE9-5F6331E87843"
        // }

        await new Promise(async (resolve, reject) => {
          while (thereIsMoreData) {
            console.log("setupPersonData 1", thereIsMoreData, shitf);
            let retPerson = await self.$globalFindPersonWithoutPhoto("", shitf, 250);
            console.log("setupPersonData 2", retPerson);

            let err = retPerson.error;
            let result = retPerson.data;
            if (err == null && result) {
              try {
                for (let i = 0; i < result.person_list.length; i++) {
                  const p = result.person_list[i];
                  p.status = 1;
                  p.register_image = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACXBIWXMAAAsSAAALEgHS3X78AAAADUlEQVR4nGP4//8/AwAI/AL+p5qgoAAAAABJRU5ErkJggg==";
                }

                self.personData = self.personData.concat(result.person_list);

                if (result.slice_shift + result.person_list.length < result.total_length) {
                  thereIsMoreData = true;
                  shitf = result.slice_shift + result.person_list.length;
                }
                else
                  thereIsMoreData = false;
              }
              catch (ex) {
                console.log("setupPersonData 3", ex);
              }
            }
            else {
              thereIsMoreData = false;
            }
          }

          resolve();
        });

        return self.personData;
      },

      // get Verify Data
      async setupVerifyData(startTS, endTS, cb) {
        console.log("============  setupVerifyData");
        let self = this;
        self.verifyData = [];
        let shitf = 0;
        let thereIsMoreData = true;

        // if (!startTS) startTS = new Date().setHours(0, 0, 0, 0) - 86400000 * 2;
        // if (!endTS) endTS = new Date().setHours(23, 59, 59, 999) - 86400000 * 2;
        // {
        // card_facility_code: ""
        // card_number: ""
        // face_image_id: {f: 'pvr_1685059200000_1685145599999', uuid: '2a42cea0-5241-47af-8967-bbf246ba03c8'}
        // group_list: "[\"All Person\"]"
        // high_temperature: false
        // id: "A-0011"
        // name: "Fd"
        // target_score: 0.9
        // temperature: 0
        // timestamp: 1685062461000
        // uuid: "7B7B04A4-F706-4A5C-8951-988B474A47A7"
        // verify_mode: 3
        // verify_mode_string: "CLOCK_IN_MODE"
        // verify_score: 0.91
        // verify_uuid: "2a42cea0-5241-47af-8967-bbf246ba03c8"
        // }



        while (thereIsMoreData) {
          let query = {
            start_time: startTS,
            end_time: endTS,
            slice_length: 2,
            slice_shift: shitf,
            uuid_list: [],
            with_image: false
          };

          let retResult = await self.$globalGetPersonResult(query);

          let err = retResult.error;
          if (err == null && retResult.data) {
            let result = retResult.data.result;
            if (result.data) {
              if (result.data.length >= 1) {

                result.data.sort(function (a, b) {
                  return a.timestamp - b.timestamp;
                });

                self.lastRecordTimestamp = result.data[result.data.length - 1].timestamp;
                console.log("self.lastRecordTimestamp", self.lastRecordTimestamp);

                // self.normalizationData(result.data);

                self.verifyData = self.verifyData.concat(result.data);
              }
            }

            if (result.slice_shift + result.data.length < result.total_length) {
              thereIsMoreData = true;
              shitf = result.slice_shift + result.data.length;
            }
            else
              thereIsMoreData = false;
          }
          else
            thereIsMoreData = false;
        }

        try {
          if (cb)
            cb(self.verifyData, self.lastRecordTimestamp);
        }
        catch (ex) {
          console.log(ex);
        }

        {
          // 0: 體溫正常 | 1: 異常體溫 | 2: 無體溫資料
          // self.personData = JSON.parse(
          //   JSON.stringify([
          //     {
          //       name: "小明我是長中",
          //       temperature: 38,
          //       temperatureStatus: 1,
          //       clockTime: 1684892138, // 9:35
          //       image: "/img/frank.b8c3ceb4.png",
          //       status: 2,
          //       punchMode: "clock_out",
          //       groups: ["長榮航太科技", "中鼎工程"],
          //     },
          //     {
          //       // uuid:"", v-for 的 key
          //       name: "小明我是長中",
          //       temperature: 38,
          //       temperatureStatus: 1,
          //       clockTime: 1684892438, // 9:40
          //       image: "/img/frank.b8c3ceb4.png",
          //       status: 2,
          //       punchMode: "clock_out",
          //       groups: ["長榮航太科技", "中鼎工程"],
          //     },
          //     {
          //       // 8:4
          //       name: "小維我是長",
          //       temperature: 31,
          //       temperatureStatus: 0,
          //       clockTime: 1684901738, // 12:15
          //       image: "/img/frank.b8c3ceb4.png",
          //       status: 1,
          //       punchMode: "clock_in",
          //       groups: ["長榮航太科技"],
          //     },
          //     {
          //       // uuid:"", v-for 的 key
          //       name: "小明我是長中",
          //       temperature: 38,
          //       temperatureStatus: 1,
          //       clockTime: 1684894958, // 10:22
          //       image: "/img/frank.b8c3ceb4.png",
          //       status: 2,
          //       punchMode: "clock_in",
          //       groups: ["長榮航太科技", "中鼎工程"],
          //     },
          //     {
          //       name: "小維我是長",
          //       temperature: 31,
          //       temperatureStatus: 0,
          //       clockTime: 1684887458, // 8:17
          //       image: "/img/frank.b8c3ceb4.png",
          //       status: 1,
          //       punchMode: "clock_out",
          //       groups: ["長榮航太科技"],
          //     },
          //     {
          //       name: "小凱我是漢台",
          //       temperature: 32.5,
          //       temperatureStatus: 0,
          //       clockTime: 1684896158, // 10:42
          //       image: "",
          //       status: 0,
          //       punchMode: "clock_in",
          //       groups: ["漢唐集成", "台達電子工業"],
          //     },
          //     {
          //       name: "小凱我是漢台",
          //       temperature: 32.5,
          //       temperatureStatus: 0,
          //       // clockTime: "09:30",
          //       clockTime: 1684896578, // 10:49
          //       image: "",
          //       status: 0,
          //       punchMode: "clock_out",
          //       groups: ["漢唐集成", "台達電子工業"],
          //     },
          //     {
          //       // uuid:"", v-for 的 key
          //       name: "我是長台",
          //       temperature: 38,
          //       temperatureStatus: 1,
          //       clockTime: 1684887098, // 8:11
          //       image: "",
          //       status: 2,
          //       punchMode: "clock_out",
          //       groups: ["長榮航太科技", "台達電子工業"],
          //     },
          //     {
          //       name: "我是長漢",
          //       temperature: 32.5,
          //       temperatureStatus: 0,
          //       clockTime: 1684897538, // 11:5
          //       image: "",
          //       status: 0,
          //       punchMode: "clock_in",
          //       groups: ["漢唐集成", "長榮航太科技"],
          //     },
          //   ])
          // );
        }
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