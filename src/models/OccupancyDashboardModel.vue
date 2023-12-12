<script>
// 0: 有到 | 1: 未到 | 2: 有到異常
export default {
  data() {
    return {
      groupData: [],
      personData: [],
      visitorData: [],
      verifyData: [],

      lastRecordTimestamp: 0,
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
      console.log('============  setupPersonData');
      const self = this;
      self.personData = [];
      let shitf = 0;
      let thereIsMoreData = true;

      await new Promise((resolve) => {
        (async () => {
          while (thereIsMoreData) {
            const retPerson = await self.$globalFindPersonWithoutPhoto('', shitf, 2500);

            const err = retPerson.error;
            const result = retPerson.data;
            if (err == null && result) {
              try {
                for (let i = 0; i < result.person_list.length; i += 1) {
                  const p = result.person_list[i];
                  p.status = 1;
                  p.register_image = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACXBIWXMAAAsSAAALEgHS3X78AAAADUlEQVR4nGP4//8/AwAI/AL+p5qgoAAAAABJRU5ErkJggg==';
                  p.display_image = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACXBIWXMAAAsSAAALEgHS3X78AAAADUlEQVR4nGP4//8/AwAI/AL+p5qgoAAAAABJRU5ErkJggg==';
                }

                self.personData = self.personData.concat(result.person_list);

                if (result.slice_shift + result.person_list.length < result.total_length) {
                  thereIsMoreData = true;
                  shitf = result.slice_shift + result.person_list.length;
                } else { thereIsMoreData = false; }
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
                for (let i = 0; i < result.visitor_list.length; i += 1) {
                  const p = result.visitor_list[i];
                  p.status = 1;
                  p.register_image = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACXBIWXMAAAsSAAALEgHS3X78AAAADUlEQVR4nGP4//8/AwAI/AL+p5qgoAAAAABJRU5ErkJggg==';
                  p.display_image = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACXBIWXMAAAsSAAALEgHS3X78AAAADUlEQVR4nGP4//8/AwAI/AL+p5qgoAAAAABJRU5ErkJggg==';
                }

                self.personData = self.personData.concat(result.visitor_list);

                if (result.slice_shift + result.visitor_list.length < result.total_length) {
                  thereIsMoreData = true;
                  shitf = result.slice_shift + result.visitor_list.length;
                } else { thereIsMoreData = false; }
              } catch (ex) {
                console.log('setupPersonData 4', ex);
              }
            } else {
              thereIsMoreData = false;
            }
          }

          resolve();
        })();
      });

      return self.personData;
    },

    // get Person Info
    async setupVisitorData() {
      console.log('============  setupVisitorData');
      const self = this;
      self.visitorData = [];
      let shitf = 0;
      let thereIsMoreData = true;

      await new Promise((resolve) => {
        (async () => {
          while (thereIsMoreData) {
            console.log('setupVisitorData 1', thereIsMoreData, shitf);
            const retPerson = await self.$globalFindVisitor('', shitf, 250);
            console.log('setupVisitorData 2', retPerson);

            const err = retPerson.error;
            const result = retPerson.data;
            if (err == null && result) {
              try {
                for (let i = 0; i < result.visitor_list.length; i += 1) {
                  const p = result.visitor_list[i];
                  p.status = 1;
                  p.register_image = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACXBIWXMAAAsSAAALEgHS3X78AAAADUlEQVR4nGP4//8/AwAI/AL+p5qgoAAAAABJRU5ErkJggg==';
                }

                self.visitorData = self.visitorData.concat(result.visitor_list);

                if (result.slice_shift + result.visitor_list.length < result.total_length) {
                  thereIsMoreData = true;
                  shitf = result.slice_shift + result.visitor_list.length;
                } else { thereIsMoreData = false; }
              } catch (ex) {
                console.log('setupVisitorData 3', ex);
              }
            } else {
              thereIsMoreData = false;
            }
          }

          resolve();
        })();
      });

      return self.visitorData;
    },

    // get Verify Data
    async setupVerifyData(startTS, endTS, cb) {
      console.log('============  setupVerifyData');
      const self = this;
      self.verifyData = [];
      let shitf = 0;
      let thereIsMoreData = true;

      while (thereIsMoreData) {
        const query = {
          start_time: startTS,
          end_time: endTS,
          slice_length: 2,
          slice_shift: shitf,
          uuid_list: [],
          with_image: false,
        };

        const retResult = await self.$globalGetPersonResult(query);

        const err = retResult.error;
        if (err == null && retResult.data) {
          const { result } = retResult.data;
          if (result.data) {
            if (result.data.length >= 1) {
              result.data.sort((a, b) => a.timestamp - b.timestamp);

              self.lastRecordTimestamp = result.data[result.data.length - 1].timestamp;
              console.log('self.lastRecordTimestamp', self.lastRecordTimestamp);

              // self.normalizationData(result.data);

              self.verifyData = self.verifyData.concat(result.data);
            }
          }

          if (result.slice_shift + result.data.length < result.total_length) {
            thereIsMoreData = true;
            shitf = result.slice_shift + result.data.length;
          } else thereIsMoreData = false;
        } else thereIsMoreData = false;
      }

      // shitf = 0;
      // thereIsMoreData = true;

      // while (thereIsMoreData) {
      //   const query = {
      //     start_time: startTS,
      //     end_time: endTS,
      //     slice_length: 2,
      //     slice_shift: shitf,
      //     uuid_list: [],
      //     with_image: false,
      //   };

      //   const retResult = await self.$globalGetVisitorResult(query);

      //   const err = retResult.error;
      //   if (err == null && retResult.data) {
      //     const { result } = retResult.data;
      //     if (result.data) {
      //       if (result.data.length >= 1) {
      //         result.data.sort((a, b) => a.timestamp - b.timestamp);

      //         self.lastRecordTimestamp = result.data[result.data.length - 1].timestamp;
      //         console.log('self.lastRecordTimestamp', self.lastRecordTimestamp);

      //         // self.normalizationData(result.data);

      //         self.verifyData = self.verifyData.concat(result.data);
      //       }
      //     }

      //     if (result.slice_shift + result.data.length < result.total_length) {
      //       thereIsMoreData = true;
      //       shitf = result.slice_shift + result.data.length;
      //     } else thereIsMoreData = false;
      //   } else thereIsMoreData = false;
      // }

      try {
        if (cb) {
          cb(self.verifyData, self.lastRecordTimestamp);
        }
      } catch (ex) {
        console.log(ex);
      }
    },

    setupColors() {
      const enterDataColors = [];
      for (let i = 0; i < 24; i += 1) {
        if (i > 10) {
          enterDataColors[i] = 'transparent';
        } else {
          enterDataColors[i] = this.chartEnterColor;
        }
      }
      const leaveDataColors = [];
      for (let i = 0; i < 24; i += 1) {
        if (i > 10) {
          leaveDataColors[i] = 'transparent';
        } else {
          leaveDataColors[i] = this.chartLeaveColor;
        }
      }
    },
  },
};
</script>
