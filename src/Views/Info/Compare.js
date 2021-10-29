import React from "react";
import {
  Table, Breadcrumb, Skeleton, Input, Button, Typography, Icon, List,
  Row, Tooltip, Collapse, Col, Divider, Tag, message, Drawer, Badge
} from "antd";
import axios from 'axios';
import { Link } from "react-router-dom";

const { Panel } = Collapse;
const { Title, Paragraph, Text } = Typography;

const findItem = (data, id) => {
  let result = null;
  data.forEach(item => {
    if (item.id === id)
      result = item;
  });
  return result;
};

const defaultPanelStyle = {
  background: '#f7f7f7',
  borderRadius: 4,
  marginBottom: 24,
  border: 0,
  overflow: 'hidden',
};

const columns = {
  slos: [
    {
      title: 'SLO Content',
      dataIndex: 'content',
    }
  ],
  cilos: [
    {
      title: 'No.',
      dataIndex: 'serial_number',
      render: text => text
    },
    {
      dataIndex: 'title',
    }
  ],
  tlss: [
    {
      title: 'Title',
      dataIndex: 'title',
      render: text => text
    },
    {
      title: 'TLSs',
      dataIndex: 'content'
    }
  ],
  assessments: [
    {
      title: 'Assessment Method',
      dataIndex: 'method'
    },
    {
      title: "Weighting",
      dataIndex: "weighting",
      render: text => text + "%"
    },
    {
      title: "Description",
      dataIndex: "description"
    }
  ],
  textBooks: [
    {
      title: "Title",
      dataIndex: "title"
    },
    {
      title: "Publish Year",
      dataIndex: "year"
    },
    {
      title: "Author(s)",
      dataIndex: "author"
    }
  ],
  subjects: [
    {
      title: 'Subject Title',
      dataIndex: 'title',
    },
    {
      title: 'Course',
      dataIndex: 'course.name',
    }
  ]
};


const defaultSelected = () => {
  let arr = [];
  for (let i = 1; i < 16; i++)
    arr.push(i);
  return arr;
};

const search_word = (keyword, origin) => {
  return origin.toLowerCase().indexOf(keyword.toLowerCase()) !== -1;
};

export class Compare extends React.Component {

  state = {
    data: [],
    results: [],
    keyword: {
      subject: '',
      course: ''
    },
    loading: true,
    loadingBtn: false,
    selectedRowKeys: [],
    compare: [],
    realCompare: [],
    drawer: false,
    children: false
  };

  constructor(...props) {
    super(...props);
    axios({
      method: 'get',
      url: 'http://45.76.112.88:8080/yzx/api/subjects'
    }).then(rsp => {
      this.setState({
        data: rsp.data.subjects,
        results: rsp.data.subjects,
        loading: false
      });
    });
  };

  onSelectChange = selectedRowKeys => {
    let rp = this.state.realCompare;
    rp.forEach(item => {
      if (selectedRowKeys.indexOf(item) === -1)
        rp.splice(rp.indexOf(item), 1);
    });
    this.setState({
      selectedRowKeys,
      realCompare: rp
    });
  };

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

