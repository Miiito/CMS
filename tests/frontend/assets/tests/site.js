chai.should();

describe('someplugin', function() {
    describe('test()', function() {
        it('should return "someplugin.test"', function() {
            var result = someplugin.test();
            result.should.be.a('string');
            result.should.equal('someplugin.test')
        });
    });
});
