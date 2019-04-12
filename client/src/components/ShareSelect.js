import React from "react";
import { connect } from "react-redux";
import Select from "react-select";

const ShareSelect = ({ onChange, users }) => {
  return (
    <Select
      id={"ShareSelect"}
      isMulti={true}
      placeholder={"Share with..."}
      onChange={options => onChange(options.map(o => o.value))}
      options={users.map(user => ({ label: user, value: user }))}
    />
  );
};

const mapStateToProps = state => ({ users: state.users });

export default connect(mapStateToProps)(ShareSelect);
