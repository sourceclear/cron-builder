[![Build Status](https://travis-ci.org/srcclr/cron-builder.svg)](https://travis-ci.org/srcclr/cron-builder)
# cron-builder
The software utility *cron* is a time-based scheduler in Unix-like computer operating systems. A user may use cron to schedule jobs (commands or scripts) to run periodically at fixed times, dates, or intervals. A cron statement is composed of 5 fields separated by white space. The `*` character translates to "every", ie: "every minute" or "every day of the week". 

cron-builder will manage the state of a cron expression, allowing a user to manipulate it through a simple API. It is decoupled from the DOM and doesn't have an opinion about where it's being called from. cron-builder considers [this article](https://en.wikipedia.org/wiki/Cron) its source of truth. 

### Install
cron-builder is available on npm and bower:
```
npm install cron-builder --save
```
or
```
bower install cron-builder --save
```

After installing, just require the package as you normally would:
```
var cb = require('/path/to/cron-builder.js');
```



### API
To instantiate the cron builder:

```JavaScript
// (default expression is set to "* * * * *")
var cronExp = new cb();

// optionally, pass in a cron expression to override the default:
var myCronExp = new cb('5 12 * * 1-5')
```

To return the cron expression at any given time:
```JavaScript
cronExp.build();
// '* * * * *'
```

API includes basic getters and setters:
```JavaScript
cronExp.get('minute');
// '*'
cronExp.set('minute', '5,35');
// '5,35'
cronExp.get('minute');
// '5,35'
cronExp.build();
// '5,35 * * * *'
```

Or if you'd prefer to add or remove values one at a time, use `addValue` and `removeValue`. These methods build or take away from what is currently set:
```JavaScript
cronExp.addValue('hour', '2');
cronExp.addValue('monthOfTheYear', '4');
cronExp.addValue('monthOfTheYear', '10');
cronExp.build();
// '5,35 2 * 4,10 *'

cronExp.removeValue('minute', '5');
cronExp.build();
// '35 2 * 4,10 *'
```

If you prefer to work with the expression object directly, use `getAll` and `setAll`:
```JavaScript
var exp = cronExp.getAll();
// {minute: ['35'], hour: ['2'], dayOfTheMonth: ['*'], monthOfTheYear: ['4','10'], ...}
exp.dayOfTheMonth = ['7','14','21','28'];
cronExp.setAll(exp);
cronExp.build();
// '35 2 7,14,21,28 4,10 *'
```

##### Notes:
- cron-builder does not currently support using `/` syntax to indicate values that are repeated. Instead of using `*/15`, use the verbose form `0,15,30,45`.
- cron-builder requires using numeric representations of days of the week and months of the year. So instead of using `Feb,Mar,Apr` just use `2,3,4`.

### Contribute
Easy!
```
npm install
npm test
```
Pull requests and issues appreciated!

### TODO
- more validation for things like adding values that are already included in a range, better range validations...
- sorting of values for a given measure of time

### License

The MIT License (MIT)
