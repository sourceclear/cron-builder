var chai = require('chai'),
    expect = chai.expect,
    cb = require('../cron-builder.js');

describe('cron-builder', function () {
    var cron;

    it('defaults to "* * * * * *" when initialized without arguements', function () {
        cron = new cb();
        expect(cron.build()).to.equal('* * * * * *');
    });
});

//var cb = require('./cron-builder.js'),
//    test,
//    test2,
//    test2Exp;
//
//// init with default values ('* * * * * *')
//test = new cb();
//console.log('test init: ', test.build());
//
//test.addValue('3', 'minute');
//test.addValue('56', 'minute'); // test multiple values
//test.addValue('6', 'minutes'); // test spelling error
//
//test.addValue('1', 'hour');
//test.addValue('5', 'hour'); // test multiple values
//test.addValue('5', 'hour'); // test duplicates
//test.addValue('6-24', 'hour');
//
//test.addValue('26', 'dayOfTheMonth');
//
//test.addValue('7', 'monthOfTheYear');
//
//test.addValue('5', 'dayOfTheWeek');
//
//test.addValue('2016', 'year');
//
//console.log('after adding values: ', test.build());
//
//test.removeValue('6-24', 'hour');
//test.removeValue('6-24', 'hour');
//
//test.removeValue('2016', 'year');
//console.log('after removing values: ', test.build());
//
//console.log('getting minutes values: ', test.get('minute'));
//
//console.log('setting new minutes', test.set(['13', '26', '54-57'], 'minute'));
//test.set('5,6,7', 'dayOfTheMonth');
//test.set(['1-6'], 'dayoftheweek');
//
//console.log('test final build', test.build());
//
//// test with explicit values
//test2 = new cb('34 1 * *');
//
//console.log('test2 init', test2.build());
//
//test2Exp = test2.getAll();
//console.log('test2Exp', test2Exp);
//
//// validation test for too many values
//test2Exp.extraUnit = ['1'];
//console.log('error, exp too long', test2.setAll(test2Exp))
//
//// validation test for bad values while using setAll
//test2Exp = test2.getAll();
//
//
//
//console.log('test2 final build', test2.build());
