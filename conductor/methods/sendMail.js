module.exports = async (settings) => {
    const path = require('path');
    const nodemailer = require('nodemailer');
    const config = require(path.join(settings.context, 'config', 'environments', process.env.NODE_ENV + '.json'));

    return async ({ from = '', to = '', subject = '', text = '', html = '' }) => {
        let transporter = nodemailer.createTransport(config.mailer_transport);
        return await transporter.sendMail({ from, to, subject, text, html });
    }
}
