import React from "react";
import { Form, Icon, Input, Button, Checkbox, Card, message } from 'antd';
import { Link, Redirect } from "react-router-dom";
import axios from 'axios';
import { UserInfo } from './Functions'

class LoginForm extends React.Component {
  state = {
    redirect: null,
    username: '',
    remember: false,
    loading: false
  };

  componentDidMount() {
    if (window.localStorage.getItem("username")) {
      this.setState({
        username: window.localStorage.getItem("username"),
        remember: true
      });
    }
  }

  handleSubmit = e => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        this.setState({
          loading: true
        });
        if (values['remember']) {
          window.localStorage.setItem("username", values['username']);
        }
        else {
          if (window.localStorage.getItem("username"))
            window.localStorage.removeItem("username");
        }
        axios({
          method: 'post',
          url: 'http://localhost:8080/api/user',
          data: {
            name: values['username'],
            password: values['password']
          }
        }).then(rsp => {
          const userInfo = new UserInfo();
          if (rsp.data.token) {
            userInfo.setUserInfo(rsp.data.token);
            message.success("Login succeeded");
            this.setState({
              loading: false,
              redirect: <Redirect to='/' />
            });
          }
          else {
            message.error("Username or password error");
            this.setState({
              loading: false
            });
          }
        });
      }
    });
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    const { redirect, username, remember, loading } = this.state;
    return (
      <Card title="Login" style={{ background: "#fff", padding: 10 }}>
        <Form onSubmit={this.handleSubmit} className="login-form">
          <Form.Item>
            {getFieldDecorator('username', {
              rules: [{ required: true, message: 'Please input your username!' }],
              initialValue: username
            })(
              <Input
                prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />}
                placeholder="Username"
              />,
            )}
          </Form.Item>
          <Form.Item>
            {getFieldDecorator('password', {
              rules: [{ required: true, message: 'Please input your Password!' }],
            })(
              <Input
                prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />}
                type="password"
                placeholder="Password"
              />,
            )}
          </Form.Item>
          <Form.Item>
            {getFieldDecorator('remember', {
              valuePropName: 'checked',
              initialValue: remember,
            })(<Checkbox>Remember me</Checkbox>)}
          </Form.Item>
          <Link style={{ float: "right" }} to="/forget">
              Forgot password
            </Link>
            <Button type="primary" htmlType="submit" onSubmit={this.handleSubmit} style={{ marginRight: 10 }} loading={loading}>
              Login
            </Button><br />
        </Form>
        {redirect}
      </Card>
    );
  }
}

export const WrappedLoginForm = Form.create({ name: 'normal_login' })(LoginForm);
