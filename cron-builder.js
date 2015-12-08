function CronBuilder () {
    this.expression = {
        minute: ['*'],
        hour: ['*'],
        dayOfTheMonth: ['*'],
        monthOfTheYear: ['*'],
        dayOfTheWeek: ['*'],
        year: ['*']
    };
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

module.exports = CronBuilder;