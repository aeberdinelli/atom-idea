'use babel';

import AtomIdeaView from './atom-idea-view';
import {CompositeDisposable} from 'atom';

import analyze from './helpers/analyze';
import get_calls from './helpers/get_calls';
import get_func from './helpers/get_func';
import walk_promise from './helpers/walk_promise';
import parse_data from './helpers/parse_data';

export default {

    AtomIdeaView: null,
    subscriptions: null,
    activated: false,
    project: [],
    promises: [],
    files: [],
    declarations: [],
    folder_separator: (process.platform.indexOf('win') > -1) ? '\\' : '/',

    provide() {
        var self = this;

        return {
            selector: '.source.php, .text.html.php, .php',

            getSuggestions(options) {
                var func = get_func(options.bufferPosition);

                // reserve the first one for the best result
                var suggestions = [{}];

                return new Promise(resolve => {
                    self.declarations.forEach(item => {
                        if (item.name == func)
                        {
                            suggestions[0] = parse_data(item);
                        }
                        else if (item.name.startsWith(func))
                        {
                            suggestions.push(parse_data(item));
                        }
                    });

                    // remove the "best" result if we didn't find it
                    if (!suggestions[0].name)
                    {
                        suggestions.splice(0, 1);
                    }

                    resolve(suggestions);
                });
            }
        }
    },

    activate(state) {
        this.AtomIdeaView = new AtomIdeaView(state.AtomIdeaViewState);

        // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
        this.subscriptions = new CompositeDisposable();

        // Register command that toggles this view
        this.subscriptions.add(atom.commands.add('atom-workspace', {
            'atom-idea:toggle': () => this.toggle()
        }));

        this.subscriptions.add(atom.commands.add('atom-workspace', {
            'atom-idea:analyze_project': () => this.prepare()
        }));

        this.subscriptions.add(atom.commands.add('atom-workspace', {
            'atom-idea:analyze_file': () => this.analyze_file()
        }));

        this.subscriptions.add(atom.commands.add('atom-workspace', {
            'atom-idea:show_declarations': () => console.info(this.declarations)
        }));

        this.subscriptions.add(atom.commands.add('atom-workspace', {
            'atom-idea:go': () => this.go()
        }));

        // get the project roots
        this.project = atom.project.getPaths();
    },

    // walk through the project searching for supported files
    prepare() {
        this.project.forEach(path => {
            walk_promise(path).then(files => {
                this.files = files;

                files.forEach(file => {
                    this.promises.push(analyze(file));
                });

                return Promise.all(this.promises).then(results => {
                    results.forEach(result => this.declarations = this.declarations.concat(result));

                    atom.notifications.addSuccess('Found ' + this.declarations.length + ' declarations');
                });
            })
            .catch(err => {
                console.error(err);
                atom.notifications.addError('Error scanning the project')
            });
        });
    },

    get_path() {
        try
        {
            var editor = atom.workspace.getActivePaneItem();
            return (editor.buffer.getPath() || '');
        }
        catch (e) {return ''};
    },

    get_text() {
        return read(this.get_path);
    },

    go() {
        var func = get_func();

        // Now search the documentation for it
        // TODO: Support for more than one declaration
        var matches = [], found = false;

        this.declarations.every(item => {
            if (item.name == func && item.url && item.line)
            {
                // TODO: Make a deeper comparation, checking the parent class and other stuff
                found = true;

                return atom.workspace.open(item.url, {
                    'initialLine': item.line
                });
            }

            if (!found)
            {
                atom.notifications.addInfo('Declaration not found');
            }
        });
    },

    // cache functions called in the current file
    analyze_file() {
        try
        {
            var editor = atom.workspace.getActivePaneItem();
            var f = editor.buffer.getPath() || '';

            get_calls(f).then(funcs => console.info(funcs)).catch(err => console.error(err));
        }
        catch (e) {};
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
