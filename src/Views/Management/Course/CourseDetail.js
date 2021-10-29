import React from 'react';
import { Typography, Breadcrumb, Table, Input, Skeleton } from "antd";
import { Link } from "react-router-dom";
import axios from 'axios';

const { Title, Paragraph } = Typography;
const InputGroup = Input.Group;
const { Search } = Input;

const search_word = (keyword, origin) => {
  return origin.toLowerCase().indexOf(keyword.toLowerCase()) !== -1;
};

export class CourseDetail extends React.Component {
  state = {
    data: {
      subjects: []
    },
    keyword: "",
    subjects: [],
    loading: [true, false]
  };

  switchView = (pathname) => {
    let path = pathname.split('/')[1];
    switch (path) {
      case '':
        return '';
      default:
        return (<Breadcrumb.Item><Link to='/course'>Course List</Link></Breadcrumb.Item>);
    }
  };

  constructor(...props) {
    super(...props);
    const course_id = this.props.match.params.id;
    axios({
      method: 'get',
      url: 'http://45.76.112.88:8080/yzx/api/course',
      params: {
        id: course_id
      }
    }).then(rsp => {
      this.setState({
        data: rsp.data.course,
        subjects: rsp.data.course.subjects,
      });
      this.setState({
        loading: false
      })
    });
  };

  handleSearch = e => {
    const { data, keyword } = this.state;
    if (keyword.length === 0)
      return;
    let subjects = [];
    data.subjects.forEach(item => {
      if (search_word(keyword, item.title))
        subjects.push(item);
    });
    this.setState({
      subjects
    });
  };

  handleChange = e => {
    const { data } = this.state;
    let keyword = e.target.value;
    if (keyword === "")
      this.setState({
        subjects: data['subjects']
      });
    this.setState({
      keyword
    });
  };

  render() {
    const { data, subjects, loading } = this.state;
    const columns = [
      {
        title: 'Subject',
        dataIndex: 'title',
        key: 'title',
        render: (text, record) => (<Link to={{
          pathname: '/subject/detail/' + record.id,
          state: {
            referrer: this.props.location.pathname
          }
        }}>{text}</Link>)
      }
    ];

    return (
      <Skeleton loading={loading[0]} active>
        <div style={{ background: '#fff', padding: 20 }}>
          <Breadcrumb>
            <Breadcrumb.Item><Link to='/'>Home</Link></Breadcrumb.Item>
            {this.props.location.state && this.switchView(this.props.location.state.referrer)}
            <Breadcrumb.Item>{data.name}</Breadcrumb.Item>
          </Breadcrumb>
          <Title>{data.name}</Title>
          <Title level={2}>Introduction</Title>
          <Paragraph>{data.introduction}</Paragraph>
          <Title level={2}>Subject List</Title>
          <InputGroup compact>
            <Search
              placeholder="Search"
              onChange={this.handleChange}
              onSearch={this.handleSearch}
              allowClear
            />
          </InputGroup>
          <Table columns={columns} dataSource={subjects}
            rowKey='id' style={{ background: '#fff', marginTop: 20 }} />
        </div>
      </Skeleton>
    );
  }
}
