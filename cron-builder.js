function CronBuilder (initialExpression) {
    var initialArray;

    if (initialExpression) {
        initialArray = initialExpression.split(' ');
        this.expression = {};
        this.expression.minute = [initialArray[0]] || ['*'];
        this.expression.hour = [initialArray[1]] || ['*'];
        this.expression.dayOfTheMonth = [initialArray[2]] || ['*'];
        this.expression.monthOfTheYear = [initialArray[3]] || ['*'];
        this.expression.dayOfTheWeek = [initialArray[4]] || ['*'];
        this.expression.year = [initialArray[5]] || ['*'];
    } else {
        this.expression = {
            minute: ['*'],
            hour: ['*'],
            dayOfTheMonth: ['*'],
            monthOfTheYear: ['*'],
            dayOfTheWeek: ['*'],
            year: ['*']
        };
    }
}

CronBuilder.prototype.build = function () {
    var expressionArray = [];

    expressionArray.push(this.expression.minute.join(','));
    expressionArray.push(this.expression.hour.join(','));
    expressionArray.push(this.expression.dayOfTheMonth.join(','));
    expressionArray.push(this.expression.monthOfTheYear.join(','));
    expressionArray.push(this.expression.dayOfTheWeek.join(','));
    expressionArray.push(this.expression.year.join(','));

    return expressionArray.join(' ');
};

CronBuilder.prototype.addValue = function (value, measureOfTime) {
    if (!this.expression[measureOfTime]) {
        return;
    }

    if (this.expression[measureOfTime].length === 1 && this.expression[measureOfTime][0] === '*') {
        this.expression[measureOfTime] = [value];
    } else {
        if (this.expression[measureOfTime].indexOf(value) < 0) {
            this.expression[measureOfTime].push(value);
        }
    }
};

CronBuilder.prototype.removeValue = function (value, measureOfTime) {
    if (!this.expression[measureOfTime] || (this.expression[measureOfTime].length === 1 && this.expression[measureOfTime][0] === '*')) {
        return;
    }

    this.expression[measureOfTime] = this.expression[measureOfTime].filter(function (timeValue) {
       return value !== timeValue;
    });

    if (!this.expression[measureOfTime].length) {
        this.expression[measureOfTime] = ['*'];
    }
};

CronBuilder.prototype.get = function (measureOfTime) {
    return this.expression[measureOfTime].join(',');
};

CronBuilder.prototype.set = function (value, measureOfTime) {
    if (!Array.isArray(value) || !this.expression[measureOfTime]) {
        return;
    }

    this.expression[measureOfTime] = value;

    return this.expression[measureOfTime].join(',');
};

CronBuilder.prototype.getAll = function () {
    return this.expression;
};

CronBuilder.prototype.setAll = function (expToSet) {
    // lots of checks to do here in order to determine if the expToSet is a valid cron expression
    if (Object.keys(expToSet).length > 6) {
      return 'Not a valid cron string; too many values';
    }

    this.expression = expToSet;
};

module.exports = CronBuilder;