<script>
  export default {
    name: "ChartHelper",

    data() {
      return {
        chartLegendColor: "#FFFFFF",
        chartBackgroundColor: "#2a2b2d",
        chartEnterColor: "#7FB97A",
        chartLeaveColor: "#647E9D",
        presentDataColor: "#647E9D",
        attendancePresentColor: "#8DCDFF",
        attendanceAbsentColor: "#737578",
        attendanceDetailPresentColor: "#FFFFFF",
        attendanceDetailAbsentColor: "#737578",

        dashBoardChart: null,
        doughnutChart: null,

        currentHour: -1,
      };
    },

    methods: {

      setupDashboardChart(ctx, chartLabels, chartDataIn, chartDataOut, chartDataPresent) {
        const self = this;

        self.currentHour = new Date().getHours();

        let yMax = Math.max(...chartDataIn) * 1.25;
        let yMin = Math.min(...chartDataOut) * 1.25;

        let dataIn = chartDataIn.slice();
        dataIn.length = self.currentHour + 1;

        let dataOut = chartDataOut.slice();
        dataOut.length = self.currentHour + 1;

        let dataPersent = chartDataPresent.slice();
        dataPersent.length = self.currentHour + 1;

        if (self.dashBoardChart) {
          self.dashBoardChart.data.datasets[0].data = dataIn;
          self.dashBoardChart.data.datasets[1].data = dataOut;
          self.dashBoardChart.data.datasets[2].data = dataPersent;

          const annotations = self.dashBoardChart.options.plugins.annotation.annotations;

          if (annotations) {
            annotations.triangle.xValue = self.currentHour;
            annotations.triangle.yValue = yMax + 1;

            annotations.label1.xValue = self.currentHour;
            annotations.label1.yValue = yMax + 1.2;
            annotations.label1.content = (ctx) => "+" + dataIn[self.currentHour];

            annotations.label2.xValue = self.currentHour + 0.9;
            annotations.label2.yValue = yMax + 1.2;
            annotations.label2.content = (ctx) => dataOut[self.currentHour] == 0 ? "-0" : dataOut[self.currentHour];

            annotations.line1.xMin = self.currentHour;
            annotations.line1.yMin = yMin;
            annotations.line1.xMax = self.currentHour;
            annotations.line1.yMax = yMax + 1;
          }
          self.dashBoardChart.update();
        }
        else {
          try {
            self.dashBoardChart = new Chart(ctx, {
              data: {
                labels: chartLabels,
                datasets: [
                  {
                    type: "bar",
                    label: self.$t("HourlyNumberOfEntry"),
                    data: dataIn,
                    barPercentage: 0.7,
                    backgroundColor: self.chartEnterColor
                  },
                  {
                    type: "bar",
                    label: self.$t("HourlyNumberOfLeave"),
                    data: dataOut,
                    barPercentage: 0.7,
                    backgroundColor: self.chartLeaveColor
                  },
                  {
                    type: "line",
                    label: self.$t("HourlyNumberOfAdmission"),
                    data: dataPersent,
                    borderWidth: 2,
                    pointBorderColor: "transparent",
                    borderColor: self.presentDataColor
                  },
                ],
              },

              options: {
                plugins: {
                  legend: {
                    display: true,
                    position: "left",
                    align: "center",
                    labels: {
                      color: self.chartLegendColor,
                      font: {
                        size: 20
                      }
                    }
                  },
                  annotation: {
                    annotations: {
                      triangle: {
                        type: "polygon",
                        xValue: self.currentHour,
                        yValue: yMax + 1,
                        sides: 3,
                        radius: 7,
                        rotation: 180,
                        backgroundColor: "white",
                        borderColor: "white",
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
                        color: "#ffffff",
                        content: (ctx) => "+" + ctx.chart.data.datasets[0].data[self.currentHour],
                        font: {
                          size: 12
                        }

                      },
                      label2: {
                        type: 'label',
                        position: 'start',
                        xValue: self.currentHour + 0.9,
                        yValue: yMax + 1.2,
                        backgroundColor: self.chartLeaveColor,
                        borderColor: self.chartLeaveColor,
                        color: "#ffffff",
                        content: (ctx) => ctx.chart.data.datasets[1].data[self.currentHour] == 0 ? "-0" : ctx.chart.data.datasets[1].data[self.currentHour],
                        font: {
                          size: 12
                        }
                      },
                      line1: {
                        type: "line",
                        borderColor: "white",
                        borderWidth: 1.5,
                        xMin: self.currentHour,
                        yMin: yMin,
                        xMax: self.currentHour,
                        yMax: yMax + 1,
                        xScaleID: "x",
                        borderDash: [2, 2],
                        drawTime: "afterDatasetsDraw",
                      },
                      xAxis: {
                        type: "line",
                        borderColor: "white",
                        borderWidth: 1,
                        scaleID: "y",
                        value: 0,

                        drawTime: "afterDatasetsDraw",
                      },
                    },
                  },

                  tooltip: {
                    enabled: true,
                    mode: 'nearest',
                    intersect: false
                  }
                },
                maintainAspectRatio: false,
                pointHitDetectionRadius : 1,
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
                      color: "white",
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
                      color: "#FFF",
                      // lineWidth: (context) => (context.tick.value == 0 ? 1 : 0),
                      lineWidth: 0,
                    },
                    ticks: {
                      display: false,
                    },
                    border: {
                      color: "#2a2b2d",
                    },
                  }
                },
              },
            });
          }
          catch (ex) {
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
        }
        else {
          try {
            self.doughnutChart = new Chart(ctx, {
              type: "doughnut",
              data: {
                datasets: [
                  {
                    type: "doughnut",
                    data: chartData,
                    backgroundColor: colors,
                    hoverOffset: 4,
                    borderColor: "transparent",
                    borderWidth: 1,
                  },
                ],
              },

              options: {
                cutout: "76%",
                plugins: {
                  legend: {
                    display: false,
                  },
                },
              },
            });
          }
          catch (ex) {
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