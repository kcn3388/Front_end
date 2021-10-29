import React from 'react';
import './App.css';
import { PageHeader, Icon, Menu, Avatar, Dropdown, Layout, message, Typography } from "antd";
import * as View from './Views';
import { Route, Switch, Link, withRouter, Redirect } from "react-router-dom";
import axios from 'axios';
import { UserInfo } from "./Views";

const { Content, Sider } = Layout;
const { Text } = Typography;

const Mask = props => (
  <div
    style={{
      background: "rgba(0, 0, 0, 0.6)",
      position: "fixed",
      height: "100%",
      width: "100%",
      zIndex: 200,
      display: props.display
    }}
    onClick={props.onClick}
  ></div>
);

/* Main Frame of website */
class App extends React.Component {
  state = {
    user: null,
    redirect: null,
    contentWidth: null,
    contentHeight: null,
    display: 'none',
    collapsed: true,
    dot: false,
  };

  componentDidMount() {
    this.updateSize();
    window.addEventListener('resize', () => this.updateSize());
  }

  componentWillUnmount() {
    window.removeEventListener('resize', () => this.updateSize());
  }

  updateSize = () => {
    let height = window.innerHeight;
    let width = window.innerWidth;
    height = width > 576 ? height - 80 : height - 124;
    let display = width > 991 ? 'none' : this.state.display;
    let collapsed = width <= 991 ? this.state.collapsed : false;
    width = width > 991 ? width - 200 : width;
    this.setState({
      contentHeight: height,
      contentWidth: width,
      display: display,
      collapsed: collapsed
    });
  };

  constructor(...props) {
    super(...props);
    const userInfo = new UserInfo();
    let info = userInfo.getUserInfo();
    if (info && info !== -1) {
      axios({
        method: 'post',
        url: 'http://localhost:8080/api/token',
        data: {
          token: info.token
        }
      }).then(rsp => {
        if (rsp.data.user) {
          let user = {
            username: rsp.data.user.name,
            role_id: rsp.data.user.role.id
          };
          this.setState({
            user
          });
        } else {
          this.setState({
            user: null,
            redirect: <Redirect to='/' />,
            dot: false
          });
        }
      });
    }
    this.props.history.listen(() => {
      let session = userInfo.getUserInfo();
      if (!session) {
        this.setState({
          user: null,
          redirect: null
        });
        return;
      } else if (session === -1) {
        message.error("User session expired");
        this.setState({
          user: null,
          redirect: null,
          dot: false
        });
        return;
      }
      axios({
        method: 'post',
        url: 'http://localhost:8080/api/token',
        data: {
          token: session.token
        }
      }).then(rsp => {
        if (rsp.data.user) {
          let user = {
            username: rsp.data.user.name,
            role_id: rsp.data.user.role.id
          };
          this.setState({
            user,
            redirect: null
          });
        } else {
          this.setState({
            user: null,
            dot: false,
            redirect: <Redirect to='/' />,
          });
        }
      });
    });
  }

  render() {
    const { user, redirect, contentHeight, contentWidth, display, collapsed, avatar } = this.state;
    /* Menu for Avatar on the top right corner */
    const AvatarMenu = (status) => {
      return status ? (
        <Menu>
          <Menu.Item>
            <strong >{user.username}</strong>
          </Menu.Item>

          <Menu.Item>
            <Text type='link' onClick={() => {
              const userInfo = new UserInfo();
              axios({
                method: 'post',
                url: 'http://localhost:8080/api/logout',
                data: {
                  token: userInfo.getUserInfo().token
                }
              }).then(rsp => {
                if (rsp.data) {
                  this.setState({
                    user: null,
                    avatar: '',
                    redirect: <Redirect to='/' />
                  }, () => {
                    message.success("Logout succeeded");
                    setTimeout(() => window.location.reload(), 1000);
                  });
                }
              });
            }}>
              <Icon type="logout" /> Logout
            </Text>
          </Menu.Item>
        </Menu>
      ) : (
        <Menu>
          <Menu.Item>
            <Link to="/login">
              <Icon type="login" /> Login
            </Link>
          </Menu.Item>
        </Menu>
      );
    };

    /**
     * Dropdown Menu on avatar
     * @returns DropdownMenu
     */
    const DropdownMenu = () => {
      return (
        <Dropdown overlay={AvatarMenu(user)} key="avatar" trigger={['click', 'hover']}>
          <Avatar icon="user" src={avatar} />
        </Dropdown>
      )
    };

    return (
      <Layout>
        {/*Header Part Start */}
        <PageHeader
          title={<Link to='/' style={{ color: 'black' }}>Course and Subject Management System</Link>}
          style={{
            background: '#fff',
          }}
          extra={[
            <DropdownMenu key="avatar" />,
          ]}
        />
        {/*Header Part End */}

        {/*Main Body Start */}
        <Layout>
          {/*Sider Part Start */}
          <Sider
            breakpoint="lg"
            collapsedWidth="0"
            theme='light'
            collapsed={collapsed}
            onCollapse={collapsed => {
              this.setState({
                display: !collapsed && window.innerWidth < 992 ?  'block' : 'none',
                collapsed: collapsed
              });
            }}
            style={{
              zIndex: 300
            }}
          >
            <Menu
              selectedKeys={[]}
              mode="inline"
            >
              <Menu.Item key="home">
                <Link to='/'>
                  <Icon type="home" />
                  <span>Home</span>
                </Link>
              </Menu.Item>
              <Menu.Item key="search">
                <Link to='/search'>
                  <Icon type="search" />
                  <span>Search</span>
                </Link>
              </Menu.Item>
              <Menu.Item key="compare">
                <Link to='/compare'>
                  <Icon type="block" />
                  <span>Compare</span>
                </Link>
              </Menu.Item>
            </Menu>
          </Sider>
          {/*Sider Part End*/}

          {/*Content Part Start*/}
          <Layout>
            <Mask display={display} onClick={() => {
              this.setState({
                collapsed: !collapsed,
                display: 'none'
              })
            }} />
            {/*Edit page redirect here*/}
            <Content style={{
              padding: 24,
              overflowX: "hidden",
              minWidth: contentWidth,
              maxHeight: contentHeight,
              zIndex: 100
            }}>
              {redirect}
              {/*HomePage*/}
              <Switch>
                <Route exact path='/' component={View.Home} />
                <Route exact path='/login' component={View.WrappedLoginForm} />
                <Route exact path={'/course/detail/:id'} component={View.CourseDetail} />
                <Route path={'/subject/detail/:id'} component={View.SubjectDetail} />
                <Route exact path='/search' component={View.SearchPage} />
                <Route exact path='/compare' component={View.Compare} />
              </Switch>
            </Content>
          </Layout>
          {/*Content Part End */}
        </Layout>
        {/*Main Body End */}
      </Layout>
    )
  }
}

export default withRouter(App);
