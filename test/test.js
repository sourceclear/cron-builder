var chai = require('chai'),
    expect = chai.expect,
    cb = require('../cron-builder.js');

describe('cron-builder', function () {
    var cron;

    it('defaults to "* * * * *" when initialized without arguments', function () {
        cron = new cb();
        expect(cron.expression.minute).to.eql(['*']);
        expect(cron.expression.hour).to.eql(['*']);
        expect(cron.expression.dayOfTheMonth).to.eql(['*']);
        expect(cron.expression.monthOfTheYear).to.eql(['*']);
        expect(cron.expression.dayOfTheWeek).to.eql(['*']);
    });

    it('returns a working cron expression when calling .build()', function () {
        expect(cron.build()).to.equal('* * * * *');
    });

    it('sets a single value', function () {
        cron = new cb();
        expect(cron.set(['5'], 'hour')).to.equal('5');
        expect(cron.build()).to.equal('* 5 * * *');
    });

    it('sets multiple values at once', function () {
        cron = new cb();
        expect(cron.set(['0', '10', '20', '30', '40', '50'], 'minute')).to.equal('0,10,20,30,40,50');
        expect(cron.build()).to.equal('0,10,20,30,40,50 * * * *');
    });

    it('sets a range', function () {
        cron = new cb();
        expect(cron.set(['5-7'], 'dayOfTheWeek')).to.equal('5-7');
        expect(cron.build()).to.equal('* * * * 5-7');
    });

    it('multiple sets build the cron string accurately', function () {
        cron = new cb();
        cron.set(['10', '30', '50'], 'minute');
        cron.set(['6', '18'], 'hour');
        cron.set(['1', '15'], 'dayOfTheMonth');
        cron.set(['1-5'], 'dayOfTheWeek');
        expect(cron.build()).to.equal('10,30,50 6,18 1,15 * 1-5');
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
        expect(function () { cron.set(['!'], 'hour') }).to.throw(Error);
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

    it('returns the entire expression object when getAll is called', function () {
        cron = new cb();
        var getAllResponse = cron.getAll();
        expect(getAllResponse).to.be.an('object');
        expect(getAllResponse).to.have.property('minute').that.is.an('array').with.deep.property('[0]').that.deep.equals('*');
        expect(getAllResponse).to.have.property('hour').that.is.an('array').with.deep.property('[0]').that.deep.equals('*');
        expect(getAllResponse).to.have.property('dayOfTheMonth').that.is.an('array').with.deep.property('[0]').that.deep.equals('*');
        expect(getAllResponse).to.have.property('monthOfTheYear').that.is.an('array').with.deep.property('[0]').that.deep.equals('*');
        expect(getAllResponse).to.have.property('dayOfTheWeek').that.is.an('array').with.deep.property('[0]').that.deep.equals('*');
    });

    it('sets the entire object when setAll is called', function () {
        cron = new cb();
        var getAllResponse = cron.getAll();
        getAllResponse.hour = ['13'];
        getAllResponse.monthOfTheYear = ['1-6'];
        getAllResponse.dayOfTheWeek = ['1,3,5,7'];
        cron.setAll(getAllResponse);
        expect(cron.build()).to.equal('* 13 * 1-6 1,3,5,7');
    });

    it('validates setting all with too many keys in the expression object', function () {
        cron = new cb();
        var getAllResponse = cron.getAll();
        getAllResponse.tooManyMeasuresOfTime = ['13'];
        expect(function () { cron.setAll(getAllResponse) }).to.throw(Error);
    });

    it('validates setting with an incorrect value with setAll', function () {
        cron = new cb();
        var getAllResponse = cron.getAll();
        getAllResponse.hour = ['28'];
        expect(function () { cron.setAll(getAllResponse) }).to.throw(Error);
    });

    it('adds a value to a measureOfTime that is set to "*"', function () {
        cron = new cb();
        cron.addValue('5', 'minute');
        expect(cron.get('minute')).to.equal('5');
        expect(cron.build()).to.equal('5 * * * *');
    });

    it('adds a value to a measure of time that has been set to a number', function () {
        cron = new cb();
        cron.addValue('5', 'hour');
        cron.addValue('10', 'hour');
        expect(cron.get('hour')).to.equal('5,10');
    });

    it('validates duplicate values', function () {
        cron = new cb();
        cron.addValue('5', 'dayOfTheMonth');
        cron.addValue('15', 'dayOfTheMonth');
        cron.addValue('5', 'dayOfTheMonth');
        expect(cron.get('dayOfTheMonth')).to.equal('5,15');
    });

    it('validates an invalid value when adding', function () {
        cron = new cb();
        expect(function () { cron.addValue('62', 'minute') }).to.throw(Error);
    });

    it('removes a value that exists with other values', function () {
        cron = new cb();
        cron.set(['2', '4'], 'dayOfTheWeek');
        cron.removeValue('4', 'dayOfTheWeek');
        expect(cron.get('dayOfTheWeek')).to.equal('2');
    });

    it('resets the value to the default "*" when removing the only value', function () {
        cron = new cb();
        cron.set(['7'], 'minute');
        cron.removeValue('7', 'minute');
        expect(cron.get('minute')).to.equal('*');
    });

    it('validates an invalid measure of time when removing a value', function () {
        cron = new cb();
        expect(function () { cron.removeValue('ninute') }).to.throw(Error);
    });

    it('accepts a cron expression when instantiating', function () {
        cron = new cb('30 0-6 * * 1-5');
        expect(cron.build()).to.equal('30 0-6 * * 1-5');
    });

    it('validates bad values when instantiating with an explicit expression', function () {
        expect(function () { cron = new cb('30 0-6 * * 1-10') }).to.throw(Error);
    });

    it('validates an expression that is too long when instantiating with an explicit expression', function () {
        expect(function () { cron = new cb('30 0-6 * * 1-5 * *') }).to.throw(Error);
    });
});
