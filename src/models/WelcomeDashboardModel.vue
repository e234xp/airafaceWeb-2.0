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
      },
      async setupVerifyData(startTS, endTS, cb) {
        console.log("============  setupVerifyData");
        let self = this;
        let verifyData = [];
        let shitf = 0;
        let thereIsMoreData = true;

        while (thereIsMoreData) {
          const query = {
            start_time: startTS,
            end_time: endTS,
            slice_length: 10,
            slice_shift: shitf,
            uuid_list: [],
            with_image: false,
          };

          const retResult = await self.$globalGetPersonResult(query);

          const err = retResult.error;
          if (err == null && retResult.data) {
            console.log('=================================');
            const { result } = retResult.data;
            if (result.data) {
              if (result.data.length >= 1) {
                result.data.sort((a, b) => a.timestamp - b.timestamp);

                self.lastRecordTimestamp = result.data[result.data.length - 1].timestamp;
                try {
                  if (cb) {
                    cb({ result: result.data, LastRecordTimestamp: self.lastRecordTimestamp });
                  }
                } catch (ex) {
                  console.log(ex);
                }
              } else {
                try {

                  if (cb) {
                    cb({ result: [], LastRecordTimestamp: self.lastRecordTimestamp });
                  }
                } catch (ex) {
                  console.log(ex);
                }
              }
            }

            if (result.slice_shift + result.data.length < result.total_length) {
              thereIsMoreData = true;
              shitf = result.slice_shift + result.data.length;
            } else {
              thereIsMoreData = false;
            }
          } else {
            thereIsMoreData = false;
          }
        }
      },
    },
  };
</script>