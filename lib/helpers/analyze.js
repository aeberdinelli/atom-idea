'use babel';

import Promise from 'promise';
import read from './read';

var types = ['bool','boolean','string','array','mixed','object','void'];
var modif = ['public','private','protected','static'];

const regexp = {
    'returnRex': new RegExp("\\*(\\s)?(\@)(return)\\s?(" + types.join('|') + ")?([^\n]+)", "i"),
    'paramRex': /\\*([ \s])?@param([ \s])([a-z0-9_\-]*)[ \s](\$[a-z\-_0-9]+)(.*)?/i,
    'functionRex': new RegExp("(" + modif.join('|') + ")?([ \s])?function([ \s])(.*)", "ig"),
    'namespaceRex': '',
    'useRex': '',
    'classRex': /^[\s]*class[\s]+([a-z0-9_]+)[\s]+(extends[\s]+[a-zA-Z0-9_\x7f-\xff\\]+)?[\s]*(implements[\s]+[a-zA-Z0-9_\x7f-\xff\\]+)?[\s\{]*$/i,
    'extendsRex': /extends[\s]+([a-zA-Z0-9_\x7f-\xff\\]+)/i,
    'implementsRex': /implements[\s]+([a-zA-Z0-9_\x7f-\xff\\]+)/i,
    'variableRex': /^([ \s]*)([^#(\/\/)]) ?(public |private |protected |static |\$|\'|\")([a-zA-Z0-9_\x7f-\xff\[\]\$\-_>]+)(\'|\")* *(=>?) *([\(\)a-zA-Z0-9_\x7f-\xff\'\"\,\s\$\-_\/>\[\]\{\}\|\?=:\.!¡@]+)(;|,){1}$/ig,
    'constRex': /^([ \s]*)([^#(\/\/)]) ?const ([a-zA-Z0-9_\x7f-\xff]+) *= *([\(\)a-zA-Z0-9_\x7f-\xff\'\"\,\s\$\-_\/>\[\]\{\}\|\?=:\.!¡@]+)(;|,){1}$/ig
};

export default (file) => {
    this.this_class = '';
    var self = this;

    return read(file).then(buffer => {
        var lineas = buffer.toString().split("\n");
        var es_documentacion = false;
        var wait = false;
        var line = 0;

        this.declarations = [];
        this._classes = [];
        this.variables = [];

        lineas.forEach(linea => {
            line++;

            var ultima = (this.declarations.length < 1 ? 1 : this.declarations.length) - 1;
            var short = linea.trim();

            // Beginning of documentation
            if (short.substr(0,3) == '/**')
            {
                es_documentacion = true;

                this.declarations.push({
                    'name': '',
                    'parameters': [],
                    'return': {
                        'type': '',
                        'description': ''
                    },
                    'line': 0,
                    '_class': self.this_class,
                    'url': file,
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
                var lastone = this.declarations.length - 1;

                if (short.trim() != '' && this.declarations[lastone].name == '')
                {
                    if (short.indexOf('function') > -1 && short.indexOf('@') == -1 && short.indexOf('*') == -1)
                    {
                        var clean = short.replace(new RegExp("(" + modif.join('|') + ")", "i"), '').replace('function', '').trim();
                        var parts = clean.split('(');

                        if (parts[0] != '')
                        {
                            this.declarations[lastone].name = parts[0].trim();
                            this.declarations[lastone].line = line;
                        }

                        wait = false;
                    }
                }
            }
            else
            {
                let lastone = this.declarations.length - 1;

                // Return type
                if (regexp['returnRex'].test(short))
                {
                    let parts = short.match(regexp['returnRex']);

                    if (types.indexOf(parts[5]) > -1)
                    {
                        this.declarations[lastone]['return'].type = parts[5].trim();
                    }
                }
                // Parameter
                else if (regexp['paramRex'].test(short))
                {
                    let parts = short.match(regexp['paramRex']);

                    this.declarations[lastone].parameters.push({
                        'name': parts[4].trim(),
                        'type': parts[3],
                        'description': (parts[5] && parts[5] != '') ? parts[5].trim() : ''
                    });
                }
                // A class definition
                else if (regexp['classRex'].test(short))
                {
                    let parts = short.match(regexp['classRex']);
                    let extend = parts[0].match(regexp['extendsRex']);
                    let extendClass = (extend && extend.length > 1) ? extend[1].replace('extends','').trim() : '';

                    if (parts)
                    {
                        this._classes.push({
                            'name': parts[1],
                            'extends': extendClass,
                            'namespace': '',
                            'uses': [],
                            'url': file,
                            'line': line
                        });
                    }

                    self.this_class = parts[1];
                }
                // Description?
                else if (this.declarations[lastone] && short.indexOf('*') > -1 && short.indexOf('@') == -1 && es_documentacion)
                {
                    this.declarations[lastone].description += short.replace(/\*/, '').trim();
                }
            }
        });

        return Promise.resolve({
            'functions': this.declarations,
            'variables': this.variables,
            '_classes': this._classes
        });
    })
    .then(parts => {
        return Promise.resolve({
            'functions': parts.functions.filter(d => {
                return (d.name != '' && (d.parameters.length > 0 || d['return'].type != '' || d['return'].description != ''));
            }),
            'variables': parts.variables,
            '_classes': parts._classes
        });
    })
    .catch(err => console.error(err));
}