  handleChange = (e, category) => {
    let keyword = this.state.keyword;
    keyword[category] = e.target.value;
    this.setState({
      keyword
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

  handleCompare = async e => {
    const { realCompare } = this.state;
    this.setState({
      loadingBtn: true
    });
    let rsp1 = await axios({
      method: 'get',
      url: 'http://45.76.112.88:8080/yzx/api/subject',
      params: {
        id: realCompare[0]
      }
    });
    let rsp2 = await axios({
      method: 'get',
      url: 'http://45.76.112.88:8080/yzx/api/subject',
      params: {
        id: realCompare[1]
      }
    });
    let compare = [rsp1.data.subject, rsp2.data.subject];
    this.setState({
      compare,
      children: true,
      loadingBtn: false
    });
  };

  render() {
    const { loading, results, selectedRowKeys, realCompare, loadingBtn, compare, keyword, data, drawer, children } = this.state;
    const rowSelection = {
      selectedRowKeys,
      onChange: this.onSelectChange
    };

    return (
      <div style={{ padding: 20 }}>
        <Skeleton active loading={loading}>
          <Breadcrumb>
            <Breadcrumb.Item><Link to='/'>Home</Link></Breadcrumb.Item>
            <Breadcrumb.Item>Compare</Breadcrumb.Item>
          </Breadcrumb>
          <Input
            placeholder='Subject'
            allowClear
            value={keyword['subject']}
            onChange={e => this.handleChange(e, 'subject')}
            style={{ marginTop: 10 }}
            onKeyDown={e => {
              if (e.keyCode === 13) this.handleSearch();
            }}
          />
          <Input
            placeholder='Course'
            allowClear
            value={keyword['course']}
            onChange={e => this.handleChange(e, 'course')}
            style={{ marginTop: 10 }}
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
          <Row>
            <Badge count={selectedRowKeys.length}>
              <Button onClick={() => this.setState({ drawer: true })} type='primary'>Selected</Button>
            </Badge>
          </Row>
          <Drawer
            title='Selected Subjectes'
            width={window.screen.width > 500 ? 360 : window.screen.width - 20}
            closable={false}
            onClose={() => this.setState({ drawer: false })}
            visible={drawer}
          >
            <Drawer
              title='Compare'
              width={window.screen.width > 500 ? 500 : window.screen.width - 20}
              closable={false}
              onClose={() => this.setState({ children: false })}
              visible={children}
            >
              {compare.length === 2 && (
                <Collapse bordered={false} defaultActiveKey={defaultSelected()}>
                  <Panel key='1' header='Course Name' style={defaultPanelStyle}>
                    <Row>
                      <Col span={12}>{compare[0].course.name}</Col>
                      <Col span={12}>{compare[1].course.name}</Col>
                    </Row>
                  </Panel>
                  <Panel key='2' header='Subject Code' style={defaultPanelStyle}>
                    <Row>
                      <Col span={12}>{compare[0].code}</Col>
                      <Col span={12}>{compare[1].code}</Col>
                    </Row>
                  </Panel>
                  <Panel key='3' header='Subject Title' style={defaultPanelStyle}>
                    <Row>
                      <Col span={12}>{compare[0].title}</Col>
                      <Col span={12}>{compare[1].title}</Col>
                    </Row>
                  </Panel>
                  <Panel key='4' header='Subject Unit' style={defaultPanelStyle}>
                    <Row>
                      <Col span={12}>{compare[0].unit}</Col>
                      <Col span={12}>{compare[1].unit}</Col>
                    </Row>
                  </Panel>
                  <Panel key='5' header='Contact hours' style={defaultPanelStyle}>
                    <Row>
                      <Col span={12}>{compare[0].hours}</Col>
                      <Col span={12}>{compare[1].hours}</Col>
                    </Row>
                  </Panel>
                  <Panel key='6' header='Offer Unit' style={defaultPanelStyle}>
                    <Row>
                      <Col span={12}>{compare[0].offer_unit}</Col>
                      <Col span={12}>{compare[1].offer_unit}</Col>
                    </Row>
                  </Panel>
                  <Panel key='7' header='Professor' style={defaultPanelStyle}>
                    <Row>
                      <Col span={12}>{compare[0].professor}</Col>
                      <Col span={12}>{compare[1].professor}</Col>
                    </Row>
                  </Panel>
                  <Panel key='8' header='Teaching assistant' style={defaultPanelStyle}>
                    <Row>
                      <Col span={12}>{compare[0].teaching_assistant}</Col>
                      <Col span={12}>{compare[1].teaching_assistant}</Col>
                    </Row>
                  </Panel>
                  <Panel key='9' header='Description' style={defaultPanelStyle}>
                    <Row>
                      <Col span={12}>{compare[0].description}</Col>
                      <Col span={12}>{compare[1].description}</Col>
                    </Row>
                  </Panel>
                  <Panel key='10' header='Subject Contents' style={defaultPanelStyle}>
                    <Title level={3}>{compare[0].title}, {compare[0].course.name}</Title>
                    {compare[0]['contents'].map(content => (
                      <div key={content.content_id}>
                        <Title level={4}>{content.content_id}. {content.title}</Title>
                        <Text mark><Icon type="clock-circle" /> {content.hours} hrs</Text>
                        <Paragraph>{content.content}</Paragraph>
                      </div>
                    ))}
                    <Divider />
                    <Title level={3}>{compare[1].title}, {compare[1].course.name}</Title>
                    {compare[1]['contents'].map(content => (
                      <div key={content.content_id}>
                        <Title level={4}>{content.content_id}. {content.title}</Title>
                        <Text mark><Icon type="clock-circle" /> {content.hours} hrs</Text>
                        <Paragraph>{content.content}</Paragraph>
                      </div>
                    ))}

                  </Panel>
                  <Panel key='11' header='Subject learning objectives (SLOs)' style={defaultPanelStyle}>
                    <Title level={4}>{compare[0].title}, {compare[0].course.name}</Title>
                    <Table columns={columns['slos']} style={{ background: '#fff', marginBottom: 10 }}
                           dataSource={compare[0]['slos']} rowKey='id' />
                    <Divider />
                    <Title level={4}>{compare[1].title}, {compare[1].course.name}</Title>
                    <Table columns={columns['slos']} style={{ background: '#fff' }}
                           dataSource={compare[1]['slos']} rowKey='id' />
                  </Panel>
                  <Panel key='12' header='Course intended learning outcomes (CILOs)' style={defaultPanelStyle}>
                    <Title level={4}>{compare[0].title}, {compare[0].course.name}</Title>
                    <Table columns={columns['cilos']} style={{ background: '#fff', marginBottom: 10 }}
                           dataSource={compare[0]['cilos']} rowKey='id' />
                    <Divider />
                    <Title level={4}>{compare[1].title}, {compare[1].course.name}</Title>
                    <Table columns={columns['cilos']} style={{ background: '#fff' }}
                           dataSource={compare[1]['cilos']} rowKey='id' />
                  </Panel>
                  <Panel key='13' header='Teaching and learning strategies' style={defaultPanelStyle}>
                    <Title level={4}>{compare[0].title}, {compare[0].course.name}</Title>
                    <Table columns={columns['tlss']} style={{ background: '#fff', marginBottom: 10 }}
                           dataSource={compare[0]['tlss']} rowKey='id' />
                    <Divider />
                    <Title level={4}>{compare[1].title}, {compare[1].course.name}</Title>
                    <Table columns={columns['tlss']} style={{ background: '#fff' }}
                           dataSource={compare[1]['tlss']} rowKey='id' />
                  </Panel>
                  <Panel key='14' header='Assessment Methods' style={defaultPanelStyle}>
                    <Title level={4}>{compare[0].title}, {compare[0].course.name}</Title>
                    <Table
                      columns={columns['assessments']}
                      dataSource={compare[0]['assessments']}
                      style={{ overflowX: 'auto', background: '#fff', marginBottom: 10 }}
                      rowKey='method'
                    />
                    <Divider />
                    <Title level={4}>{compare[1].title}, {compare[1].course.name}</Title>
                    <Table
                      columns={columns['assessments']}
                      dataSource={compare[1]['assessments']}
                      style={{ overflowX: 'auto', background: '#fff' }}
                      rowKey='method'
                    />
                  </Panel>
                  <Panel key='15' header='Textbooks/Recommended Readings' style={defaultPanelStyle}>
                    <Title level={4}>{compare[0].title}, {compare[0].course.name}</Title>
                    <Table columns={columns['textBooks']} style={{ background: '#fff', marginBottom: 10 }}
                           dataSource={compare[0]['textBooks']} rowKey='id' />
                    <Divider />
                    <Title level={4}>{compare[1].title}, {compare[1].course.name}</Title>
                    <Table columns={columns['textBooks']} style={{ background: '#fff' }}
                           dataSource={compare[1]['textBooks']} rowKey='id' />
                  </Panel>
                </Collapse>
              )}
            </Drawer>
            <Row>
              {realCompare.map(item => (
                <Tag closable style={{ marginBottom: 20 }} onClose={e => {
                  e.preventDefault();
                  let rp = realCompare;
                  rp.splice(rp.indexOf(item), 1);
                  this.setState({
                    realCompare: rp
                  });
                }}>
                  {findItem(data, item).title}, {findItem(data, item).course.name}
                </Tag>
              ))}
            </Row>
            <Row>
              <Tooltip title='Select 2 subjects to compare'>
                <Button
                  type='primary'
                  loading={loadingBtn}
                  onClick={this.handleCompare}
                  disabled={realCompare.length !== 2}
                >Compare</Button>
              </Tooltip>
              <Tooltip title='Clear your selections'>
                <Button
                  style={{ marginLeft: 10 }}
                  onClick={() => {
                    this.setState({
                      selectedRowKeys: [],
                      realCompare: []
                    });
                  }}
                >Clear</Button>
              </Tooltip>
            </Row>
            <List
              itemLayout='horizontal'
              dataSource={selectedRowKeys}
              renderItem={(item, index) => (
                <List.Item
                  actions={
                    [
                      <a onClick={() => {
                        let rp = realCompare;
                        if (realCompare.indexOf(item) >= 0)
                          rp.splice(rp.indexOf(item), 1);
                        else if (realCompare.length === 2) {
                          message.warning("You can only choose 2 subjects to compare.");
                          return;
                        }
                        else
                          rp.push(item);
                        this.setState({
                          realCompare: rp
                        });
                      }}><Icon type={realCompare.indexOf(item) !== -1 ? 'minus' : 'plus'} /></a>,
                      <a onClick={() => {
                        let selected = selectedRowKeys;
                        let rp = realCompare;
                        selected.splice(index, 1);
                        if (rp.indexOf(index) !== -1)
                          rp.splice(rp.indexOf(index), 1);
                        this.setState({
                          selectedRowKeys: selected,
                          realCompare: rp
                        });
                      }}><Icon type='delete' /></a>
                    ]
                  }
                >
                  <List.Item.Meta
                    title={findItem(data, item).title}
                    description={findItem(data, item).course.name}
                  />
                </List.Item>
              )}
            />
          </Drawer>
          <Table
            columns={columns['subjects']}
            dataSource={results}
            rowKey='id'
            style={{ marginTop: 20, background: "#fff" }}
            rowSelection={rowSelection}
          />
        </Skeleton>
      </div>
    )
  }
}
