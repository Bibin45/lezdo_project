import React, { Component } from "react";
import { RiArrowDownSLine, RiArrowUpSLine } from "react-icons/ri";
import { Form } from "react-bootstrap";
export default class RecordsAccordian extends Component {
  state = {
    allMedicalLabels: {},
    disabled_labels: {},
    activeAccordian: "Medical Record Review Services",
  };

  componentDidMount() {
    this.loadData();
  }
  loadData = async () => {
    try {
      const response = await fetch("/config/test_response.json");
      const jsonData = await response.json();
      this.setState({
        allMedicalLabels: jsonData.medical_record,
        copy_records: JSON.parse(JSON.stringify(jsonData.medical_record)),
      });
    } catch (error) {
      console.error("error", error);
    }
  };

  filterLabels = async (checked, currentKey, value, index) => {
    console.log("first", checked, "|", currentKey, "|", value);
    this.clearLabels(currentKey, value, checked);
    if (!checked && currentKey === "Medical Record Review Services") return;
    const updatedAllMedicalLabels = { ...this.state.allMedicalLabels };
    for (const key in updatedAllMedicalLabels) {
      console.log("key", key);
      if (currentKey === "Medical Record Review Services") {
        for (let i = 0; i < this.state.allMedicalLabels[key].length; i++) {
          const updatedAllMedicalLabels = { ...this.state.allMedicalLabels };

          if (
            this.state.allMedicalLabels[key][i].disable_id.includes(value.p_id)
          ) {
            updatedAllMedicalLabels[key][i].disabled = true;
          } else {
            updatedAllMedicalLabels[key][i].disabled = false;
          }
          if (
            this.state.allMedicalLabels[key][i].checked_id.includes(value.p_id)
          ) {
            updatedAllMedicalLabels[key][i].checked = true;
          } else {
            updatedAllMedicalLabels[key][i].checked = false;
          }
          updatedAllMedicalLabels[key][i].temp_checked = false;
          this.setState({ allMedicalLabels: updatedAllMedicalLabels });
        }
      } else {
        if (updatedAllMedicalLabels[currentKey][index].temp_checked === true) {
          updatedAllMedicalLabels[currentKey][index].temp_checked = false;
        } else {
          updatedAllMedicalLabels[currentKey][index].temp_checked = true;
        }
        this.setState({ allMedicalLabels: updatedAllMedicalLabels });
      }
    }
  };
  clearLabels = (Key, value, checked) => {
    if (Key === "Medical Record Review Services") {
      this.setState({
        allMedicalLabels: {},
        active_label: checked ? value.label : "",
      });
      this.setState({
        allMedicalLabels: JSON.parse(JSON.stringify(this.state.copy_records)),
      });
    }
  };
  activeAccordian = (activeKey) => {
    if (activeKey === this.state.activeAccordian) {
      this.setState({ activeAccordian: null });
    } else {
      this.setState({ activeAccordian: activeKey });
    }
  };
  disable_accordian_array = ["Sorting & Indexing"];
  render() {
    return (
      <div className="p-3 d-grid">
        <div className="d-flex justify-content-between align-items-center">
          <img src="/images/file_logo.png" alt="logo" />
          <p className="label_text bold">
            Already have an account? <span className="blue_text">sign in</span>
          </p>
        </div>
<div className="d-flex justify-content-center">
<div className="blue_shadow margin_box">
          <div className="w-75 m-auto">
            <h3 className="text-center py-4 bold header_text">
              <img src="/images/select.png" alt="logo"/>
              Kindly select the required services
            </h3>
            {Object.keys(this.state.allMedicalLabels).map((key, index) => {
              return (
                <>
                  <div
                    className={`accordian_grey_bg d-flex justify-content-between align-items-center px-3 py-3 ${
                      key !== "Medical Record Review Services" &&
                      this.disable_accordian_array.includes(
                        this.state.active_label
                      )
                        ? " low_opacity "
                        : ""
                    }`}
                    onClick={() => this.activeAccordian(key)}
                  >
                    <h4 className="m-0 bold accordian_header">{key}</h4>

                    {key === this.state.activeAccordian ? (
                      <RiArrowUpSLine />
                    ) : (
                      <RiArrowDownSLine />
                    )}
                  </div>
                  <div className="row px-3">
                    {this.state.allMedicalLabels[key].map((item, idx) => {
                      return (
                        <>
                          {key === this.state.activeAccordian && (
                            <div
                              className={`${
                                item.disabled ? " low_opacity " : ""
                              }custom-checkbox col-md-6 my-2`}
                            >
                              <Form.Check
                                type="checkbox"
                                id={item.label}
                                className={`${
                                  item.checked || item.temp_checked
                                    ? ""
                                    : "check_bg"
                                }`}
                                onClick={(e) =>
                                  this.filterLabels(
                                    e.target.checked,
                                    key,
                                    item,
                                    idx
                                  )
                                }
                                defaultChecked={false}
                                checked={
                                  item.checked
                                    ? item.checked
                                    : item.temp_checked
                                    ? item.temp_checked
                                    : false
                                }
                              />
                              <label
                                className="label_text d-flex align-items-center h-100 mx-2"
                                htmlFor={item.label}
                              >
                                {item.label}
                                {(item.free && item.checked)?<span className="mx-1 red_text bold">
                                  Free
                                </span>:null}
                              </label>
                            </div>
                          )}
                        </>
                      );
                    })}
                  </div>
                </>
              );
            })}
            <div className="d-flex align-items-center">
              <input className="label_text" type="checkbox" />
              <label className="label_text m-2 bold">
                By clicking this, I hereby agree to the{" "}
                <span className="blue_text">Terms & Conditions</span>
              </label>
            </div>
          </div>
          <div className="d-flex justify-content-center">
            <button className="btn blue_bg bold my-2">Confirm</button>
          </div>
        </div>
</div>
        
        <div className="align-self-end">
          <img src="/images/sms_logo.png" alt="logo" />
        </div>
      </div>
    );
  }
}
