'use babel';

import debug from 'debug';
import path from 'path';
import fs from 'fs';

var soportados = ['.php']

// prepare the above extensions for the regexp
.map(item => item.replace('.','\\.'));

var done = (err, resultados, cb) => {
    if (err)
    {
        return err;
    }

    // remove the files that we don't support
    return cb(err, resultados.filter(item => {
        var partes = item.split("/");
        return (new RegExp("^(.*)(" + soportados.join('|') + ")$","i").test(partes[partes.length - 1]));
    }));
}

// walk through a directory and get every file
export default (dir, callback) => {
    var resultados = [];

    fs.readdir(dir, (err, list) => {
        if (err)
        {
            return done(err);
        }

        var pending = list.length;
        if (!pending)
        {
            return done(null, resultados, callback);
        }

        list.forEach(file => {
            file = path.resolve(dir, file);

            fs.stat(file, (err, stat) => {
                if (stat && stat.isDirectory())
                {
                    walk(file, (err, res) => {
                        resultados = resultados.concat(res);

                        if (!--pending)
                        {
                            done(null, resultados, callback);
                        }
                    });
                }
                else
                {
                    resultados.push(file);

                    if (!--pending)
                    {
                        done(null, resultados, callback);
                    }
                }
            });
        });
    });
}
