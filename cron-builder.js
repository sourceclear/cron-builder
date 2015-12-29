expressionObjectValidator = function (expression) {
    var validateResponse = {valid: true},
        valueCheck;

    if (Object.keys(expression).length > 6) {
        validateResponse.valid = false;
        validateResponse.message = 'Invalid cron expression; limited to 6 values.';
        return validateResponse;
    }

    for (var measureOfTime in expression) {
        if (expression.hasOwnProperty(measureOfTime)) {
            valueCheck = valueValidator(expression[measureOfTime], measureOfTime);
            if (!valueCheck.valid) {
                validateResponse = valueCheck;
                break;
            }
        }
    }

    return validateResponse;
};

expressionStringValidator = function (expression) {
    var validateResponse = {valid: true},
        valueCheck,
        measureOfTimeMap = {
            0: 'minute',
            1: 'hour',
            2: 'dayOfTheMonth',
            3: 'monthOfTheYear',
            4: 'dayOfTheWeek',
            5: 'year'
        };

    if (expression.length > 6) {
        validateResponse.valid = false;
        validateResponse.message = 'Invalid cron expression; limited to 6 values.';
        return validateResponse;
    }

    for (var i = 0; i < expression.length; i++) {
        valueCheck = valueValidator(expression[i], measureOfTimeMap[i]);
        if (!valueCheck.valid) {
            validateResponse = valueCheck;
            break;
        }
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
        validateResponse.message = 'Invalid measureOfTime; Valid options are: "minute", "hour", "dayOfTheMonth", "monthOfTheYear", "dayOfTheWeek", & "year".'
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
                validateResponse.message = 'Invalid value; bottom of range is not valid for "' + measureOfTime + '". Limit is ' + validatorObj[measureOfTime].min + '.';
            }

            if (!range[1] || range[1] > validatorObj[measureOfTime].max) {
                validateResponse.valid = false;
                validateResponse.message = 'Invalid value; top of range is not valid for "' + measureOfTime + '". Limit is ' + validatorObj[measureOfTime].max + '.';
            }
        } else {

            if (parseInt(value) < validatorObj[measureOfTime].min) {
                validateResponse.valid = false;
                validateResponse.message = 'Invalid value; given value is not valid for "' + measureOfTime + '". Minimum value is "' + validatorObj[measureOfTime].min + '".';
            }
            if (parseInt(value) > validatorObj[measureOfTime].max) {
                validateResponse.valid = false;
                validateResponse.message = 'Invalid value; given value is not valid for "' + measureOfTime + '". Maximum value is "' + validatorObj[measureOfTime].max + '".';
            }
        }
    }

    return validateResponse;
};

function CronBuilder (initialExpression) {
    var initialArray,
        expressionCheck;

    if (initialExpression) {
        initialArray = initialExpression.split(' ');

        // check to see if initial expression is valid
        expressionCheck = expressionStringValidator(initialArray);
        if (!expressionCheck.valid) {
            throw expressionCheck.message;
        }

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
    if (!this.expression[measureOfTime]) {
        return 'Invalid measureOfTime: Valid options are: "minute", "hour", "dayOfTheMonth", "monthOfTheYear", "dayOfTheWeek", & "year".';
    }

    if (this.expression[measureOfTime].length === 1 && this.expression[measureOfTime][0] === '*') {
        return 'The value for "' + measureOfTime + '" is already at the default "*"';
    }

    this.expression[measureOfTime] = this.expression[measureOfTime].filter(function (timeValue) {
       return value !== timeValue;
    });

    if (!this.expression[measureOfTime].length) {
        this.expression[measureOfTime] = ['*'];
    }
};

CronBuilder.prototype.get = function (measureOfTime) {
    if (!this.expression[measureOfTime]) {
        return 'Invalid measureOfTime: Valid options are: "minute", "hour", "dayOfTheMonth", "monthOfTheYear", "dayOfTheWeek", & "year".';
    }

    return this.expression[measureOfTime].join(',');
};

CronBuilder.prototype.set = function (value, measureOfTime) {
    var valueCheck;

    if (!Array.isArray(value)) {
        return 'Invalid value; Value must be in the form of an Array.';
    }

    valueCheck = valueValidator(value, measureOfTime);

    if (!valueCheck.valid) {
        return valueCheck;
    }

    this.expression[measureOfTime] = value;

    return this.expression[measureOfTime].join(',');
};

CronBuilder.prototype.getAll = function () {
    return this.expression;
};

CronBuilder.prototype.setAll = function (expToSet) {
    var expressionCheck = expressionObjectValidator(expToSet);

    if (!expressionCheck.valid) {
        return expressionCheck;
    }

    this.expression = expToSet;
};

module.exports = CronBuilder;