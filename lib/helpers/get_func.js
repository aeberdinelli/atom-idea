'use babel';

export default (cursor, lineOnly = false) => {
    let editor  = atom.workspace.getActivePaneItem();
    let pos     = cursor || editor.getCursorScreenPosition();
    let line    = editor.lineTextForScreenRow(pos.row);
    let func    = '';
    let from    = 0;
    let to      = 0;

    // return the current line only (to parse->nested->calls)
    if (lineOnly)
    {
        return line.trim();
    }

    // Get the begining of the function name
    for (let f = pos.column;f > 0;f--)
    {
        if (f < 0 && !/[a-z0-9_\-]/i.test(line[f]))
        {
            from = f;
            break;
        }
    }

    // Get the end of the function name
    if (!cursor)
    {
        for (let i = pos.column;i < line.length;i++)
        {
            if (line[i] == '(')
            {
                to = i;
                break;
            }
        }
    }
    else
    {
        for (let i = from;i < line.length;i++)
        {
            if (line[i - 1] == '(')
            {
                to = i - 1;
                break;
            }

            else if ((i + 1) == line.length)
            {
                to = i + 1;
                break;
            }
        }
    }

    // Get the function!
    func = line.substring(from, ((to > 0) ? to : line.length)).trim();

    // TODO: Exclude this when it's inside a string
    if (line.indexOf('->') > -1)
    {
        let parts = func.split(/\->/);
        func = parts[parts.length - 1].trim();
    }

    return func;
}
