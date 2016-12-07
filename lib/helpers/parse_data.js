'use babel';

var folder_separator = (process.platform.indexOf('win') > -1) ? '\\' : '/';

export default (item) => {
    var param_string = '';
    var return_string = (item.return.type != '') ? item.return.type : '';

    if (item.parameters.length > 0)
    {
        param_string = item.parameters.map(param => {
            return param.type + ' ' + param.name
        }).join(', ');
    }

    var text = (item._class != '') ? item._class + '::' + item.name + '(' + param_string + ')' : item.name + '(' + param_string + ')';

    return {
        'text': text,
        'snippet': item.name + '(',
        'displayText': text,
        //'replacementPrefix': '',
        'type': item.type,
        'leftLabel': return_string,
        'leftLabelHTML': return_string,
        'rightLabel': item.url.substr(item.url.lastIndexOf(folder_separator) + 1),
        'rightLabelHTML': item.url.substr(item.url.lastIndexOf(folder_separator) + 1),
        'className': 'atom-idea',
        'iconHTML': '',
        'description': item.description
        //'descriptionMoreURL': item.url
    }
};
