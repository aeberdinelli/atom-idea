'use babel';

export default (class_name, declarations) => {
    var constr = null;

    declarations.forEach(item => {
        if (item._class.trim().toLowerCase() == class_name.toLowerCase() && item.name.trim().toLowerCase() == '__construct')
        {
            constr = item;
        }
    });

    return constr;
}
