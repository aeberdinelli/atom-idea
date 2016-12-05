'use babel';

import AtomIdeaView from './atom-idea-view';
import {CompositeDisposable} from 'atom';

import analyze from './helpers/analyze';
import get_calls from './helpers/get_calls';
import walk_promise from './helpers/walk_promise';

export default {

    AtomIdeaView: null,
    subscriptions: null,
    activated: false,
    project: '',
    declarations: [],
    promises: [],
    files: [],
    folder_separator: (process.platform.indexOf('win') > -1) ? '\\' : '/',

    activate(state) {
        this.AtomIdeaView = new AtomIdeaView(state.AtomIdeaViewState);

        // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
        this.subscriptions = new CompositeDisposable();

        // Register command that toggles this view
        this.subscriptions.add(atom.commands.add('atom-workspace', {
            'atom-idea:toggle': () => this.toggle()
        }));

        this.subscriptions.add(atom.commands.add('atom-workspace', {
            'atom-idea:suggest': () => this.suggest()
        }));

        this.subscriptions.add(atom.commands.add('atom-workspace', {
            'atom-idea:analyze_file': () => this.analyze_file()
        }));

        this.subscriptions.add(atom.commands.add('atom-workspace', {
            'atom-idea:go': () => this.go()
        }));

        var f = this.get_path();
        if (f != '')
        {
            this.project = f.substring(0, f.lastIndexOf(this.folder_separator));
            this.prepare();
        }
    },

    // walk through the project searching for supported files
    prepare() {
        walk_promise(this.project).then(files => {
            this.files = files;

            files.forEach(file => {
                this.promises.push(analyze(file));
            });

            return Promise.all(this.promises).then(results => {
                results.forEach(result => this.declarations = this.declarations.concat(result));
            });
        })
        .catch(err => console.error(err));
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
        console.info("Jumping to declaration");

        var editor  = atom.workspace.getActivePaneItem();
        var pos     = editor.getCursorScreenPosition();
        var line    = editor.lineTextForScreenRow(pos.row);
        var func    = '';
        var from    = 0;
        var to      = 0;

        // Get the end of the function name
        for (var i = pos.column;i < line.length;i++)
        {
            if (line[i] == '(')
            {
                to = i;
                break;
            }
        }

        // Get the begining of the function name
        for (var f = pos.column;f > 0;f--)
        {
            if (!/[a-z0-9_\-]/i.test(line[f]))
            {
                from = f;
                break;
            }
        }

        // Get the function!
        func = line.substr(from, line.substr(from).indexOf("(")).trim();

        // Search the documentation for that function
        var matches = [];

        this.declarations.forEach(item => {
            if (item.name == func)
            {
                matches.push(item);
            }
        });

        // TODO: Make a deeper comparation, checking the parent class and other stuff
        atom.workspace.open(matches[0].url, {
            'initialLine': --matches[0].line
        });

        return console.info(matches);
    },

    suggest() {
        console.info("Getting suggestions");
    },

    // cache functions called in the current file
    analyze_file() {
        try
        {
            var editor = atom.workspace.getActivePaneItem();
            var f = editor.buffer.getPath() || '';

            get_calls(f).then(funcs => {
                console.info(funcs);
            })
            .catch(err => console.error(err));
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
