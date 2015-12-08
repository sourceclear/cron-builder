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
    expressionArray.push(this.expression.minute.join(','));
    expressionArray.push(this.expression.minute.join(','));
    expressionArray.push(this.expression.minute.join(','));
    expressionArray.push(this.expression.minute.join(','));
    expressionArray.push(this.expression.minute.join(','));

    return expressionArray.join(' ');
};

module.exports = CronBuilder;