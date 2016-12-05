'use babel';

import Promise from 'promise';
import read from './read';

var tipos = ['bool','boolean','string','array','mixed','object','void'];
var modif = ['public','private','protected','static'];

var regexp = {
    'return': new RegExp("\\*(\\s)?(\@)(return)\\s?(" + tipos.join('|') + ")?([^\n]+)", "i"),
    'param': /\\*([ \s])?@param([ \s])([a-z0-9_\-]*)[ \s](\$[a-z\-_0-9]+)(.*)?/i,
    'function': new RegExp("(" + modif.join('|') + ")?([ \s])?function([ \s])(.*)", "ig"),
    'namespace': '',
    'class': '',
    'const': ''
};

export default (archivo) => {
    return read(archivo).then(buffer => {
        var lineas = buffer.toString().split("\n");
        var es_documentacion = false;
        var esperar = false;
        var line = 0;
        var declaraciones = [];

        lineas.forEach(linea => {
            line++;

            var ultima = (declaraciones.length < 1 ? 1 : declaraciones.length) - 1;
            var short = linea.trim();

            // Beginning of documentation
            if (short.substr(0,3) == '/**')
            {
                es_documentacion = true;

                declaraciones.push({
                    'name': '',
                    'parameters': [],
                    'return': {
                        'type': '',
                        'description': ''
                    },
                    'line': 0,
                    'url': archivo,
                    'type': 'function',
                    'description': ''
                });
            }
            // End of documentation
            else if (es_documentacion && short.substr(0,2) == '*/')
            {
                es_documentacion = false;
                esperar = true;
            }
            // Capture the name of the function
            else if (esperar)
            {
                if (short.trim() != '' && declaraciones[declaraciones.length - 1].name == '')
                {
                    if (short.indexOf('function') > -1 && short.indexOf('@') == -1 && short.indexOf('*') == -1)
                    {
                        var limpio = short.replace(new RegExp("(" + modif.join('|') + ")", "i"), '').replace('function', '').trim();
                        var partes = limpio.split('(');

                        if (partes[0] != '')
                        {
                            declaraciones[declaraciones.length - 1].name = partes[0].trim();
                            declaraciones[declaraciones.length - 1].line = line;
                        }

                        esperar = false;
                    }
                }
            }
            // Part of documentation
            else
            {
                // Return type
                if (regexp['return'].test(short))
                {
                    var partes = short.match(regexp['return']);

                    if (tipos.indexOf(partes[5]) > -1)
                    {
                        declaraciones[declaraciones.length - 1]['return'].type = partes[5].trim();
                    }
                }
                // Parameter
                else if (regexp['param'].test(short))
                {
                    var partes = short.match(regexp['param']);

                    declaraciones[declaraciones.length - 1].parameters.push({
                        'name': partes[4].trim(),
                        'type': partes[3],
                        'description': (partes[5] && partes[5] != '') ? partes[5].trim() : ''
                    });
                }
                // Description?
                else if (declaraciones[declaraciones.length - 1] && short.indexOf('*') > -1 && short.indexOf('@') == -1 && es_documentacion)
                {
                    declaraciones[declaraciones.length - 1].description = short.replace(/\*/, '').trim();
                }
            }
        });

        return Promise.resolve(declaraciones);
    })
    .then(declaraciones => {
        return Promise.resolve(declaraciones.filter(d => {
            return (d.name != '' && (d.parameters.length > 0 || d['return'].type != '' || d['return'].description != ''));
        }));
    })
    .catch(err => console.error(err));
}
