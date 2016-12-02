'use babel';

import PhpIntellgView from './php-intellg-view';
import {CompositeDisposable} from 'atom';

import analyze from './helpers/analyze';
import get_calls from './helpers/get_calls';

export default {

    phpIntellgView: null,
    subscriptions: null,
    activated: false,
    project: '',
    files: [],

    activate(state) {
        this.phpIntellgView = new PhpIntellgView(state.phpIntellgViewState);

        // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
        this.subscriptions = new CompositeDisposable();

        // Register command that toggles this view
        this.subscriptions.add(atom.commands.add('atom-workspace', {
            'php-intellg:toggle': () => this.toggle()
        }));

        this.subscriptions.add(atom.commands.add('atom-workspace', {
            'php-intellg:suggest': () => this.suggest()
        }));

        this.subscriptions.add(atom.commands.add('atom-workspace', {
            'php-intellg:analyze_file': () => this.analyze_file()
        }));

        this.subscriptions.add(atom.commands.add('atom-workspace', {
            'php-intellg:go': () => this.go()
        }));

        var editor = atom.workspace.getActivePaneItem();
        var f = editor.buffer.getPath() || '';

        if (f != '')
        {
            this.project = f.substring(0, f.lastIndexOf("/"));
        }
    },

    go() {
        console.info("Jumping to declaration");
    },

    suggest() {
        console.info("Getting suggestions");
    },

    analyze_file() {
        var editor = atom.workspace.getActivePaneItem();
        var f = editor.buffer.getPath() || '';

        if (f != '')
        {
            get_calls(f).then(funcs => {
                console.info("Functions found: ");
                console.info(funcs);
            });
        }
    },

    deactivate() {
        this.subscriptions.dispose();
        this.phpIntellgView.destroy();
    },

    serialize() {
        return null;
    },

    toggle() {
        return this.activated = (!this.activated);
    }

};
