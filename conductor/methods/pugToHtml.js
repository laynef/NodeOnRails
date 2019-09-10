const path = require('path');

module.exports = (settings) => {
    const pug = require('pug');
    const mailer_view_path = path.join(settings.context, 'app', 'assets', 'views', 'mailer');

    return (file_path, locals = {}) => {
        try {
            const fn = pug.compileFile(path.join(mailer_view_path, file_path));
            return fn(locals || {});
        } catch {
            return "";
        }
    };

}
