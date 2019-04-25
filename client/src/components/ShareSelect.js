import React from "react";
import Select from "react-select";
import { usersService } from "../services";

class ShareSelect extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      users: []
    };

    this.handleInputChange = this.handleInputChange.bind(this);
  }

  render() {
    return (
      <Select
        isMulti={true}
        placeholder={"Share with..."}
        onChange={options => this.props.onChange(options.map(o => o.value))}
        options={this.state.users.map(user => ({ label: user, value: user }))}
        onInputChange={this.handleInputChange}
      />
    );
  }

  handleInputChange(search) {
    (async () => {
      const response = await usersService.getUsers(search);
      this.setState({ users: response.users == null ? [] : response.users });
    })();
    return search;
  }
}

export default ShareSelect;
