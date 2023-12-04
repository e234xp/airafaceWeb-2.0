<script>
export default {
  data() {
    return {
      groupData: [],
      personData: [],
      verifyData: [],

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

    async setupPersonData() {
      console.log("============  setupPersonData");
      let self = this;
      self.personData = [];
      let shitf = 0;
      let thereIsMoreData = true;

      await new Promise(async (resolve, reject) => {
        while (thereIsMoreData) {
          let retPerson = await self.$globalFindPersonWithoutPhoto("", shitf, 2500);

          let err = retPerson.error;
          let result = retPerson.data;
          if (err == null && result) {
            try {
              for (let i = 0; i < result.person_list.length; i++) {
                const p = result.person_list[i];
                p.status = 1;
                p.register_image = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACXBIWXMAAAsSAAALEgHS3X78AAAADUlEQVR4nGP4//8/AwAI/AL+p5qgoAAAAABJRU5ErkJggg==";
                p.display_image = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACXBIWXMAAAsSAAALEgHS3X78AAAADUlEQVR4nGP4//8/AwAI/AL+p5qgoAAAAABJRU5ErkJggg==";
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

        thereIsMoreData = true;
        while (thereIsMoreData) {
          let retPerson = await self.$globalFindVisitorWithoutPhoto("", shitf, 2500);

          let err = retPerson.error;
          let result = retPerson.data;
          if (err == null && result) {
            try {
              for (let i = 0; i < result.visitor_list.length; i++) {
                const p = result.visitor_list[i];
                p.status = 1;
                p.register_image = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACXBIWXMAAAsSAAALEgHS3X78AAAADUlEQVR4nGP4//8/AwAI/AL+p5qgoAAAAABJRU5ErkJggg==";
                p.display_image = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACXBIWXMAAAsSAAALEgHS3X78AAAADUlEQVR4nGP4//8/AwAI/AL+p5qgoAAAAABJRU5ErkJggg==";
              }

              self.personData = self.personData.concat(result.visitor_list);

              if (result.slice_shift + result.visitor_list.length < result.total_length) {
                thereIsMoreData = true;
                shitf = result.slice_shift + result.visitor_list.length;
              }
              else
                thereIsMoreData = false;
            }
            catch (ex) {
              console.log("setupPersonData 4", ex);
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

    async setupVerifyData(startTS, endTS, cb) {
      console.log("============  setupVerifyData");
      let self = this;
      self.verifyData = [];
      let shitf = 0;
      let thereIsMoreData = true;

      while (thereIsMoreData) {
        let query = {
          start_time: startTS,
          end_time: endTS,
          slice_length: 1000,
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
  }
};
</script>