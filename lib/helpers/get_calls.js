'use babel';

import Promise from 'promise';
import read from './read';

var regexp = /([a-z_\-0-9]+)(\(\){1})/ig;
var ignorar = ['stdClass','array','include','print','print_r','var_dump','echo','__construct','empty','array_merge','count'];

export default (archivo) => {
    return read(archivo).then(buffer => {
        var lineas = buffer.toString().split("\n");
        var funciones = [];

        lineas.forEach(linea => {
            var resultados = linea.match(regexp);

            if (resultados && resultados.length > 0)
            {
                funciones.push.apply(funciones, resultados.map(item => {
                    return item.replace(/\(/, '').replace(/\)/, '').trim();
                }));
            }
        });

        /*
        console.info("get_calls");
        console.info(funciones);
        console.info("/ get_calls");
        */

        return funciones.filter((fn, index) => {
            return (ignorar.indexOf(fn) == -1 && funciones.indexOf(fn) == index);
        });
    })
    .catch(err => {
        console.error(err);
        return Promise.reject(err);
    });
}
