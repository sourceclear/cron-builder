[![Build Status](https://travis-ci.org/srcclr/cron-builder.svg)](https://travis-ci.org/srcclr/cron-builder)
# cron-builder
cron-builder will manage the state of a cron expression allowing a user to manipulate it through a simple API. It is decoupled from the DOM and doesn't have an opinion about where it's being called from. cron-builder uses [this article](https://en.wikipedia.org/wiki/Cron) as a source of truth.

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
cronExp.set('5,35', 'minute');
// '5,35'
cronExp.get('minute');
// '5,35'
cronExp.build();
// '5,35 * * * *'
```

Add or remove values one at a time:
```JavaScript
cronExp.addValue('2', 'hour');
cronExp.addValue('4', 'monthOfTheYear');
cronExp.addValue('10', 'monthOfTheYear');
cronExp.build();
// '5,35 2 * 4,10 *'

cronExp.removeValue('5', 'minute');
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
