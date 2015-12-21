# cron-builder
A simple JavaScript module for building cron expressions.

### API
To initialize the cron builder (default expression is set to `* * * * * *`)

```JavaScript
var cb = require('/path/to/cron-builder.js'),
    cronExp = new cb();
```

To return the cron expression at any given time:
```JavaScript
cronExp.build();
// '* * * * * *'
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
// '5,35 * * * * *'
```

Add or remove values one at a time:
```JavaScript
cronExp.addValue('2', 'hour');
cronExp.addValue('4', 'monthOfTheYear');
cronExp.addValue('10', 'monthOfTheYear');
cronExp.build();
// '5,35 2 * 4,10 * *'

cronExp.removeValue('5', 'minute');
cronExp.build();
// '35 2 * 4,10 * *'
```

If you prefer to work with the expression object directly, use `getAll` and `setAll`:
```JavaScript
var exp = cronExp.getAll();
// {minute: ['35'], hour: ['2'], dayOfTheMonth: ['*'], monthOfTheYear: ['4','10'], ...}
exp.dayOfTheMonth = ['7','14','21','28'];
cronExp.setAll(exp);
cronExp.build();
// '35 2 7,14,21,28 4,10 * *'
```
