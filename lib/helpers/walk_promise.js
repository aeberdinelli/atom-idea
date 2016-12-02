import Promise from 'promise';
import walk from './walk';

export default (folder) => {
    return new Promise((resolve, reject) => {
        walk(folder, (err, results) => {
            if (err)
            {
                return reject(err);
            }

            return resolve(results)
        });
    });
}
