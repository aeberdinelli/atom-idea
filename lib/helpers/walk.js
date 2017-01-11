'use babel';

import debug from 'debug';
import path from 'path';
import fs from 'fs';

var supported = ['.php']

// prepare the above extensions for the regexp
.map(item => item.replace('.','\\.'));

var done = (err, results, cb) => {
    if (err)
    {
        return err;
    }

    // remove the files that we don't support
    return cb(err, results.filter(item => {
        var partes = item.split("/");
        return (new RegExp("^(.*)(" + supported.join('|') + ")$","i").test(partes[partes.length - 1]));
    }));
}

// walk through a directory and get every file
var walk = (dir, callback) => {
    var results = [];

    fs.readdir(dir, (err, list) => {
        if (err)
        {
            return done(err);
        }

        var pending = list.length;
        if (!pending)
        {
            return done(null, results, callback);
        }

        list.forEach(file => {
            file = path.resolve(dir, file);

            fs.stat(file, (err, stat) => {
                if (stat && stat.isDirectory())
                {
                    walk(file, (err, res) => {
                        results = results.concat(res);

                        if (!--pending)
                        {
                            done(null, results, callback);
                        }
                    });
                }
                else
                {
                    results.push(file);

                    if (!--pending)
                    {
                        done(null, results, callback);
                    }
                }
            });
        });
    });
}

export default walk;
