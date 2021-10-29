import { Card, Row, Col, Icon, Typography, Skeleton } from 'antd';
import React from "react";
import { Link } from "react-router-dom";
import axios from 'axios';

const { Title } = Typography;

/* Custom Components */

/**
 * Title of information card section
 * @param props
 * @property title: Title of section
 * @property href: Link to View All
 */
const SectionTitle = (props) => {
  return (
    <Row style={{ marginTop: 30 }}>
      <Col lg={3} md={5} xs={12} offset={1}>
        <Title level={2}>{props.title}</Title>
      </Col>
      <Col lg={{ span: 4, offset: 1 }} sm={3} xs={{ span: 12, offset: 1 }}
           style={{ paddingTop: 10, marginBottom: 20 }}>
      </Col>
    </Row>
  )
};

/**
 * Information Card
 * @param props
 * @property title: Title of Information Card
 * @property info: Information of card
 * @property href: Redirect location
 */
const InfoCard = (props) => {
  return (
    <Col xs={24} md={12} lg={8} xxl={6}>
        <Card
          title={<Link to={props.href}>{props.title}</Link>}
          style={{ width: "80%", marginLeft: "10%", marginBottom: 20 }}
          extra={props.extra}
        >
          <Link to={props.href} style={{ color: '#000' }}>
            {props.info}
          </Link>
        </Card>
    </Col>
  )
};

export class Home extends React.Component {
  state = {
    subjects: [],
    courses: [],
    loading: {
      main: true,
      subjects: new Array(6).fill(false),
      courses: new Array(6).fill(false)
    }
  };

  constructor(...props) {
    super(...props);
    axios({
      method: 'get',
      url: 'http://localhost:8080/api/courses'
    }).then(rsp => {
      let courses = rsp.data.courses;
      let display = [];
      if (courses.length <= 6) {
        display = courses;
      }
      else {
        for (let i = 0; i < 6; i++) {
          let num = Math.floor(Math.random() * courses.length);
          display.push(courses[num]);
          courses.splice(num, 1);
        }
      }
      this.setState({
        courses: display,
      });
    });
    axios({
      method: 'get',
      url: 'http://localhost:8080/api/subjects'
    }).then(rsp => {
      let loading = this.state.loading;
      loading.main = false;
      this.setState({
        loading
      });
      let subjects = rsp.data.subjects;
      let display = [];
      if (subjects.length <= 6) {
        display = subjects;
      }
      else {
        for (let i = 0; i < 6; i++) {
          let num = Math.floor(Math.random() * subjects.length);
          display.push(subjects[num]);
          subjects.splice(num, 1);
        }
      }
      this.setState({
        subjects: display
      });
    });
  }

  render() {
    const { subjects, courses, loading } = this.state;

    return (
      <div>
        <Skeleton active loading={loading.main}>
        <SectionTitle href="/search" title="Subject" />
        <Row>
          {subjects.map((c, index) => (
            <InfoCard
              title={c.title}
              key={c.title}
              href={"/subject/detail/" + c.id}
              info={<div>
                <p><Icon type="bank" /> {c.course.name}</p>
                <p><Icon type="environment" /> {c.course.location}</p>
              </div>}
            />
          ))}
        </Row>
        <SectionTitle href="/course" title="Course" />
        <Row>
          {courses.map((c, index) => (
            <InfoCard
              title={c.name}
              key={c.name}
              href={{
                pathname: '/course/detail/' + c.id,
                state: {
                  referrer: this.props.location.pathname
                }
              }}
              info={<div>
                <p><Icon type="file-text" /> {c.subjects.length} subjects</p>
                <p><Icon type="environment" /> {c.location}</p>
              </div>}

            />
          ))}
        </Row>
      </Skeleton>
      </div>
    );
  }
}
