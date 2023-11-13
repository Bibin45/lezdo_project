import React, { useEffect, useState } from "react";
import ReportChart from "../components/ReportChart";
import DatePicker from "react-datetime";
import { MdOutlineArrowDropDown, MdOutlineArrowRight } from "react-icons/md";
import {
  HiOutlineArrowNarrowDown,
  HiOutlineArrowNarrowUp,
} from "react-icons/hi";
import { Form, InputGroup } from "react-bootstrap";
import moment from "moment";
export default function ReportContainer() {
  const [chartRecord, setChartRecords] = useState(null);
  const [filters, setFilters] = useState([
    { dateSelection: false, label: "This Month" },
    { primaryFilter: false, label: "All Clients" },
    { secondaryFilter: false, label: "All Services" },
  ]);
  const [primaryFilter, setPrimaryFilter] = useState("clients");
  const [data, setData] = useState({});
  const [originalChartData, setoriginalChartData] = useState([]);
  const [activePrimaryFilter, setActivePrimaryFilter] = useState("");
  const [navFilter, setNavFilter] = useState("cases");
  const [filteredPath, setFilteredPath] = useState(null);
  const [serviceRecord, setServiceRecord] = useState({});
  const [activeSecondaryFilter, setActiveSecondaryFilter] = useState("");
  const [teamPath, setTeamPath] = useState("");
  const [tabFilters, setTabFilters] = useState([
    "Cases",
    "Pages",
    "Billed Hours",
    "Billed Amount",
    "Quality Score",
  ]);
  const [activeEmployee, setActiveEmployee] = useState("");
  const [activeEfficient, setActiveEfficient] = useState("");
  const [openCalendar, setOpenCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [dateSelection, setDateSelection] = useState(null);
  const [currentService, setCurrentService] = useState(null);
  const [dateValues, setDateValues] = useState([
    "All Time",
    "Today",
    "This Month",
    "Last Month",
    "This Year",
    "Last year",
    "Custom",
  ]);
  const [efficiency, setEfficiency] = useState({
    "Utilization Efficiency": [
      "Actual Hours",
      "After QC",
      "Production Efficiency",
    ],
    "Ouality Efficiency": ["Target", "Acheived", "Quality Efficiency"],
    "Auditor Efficiency": [
      "Allocated Hours",
      "Audited Hours",
      "Auditor Efficiency",
    ],
    "Billing Efficiency": [
      "Actual Hours",
      "Billed Hours",
      "Billing Efficiency",
    ],
  });
  const [revenue, setRevenue] = useState([
    "Gross Revenue",
    "Commission",
    "Loyalty",
    "Referral",
    "Net Revenue",
  ]);
  const [primaryEfficiency, setPrimaryEfficiency] = useState(
    "Utilization Efficiency"
  );
  const [activeEfficiency, setActiveEfficiency] = useState("");
  useEffect(() => {
    chartData();
  }, []);
  useEffect(() => {
    if (activePrimaryFilter === "efficiency") {
      if (teamPath) tabFilter(efficiency[teamPath][0]);
    } else if (activePrimaryFilter === "revenue") {
      tabFilter(revenue[0]);
    } else {
      tabFilter("cases");
    }
  }, [teamPath]);
  useEffect(() => {
    if (activePrimaryFilter) setPrimaryFilter(activePrimaryFilter);
    if (activeEfficiency) setPrimaryEfficiency(activeEfficiency);
    filterChart(navFilter);
  }, [
    chartRecord,
    primaryFilter,
    navFilter,
    filteredPath,
    dateSelection,
    selectedDate,
  ]);
  const chartData = async () => {
    try {
      const response = await fetch("/config/test_response.json");
      const jsonData = await response.json();
      setChartRecords(jsonData.total_chart_record);
      setServiceRecord(jsonData.service_record);
    } catch (error) {
      console.error("error", error);
    }
  };

  const HandleMainFilter = (key, currentFilter) => {
    setFilters((prevFilters) => {
      const newFilters = prevFilters.map((filter) => {
        const keys = Object.keys(filter);
        return {
          ...filter,
          [keys[0]]: filter.label === key ? true : false,
        };
      });
      return newFilters;
    });
  };
  const convertToLowerCaseWithUnderscores = (inputString) => {
    const resultString = inputString.toLowerCase().replace(/ /g, "_");
    return resultString;
  };
  const filterChart = (activeTab, diviser = null, label = null) => {
    try {
      activeTab = convertToLowerCaseWithUnderscores(activeTab);
      setData({});
      setoriginalChartData([]);

      if (chartRecord) {
        for (const parentKey in chartRecord) {
          let resultData = {};

          for (const key in chartRecord[parentKey][primaryFilter]) {
            if (!filteredPath) {
              for (
                let i = 0;
                i < chartRecord[parentKey][primaryFilter][key].length;
                i++
              ) {
                const currentItem =
                  chartRecord[parentKey][primaryFilter][key][i];
                const dateValue = currentItem.date;

                Object.keys(currentItem).forEach((currentKey) => {
                  const currentValue = currentItem[currentKey];

                  if (typeof currentValue === "number") {
                    if (!resultData[dateValue]) {
                      resultData[dateValue] = {
                        [currentKey]: currentValue,
                      };
                    } else {
                      resultData[dateValue][currentKey] =
                        (resultData[dateValue][currentKey] || 0) + currentValue;
                    }
                  }
                });
              }
            } else {
              let currentItem;

              if (
                (activePrimaryFilter === "efficiency" ||
                  (activePrimaryFilter === "revenue" &&
                    teamPath === "Employees")) &&
                chartRecord[parentKey][activePrimaryFilter][teamPath] &&
                chartRecord[parentKey][activePrimaryFilter][teamPath][
                  activeEmployee
                ] &&
                chartRecord[parentKey][activePrimaryFilter][teamPath][
                  activeEmployee
                ][filteredPath]
              ) {
                currentItem =
                  chartRecord[parentKey][activePrimaryFilter][teamPath][
                    activeEmployee
                  ][filteredPath];
              } else if (
                (activePrimaryFilter === "employees" ||
                  activePrimaryFilter === "revenue") &&
                teamPath
              ) {
                currentItem =
                  chartRecord[parentKey][activePrimaryFilter][teamPath][
                    filteredPath
                  ];
              } else {
                currentItem =
                  chartRecord[parentKey][activePrimaryFilter][filteredPath];
              }
              if (!currentItem) return;
              resultData = currentItem;
              updateFilters(filteredPath, "primaryFilter");
            }
          }
          let formattedData = Object.entries(resultData).map(
            ([date, values]) => ({
              date,
              ...values,
            })
          );
          const dateFormat = "DD-MM-YYYY";
          if (dateSelection === "This Month") {
            const thisMonthStart = moment().startOf("month");
            const thisMonthEnd = moment().endOf("month");

            formattedData = formattedData.filter((entry) => {
              const thisDate = moment(entry.date, dateFormat);
              return thisDate.isBetween(
                thisMonthStart,
                thisMonthEnd,
                null,
                "[]"
              );
            });
          } else if (dateSelection === "Last Month") {
            const lastMonthStart = moment()
              .subtract(1, "months")
              .startOf("month");
            const lastMonthEnd = moment().subtract(1, "months").endOf("month");

            formattedData = formattedData.filter((entry) => {
              const entryDate = moment(entry.date, dateFormat);
              return entryDate.isBetween(
                lastMonthStart,
                lastMonthEnd,
                null,
                "[]"
              );
            });
          } else if (dateSelection === "Custom" && selectedDate) {
            formattedData = formattedData.filter(
              (entry) =>
                entry.date === moment(selectedDate).format("DD-MM-YYYY")
            );
            if (formattedData.length == 0) {
              alert(
                `No Data for selected date ${moment(selectedDate).format(
                  "DD-MMM-YYYY"
                )}`
              );
              setoriginalChartData([]);
              return;
            }
          } else if (
            dateSelection === "Today" ||
            dateSelection === "Last year"
          ) {
            alert("No Data Found");
            setoriginalChartData([]);
            return;
          }

          if (diviser) {
            formattedData = filterService(diviser, formattedData, label);
          }

          setData((prevData) => ({
            ...prevData,
            [parentKey]: formattedData,
          }));

          setoriginalChartData((prevChartData) => [
            ...prevChartData,
            {
              data: formatChartData(
                "date",
                activeTab,
                formattedData,
                parentKey
              ),
              name: parentKey,
            },
          ]);
        }
      }
    } catch (error) {
      console.error("Error in filterChart:", error);
    }
  };

  function handleDateChange(e) {
    setSelectedDate(e);
    setOpenCalendar(false);
    updateFilters(moment(e).format("DD-MMM-YYYY"), "dateSelection");
  }

  function formatChartData(xKey, yKey, formattedData) {
    const chartData = formattedData.map((item) => ({
      x: item[xKey],
      y: item[yKey],
    }));

    return chartData;
  }
  const tabFilter = (tab) => {
    setNavFilter(tab);
  };
  function getKeyCount(key, dataArray) {
    key = convertToLowerCaseWithUnderscores(key);
    let count = 0;
    if (dataArray && Object.keys(dataArray).length > 0) {
      Object.keys(dataArray).forEach((item) => {
        if (item === "Preceeding Record" && dateSelection !== "Last Month")
          return;
        for (let i = 0; i < dataArray[item].length; i++) {
          if (
            key in dataArray[item][i] &&
            typeof dataArray[item][i][key] === "number"
          ) {
            count += dataArray[item][i][key];
          }
        }
      });
    }

    return Math.floor(count).toFixed();
  }
  function getKeyDifference(key, dataArray) {
    key = convertToLowerCaseWithUnderscores(key);
    let counts = {};

    if (dataArray && Object.keys(dataArray).length > 0) {
      Object.keys(dataArray).forEach((item) => {
        counts[item] = 0;
        for (let i = 0; i < dataArray[item].length; i++) {
          if (
            key in dataArray[item][i] &&
            typeof dataArray[item][i][key] === "number"
          ) {
            counts[item] += dataArray[item][i][key];
          }
        }
      });
    }
    return (
      <div>
        <p>
          {counts["Preceeding Record"] &&
            counts["Current Record"] &&
            counts["Preceeding Record"] !== 0 && (
              <p
                className={`${
                  counts["Current Record"] < counts["Preceeding Record"]
                    ? "text_red "
                    : "text-success "
                } d-flex justify-content-center align-items-center`}
              >
                {(
                  ((counts["Current Record"] - counts["Preceeding Record"]) /
                    counts["Preceeding Record"]) *
                  100
                ).toFixed(0)}
                %
                {counts["Current Record"] < counts["Preceeding Record"] ? (
                  <HiOutlineArrowNarrowDown color="red" />
                ) : (
                  <HiOutlineArrowNarrowUp color="green" />
                )}
              </p>
            )}
        </p>
      </div>
    );
  }
  function updateFilters(label, key = "secondaryFilter") {
    const filterIndex = filters.findIndex((filter) =>
      filter.hasOwnProperty(key)
    );
    const updatedFilters = [...filters];
    setFilters(updatedFilters);
    updatedFilters[filterIndex].label = label;
  }
  function filterService(diviser, data, label, key = "secondaryFilter") {
    updateFilters(label, key);
    for (let i = 0; i < data.length; i++) {
      for (const [prop, value] of Object.entries(data[i])) {
        if (typeof value === "number") {
          data[i][prop] = value / diviser;
        }
      }
    }
    return data;
  }
  function capitalizeString(inputString) {
    if (!inputString) return;
    const words = inputString.split("_");
    const capitalizedWords = words.map(
      (word) => word.charAt(0).toUpperCase() + word.slice(1)
    );
    const resultString = capitalizedWords.join(" ");

    return resultString;
  }
  const ResetState = () => {
    setTeamPath("");
    setActiveEmployee("");
    setActiveEmployee("");
    setoriginalChartData([]);
  };
  return (
    <div className="light_grey_bg">
      <div className="p-5 ">
        <div className="width_adjust m-auto">
          <h5 className="bold mx-2 my-4">Analytics</h5>
          <div className="black_shadow p-3">
            <div className="d-flex justify-content-around align-items-center scroll_auto">
              {activePrimaryFilter === "efficiency" ? (
                <>
                  {efficiency[primaryEfficiency].map((tab, i) => {
                    return (
                      <div
                        className="d-grid"
                        key={i}
                        onClick={() => tabFilter(tab)}
                      >
                        {tab===capitalizeString(navFilter) && <div className="blue_border"></div>}
                        <h6 className="bold text-center grey_font">{tab}</h6>
                        <p className="bold text-center grey_font m-0">
                          {getKeyCount(tab, data)}
                        </p>
                        <p className="bold text-center ">
                          {getKeyDifference(tab, data)}
                        </p>
                      </div>
                    );
                  })}
                </>
              ) : activePrimaryFilter === "revenue" ? (
                <>
                  {revenue.map((tab, i) => {
                    return (
                      <div
                        className="d-grid"
                        key={i}
                        onClick={() => tabFilter(tab)}
                      >
                       {tab===capitalizeString(navFilter) && <div className="blue_border"></div>}
                        <h6 className="bold text-center grey_font">{tab}</h6>
                        <p className="bold text-center grey_font m-0">
                          {getKeyCount(tab, data)}
                        </p>
                        <p className="bold text-center ">
                          {getKeyDifference(tab, data)}
                        </p>
                      </div>
                    );
                  })}
                </>
              ) : (
                tabFilters.map((tab, i) => {
                  return (
                    <div
                      className="d-grid"
                      key={i}
                      onClick={() => tabFilter(tab)}
                    >
                     {tab===capitalizeString(navFilter) && <div className="blue_border"></div>}
                      <h6 className="bold text-center grey_font">{tab}</h6>
                      <p className="bold text-center grey_font m-0">
                        {getKeyCount(tab, data)}
                      </p>
                      <p className="bold text-center ">
                        {getKeyDifference(tab, data)}
                      </p>
                    </div>
                  );
                })
              )}
            </div>
            <div class="hide_date px-3">
              <ReportChart data={originalChartData} currentFilter={capitalizeString(navFilter)} />
              {chartRecord &&
                filters.map((each, i) => {
                  return (
                    <>
                      {(each.primaryFilter ||
                        each.secondaryFilter ||
                        each.dateSelection) && (
                        <>
                          {!each.dateSelection && (
                            <>
                              <InputGroup className="mb-3 search_position">
                                <InputGroup.Text id="basic-addon1">
                                  @
                                </InputGroup.Text>
                                <Form.Control
                                  placeholder="Search here..."
                                  aria-label="Search here..."
                                  aria-describedby="basic-addon1"
                                  className="border"
                                />
                              </InputGroup>
                              <div
                                className="floating_div"
                                onMouseLeave={() => HandleMainFilter("close")}
                              >
                                <div></div>
                                {each.primaryFilter ? (
                                  <>
                                    {Object.keys(chartRecord).flatMap(
                                      (item) => {
                                        if (item === "Preceeding Record")
                                          return [];
                                        return Object.keys(
                                          chartRecord[item]
                                        ).map((nestedItem, index) => (
                                          <div>
                                            <div
                                              key={index}
                                              onClick={() => {
                                                setActivePrimaryFilter(
                                                  nestedItem
                                                );
                                                ResetState();
                                              }}
                                              className="d-flex   align-items-center"
                                            >
                                              <div
                                                className={`${
                                                  activePrimaryFilter ===
                                                  nestedItem
                                                    ? " fixed_blue "
                                                    : ""
                                                } d-flex   fixed_width justify-content-between hover_blue`}
                                              >
                                                <h6 className="my-0  label_text btn text-left ">
                                                  {capitalizeString(nestedItem)}
                                                </h6>

                                                <MdOutlineArrowRight
                                                  size={30}
                                                  className="hover_blue"
                                                  color="grey"
                                                />
                                              </div>
                                            </div>
                                          </div>
                                        ));
                                      }
                                    )}
                                    {activePrimaryFilter && (
                                      <div className="inner_position border py-4">
                                        {Object.keys(
                                          chartRecord["Current Record"][
                                            activePrimaryFilter
                                          ]
                                        ).map((innernest, inneridx) => (
                                          <>
                                            <div
                                              className={`${
                                                teamPath === innernest
                                                  ? " fixed_blue "
                                                  : ""
                                              } hover_blue`}
                                              onClick={() => {
                                                if (
                                                  Array.isArray(
                                                    chartRecord[
                                                      "Current Record"
                                                    ][activePrimaryFilter][
                                                      innernest
                                                    ]
                                                  )
                                                ) {
                                                  setFilteredPath(innernest);
                                                } else {
                                                  setTeamPath(innernest);
                                                }

                                                setActiveEmployee();
                                                if (
                                                  activePrimaryFilter ===
                                                  "efficiency"
                                                ) {
                                                  setActiveEfficiency(
                                                    innernest
                                                  );
                                                }
                                              }}
                                            >
                                              <h6 className="ml my-2 light_grey btn text-left label_text">
                                                {innernest}
                                              </h6>
                                            </div>
                                          </>
                                        ))}
                                        {teamPath && (
                                          <div className="inner_team_position py-4">
                                            {typeof (
                                              chartRecord["Current Record"][
                                                activePrimaryFilter
                                              ][teamPath] === "object"
                                            ) &&
                                              !Array.isArray(
                                                chartRecord["Current Record"][
                                                  activePrimaryFilter
                                                ][teamPath]
                                              ) &&
                                              Object.keys(
                                                chartRecord["Current Record"][
                                                  activePrimaryFilter
                                                ][teamPath]
                                              ).map((team_member, t) => (
                                                <div
                                                  className={`${
                                                    activeEmployee ===
                                                    team_member
                                                      ? " fixed_blue "
                                                      : ""
                                                  } hover_blue`}
                                                  onClick={() => {
                                                    if (
                                                      Array.isArray(
                                                        chartRecord[
                                                          "Current Record"
                                                        ][activePrimaryFilter][
                                                          teamPath
                                                        ][team_member]
                                                      )
                                                    ) {
                                                      setFilteredPath(
                                                        team_member
                                                      );
                                                    } else {
                                                      setActiveEmployee(
                                                        team_member
                                                      );
                                                    }
                                                  }}
                                                >
                                                  <h6 className="ml my-2 light_grey btn text-left label_text">
                                                    {team_member}
                                                  </h6>
                                                </div>
                                              ))}
                                          </div>
                                        )}

                                        {activeEmployee && (
                                          <div className="inner_efficiency_position py-4">
                                            {typeof (
                                              chartRecord["Current Record"][
                                                activePrimaryFilter
                                              ][teamPath][activeEmployee] ===
                                              "object"
                                            ) &&
                                              !Array.isArray(
                                                chartRecord["Current Record"][
                                                  activePrimaryFilter
                                                ][teamPath][activeEmployee]
                                              ) &&
                                              Object.keys(
                                                chartRecord["Current Record"][
                                                  activePrimaryFilter
                                                ][teamPath][activeEmployee]
                                              ).map((efficiency_member, t) => (
                                                <div
                                                  className={`${
                                                    activeEfficient ===
                                                    efficiency_member
                                                      ? " fixed_blue "
                                                      : ""
                                                  } hover_blue`}
                                                  onClick={() => {
                                                    if (
                                                      Array.isArray(
                                                        chartRecord[
                                                          "Current Record"
                                                        ][activePrimaryFilter][
                                                          teamPath
                                                        ][activeEmployee][
                                                          efficiency_member
                                                        ]
                                                      )
                                                    ) {
                                                      setFilteredPath(
                                                        efficiency_member
                                                      );
                                                      setActiveEfficient(
                                                        efficiency_member
                                                      );
                                                    }
                                                  }}
                                                >
                                                  <h6 className="ml my-2 light_grey btn text-left label_text">
                                                    {efficiency_member}
                                                  </h6>
                                                </div>
                                              ))}
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </>
                                ) : each.secondaryFilter ? (
                                  <>
                                    {Object.keys(serviceRecord).map(
                                      (serviceItem, index) => (
                                        <div>
                                          <div
                                            key={index}
                                            onClick={() =>
                                              setActiveSecondaryFilter(
                                                serviceItem
                                              )
                                            }
                                            className="d-flex   align-items-center"
                                          >
                                            <div
                                              className={`${
                                                activeSecondaryFilter ===
                                                serviceItem
                                                  ? " fixed_blue "
                                                  : ""
                                              } d-flex   fixed_width justify-content-between hover_blue`}
                                            >
                                              <h6 className="my-0  label_text btn text-left ">
                                                {capitalizeString(serviceItem)}
                                              </h6>

                                              <MdOutlineArrowRight
                                                size={30}
                                                className="hover_blue"
                                                color="grey"
                                              />
                                            </div>
                                          </div>
                                          {activeSecondaryFilter && (
                                            <div
                                              className="inner_position border py-4"
                                              style={{ width: "40%" }}
                                            >
                                              {Object.keys(
                                                serviceRecord[
                                                  activeSecondaryFilter
                                                ]
                                              ).map((innernest, inneridx) => (
                                                <div
                                                  className={`"${
                                                    currentService === innernest
                                                      ? " fixed_blue "
                                                      : ""
                                                  } hover_blue`}
                                                  onClick={() => {
                                                    filterChart(
                                                      navFilter,
                                                      serviceRecord[
                                                        activeSecondaryFilter
                                                      ][innernest],
                                                      innernest
                                                    );
                                                    setCurrentService(
                                                      innernest
                                                    );
                                                  }}
                                                >
                                                  <h6 className="ml my-2 light_grey btn text-left label_text">
                                                    {innernest}
                                                  </h6>
                                                </div>
                                              ))}
                                            </div>
                                          )}
                                        </div>
                                      )
                                    )}
                                  </>
                                ) : (
                                  <></>
                                )}
                              </div>
                            </>
                          )}
                          {each.dateSelection && (
                            <div
                              className={`dateselection_div ${
                                openCalendar
                                  ? "d-flex justify-content-center"
                                  : ""
                              }`}
                              onMouseLeave={() => HandleMainFilter("close")}
                            >
                              {dateValues.map((date, d) => {
                                return (
                                  <>
                                    {!openCalendar && (
                                      <div>
                                        <h6
                                          key={d}
                                          className="mx-3 pointer"
                                          onClick={() => {
                                            date === "Custom" &&
                                              setOpenCalendar(true);
                                            updateFilters(
                                              date,
                                              "dateSelection"
                                            );
                                            setDateSelection(date);
                                          }}
                                        >
                                          {date}
                                        </h6>
                                      </div>
                                    )}
                                  </>
                                );
                              })}
                              {openCalendar && (
                                <DatePicker
                                  selected={selectedDate}
                                  closeOnSelect={true}
                                  onChange={handleDateChange}
                                  className="pointer text-center"
                                  inputProps={{ readOnly: true }}
                                  timeFormat={false}
                                />
                              )}
                            </div>
                          )}
                        </>
                      )}
                    </>
                  );
                })}
            </div>

            <div className="d-flex px-3">
              {filters.map((item, idx) => (
                <div
                  className="d-flex mx-2 align-items-center"
                  key={idx}
                  onMouseEnter={() => HandleMainFilter(item.label)}
                >
                  <p
                    className={`m-0 ${
                      idx === 1 ? "blue_text" : idx === 2 ? "text-success" : ""
                    }`}
                  >
                    {item.label}
                  </p>
                  <MdOutlineArrowDropDown
                    size={30}
                    className={` ${
                      idx === 1 ? "blue_text" : idx === 2 ? "text-success" : ""
                    }`}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
