import React, { Component } from "react";
import Chart from "react-apexcharts";
import moment from "moment";

export default class ReportChart extends Component {
  constructor(props) {
    super(props);

    this.state = {
      currentFilter: this.props.currentFilter,
      options: {
        chart: {
          id: "medical_chart",
          toolbar: {
            show: false,
          },
        },
        stroke: {
          curve: "straight",
          width: [4, 2],
          dashArray: [0, 8],
        },
        title: {
          text: this.props.title,
          align: "center",
          style: {
            color: "#999",
          },
        },
        tooltip: {
          custom: this.customTooltip,
          x: {
            formatter: function (val, timestamp) {
              if (val) {
                return moment(val, "DD-MM-YYYY").format("DD-MMM-YYYY");
              }
            },
          },
        },
        xaxis: {
          lines: {
            show: true,
          },
          labels: {
            style: {
              colors: "#999",
            },
            show: true,
            step: 2,
            tickAmount: 5,
            formatter: function (value, timestamp, index) {
              if (value) {
                return moment(value, "DD-MM-YYYY").format("DD");
              }
            },
          },
          categories:
            this.props.categories === undefined ? [] : this.props.categories,
        },
        yaxis: {
          lines: {
            show: true,
          },
          labels: {
            style: {
              colors: "#999",
            },
            formatter: function (val) {
              val = Math.abs(val).toFixed();
              return new Intl.NumberFormat("en-US").format(val);
            },
          },
          dataLabels: {
            enabled: true,
            style: {
              colors:
                this.props.colors === undefined
                  ? ["#00e396", "#ff3154", "#fadd17"]
                  : this.props.colors,
            },
            formatter: function (val) {
              if (val) {
                return moment(val, "DD-MM-YYYY").format("DD-MMM-YYYY");
              }
            },
          },
          title: {
            text:
              this.props.y_axis_tittle === undefined
                ? undefined
                : this.props.y_axis_tittle,
            style: {
              color: "#939394",
            },
          },
        },
        grid: {
          show: true,
          strokeDashArray: 0,
        },
        colors: ["#0038FF"],
      },
    };
    this.customTooltip = this.customTooltip.bind(this);
  }
  componentDidUpdate(prevProps) {
    if (this.props.currentFilter !== prevProps.currentFilter) {
      this.setState({
        currentFilter: this.props.currentFilter,
      });
    }
  }
  customTooltip = ({ series, seriesIndex, dataPointIndex, w }) => {
    const currentMonthValue = w.globals.series[0][dataPointIndex];
    const previousMonthValue = w.globals.series[1][dataPointIndex];

    const percentageChange =
      previousMonthValue !== null
        ? ((currentMonthValue - previousMonthValue) /
            Math.abs(previousMonthValue)) *
          100
        : null;

    return (
      '<div class="custom-tooltip">' +
      '<div style="display: flex; font-size: 11px; justify-content: center;">' +
      '<h6 style="font-size: 13px;">Current Month</h6>' +
      '<span style="margin: 0 5px;">vs</span>' +
      '<h6 style="font-size: 13px;">Previous Month</h6>' +
      "</div>" +
      '<p style="font-size: 13px; text-align: center;">' +
      currentMonthValue +
      " " +
      this.state.currentFilter +
      "</p>" +
      '<p style="color: ' +
      (currentMonthValue < previousMonthValue ? "red" : "green") +
      '; font-size: 13px; text-align: center;">' +
      (currentMonthValue < previousMonthValue ? "↓" : "↑") +
      (percentageChange !== null ? percentageChange.toFixed(0) + "%" : "N/A") +
      "</p>" +
      "</div>"
    );
  };

  render() {
    return (
      <Chart
        options={this.state.options}
        series={this.props.data ? this.props.data : []}
        type="line"
        height={600}
      />
    );
  }
}
