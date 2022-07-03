const cryptoHash = require("./crypto-hash");

describe('cryptoHash()', () => {
    it('takes a parameter and generates a SHA-256 hash of it', () => {
        expect(cryptoHash('test string'))
            .toEqual('ee68a16fef8bf44a2b86b5614554b4079820f98dea14a67c3b507f59333cd591');
    });

    it('has the same result for same arguments, regardless of order', () => {
        expect(cryptoHash('a', 'b', 'c')).toEqual(cryptoHash('b', 'c', 'a'));
    });

    it('produces an unique hash when the properties of the input have changed', () => {
        const obj = {};
        const originalHash = cryptoHash(obj);
        obj['test'] = 'test';

        expect(cryptoHash(obj)).not.toEqual(originalHash);
    });
});