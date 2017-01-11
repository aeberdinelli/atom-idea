'use babel';

const folder_separator = (process.platform.indexOf('win') > -1) ? '\\' : '/';

export default (item) => {
    let param_string = '';
    let return_string = (item.return.type != '') ? item.return.type : '';
    let snippet = item.name + '(';

    if (item.parameters.length > 0)
    {
        let i = 0;

        param_string = item.parameters.map(param => {
            i++;

            if (i > 1)
            {
                snippet += ', ';
            }

            snippet += '${' + (i + 1) + ':' + param.name + '}';
            return param.type + ' ' + param.name;
        }).join(', ');

        snippet += ')$' + (i + 2);
    }

    let text = item.name + '(' + param_string + ')';
    let right = (item._class != '') ? item._class : item.url.substr(item.url.lastIndexOf(folder_separator) + 1);

    return {
        'text': text,
        'snippet': snippet,
        'displayText': text,
        'type': 'function',
        'leftLabel': return_string,
        'leftLabelHTML': return_string,
        'rightLabel': right,
        'rightLabelHTML': right,
        'className': 'atom-idea',
        'iconHTML': '',
        'description': item.description
    }
};
