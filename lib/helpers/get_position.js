'use babel';

export default () => {
	let editor  = atom.workspace.getActivePaneItem();
	let pos = editor.getCursorScreenPosition();
	let file = editor.buffer.file.path;

	return {
		'file': file || '',
		'line': pos.row || -1,
		'col': pos.column || -1
	};
};
