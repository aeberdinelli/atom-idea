'use babel';

import Promise from 'promise';
import read from './read';

var types = ['bool','boolean','string','array','mixed','object','void'];
var modif = ['public','private','protected','static'];

var regexp = {
    'return': new RegExp("\\*(\\s)?(\@)(return)\\s?(" + types.join('|') + ")?([^\n]+)", "i"),
    'param': /\\*([ \s])?@param([ \s])([a-z0-9_\-]*)[ \s](\$[a-z\-_0-9]+)(.*)?/i,
    'function': new RegExp("(" + modif.join('|') + ")?([ \s])?function([ \s])(.*)", "ig"),
    'namespace': '',
    'use': '',
    '_class': /class([ \s]+)([a-z0-9]+)/ig,
    'const': ''
};

export default (archivo) => {
    var this_class = '';

    return read(archivo).then(buffer => {
        var lineas = buffer.toString().split("\n");
        var es_documentacion = false;
        var wait = false;
        var line = 0;
        var declarations = [];

        lineas.forEach(linea => {
            line++;

            var ultima = (declarations.length < 1 ? 1 : declarations.length) - 1;
            var short = linea.trim();

            // Beginning of documentation
            if (short.substr(0,3) == '/**')
            {
                es_documentacion = true;

                declarations.push({
                    'name': '',
                    'parameters': [],
                    'return': {
                        'type': '',
                        'description': ''
                    },
                    'line': 0,
                    '_class': this_class,
                    'url': archivo,
                    'type': 'function',
                    'description': ''
                });
            }
            // End of documentation
            else if (es_documentacion && short.substr(0,2) == '*/')
            {
                es_documentacion = false;
                wait = true;
            }
            // Capture the name of the function
            else if (wait)
            {
                var lastone = declarations.length - 1;

                if (short.trim() != '' && declarations[lastone].name == '')
                {
                    if (short.indexOf('function') > -1 && short.indexOf('@') == -1 && short.indexOf('*') == -1)
                    {
                        var limpio = short.replace(new RegExp("(" + modif.join('|') + ")", "i"), '').replace('function', '').trim();
                        var parts = limpio.split('(');

                        if (parts[0] != '')
                        {
                            declarations[lastone].name = parts[0].trim();
                            declarations[lastone].line = line;
                        }

                        wait = false;
                    }
                }
            }
            // Part of documentation
            else
            {
                var lastone = declarations.length - 1;

                // Return type
                if (regexp['return'].test(short))
                {
                    var parts = short.match(regexp['return']);

                    if (types.indexOf(parts[5]) > -1)
                    {
                        declarations[lastone]['return'].type = parts[5].trim();
                    }
                }
                // Parameter
                else if (regexp['param'].test(short))
                {
                    var parts = short.match(regexp['param']);

                    declarations[lastone].parameters.push({
                        'name': parts[4].trim(),
                        'type': parts[3],
                        'description': (parts[5] && parts[5] != '') ? parts[5].trim() : ''
                    });
                }
                // A class definition
                else if (regexp['_class'].test(short))
                {
                    var parts = short.match(regexp['_class']);
                    var parts2 = parts[0].split(' ');

                    this_class = parts2[1];
                }
                // Description?
                else if (declarations[lastone] && short.indexOf('*') > -1 && short.indexOf('@') == -1 && es_documentacion)
                {
                    declarations[lastone].description = short.replace(/\*/, '').trim();
                }
            }
        });

        return Promise.resolve(declarations);
    })
    .then(declarations => {
        return Promise.resolve(declarations.filter(d => {
            return (d.name != '' && (d.parameters.length > 0 || d['return'].type != '' || d['return'].description != ''));
        }));
    })
    .catch(err => console.error(err));
}
