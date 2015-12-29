expressionValidator = function (expression) {
    var validateResponse = {valid: true};

    if (Object.keys(expression).length > 6) {
        validateResponse.valid = false;
        validateResponse.message = 'Not a valid cron expression; limited to 6 values.';
    }

    return validateResponse;
};

valueValidator = function (value, measureOfTime) {
    var validateResponse = {valid: true},
        validatorObj = {
            minute: {min: 0, max: 59},
            hour: {min: 0, max: 23},
            dayOfTheMonth: {min: 1, max: 31},
            monthOfTheYear: {min: 1, max: 12},
            dayOfTheWeek: {min: 1, max: 7},
            year: {min: 1900, max: 3000}
        },
        range,
        validChars = /^[0-9*-]/;

    if (!validatorObj[measureOfTime]) {
        validateResponse.valid = false;
        validateResponse.message = 'Not a valid measureOfTime; Valid options are: "minute", "hour", "dayOfTheMonth", "monthOfTheYear", "dayOfTheWeek", & "year".'
        return validateResponse;
    }

    if (!validChars.test(value)) {
        validateResponse.valid = false;
        validateResponse.message = 'Invalid value; Only numbers 0-9, "-", and "*" chars are allowed.';
        return validateResponse;
    }

    if (value !== '*') {
        // check to see if value is within range if value is not '*'
        if (value.indexOf('-') >= 0) {
            // value is a range and must be split into high and low
            range = value.split('-');

            if (!range[0] || range[0] < validatorObj[measureOfTime].min) {
                validateResponse.valid = false;
                validateResponse.message = 'Not a valid value; bottom of range is not valid for "' + measureOfTime + '". Limit is ' + validatorObj[measureOfTime].min + '.';
            }

            if (!range[1] || range[1] > validatorObj[measureOfTime].max) {
                validateResponse.valid = false;
                validateResponse.message = 'Not a valid value; top of range is not valid for "' + measureOfTime + '". Limit is ' + validatorObj[measureOfTime].max + '.';
            }
        } else {

            if (parseInt(value) < validatorObj[measureOfTime].min) {
                validateResponse.valid = false;
                validateResponse.message = 'Not a valid value; given value is not valid for "' + measureOfTime + '". Minimum value is "' + validatorObj[measureOfTime].min + '".';
            }
            if (parseInt(value) > validatorObj[measureOfTime].max) {
                validateResponse.valid = false;
                validateResponse.message = 'Not a valid value; given value is not valid for "' + measureOfTime + '". Maximum value is "' + validatorObj[measureOfTime].max + '".';
            }
        }
    }

    return validateResponse;
};

function CronBuilder (initialExpression) {
    var initialArray;

    if (initialExpression) {
        initialArray = initialExpression.split(' ');
        this.expression = {};
        this.expression.minute = initialArray[0] ? [initialArray[0]] : ['*'];
        this.expression.hour = initialArray[1] ? [initialArray[1]] : ['*'];
        this.expression.dayOfTheMonth = initialArray[2] ? [initialArray[2]] : ['*'];
        this.expression.monthOfTheYear = initialArray[3] ? [initialArray[3]] : ['*'];
        this.expression.dayOfTheWeek = initialArray[4] ? [initialArray[4]] : ['*'];
        this.expression.year = initialArray[5] ? [initialArray[5]] : ['*'];
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
    var valueCheck = valueValidator(value, measureOfTime);

    if (!valueCheck.valid) {
        return valueCheck;
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
    var expressionCheck = expressionValidator(expToSet);

    if (!expressionCheck.valid) {
        return expressionCheck;
    }

    this.expression = expToSet;
};

module.exports = CronBuilder;