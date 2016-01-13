var DEFAULT_INTERVAL = ['*'];

var CronValidator = (function() {
    /**
     * Contains the position-to-name mapping of the cron expression
     * @type {Object}
     * @const
     */
    var MeasureOfTimeMap = {
            0: 'minute',
            1: 'hour',
            2: 'dayOfTheMonth',
            3: 'month',
            4: 'dayOfTheWeek'
        },
        /**
         * contains every permissible 'measureOfTime' string constant
         * @const
         * @type {Array}
         */
        MeasureOfTimeValues = Object.keys(MeasureOfTimeMap).map(function (key) {
            return MeasureOfTimeMap[key];
        });

    /**
     * validates a given cron expression (object) for length, then calls validateValue on each value
     * @param {!{
        minute: Array.string,
        hour: Array.string,
        dayOfTheMonth: Array.string,
        month: Array.string,
        dayOfTheWeek: Array.string,
     * }} expression - rich object containing the state of the cron expression
     * @throws {Error} if expression contains more than 5 keys
     */
    var validateExpression = function(expression) {
        // don't care if it's less than 5, we'll just set those to the default '*'
        if (Object.keys(expression).length > 5) {
            throw new Error('Invalid cron expression; limited to 5 values.');
        }

        for (var measureOfTime in expression) {
            if (expression.hasOwnProperty(measureOfTime)) {
                this.validateValue(measureOfTime, expression[measureOfTime]);
            }
        }
    },

    /**
     * validates a given cron expression (string) for length, then calls validateValue on each value
     * @param {!String} expression - an optionally empty string containing at most 5 space delimited expressions.
     * @throws {Error} if the string contains more than 5 space delimited parts.
     */
    validateString = function(expression) {
        var splitExpression = expression.split(' ');

        if (splitExpression.length > 5) {
            throw new Error('Invalid cron expression; limited to 5 values.');
        }

        for (var i = 0; i < splitExpression.length; i++) {
            this.validateValue(MeasureOfTimeMap[i], splitExpression[i]);
        }
    },

    /**
     * validates any given measureOfTime and corresponding value
     * @param {!String} measureOfTime - as expected
     * @param {!String} value - the cron-ish interval specifier
     * @throws {Error} if measureOfTime is bogus
     * @throws {Error} if value contains an unsupported character
     */
    validateValue = function(measureOfTime, value) {
        var validatorObj = {
                minute:        {min: 0, max: 59},
                hour:          {min: 0, max: 23},
                dayOfTheMonth: {min: 1, max: 31},
                month:         {min: 1, max: 12},
                dayOfTheWeek:  {min: 1, max: 7}
            },
            range,
            validChars = /^[0-9*-]/;

        if (!validatorObj[measureOfTime]) {
            throw new Error('Invalid measureOfTime; Valid options are: ' + MeasureOfTimeValues.join(', '));
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
    };


    return {
        measureOfTimeValues: MeasureOfTimeValues,
        validateExpression: validateExpression,
        validateString: validateString,
        validateValue: validateValue
    }
}());


/**
 * Initializes a CronBuilder with an optional initial cron expression.
 * @param {String=} initialExpression - if provided, it must be up to 5 space delimited parts
 * @throws {Error} if the initialExpression is bogus
 * @constructor
 */
var CronBuilder = (function() {
    function CronBuilder(initialExpression) {
        var splitExpression,
            expression;

        if (initialExpression) {
            CronValidator.validateString(initialExpression);

            splitExpression = initialExpression.split(' ');
            // check to see if initial expression is valid

            expression = {
                minute:        splitExpression[0] ? [splitExpression[0]] : DEFAULT_INTERVAL,
                hour:          splitExpression[1] ? [splitExpression[1]] : DEFAULT_INTERVAL,
                dayOfTheMonth: splitExpression[2] ? [splitExpression[2]] : DEFAULT_INTERVAL,
                month:         splitExpression[3] ? [splitExpression[3]] : DEFAULT_INTERVAL,
                dayOfTheWeek:  splitExpression[4] ? [splitExpression[4]] : DEFAULT_INTERVAL,
            };
        } else {
            expression = {
                minute: DEFAULT_INTERVAL,
                hour: DEFAULT_INTERVAL,
                dayOfTheMonth: DEFAULT_INTERVAL,
                month: DEFAULT_INTERVAL,
                dayOfTheWeek: DEFAULT_INTERVAL,
            };
        }

        /**
         * builds a working cron expression based on the state of the cron object
         * @returns {string} - working cron expression
         */
        this.build = function () {
            return [
                expression.minute.join(','),
                expression.hour.join(','),
                expression.dayOfTheMonth.join(','),
                expression.month.join(','),
                expression.dayOfTheWeek.join(','),
            ].join(' ');
        };

        /**
         * adds a value to what exists currently (builds)
         * @param {!String} measureOfTime
         * @param {!Number} value
         * @throws {Error} if measureOfTime or value fail validation
         */
        this.addValue = function (measureOfTime, value) {
            CronValidator.validateValue(measureOfTime, value);

            if (expression[measureOfTime].length === 1 && expression[measureOfTime][0] === '*') {
                expression[measureOfTime] = [value];
            } else {
                if (expression[measureOfTime].indexOf(value) < 0) {
                    expression[measureOfTime].push(value);
                }
            }
        };

        /**
         * removes a single explicit value (subtracts)
         * @param {!String} measureOfTime - as you might guess
         * @param {!String} value - the offensive value
         * @throws {Error} if measureOfTime is bogus.
         */
        this.removeValue = function (measureOfTime, value) {
            if (!expression[measureOfTime]) {
                throw new Error('Invalid measureOfTime: Valid options are: ' + CronValidator.measureOfTimeValues.join(', '));
            }

            if (expression[measureOfTime].length === 1 && expression[measureOfTime][0] === '*') {
                return 'The value for "' + measureOfTime + '" is already at the default value of "*" - this is a no-op.';
            }

            expression[measureOfTime] = expression[measureOfTime].filter(function (timeValue) {
               return value !== timeValue;
            });

            if (!expression[measureOfTime].length) {
                expression[measureOfTime] = DEFAULT_INTERVAL;
            }
        };

        /**
         * returns the current state of a given measureOfTime
         * @param {!String} measureOfTime one of "minute", "hour", etc
         * @returns {!String} comma separated blah blah
         * @throws {Error} if the measureOfTime is not one of the permitted values.
         */
        this.get = function (measureOfTime) {
            if (!expression[measureOfTime]) {
                throw new Error('Invalid measureOfTime: Valid options are: ' + CronValidator.measureOfTimeValues.join(', '));
            }

            return expression[measureOfTime].join(',');
        };

        /**
         * sets the state of a given measureOfTime
         * @param {!String} measureOfTime - yup
         * @param {!Array.<String>} value - the 5 tuple array of values to set
         * @returns {!String} the comma separated version of the value that you passed in
         * @throws {Error} if your "value" is not an Array&lt;String&gt;
         * @throws {Error} when any item in your value isn't a legal cron-ish descriptor
         */
        this.set = function (measureOfTime, value) {
            if (!Array.isArray(value)) {
                throw new Error('Invalid value; Value must be in the form of an Array.');
            }

            for(var i = 0; i < value.length; i++) {
                CronValidator.validateValue(measureOfTime, value[i]);
            }

            expression[measureOfTime] = value;

            return expression[measureOfTime].join(',');
        };

        /**
         * Returns a rich object that describes the current state of the cron expression.
         * @returns {!{
            minute: Array.string,
            hour: Array.string,
            dayOfTheMonth: Array.string,
            month: Array.string,
            dayOfTheWeek: Array.string,
         * }}
         */
        this.getAll = function () {
            return expression;
        };

        /**
         * sets the state for the entire cron expression
         * @param {!{
            minute: Array.string,
            hour: Array.string,
            dayOfTheMonth: Array.string,
            month: Array.string,
            dayOfTheWeek: Array.string,
         * }} expToSet - the entirety of the cron expression.
         * @throws {Error} as usual
         */
        this.setAll = function (expToSet) {
            CronValidator.validateExpression(expToSet);

            expression = expToSet;
        };
    }

    return CronBuilder;
}());

module.exports = CronBuilder;