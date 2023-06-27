<script>
  // 0: 有到 | 1: 未到 | 2: 有到異常
  export default {
    data() {
      return {
        personData: [],
        verifyData: [],

        hourlyPersonInData: new Map(),
        hourlyPersonOutData: new Map(),
        hourlyPresentData: new Map(),

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

      getHourlyPresentData() {
        let PersonIn = Array(24).fill(0);
        let PersonOut = Array(24).fill(0);
        let PersonPresent = Array(24).fill(0);

        this.hourlyPersonInData.forEach((v, k, m) => {
          PersonIn[k] += v.length;
        });

        this.hourlyPersonOutData.forEach((v, k, m) => {
          PersonOut[k] += v.length * -1;
        });

        this.hourlyPresentData.forEach((v, k, m) => {
          PersonPresent[k] += v.length;
        });

        return {
          PersonIn,
          PersonOut,
          PersonPresent
        };
      },

      async setupPersonData() {
        console.log("============  setupPersonDataV2");
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

        while (thereIsMoreData) {
          let retPerson = await self.$globalFindPersonWithoutPhoto("", shitf, 250);

          let err = retPerson.error;
          let result = retPerson.data;
          if (err == null && result) {
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
        }
      },

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

                self.normalizationData(result.data);

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
            cb(self.lastRecordTimestamp);
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

      normalizationData(data) {
        console.log("============  normalizationData");
        let self = this;

        let passModeRecord = [];
        let clockModeRecord = [];

        if (data.length >= 1) {
          // id: "A-0011"
          // name: "Fd"
          // timestamp: 1685062461000
          // uuid: "7B7B04A4-F706-4A5C-8951-988B474A47A7"

          passModeRecord = data.filter((attRec) => {
            return (attRec.verify_mode != 3 && attRec.verify_mode != 4);
          });
          clockModeRecord = data.filter((attRec) => {
            return (attRec.verify_mode == 3 || attRec.verify_mode == 4);
          });

          if (clockModeRecord.length >= 1) {
            clockModeRecord.sort(function (a, b) {
              return a.timestamp - b.timestamp;
            });

            for (let i = 0; i < clockModeRecord.length; i++) {
              let record = clockModeRecord[i];

              let uuid = record.uuid;
              let id = record.id;
              let name = record.name;

              let mode = record.verify_mode;
              let timestamp = record.timestamp;

              let hour = new Date(record.timestamp).getHours();

              let person = self.personData.find(r => r.uuid == uuid);
              switch (mode) {
                case 3:
                  {
                    if (person) {
                      // clockinRecord
                      person.clockinRecord = record;

                      // presentRecord
                      if (person.presentRecord) {
                        let last = person.presentRecord[person.presentRecord.length - 1];
                        if (last.out) {
                          person.presentRecord.push({
                            in: hour
                          })
                        }
                      }
                      else {
                        person.presentRecord = [];
                        person.presentRecord.push({
                          in: hour
                        })
                      }
                    }

                    // hourlyPersonInData
                    let hValue = self.hourlyPersonInData.get(hour) || [];
                    hValue.push(uuid);

                    self.hourlyPersonInData.set(hour, hValue);
                  }
                  break;
                case 4:
                  {
                    // clockoutRecord
                    if (person) {
                      person.clockoutRecord = record;

                      // presentRecord
                      if (person.presentRecord) {
                        let last = person.presentRecord[person.presentRecord.length - 1];
                        if (!last.out) {
                          person.presentRecord[person.presentRecord.length - 1].out = hour;
                        }
                      }
                    }

                    // hourlyPersonOutData
                    let hValue = self.hourlyPersonOutData.get(hour) || [];
                    hValue.push(uuid);

                    self.hourlyPersonOutData.set(hour, hValue);
                  }
                  break;
              }


              if ((!person.clockinRecord) && (!person.clockoutRecord)) {
                person.punchMode = 0; // no clockin and no clockout = unknow
                person.status = 1;
              }
              else if ((!person.clockinRecord) && (person.clockoutRecord)) {
                person.punchMode = 0;  // no clockin and have clockout = unknow
                person.status = 1;
              }
              if ((person.clockinRecord) && (!person.clockoutRecord)) {
                person.punchMode = 3;  // have clockin and no clockout = clockin
                person.status = 0;
              }
              if ((person.clockinRecord) && (person.clockoutRecord)) {
                // have clockin and have clockout
                if (person.clockinRecord.timestamp < person.clockoutRecord.timestamp) {
                  person.punchMode = 4;  // clockinRecord.timestamp <  clockoutRecord.timestamp = clockout
                  person.status = 1;
                }
                else {
                  person.punchMode = 3;  // clockinRecord.timestamp >=  clockoutRecord.timestamp = clockin
                  person.status = 0;
                }
              }
            }

            for (let i = 0; i < self.personData.length; i++) {
              let person = self.personData[i];

              if (person.presentRecord) {
                for (let j = 0; j < person.presentRecord.length; j++) {
                  const present = person.presentRecord[j];

                  let _in = present.in;
                  let _out = present.out;

                  if (_in && _out) {
                    // console.log("presentRecord", person, _in, _out);

                    for (let k = _in; k < _out; k++) {
                      let hValue = self.hourlyPresentData.get(k) || [];

                      if (hValue.indexOf(person.uuid) < 0)
                        hValue.push(person.uuid);

                      self.hourlyPresentData.set(k, hValue);
                    }
                  }
                }
              }
            }

            console.log("c personData", self.personData);
            console.log("c hourlyPresentData", self.hourlyPresentData);
            console.log("c hourlyPersonInData", self.hourlyPersonInData);
            console.log("c hourlyPersonOutData", self.hourlyPersonOutData);

          }
          else if (passModeRecord.length >= 1) {
            passModeRecord.sort(function (a, b) {
              return a.timestamp - b.timestamp;
            });

            if (passModeRecord.length >= 1) {
              let record = passModeRecord[0];

              let uuid = record.uuid;
              let person = self.personData.find(r => r.uuid == uuid);
              if (person) person.clockinRecord = record;
            }

            if (passModeRecord.length >= 2) {
              let record = passModeRecord[passModeRecord.length - 1];

              let uuid = record.uuid;
              let person = self.personData.find(r => r.uuid == uuid);
              if (person) person.clockinRecord = record;
            }

            console.log("p personData", self.personData);
            console.log("p hourlyPersonInData", self.hourlyPersonInData);
            console.log("p hourlyPersonOutData", self.hourlyPersonOutData);
          }
        }
      },

      // setupPersonData() {
      //   console.log("============  setupPersonData");


      //   let now = new Date();
      //   let currentHour = now.getHours();
      //   let seed = [
      //     {
      //       // uuid:"", v-for 的 key
      //       name: "我是長中",
      //       temperature: 38,
      //       temperatureStatus: 1,
      //       clockTime: currentHour + ":20", //
      //       image: "/img/frank.b8c3ceb4.png",
      //       status: 2,
      //       punchMode: "clock_in",
      //       groups: ["長榮航太科技", "中鼎工程"],
      //     },
      //     {
      //       // uuid:"", v-for 的 key
      //       name: "我是長中",
      //       temperature: 38,
      //       temperatureStatus: 1,
      //       clockTime: currentHour + ":30", //
      //       image: "/img/frank.b8c3ceb4.png",
      //       status: 2,
      //       punchMode: "clock_out",
      //       groups: ["長榮航太科技", "中鼎工程"],
      //     },
      //     {
      //       name: "我是長",
      //       temperature: 31,
      //       temperatureStatus: 0,
      //       clockTime: "12:30", //
      //       image: "/img/frank.b8c3ceb4.png",
      //       status: 1,
      //       punchMode: "clock_out",
      //       groups: ["長榮航太科技"],
      //     },
      //     {
      //       name: "我是漢台",
      //       temperature: 32.5,
      //       temperatureStatus: 0,
      //       clockTime: "09:30", //
      //       image: "",
      //       status: 0,
      //       punchMode: "clock_in",
      //       groups: ["漢唐集成", "台達電子工業"],
      //     },
      //     {
      //       // uuid:"", v-for 的 key
      //       name: "我是長台",
      //       temperature: 38,
      //       temperatureStatus: 1,
      //       clockTime: "09:16", //
      //       image: "",
      //       status: 2,
      //       punchMode: "clock_out",
      //       groups: ["長榮航太科技", "台達電子工業"],
      //     },
      //     {
      //       name: "我是長漢",
      //       temperature: 32.5,
      //       temperatureStatus: 0,
      //       clockTime: "12:12", //
      //       image: "",
      //       status: 0,
      //       punchMode: "clock_in",
      //       groups: ["漢唐集成", "長榮航太科技"],
      //     },
      //   ];
      //   let data = [];
      //   let data1 = [];
      //   for (let i = 0; i < 7; i++) {
      //     console.log("i = ", i);
      //     data1 = [];
      //     for (let j = 0; j < seed.length; j++) {
      //       console.log("j = ", j);
      //       let item = {};
      //       item.name = seed[j].name;
      //       item.temperature = seed[j].temperature;
      //       item.temperatureStatus = seed[j].temperatureStatus;
      //       item.clockTime = seed[j].clockTime;
      //       item.image = seed[j].image;
      //       item.status = seed[j].status;
      //       item.punchMode = seed[j].punchMode;
      //       item.groups = seed[j].groups;
      //       item.name += "." + (i % 4);
      //       data1.push(item);
      //       console.log("data1 = ", data1.length);
      //     }
      //     let data2 = [];
      //     for (let k = 0; k < 6; k++) {
      //       console.log("k = ", k);
      //       data2 = data2.concat(data1);
      //       console.log("data2 = ", data2.length);
      //     }
      //     data = data.concat(data2);
      //     console.log("data = ", data.length);
      //   }

      //   this.personData = data;
      // },
      // setupGrouopData() {
      //   let seed = [
      //     {
      //       name: "長榮航太科技",
      //       present: 37,
      //       total: 39,
      //       status: 0,
      //     },
      //     {
      //       name: "中鼎工程",
      //       present: 48,
      //       total: 18,
      //       status: 1,
      //     },
      //     {
      //       name: "漢唐集成",
      //       present: 39,
      //       total: 0,
      //       status: 0,
      //     },
      //     {
      //       name: "台達電子工業",
      //       present: 39,
      //       total: 39,
      //       status: 1,
      //     },
      //   ];
      //   let data = [];
      //   let data1 = [];
      //   for (let i = 0; i < 7; i++) {
      //     data1 = [];
      //     for (let j = 0; j < 4; j++) {
      //       let item = {};
      //       item.name = seed[j].name;
      //       item.present = seed[j].present;
      //       item.total = seed[j].total;
      //       item.status = seed[j].status;
      //       data1.push(item);
      //     }
      //     let data2 = [];
      //     for (let k = 0; k < 6; k++) {
      //       data2 = data2.concat(data1);
      //     }
      //     data = data.concat(data2);
      //   }

      //   this.groupData = data;
      // },
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