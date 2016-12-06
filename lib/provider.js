'use babel';

export default {
    selector: 'source.php',

    getSuggestions(options) {
        // editor, bufferPosition, scopeDescriptor, prefix
        console.log("alkjflksdjflsdjflsjf");

        return new Promise(resolve => {
            var suggestions = [{
                text: 'someText',
                snippet: 'alkjflskdjlsdjlkf',
                displayText: 'someText',
                replacementPrefix: 'so',
                type: 'function',
                leftLabel: 'left label',
                leftLabelHTML: 'left label html',
                rightLabel: 'right label',
                rightLabelHTML: 'right label html',
                className: '',
                iconHTML: '',
                description: 'description 123 123',
                descriptionMoreURL: 'http://www.google.com.ar/'
            }];

            resolve(suggestions);
        });
    }
}
