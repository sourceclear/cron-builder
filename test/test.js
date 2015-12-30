var chai = require('chai'),
    expect = chai.expect,
    cb = require('../cron-builder.js');

describe('cron-builder', function () {
    var cron;

    it('defaults to "* * * * * *" when initialized without arguments', function () {
        cron = new cb();
        expect(cron.expression.minute).to.eql(['*']);
        expect(cron.expression.hour).to.eql(['*']);
        expect(cron.expression.dayOfTheMonth).to.eql(['*']);
        expect(cron.expression.monthOfTheYear).to.eql(['*']);
        expect(cron.expression.dayOfTheWeek).to.eql(['*']);
        expect(cron.expression.year).to.eql(['*']);
    });

    it('returns a working cron expression when calling .build()', function () {
        expect(cron.build()).to.equal('* * * * * *');
    });

    it('sets a single value', function () {
        cron = new cb();
        expect(cron.set(['5'], 'hour')).to.equal('5');
        expect(cron.build()).to.equal('* 5 * * * *');
    });

    it('sets multiple values at once', function () {
        cron = new cb();
        expect(cron.set(['0', '10', '20', '30', '40', '50'], 'minute')).to.equal('0,10,20,30,40,50');
        expect(cron.build()).to.equal('0,10,20,30,40,50 * * * * *');
    });

    it('sets a range', function () {
        cron = new cb();
        expect(cron.set(['5-7'], 'dayOfTheWeek')).to.equal('5-7');
        expect(cron.build()).to.equal('* * * * 5-7 *');
    });

    it('multiple sets build the cron string accurately', function () {
        cron = new cb();
        cron.set(['10', '30', '50'], 'minute');
        cron.set(['6', '18'], 'hour');
        cron.set(['1', '15'], 'dayOfTheMonth');
        cron.set(['1-5'], 'dayOfTheWeek');
        cron.set(['2015-2025'], 'year');
        expect(cron.build()).to.equal('10,30,50 6,18 1,15 * 1-5 2015-2025');
    });

    it('validates against setting an incorrect measureOfTime', function () {
        cron = new cb();
        expect(function () { cron.set(['5'], 'minutes') }).to.throw(Error);
    });

    it('validates against setting a value that is not an Array', function () {
        cron = new cb();
        expect(function () { cron.set('10', 'hour') }).to.throw(Error);
    });

    it('validates against setting a value that is not a number or range of numbers', function () {
        cron = new cb();
        expect(function () { cron.set(['!'], 'year') }).to.throw(Error);
    });

    describe('validates against setting values outside the valid range', function () {
        it('validates against values too low', function () {
            cron = new cb();
            expect(function () { cron.set(['0'], 'dayOfTheWeek') }).to.throw(Error);
        });

        it('validates against values too high', function () {
            cron = new cb();
            expect(function () { cron.set(['100'], 'hour') }).to.throw(Error);
        });

        it('validates against setting a range that is out of bounds', function () {
            cron = new cb();
            expect(function () { cron.set(['1834-2015'], 'year') }).to.throw(Error);

            expect(function () { cron.set(['20-60'], 'minute') }).to.throw(Error);

            expect(function () { cron.set(['12', '22-26', '15'], 'hour') }).to.throw(Error);
        });
    });

    it('gets a single value', function () {
        cron = new cb();
        cron.set(['30'], 'minute');
        expect(cron.get('minute')).to.equal('30');
    });

    it('validates against getting with an invalid measureOfTime', function () {
        cron = new cb();
        expect(function () { cron.get('hours'); }).to.throw(Error);
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
