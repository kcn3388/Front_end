import React from "react";
import { Link } from "react-router-dom";
import { Alert, Typography } from "antd";

const { Text } = Typography;

export class NotFound extends React.Component {
  render() {
    return (
      <Alert message="404 Not Found" type="warning" description={<Text>The page you request could not be found. Click <Link to='/'>here</Link> to go back to homepage.</Text>}  />
    )
  }
}