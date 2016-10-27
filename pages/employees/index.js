/**
 * React Static Boilerplate
 * https://github.com/kriasoft/react-static-boilerplate
 *
 * Copyright © 2015-present Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import React, { PropTypes } from 'react';
import Layout from '../../components/Layout';
import s from './styles.css';
import { title, html } from './index.md';
import eData from '../../data/employees.json';
import bData from '../../data/blackout.json';
import {Button} from 'react-toolbox/lib/button';

class EmployeesPage extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      employeeId: "",
      date: null,
      hasPerformanceReview: null,
      explanation: null
    };
  }

  componentDidMount() {
    document.title = title;
  }

  handleEmployeeChange(event) {
    // save selected employee
    this.setState({ employeeId: event.target.value });
  }

  handleDateChange(event) {
    // save selected date
    this.setState({ date: new Date(event.target.value.replace("-", "/")) });
  }

  handleAskButtonClick() {
    // save calculated value: has performance review
    const answer = this.askOracle();
    this.setState({ hasPerformanceReview: answer.value });
    this.setState({ explanation: answer.reasons });
  }

  askOracle() {
    // true if the selected employee has a performance review on the selected date
    const { employeeId, date } = this.state;
    if (employeeId === "" || date === null) return null;

    const employee = eData.employees.find(x => x.id == employeeId);

    let reasons = [];
    if (!this.hiredBefore(employee, date)) {
      reasons.push("The employee wasn't hired at that time. His reviews begin after " + employee.hireDate + ".");
    }
    if (!this.isOddMonth(date)) {
      reasons.push("Reviews only happen every other month: Jan, Mar, May, July, Sept, Nov.");
    }
    if (!this.isFirstBusinessDayOfMonth(date)) {
      reasons.push("Reviews only happen on the first business day of the applicable months, never on weekends or special days such as holidays.");
    }
    return {
      value: !reasons.length,
      reasons: reasons
    };
  }

  hiredBefore(employee, date) {
    // true if the employee was hired before the specified date
    const hireDate = new Date(employee.hireDate);
    return hireDate < date;
  }

  isOddMonth(date) {
    // true for odd months: 1, 3, 5, 7, 9, 11; false otherwise
    const month = date.getMonth() + 1;
    return month % 2 !== 0;
  }

  isFirstBusinessDayOfMonth(date) {
    // true if the specified date matches the first biz day of the month
    const firstBizDay = this.getFirstBusinessDayOfMonth(date);
    return date.toDateString() == firstBizDay.toDateString();
  }

  getFirstBusinessDayOfMonth(date) {
    // get first business day of month that is not a blackout date, e.g. holiday
    const firstBizDay = new Date(date.getFullYear(), date.getMonth(), 1);
    while (!this.isBusinessDay(firstBizDay) || this.isBlackout(firstBizDay))
      firstBizDay.setDate(firstBizDay.getDate() + 1);
    return firstBizDay;
  }

  isBusinessDay(date) {
    // true if monday to friday, false if saturday(6)/sunday(0)
    const dayOfWeek = date.getDay();
    return dayOfWeek > 0 && dayOfWeek < 6;
  }

  isBlackout(date) {
    // true if a least one blackout date matches the specified date
    return bData.blackout.some(x => new Date(x).toDateString() == date.toDateString());
  }

  render() {
    return (
      <Layout className={s.content}>
        <div dangerouslySetInnerHTML={{ __html: html }} />
        <ul>
          {eData.employees.map((employee, i) =>
            <li key={i}>
              {employee.id} - {employee.name}: {employee.hireDate}
            </li>
          )}
        </ul>
        <p>
        </p>
        <h2>
          Oracle
        </h2>
        Employee:
        <select value={this.state.employee} onChange={(e) => this.handleEmployeeChange(e)}>
          <option value="" key="0">[Select]</option>
          {eData.employees.map((employee, i) =>
            <option value={employee.id} key={i}>
              {employee.name}
            </option>
          )}
        </select>
        &nbsp;&nbsp;&nbsp;&nbsp;

        Date:
        <input type="date" onChange={(e) => this.handleDateChange(e)}/>
        &nbsp;&nbsp;&nbsp;&nbsp;

        <Button onClick={() => this.handleAskButtonClick()} primary>Ask</Button>
        <p>
          <br/>
          {this.renderHasPerformanceReview()}
        </p>
        <p>
          <br /><br />
        </p>
      </Layout>
    );
  }

  renderHasPerformanceReview() {
      if (this.state.hasPerformanceReview === null) return "";
      if (this.state.hasPerformanceReview) return (<span><i>Has performance review</i></span>);
      return (
        <span>
          <i>Does not have performance review</i><br/>
          <ul>
          {this.state.explanation.map((reason, i) =>
            <li key={i}>
              {reason}
            </li>
          )}
          </ul>
        </span>
      );
    }

}

export default EmployeesPage;
