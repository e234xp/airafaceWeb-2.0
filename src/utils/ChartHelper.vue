<script>
export default {
  name: 'ChartHelper',

  data() {
    return {
      chartLegendColor: '#FFFFFF',
      chartBackgroundColor: '#2a2b2d',
      chartEnterColor: '#7FB97A',
      chartLeaveColor: '#647E9D',
      presentDataColor: '#647E9D',
      attendancePresentColor: '#8DCDFF',
      attendanceAbsentColor: '#737578',
      attendanceDetailPresentColor: '#FFFFFF',
      attendanceDetailAbsentColor: '#737578',

      doughnutChart: null,

      currentHour: -1,
    };
  },

  methods: {

    setupDashboardChart(ctx, chartLabels, chartDataIn, chartDataOut, chartDataPresent) {
      const self = this;

      self.currentHour = new Date().getHours();

      const yMax = Math.max(...chartDataIn) * 1.25;
      const yMin = Math.min(...chartDataOut) * 1.25;

      const dataIn = chartDataIn.slice();
      dataIn.length = self.currentHour + 1;

      const dataOut = chartDataOut.slice();
      dataOut.length = self.currentHour + 1;

      const dataPersent = chartDataPresent.slice();
      dataPersent.length = self.currentHour + 1;

      if (this.dashBoardChart) {
        this.dashBoardChart.data.datasets[0].data = dataIn;
        this.dashBoardChart.data.datasets[1].data = dataOut;
        this.dashBoardChart.data.datasets[2].data = dataPersent;

        const { annotations } = this.dashBoardChart.options.plugins.annotation;

        if (annotations) {
          annotations.triangle.xValue = self.currentHour;
          annotations.triangle.yValue = yMax + 1;

          annotations.label1.xValue = self.currentHour;
          annotations.label1.yValue = yMax + 1.2;
          annotations.label1.content = (ctx) => `+${dataIn[self.currentHour]}`;

          annotations.label2.xValue = self.currentHour + 0.9;
          annotations.label2.yValue = yMax + 1.2;
          annotations.label2.content = (ctx) => (dataOut[self.currentHour] == 0 ? '-0' : dataOut[self.currentHour]);

          annotations.line1.xMin = self.currentHour;
          annotations.line1.yMin = yMin;
          annotations.line1.xMax = self.currentHour;
          annotations.line1.yMax = yMax + 1;
        }
        this.dashBoardChart.update();
      } else {
        try {
          this.dashBoardChart = new Chart(ctx, {
            data: {
              labels: chartLabels,
              datasets: [
                {
                  type: 'bar',
                  label: self.$t('HourlyNumberOfEntry'),
                  data: dataIn,
                  barPercentage: 0.7,
                  backgroundColor: self.chartEnterColor,
                },
                {
                  type: 'bar',
                  label: self.$t('HourlyNumberOfLeave'),
                  data: dataOut,
                  barPercentage: 0.7,
                  backgroundColor: self.chartLeaveColor,
                },
                {
                  type: 'line',
                  label: self.$t('HourlyNumberOfAdmission'),
                  data: dataPersent,
                  borderWidth: 2,
                  pointBorderColor: 'transparent',
                  borderColor: self.presentDataColor,
                },
              ],
            },

            options: {
              animation: false,
              plugins: {
                legend: {
                  display: true,
                  position: 'left',
                  align: 'center',
                  labels: {
                    color: self.chartLegendColor,
                    font: {
                      size: 20,
                    },
                  },
                },
                annotation: {
                  annotations: {
                    triangle: {
                      type: 'polygon',
                      xValue: self.currentHour,
                      yValue: yMax + 1,
                      sides: 3,
                      radius: 7,
                      rotation: 180,
                      backgroundColor: 'white',
                      borderColor: 'white',
                      order: 1,
                    },
                    label1: {
                      type: 'label',
                      position: 'start',
                      xValue: self.currentHour,
                      yValue: yMax + 1.2,
                      width: 100,
                      backgroundColor: self.chartEnterColor,
                      borderColor: self.chartEnterColor,
                      color: '#ffffff',
                      content: (ctx) => `+${ctx.chart.data.datasets[0].data[self.currentHour]}`,
                      font: {
                        size: 12,
                      },

                    },
                    label2: {
                      type: 'label',
                      position: 'start',
                      xValue: self.currentHour + 0.9,
                      yValue: yMax + 1.2,
                      backgroundColor: self.chartLeaveColor,
                      borderColor: self.chartLeaveColor,
                      color: '#ffffff',
                      content: (ctx) => (ctx.chart.data.datasets[1].data[self.currentHour] == 0 ? '-0' : ctx.chart.data.datasets[1].data[self.currentHour]),
                      font: {
                        size: 12,
                      },
                    },
                    line1: {
                      type: 'line',
                      borderColor: 'white',
                      borderWidth: 1.5,
                      xMin: self.currentHour,
                      yMin,
                      xMax: self.currentHour,
                      yMax: yMax + 1,
                      xScaleID: 'x',
                      borderDash: [2, 2],
                      drawTime: 'afterDatasetsDraw',
                    },
                    xAxis: {
                      type: 'line',
                      borderColor: 'white',
                      borderWidth: 1,
                      scaleID: 'y',
                      value: 0,

                      drawTime: 'afterDatasetsDraw',
                    },
                  },
                },

                tooltip: {
                  enabled: true,
                  mode: 'nearest',
                  intersect: false,
                },
              },
              maintainAspectRatio: false,
              pointHitDetectionRadius: 1,
              scales: {
                x: {
                  beginAtZero: true,
                  stacked: true,
                  grid: {
                    display: false,
                  },
                  border: {
                    color: self.chartBackgroundColor,
                  },
                  ticks: {
                    color: 'white',
                    font: {
                      size: 20,
                      family: "'Noto Sans', sans-serif",
                      weight: 100,
                    },
                  },
                },
                y: {
                  stacked: false,
                  grid: {
                    color: '#FFF',
                    // lineWidth: (context) => (context.tick.value == 0 ? 1 : 0),
                    lineWidth: 0,
                  },
                  ticks: {
                    display: false,
                  },
                  border: {
                    color: '#2a2b2d',
                  },
                },
              },
            },
          });
        } catch (ex) {
          console.log(ex);
        }
      }
    },

    setupAttendanceDoughnutChart(ctx, chartData, isShowGroup) {
      const self = this;

      let colors = [];
      if (isShowGroup) {
        colors = [self.attendancePresentColor, self.attendanceAbsentColor];
      } else {
        colors = [self.attendanceDetailPresentColor, self.attendanceDetailAbsentColor];
      }

      if (self.doughnutChart) {
        self.doughnutChart.data.datasets[0].data = chartData;
        self.doughnutChart.update();
      } else {
        try {
          self.doughnutChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
              datasets: [
                {
                  type: 'doughnut',
                  data: chartData,
                  backgroundColor: colors,
                  hoverOffset: 4,
                  borderColor: 'transparent',
                  borderWidth: 1,
                },
              ],
            },

            options: {
              cutout: '76%',
              plugins: {
                legend: {
                  display: false,
                },
              },
            },
          });
        } catch (ex) {
          console.log(ex);
        }
      }
    },

    setupGuardDashboardChart(ctx, chartLabels, chartDataIn, chartDataOut, zoom = 1) {
      const self = this;

      self.currentHour = new Date().getHours();

      // const yMax = Math.max(...chartDataIn) * 1.25;
      // const yMin = Math.min(...chartDataOut) * 1.25;

      const dataIn = chartDataIn.slice();
      dataIn.length = self.currentHour + 1;

      const dataOut = chartDataOut.slice();
      dataOut.length = self.currentHour + 1;

      const sum = dataIn.map((d, idx) => d + dataOut[idx]);

      const yMax = Math.max(...sum) * 1.1;
      const yMin = 0;

      // const dataPersent = chartDataPresent.slice();
      // dataPersent.length = self.currentHour + 1;

      if (this.dashBoardChart) {
        this.dashBoardChart.data.datasets[0].data = dataIn;
        this.dashBoardChart.data.datasets[1].data = dataOut;

        const { annotations } = this.dashBoardChart.options.plugins.annotation;

        if (annotations) {
          annotations.triangle.xValue = self.currentHour;
          annotations.triangle.yValue = yMax + 1;

          annotations.label1.xValue = self.currentHour;
          annotations.label1.yValue = yMax + 1.2;
          annotations.label1.content = () => `+${dataIn[self.currentHour]}`;

          annotations.label2.xValue = self.currentHour + 0.9;
          annotations.label2.yValue = yMax + 1.2;
          annotations.label2.content = () => (dataOut[self.currentHour] == 0 ? '-0' : `-${dataOut[self.currentHour]}`);

          annotations.line1.xMin = self.currentHour;
          annotations.line1.yMin = yMin;
          annotations.line1.xMax = self.currentHour;
          annotations.line1.yMax = yMax + 1;
        }
        this.dashBoardChart.update();
      } else {
        try {
          this.dashBoardChart = new Chart(ctx, {
            type: 'bar',
            data: {
              labels: chartLabels,
              datasets: [
                {
                  label: self.$t('HourlyNumberOfEntry'),
                  data: dataIn,
                  backgroundColor: self.chartEnterColor,
                },
                {
                  label: self.$t('HourlyNumberOfLeave'),
                  data: dataOut,
                  backgroundColor: self.chartLeaveColor,
                },
              ],
            },
            options: {
              plugins: {
                legend: {
                  display: false,
                },
                annotation: {
                  annotations: {
                    triangle: {
                      type: 'polygon',
                      xValue: self.currentHour,
                      yValue: yMax + 1,
                      sides: 3,
                      radius: 7,
                      rotation: 180,
                      backgroundColor: 'white',
                      borderColor: 'white',
                      order: 1,
                    },
                    label1: {
                      type: 'label',
                      position: 'start',
                      xValue: self.currentHour,
                      yValue: yMax + 1.2,
                      width: 100,
                      backgroundColor: self.chartEnterColor,
                      borderColor: self.chartEnterColor,
                      color: '#ffffff',
                      content: () => `+${dataIn[this.currentHour]}`,
                      font: {
                        size: 12,
                      },
                    },
                    label2: {
                      type: 'label',
                      position: 'start',
                      xValue: self.currentHour + 0.9,
                      yValue: yMax + 1.2,
                      backgroundColor: self.chartLeaveColor,
                      borderColor: self.chartLeaveColor,
                      color: '#ffffff',
                      content: () => (dataOut[this.currentHour] === 0 ? '-0' : `-${dataOut[this.currentHour]}`),
                      font: {
                        size: 12,
                      },
                    },
                    line1: {
                      type: 'line',
                      borderColor: 'white',
                      borderWidth: 1.5,
                      xMin: self.currentHour,
                      yMin,
                      xMax: self.currentHour,
                      yMax: yMax + 1,
                      xScaleID: 'x',
                      borderDash: [2, 2],
                      drawTime: 'afterDatasetsDraw',
                    },
                    xAxis: {
                      type: 'line',
                      borderColor: 'white',
                      borderWidth: 1,
                      scaleID: 'y',
                      value: 0,
                      drawTime: 'afterDatasetsDraw',
                    },
                  },
                },
              },
              maintainAspectRatio: false,
              pointHitDetectionRadius: 1,
              scales: {
                x: {
                  beginAtZero: true,
                  stacked: true,
                  grid: {
                    display: false,
                  },
                  border: {
                    color: self.chartBackgroundColor,
                  },
                  ticks: {
                    color: 'white',
                    font: {
                      size: 20,
                      family: "'Noto Sans', sans-serif",
                      weight: 100,
                    },
                  },
                },
                y: {
                  stacked: true,
                  grid: {
                    color: '#FFF',
                    // lineWidth: (context) => (context.tick.value == 0 ? 1 : 0),
                    lineWidth: 0,
                  },
                  ticks: {
                    display: false,
                  },
                  border: {
                    color: '#2a2b2d',
                  },
                },
              },
            },
            plugins: [{
              id: 'zoomCSS',
              beforeEvent(chart, c) {
                const event = c.event;
                // Take into account CSS zoom on some parent element.
                // Zoom is used, e.g., by Reveal.js.
                // const zoom = window.getComputedStyle(this.dashBoardChart.canvas.parentElement).zoom || 1;
                // const zoom = 0.89;
                if (zoom != 1) {
                  event.x = event.x / zoom;
                  event.y = event.y / zoom;
                }
              },
            }],
          });
        } catch (ex) {
          console.log(ex);
        }
      }
    },
  },
};
</script>

<style>
  /* .chart {
    zoom: calc(1/0.9);
  } */
</style>
