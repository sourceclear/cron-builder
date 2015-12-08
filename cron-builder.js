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

module.exports = CronBuilder;