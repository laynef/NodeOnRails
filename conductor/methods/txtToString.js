const fs = require('fs');
const path = require('path');


module.exports = (settings) => {
    const mailer_view_path = path.join(settings.context, 'app', 'assets', 'views', 'mailer');

    return (filename, locals) => {
        let string = "";
        try {
            string = fs.readFileSync(path.join(mailer_view_path, filename), { encoding: 'utf8' }) || "";
            return string.replace(/\${([^}]*)}/g, (r,k) => locals[k] || "");
        } catch {
            return string;
        }
    };
};
