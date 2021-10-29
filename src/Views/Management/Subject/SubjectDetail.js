import React from 'react';
import { Typography, Icon, Breadcrumb, Table, Skeleton } from "antd";
import { Link } from "react-router-dom";
import axios from 'axios';

const { Title, Paragraph, Text } = Typography;

export class SubjectDetail extends React.Component {
  state = {
    data: {
      course: {},
      contents: []
    },
    loading: [true, false]
  };

  switchView = (pathname, subject) => {
    let path = pathname.split('/')[1];
    switch (path) {
      case 'course':
        return (<Breadcrumb.Item><Link to={{
          pathname: '/course/detail/' + subject.course.id,
          state: {
            referrer: this.props.location.pathname
          }
        }}>{subject.course.name}</Link></Breadcrumb.Item>);
      case 'subject':
        return (<Breadcrumb.Item><Link to={'/subject/index/' + subject.title}>{subject.title}</Link></Breadcrumb.Item>);
      default:
        return (<Breadcrumb.Item><Link to='/search'>Search Subject</Link></Breadcrumb.Item>);
    }
  };

  constructor(...props) {
    super(...props);
    const subject_id = this.props.match.params.id;
    axios({
      method: 'get',
      url: 'http://localhost:8080/api/subject',
      params: {
        id: subject_id
      }
    }).then(rsp => {
      this.setState({
        data: rsp.data.subject,
      });
      this.setState({
        loading: false
      })
    });
  }

  render() {
    const { data, loading } = this.state;
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
        },
        {
          title: 'Content',
          dataIndex: 'content',
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
      ]
    };

    return (
        <div style={{ background: '#fff', padding: 20 }}>
          <Skeleton active loading={loading}>
            <Breadcrumb>
              <Breadcrumb.Item><Link to='/'>Home</Link></Breadcrumb.Item>
              {this.props.location.state && this.switchView(this.props.location.state.referrer, data)}
              <Breadcrumb.Item>{data.title}, {data.course.name}</Breadcrumb.Item>
            </Breadcrumb>
            <Title>{data.code} {data.title}, <Link to={{
              pathname: '/course/detail/' + data.course.id,
              state: {
                referrer: this.props.location.pathname
              }
            }}>{data.course.name}</Link></Title>
            <Title level={3}>Unit</Title>
            <Paragraph>{data.unit}</Paragraph>
            <Title level={3}>Contact Hours</Title>
            <Paragraph>{data.hours}</Paragraph>
            <Title level={3}>Offer Unit</Title>
            <Paragraph>{data.offer_unit}</Paragraph>
            <Title level={3}>Pre-Requisition</Title>
            <Paragraph>{data.pre_req}</Paragraph>
            <Title level={3}>Co-Requisition</Title>
            <Paragraph>{data.co_req}</Paragraph>
            <Title level={3}>Professor</Title>
            <Paragraph>{data.professor}</Paragraph>
            <Title level={3}>Teaching Assistant</Title>
            <Paragraph>{data.teaching_assistant}</Paragraph>
            <Title level={3}>Description</Title>
            <Paragraph>{data.description}</Paragraph>
            <Title level={3}>Subject Contents</Title>
            {data['contents'].map(content => (
                <div key={content.content_id}>
                  <Title level={4}>{content.content_id}. {content.title}</Title>
                  <Text mark><Icon type="clock-circle" /> {content.hours} hrs</Text>
                  <Paragraph>{content.content}</Paragraph>
                </div>
            ))}
            <Title level={3}>Subject learning objectives (SLOs)</Title>
            <Table columns={columns['slos']}
                   dataSource={data['slos']} rowKey='id' />
            <Title level={3}>Course intended learning outcomes (CILOs)</Title>
            <Table columns={columns['cilos']}
                   dataSource={data['cilos']} rowKey='id' />
            <Title level={3}>Teaching and learning strategies</Title>
            <Table columns={columns['tlss']}
                   dataSource={data['tlss']} rowKey='id' />
            <Title level={3}>Assessment</Title>
            <Table
                columns={columns['assessments']}
                dataSource={data['assessments']}
                style={{ overflowX: 'auto' }}
                rowKey='method'
            />
            <Title level={3}>Recommended texts</Title>
            <Table columns={columns['textBooks']}
                   dataSource={data['textBooks']} rowKey='id' />
          </Skeleton>
        </div>
    );
  }
}
