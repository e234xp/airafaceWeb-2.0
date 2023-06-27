<script>
  export default {
    data() {
      return {
        personData: [],
        groupData: [],

        lastRecordTimestamp: 0
      };
    },
    methods: {
      getPersonData() {
        return this.personData;
      },
      getGroupData() {
        return this.groupData;
      },
      setupPersonDataV2() {
        let self = this;
        let now = new Date().getTime();
        self.personData = JSON.parse(
          JSON.stringify([
            {
              uuid: "a",
              title: "Media  Director",
              name: "Sally Watson A",
              department: "Media dept.",
              remarks: "PXI",
              priority: 0,
              startShowingTime: now,
            },
            {
              uuid: "b",

              title: "Art  Director",
              name: "Lisa Johnson B",
              department: "Media dept.",
              remarks: "IxdA",
              priority: 0,
              startShowingTime: now,
            },
            {
              uuid: "c",

              title: "CMO",
              name: "John Anderson C",
              department: "Marketing dept.",
              remarks: "aaa",
              priority: 0,
              startShowingTime: now,
            },
            {
              uuid: "d",

              title: "Art A. Director",
              name: "Sophia Lynn D",
              department: "Media dept.",
              remarks: "xxx",
              priority: 0,
              startShowingTime: now,
            },
          ])
        );
        console.log(("mock data", self.personData));
      },
      async setupVerifyData(startTS, endTS, cb) {
        console.log("============  setupVerifyData");
        let self = this;
        let verifyData = [];
        let shitf = 0;
        let thereIsMoreData = true;

        while (thereIsMoreData) {
          let query = {
            start_time: startTS,
            end_time: endTS,
            slice_length: 10,
            slice_shift: shitf,
            uuid_list: [],
            with_image: false
          };

          let retResult = await self.$globalGetPersonResult(query);

          let err = retResult.error;
          if (err == null && retResult.data) {
            console.log("=================================");
            let result = retResult.data.result;
            if (result.data) {
              if (result.data.length >= 1) {
                result.data.sort(function (a, b) {
                  return a.timestamp - b.timestamp;
                });

                self.lastRecordTimestamp = result.data[result.data.length - 1].timestamp;
                try {
                  console.log("callback a", { result: result.data, LastRecordTimestamp: self.lastRecordTimestamp });
                  if (cb)
                    cb({ result: result.data, LastRecordTimestamp: self.lastRecordTimestamp });
                }
                catch (ex) {
                  console.log(ex);
                }
              }
              else {
                try {
                  console.log("callback b", { result: [], LastRecordTimestamp: self.lastRecordTimestamp });

                  if (cb)
                    cb({ result: [], LastRecordTimestamp: self.lastRecordTimestamp });
                }
                catch (ex) {
                  console.log(ex);
                }
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
      },


      // setupPersonData() {
      //   let now = new Date();
      //   let currentHour = now.getHours();
      //   let seed = [];
      //   let data = [];
      //   let data1 = [];
      //   for (let i = 0; i < 7; i++) {
      //     data1 = [];
      //     for (let j = 0; j < seed.length; j++) {
      //       let item = {};
      //       item.name = seed[j].name;
      //       item.temperature = seed[j].temperature;
      //       item.temperatureStatus = seed[j].temperatureStatus;
      //       item.startShowingTime = seed[j].startShowingTime;
      //       item.image = seed[j].image;
      //       item.status = seed[j].status;
      //       item.punchMode = seed[j].punchMode;
      //       item.groups = seed[j].groups;
      //       item.name += "." + (i % 4);
      //       data1.push(item);
      //     }
      //     let data2 = [];
      //     for (let k = 0; k < 6; k++) {
      //       data2 = data2.concat(data1);
      //     }
      //     data = data.concat(data2);
      //   }

      //   this.personData = data;
      // },
      // setupGrouopData() {},
    },
  };
</script>