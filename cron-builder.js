var DEFAULT_INTERVAL = ['*'];

var CronValidator = (function() {

    var validateExpression = function(expression) {
        // don't care if it's less than 6, we'll just set those to the default '*'
        if (Object.keys(expression).length > 6) {
            throw new Error('Invalid cron expression; limited to 5 values.');
        }

        for (var measureOfTime in expression) {
            if (expression.hasOwnProperty(measureOfTime)) {
                this.validateValue(measureOfTime, expression[measureOfTime]);
            }
        }
    },

    validateString = function(expression) {
        var measureOfTimeMap = {
                0: 'minute',
                1: 'hour',
                2: 'dayOfTheMonth',
                3: 'month',
                4: 'dayOfTheWeek'
            },
            splitExpression = expression.split(' ');

        if (splitExpression.length > 6) {
            throw new Error('Invalid cron expression; limited to 5 values.');
        }

        for (var i = 0; i < splitExpression.length; i++) {
            this.validateValue(measureOfTimeMap[i], splitExpression[i]);
        }
    },

    validateValue = function(measureOfTime, value) {
        var validatorObj = {
                minute: {min: 0, max: 59},
                hour: {min: 0, max: 23},
                dayOfTheMonth: {min: 1, max: 31},
                month: {min: 1, max: 12},
                dayOfTheWeek: {min: 1, max: 7}
            },
            range,
            validChars = /^[0-9*-]/;

        if (!validatorObj[measureOfTime]) {
            throw new Error('Invalid measureOfTime; Valid options are: "minute", "hour", "dayOfTheMonth", "month", & "dayOfTheWeek".');
        }

        if (!validChars.test(value)) {
            throw new Error('Invalid value; Only numbers 0-9, "-", and "*" chars are allowed');
        }

        if (value !== '*') {
            // check to see if value is within range if value is not '*'
            if (value.indexOf('-') >= 0) {
                // value is a range and must be split into high and low
                range = value.split('-');
                if (!range[0] || range[0] < validatorObj[measureOfTime].min) {
                    throw new Error('Invalid value; bottom of range is not valid for "' + measureOfTime + '". Limit is ' + validatorObj[measureOfTime].min + '.');
                }

                if (!range[1] || range[1] > validatorObj[measureOfTime].max) {
                    throw new Error('Invalid value; top of range is not valid for "' + measureOfTime + '". Limit is ' + validatorObj[measureOfTime].max + '.');
                }
            } else {

                if (parseInt(value) < validatorObj[measureOfTime].min) {
                    throw new Error('Invalid value; given value is not valid for "' + measureOfTime + '". Minimum value is "' + validatorObj[measureOfTime].min + '".');
                }
                if (parseInt(value) > validatorObj[measureOfTime].max) {
                    throw new Error('Invalid value; given value is not valid for "' + measureOfTime + '". Maximum value is "' + validatorObj[measureOfTime].max + '".');
                }
            }
        }
    }


    return {
        validateExpression: validateExpression,
        validateString: validateString,
        validateValue: validateValue
    }
}());

var CronBuilder = function(initialExpression) {
    var splitExpression;
    if (initialExpression) {
        CronValidator.validateString(initialExpression);

        splitExpression = initialExpression.split(' ');
        // check to see if initial expression is valid

        this.expression = {
            minute: splitExpression[0] ? [splitExpression[0]] : DEFAULT_INTERVAL,
            hour: splitExpression[1] ? [splitExpression[1]] : DEFAULT_INTERVAL,
            dayOfTheMonth: splitExpression[2] ? [splitExpression[2]] : DEFAULT_INTERVAL,
            month: splitExpression[3] ? [splitExpression[3]] : DEFAULT_INTERVAL,
            dayOfTheWeek: splitExpression[4] ? [splitExpression[4]] : DEFAULT_INTERVAL,
        };
    } else {
        this.expression = {
            minute: DEFAULT_INTERVAL,
            hour: DEFAULT_INTERVAL,
            dayOfTheMonth: DEFAULT_INTERVAL,
            month: DEFAULT_INTERVAL,
            dayOfTheWeek: DEFAULT_INTERVAL,
        };
    }
}

CronBuilder.prototype.build = function () {
    return [
        this.expression.minute.join(','),
        this.expression.hour.join(','),
        this.expression.dayOfTheMonth.join(','),
        this.expression.month.join(','),
        this.expression.dayOfTheWeek.join(','),
    ].join(' ');
};

CronBuilder.prototype.addValue = function (measureOfTime, value) {
    CronValidator.validateValue(measureOfTime, value);

    if (this.expression[measureOfTime].length === 1 && this.expression[measureOfTime][0] === '*') {
        this.expression[measureOfTime] = [value];
    } else {
        if (this.expression[measureOfTime].indexOf(value) < 0) {
            this.expression[measureOfTime].push(value);
        }
    }
};

CronBuilder.prototype.removeValue = function (measureOfTime, value) {
    if (!this.expression[measureOfTime]) {
        throw new Error('Invalid measureOfTime: Valid options are: "minute", "hour", "dayOfTheMonth", "month", & "dayOfTheWeek".');
    }

    if (this.expression[measureOfTime].length === 1 && this.expression[measureOfTime][0] === '*') {
        return 'The value for "' + measureOfTime + '" is already at the default value of "*" - this is a no-op.';
    }

    this.expression[measureOfTime] = this.expression[measureOfTime].filter(function (timeValue) {
       return value !== timeValue;
    });

    if (!this.expression[measureOfTime].length) {
        this.expression[measureOfTime] = DEFAULT_INTERVAL;
    }
};

CronBuilder.prototype.get = function (measureOfTime) {
    if (!this.expression[measureOfTime]) {
        throw new Error('Invalid measureOfTime: Valid options are: "minute", "hour", "dayOfTheMonth", "month", & "dayOfTheWeek".');
    }

    return this.expression[measureOfTime].join(',');
};

CronBuilder.prototype.set = function (measureOfTime, value) {
    if (!Array.isArray(value)) {
        throw new Error('Invalid value; Value must be in the form of an Array.');
    }

    for(var i = 0; i < value.length; i++) {
        CronValidator.validateValue(measureOfTime, value[i]);
    }

    this.expression[measureOfTime] = value;

    return this.expression[measureOfTime].join(',');
};

CronBuilder.prototype.getAll = function () {
    return this.expression;
};

CronBuilder.prototype.setAll = function (expToSet) {
    CronValidator.validateExpression(expToSet);

    this.expression = expToSet;
};

module.exports = CronBuilder;