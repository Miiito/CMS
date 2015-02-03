chai.should();

describe('someplugin', function() {

    describe('test()', function() {
        beforeEach(function() {
            this.sinon.spy(console, "log");
        });
        it('should console.log "someplugin.test" once', function() {
            someplugin.test();
            console.log.should.have.been.calledWith('someplugin.test');
            console.log.should.have.been.calledOnce;
        });
    });

    describe('add()', function() {
        beforeEach(function() {
            this.sinon.spy(console, "log");
        });

        leche.withData({
            'numbers': [1, 2, 3],
            'strings': ['1', '2', '12']
        }, function(first, second, result) {
            it('should console.log the result once', function() {
                someplugin.add(first, second);
                console.log.should.have.been.calledWith(result);
                console.log.should.have.been.calledOnce;
            });
        });
    });

});
