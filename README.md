# Atom Idea
This is a package to convert atom in a small PHP IDE. It's inspired in IntelliJ IDEA.
It will capture every piece of documentation written in the format:

> **Warning**: This is a work in progress.

```
<?php
/**
 * Description of the function
 *
 * @param String $text Description of the 'text' parameter
 * @return Boolean Description of the return
 */

function something($text)
{
    return true;
}
?>
```

You can find a good example of its features if you try it with `phpBB`.

## Features
- **Jump to**: Jump to the file and line where the function is declared.
- **Suggestions**: It will show the atom autocomplete menu showing every parameter and its type so you can understand the function without having to search for its declaration and read it.

## Languages
It will support only `PHP` at first, but I expect to add Java once PHP is ready, and other languages in the future.

##### Note:
This is my very first package for atom, so try it at your own risk.
