import React from "react";
import { Input, Table, Breadcrumb, Button, Row, Skeleton, } from "antd";
import { Link } from "react-router-dom";
import axios from 'axios';
import { UserInfo } from "../Functions";

const search_word = (keyword, origin) => {
  return origin.toLowerCase().indexOf(keyword.toLowerCase()) !== -1;
};

export class SearchPage extends React.Component {
  state = {
    data: [],
    keyword: {
      subject: '',
      course: ''
    },
    results: [],
    loading: true
  };

  constructor(...props) {
    super(...props);
    const userInfo = new UserInfo();
    axios({
      method: 'get',
      url: 'http://localhost:8080/api/subjects'
    }).then(rsp => {
      let data = rsp.data.subjects;
      data.forEach(item => {
        item.loading = false;
      });
      if (userInfo.getUserInfo()) {
        this.setState({
          data,
          results: data,
          loading: false
        });
      }
      else {
        this.setState({
          data,
          results: data,
          loading: false
        });
      }
    });
  }

  handleSearch = e => {
    const { data, keyword } = this.state;
    if (keyword['subject'].length === 0 && keyword['course'].length === 0)
      return;
    let results = [];
    data.forEach(item => {
      if (keyword['course'].length === 0) {
        if (search_word(keyword['subject'], item.title))
          results.push(item);
      } else if (keyword['subject'].length === 0) {
        if (search_word(keyword['course'], item.course.name))
          results.push(item);
      } else {
        if (search_word(keyword['subject'], item.title) && search_word(keyword['course'], item.course.name))
          results.push(item);
      }
    });
    this.setState({
      results
    });
  };

  handleClear = e => {
    const { data } = this.state;
    let keyword = this.state.keyword;
    keyword['subject'] = '';
    keyword['course'] = '';
    this.setState({
      keyword,
      results: data
    });
  };

  handleChange = (e, category) => {
    let keyword = this.state.keyword;
    keyword[category] = e.target.value;
    this.setState({
      keyword
    });
  };

  render() {
    const { results, keyword, loading } = this.state;
    const columns = [
      {
        title: 'Name',
        dataIndex: 'title',
        render: (text, record) => (<Link to={{
          pathname: '/subject/detail/' + record.id,
          state: {
            referrer: this.props.location.pathname
          }
        }}>{text}</Link>)
      },
      {
        title: 'Course',
        dataIndex: 'course.name',
      }
    ];

    return (
      <Skeleton active loading={loading}>
        <Breadcrumb>
          <Breadcrumb.Item><Link to='/'>Home</Link></Breadcrumb.Item>
          <Breadcrumb.Item>Search</Breadcrumb.Item>
        </Breadcrumb>
        <Input
          placeholder="Subject"
          allowClear
          style={{ marginTop: 10 }}
          value={keyword['subject']}
          onChange={e => this.handleChange(e, 'subject')}
          onKeyDown={e => {
            if (e.keyCode === 13) this.handleSearch();
          }}
        />
        <Input
          placeholder="Course"
          allowClear
          style={{ marginTop: 10 }}
          value={keyword['course']}
          onChange={e => this.handleChange(e, 'course')}
          onKeyDown={e => {
            if (e.keyCode === 13) this.handleSearch();
          }}
        />
        <Row style={{ marginTop: 10, marginRight: 10 }}>
          <Button
            type='primary'
            style={{ float: 'right' }}
            onClick={this.handleSearch}
          >Search</Button>
          <Button
            style={{ float: 'right', marginRight: 20 }}
            onClick={this.handleClear}
          >Clear</Button>
        </Row>
        <Table columns={columns} dataSource={results}
               rowKey='id' style={{ background: '#fff', marginTop: 20 }} />
      </Skeleton>
    )
  }
}
