'use babel';

import AtomIdeaView from './atom-idea-view';
import {CompositeDisposable, Task} from 'atom';

import get_calls from './helpers/get_calls';
import get_func from './helpers/get_func';
import walk_promise from './helpers/walk_promise';
import parse_func from './helpers/parse_func';
import parse_class from './helpers/parse_class';
import find_constructor from './helpers/find_constructor';
import Status from './helpers/status';

export default {

    AtomIdeaView: null,
    subscriptions: null,
    activated: false,
    project: [],

    // indexing status
    promises: [],
    complete: 0,

    // code definitions
    files: [],
    functions: [],
    _classes: [],
    variables: [],

    // status bar
    status: null,

    // path separator
    folder_separator: (process.platform.indexOf('win') > -1) ? '\\' : '/',

    provide() {
        var self = this;

        return {
            selector: '.source.php, .text.html.php, .php',

            getSuggestions(options) {
                var func = get_func(options.bufferPosition);
                var line = get_func(options.bufferPosition, true);

                // reserve the first one for the best result
                var suggestions = [{}];

                return new Promise(resolve => {
                    // Suggest class
                    if (line.indexOf('new') > -1)
                    {
                        let parts = line.split('new ');
                        let _class = (parts[1]) ? parts[1].trim().toLowerCase() : '';
                        _class = _class.replace(/\(/, '').replace(/\)/, '');

                        self._classes.forEach(item => {
                            if (_class != '' && item.name == _class)
                            {
                                let constr = find_constructor(item.name, self.functions);
                                suggestions[0] = parse_class(item, constr);
                            }
                            else if (_class == '' || item.name.toLowerCase().indexOf(_class) > -1)
                            {
                                let constr = find_constructor(item.name, self.functions);
                                suggestions.push(parse_class(item, constr));
                            }
                        });
                    }
                    // Suggest function
                    else if (func != '')
                    {
                        self.functions.forEach(item => {
                            if (item.name == func)
                            {
                                // exact match should be on top
                                suggestions[0] = parse_func(item);
                            }
                            else if (item.name.startsWith(func))
                            {
                                suggestions.push(parse_func(item));
                            }
                        });
                    }

                    // remove the "best" result if we didn't find it
                    if (!suggestions[0].name && suggestions.length > 1)
                    {
                        suggestions.splice(0, 1);
                    }

                    resolve(suggestions.filter(suggestion => {
                        // remove wrong function
                        return (suggestion.type != 'variable');
                    }));
                });
            }
        }
    },

    activate(state) {
        this.AtomIdeaView = new AtomIdeaView(state.AtomIdeaViewState);
        this.subscriptions = new CompositeDisposable();

        this.subscriptions.add(atom.commands.add('atom-workspace', {
            'atom-idea:Toggle': () => this.toggle()
        }));

        this.subscriptions.add(atom.commands.add('atom-workspace', {
            'atom-idea:Analyze Project': () => this.prepare()
        }));

        this.subscriptions.add(atom.commands.add('atom-workspace', {
            'atom-idea:Show Declarations': () => this.show_declarations()
        }));

        this.subscriptions.add(atom.commands.add('atom-workspace', {
            'atom-idea:Go': () => this.go()
        }));

        // get the project roots
        this.project = atom.project.getPaths();

        // create the statusbar
        this.status = new Status('Loading...');

        // start plugin
        this.prepare();
    },

    prepare() {
        // walk through the projects searching for supported files
        this.status.msg('Scanning projects...');

        this.project.forEach(path => {
            this.promises.push(walk_promise(path));
        });

        Promise.all(this.promises).then(result_files => {
            this.status.msg('Indexing files...');

            result_files.forEach(files => {
                this.files = this.files.concat(files);
            });

            // Begin background task
            let bg = Task.once(__dirname + '/helpers/scan_async.coffee', this.files);

            // Update completed files
            bg.on('scan-start', (data) => {
                this.complete++;
                this.status.msg(`Analyzing file ${this.complete} of ${this.files.length}`);
            });

            // Finished all the files
            bg.on('analysis-done', (data) => {
                this.functions = data.functions;
                this._classes = data._classes;
                this.variables = data.variables;

                // Are we finished every project?
                if (this.complete == this.files.length)
                {
                    atom.notifications.addSuccess(`${this.functions.length} functions and ${this._classes.length} classes found`);
                    this.status.msg('');
                }
            });
        })
        .catch(err => {
            console.error(err);
            atom.notifications.addError('Error scanning the project');
        });
    },

    get_path() {
        try
        {
            let editor = atom.workspace.getActivePaneItem();
            return (editor.buffer.getPath() || '');
        }
        catch (e) {return ''};
    },

    get_text() {
        return read(this.get_path);
    },

    go() {
        let func = get_func();
        let matches = [];

        this.functions.forEach(item => {
            if (item.name == func && item.url && item.line)
            {
                // TODO: Make a deeper comparation, checking the parent class and other stuff
                matches.push(item);
            }
        });

        if (matches.length == 0)
        {
            return atom.notifications.addInfo(`Declaration for ${func} not found`);
        }

        // Don't open more than 3 declarations
        let max = (matches.length > 3) ? 3 : matches.length;

        for (let i = 0;i < max;i++)
        {
            atom.workspace.open(matches[i].url, {
                'initialLine': matches[i].line
            });
        }
    },

    // cache functions called in the current file
    analyze_file() {
        try
        {
            let editor = atom.workspace.getActivePaneItem();
            let f = editor.buffer.getPath() || '';

            get_calls(f).then(funcs => console.info(funcs)).catch(err => console.error(err));
        }
        catch (e) {};
    },

    show_declarations() {
        console.info(this.functions);
        atom.notifications.addInfo('Functions sent to developer console (Ctrl+Shift+I)')
    },

    deactivate() {
        this.subscriptions.dispose();
        this.AtomIdeaView.destroy();
    },

    serialize() {
        return null;
    },

    toggle() {
        return this.activated = (!this.activated);
    }

};
