'use babel';

var Promise = require('promise');
var fs = require('fs');

export default (src) => {
    var s = src;

    return new Promise((resolve, reject) => {
        try
        {
            return resolve(fs.readFileSync(s));
        }
        catch (e)
        {
            return reject(e);
        }
    });
}
