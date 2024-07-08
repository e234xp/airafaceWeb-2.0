<script>
export default {
  data() {
    return {
      groupData: [],
      personData: [],
      verifyData: [],

      lastRecordTimestamp: 0,
      loading: false,
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
      const self = this;
      self.groupData = [];

      const ret = await self.$globalGetGroupList();
      const list = ret.group_list;
      const { error } = ret;

      if (error == null) {
        list.forEach((g) => {
          self.groupData.push(
            {
              uuid: g.uuid,
              groupName: g.name,
              person_list: g.person_list,
              persons: [],
              total: 0,
              present: 0,
            },
          );
        });
      }

      return self.groupData;
    },

    async setupPersonData() {
      const self = this;
      self.personData = [];
      let shitf = 0;
      let thereIsMoreData = true;

      await new Promise(async (resolve, reject) => {
        while (thereIsMoreData) {
          const retPerson = await self.$globalFindPersonWithoutPhoto('', shitf, 2500);

          const err = retPerson.error;
          const result = retPerson.data;
          if (err == null && result) {
            try {
              for (let i = 0; i < result.person_list.length; i++) {
                const p = result.person_list[i];
                p.status = -1;
                p.register_image = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACXBIWXMAAAsSAAALEgHS3X78AAAADUlEQVR4nGP4//8/AwAI/AL+p5qgoAAAAABJRU5ErkJggg==';
                p.display_image = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACXBIWXMAAAsSAAALEgHS3X78AAAADUlEQVR4nGP4//8/AwAI/AL+p5qgoAAAAABJRU5ErkJggg==';
              }

              self.personData = self.personData.concat(result.person_list);

              if (result.slice_shift + result.person_list.length < result.total_length) {
                thereIsMoreData = true;
                shitf = result.slice_shift + result.person_list.length;
              } else thereIsMoreData = false;
            } catch (ex) {
              console.log('setupPersonData 3', ex);
            }
          } else {
            thereIsMoreData = false;
          }
        }

        thereIsMoreData = true;
        while (thereIsMoreData) {
          const retPerson = await self.$globalFindVisitorWithoutPhoto('', shitf, 2500);

          const err = retPerson.error;
          const result = retPerson.data;
          if (err == null && result) {
            try {
              for (let i = 0; i < result.visitor_list.length; i++) {
                const p = result.visitor_list[i];
                p.status = -1;
                p.register_image = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACXBIWXMAAAsSAAALEgHS3X78AAAADUlEQVR4nGP4//8/AwAI/AL+p5qgoAAAAABJRU5ErkJggg==';
                p.display_image = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACXBIWXMAAAsSAAALEgHS3X78AAAADUlEQVR4nGP4//8/AwAI/AL+p5qgoAAAAABJRU5ErkJggg==';
              }

              self.personData = self.personData.concat(result.visitor_list);

              if (result.slice_shift + result.visitor_list.length < result.total_length) {
                thereIsMoreData = true;
                shitf = result.slice_shift + result.visitor_list.length;
              } else thereIsMoreData = false;
            } catch (ex) {
              console.log('setupPersonData 4', ex);
            }
          } else {
            thereIsMoreData = false;
          }
        }

        resolve();
      });

      return self.personData;
    },

    async setupVerifyData(startTS, endTS, cb) {
      const self = this;
      self.verifyData = [];
      let shitf = 0;
      let thereIsMoreData = true;
      self.loading = true;

      while (thereIsMoreData) {
        const query = {
          start_time: startTS,
          end_time: endTS,
          slice_length: 10000,
          slice_shift: shitf,
          uuid_list: [],
          with_image: false,
        };

        const retResultP = await self.$globalGetPersonResult(query);

        const errP = retResultP.error;
        if (errP == null && retResultP.data) {
          const { result } = retResultP.data;
          if (result.data) {
            if (result.data.length >= 1) {
              result.data.sort((a, b) => a.timestamp - b.timestamp);

              self.lastRecordTimestamp = result.data[result.data.length - 1].timestamp;

              self.verifyData = self.verifyData.concat(result.data);
            }
          }

          if (result.slice_shift + result.data.length < result.total_length) {
            thereIsMoreData = true;
            shitf = result.slice_shift + result.data.length;
          } else thereIsMoreData = false;
        } else thereIsMoreData = false;
      }

      shitf = 0;
      thereIsMoreData = true;

      while (thereIsMoreData) {
        const query = {
          start_time: startTS,
          end_time: endTS,
          slice_length: 10000,
          slice_shift: shitf,
          uuid_list: [],
          with_image: false,
        };

        const retResultV = await self.$globalGetVisitorResult(query);

        const errV = retResultV.error;
        if (errV == null && retResultV.data) {
          const { result } = retResultV.data;
          if (result.data) {
            if (result.data.length >= 1) {
              result.data.sort((a, b) => a.timestamp - b.timestamp);

              self.lastRecordTimestamp = result.data[result.data.length - 1].timestamp;

              self.verifyData = self.verifyData.concat(result.data);
            }
          }

          if (result.slice_shift + result.data.length < result.total_length) {
            thereIsMoreData = true;
            shitf = result.slice_shift + result.data.length;
          } else thereIsMoreData = false;
        } else thereIsMoreData = false;
      }

      try {
        self.loading = false;
        if (cb) cb(self.verifyData, self.lastRecordTimestamp);
      } catch (ex) {
        console.log(ex);
      }
    },

    setupColors() {
      const enterDataColors = [];
      for (let i = 0; i < 24; i++) {
        if (i > 10) {
          enterDataColors[i] = 'transparent';
        } else {
          enterDataColors[i] = self.chartEnterColor;
        }
      }
      const leaveDataColors = [];
      for (let i = 0; i < 24; i++) {
        if (i > 10) {
          leaveDataColors[i] = 'transparent';
        } else {
          leaveDataColors[i] = self.chartLeaveColor;
        }
      }
    },
  },
};
</script>
