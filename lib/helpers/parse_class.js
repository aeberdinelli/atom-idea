'use babel';

const folder_separator = (process.platform.indexOf('win') > -1) ? '\\' : '/';

export default (item, construct = null) => {
    let param_string = '';
    let snippet = item.name + '(';

    if (construct && construct.parameters.length > 0)
    {
        let i = 0;

        param_string = construct.parameters.map(param => {
            i++;

            if (i > 1)
            {
                snippet += ', ';
            }

            snippet += '${' + (i + 1) + ':' + param.name + '}';
            return param.type + ' ' + param.name;
        }).join(', ');

        snippet += ')$' + (i + 1);
    }

    let text = item.name + '(' + param_string + ')';
    let right = (item.namespace != '') ? item.namespace : item.url.substr(item.url.lastIndexOf(folder_separator) + 1);

    return {
        'text': text,
        'snippet': snippet,
        'displayText': text,
        'type': 'function',
        'leftLabel': '',
        'leftLabelHTML': '',
        'rightLabel': right,
        'rightLabelHTML': right,
        'className': 'atom-idea',
        'iconHTML': '',
        'description': ''
    }
};
