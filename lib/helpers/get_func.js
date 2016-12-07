'use babel';

export default (cursor) => {
    var editor  = atom.workspace.getActivePaneItem();
    var pos     = cursor || editor.getCursorScreenPosition();
    var line    = editor.lineTextForScreenRow(pos.row);
    var func    = '';
    var from    = 0;
    var to      = 0;

    // Get the begining of the function name
    for (var f = pos.column;f > 0;f--)
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
        for (var i = pos.column;i < line.length;i++)
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
        for (var i = from;i < line.length;i++)
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
    return line.substr(from, ((to > 0) ? to - from : line.length - from)).trim();
}
