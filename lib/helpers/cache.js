var Promise = require('promise');
var fs      = require('fs');
var fsp     = require('fs-promise');
var path    = require('path');
var debug   = require('debug');
var touch   = require('touch');

var ubicacion = process.env.UBICACION || '/home/alan.berdinelli/dev/walker/cache/';

module.exports = function(archivo, json) {
    try
    {
        touch(path.join(ubicacion, archivo.replace(/\//g, '_') + '.json'), {}, function() {
            return fsp.writeFile(path.join(ubicacion, archivo.replace(/\//g, '_') + '.json'), json);
        });
    }
    catch (e) {
        console.log(e);

        return Promise.reject(e);
    }
}
