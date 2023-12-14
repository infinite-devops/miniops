/*
 *   Copyright (c) 2023 JRichardsz
 *   All rights reserved.

 *   Permission is hereby granted, free of charge, to any person obtaining a copy
 *   of this software and associated documentation files (the "Software"), to deal
 *   in the Software without restriction, including without limitation the rights
 *   to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 *   copies of the Software, and to permit persons to whom the Software is
 *   furnished to do so, subject to the following conditions:
 
 *   The above copyright notice and this permission notice shall be included in all
 *   copies or substantial portions of the Software.
 
 *   THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *   IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *   FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 *   AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *   LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 *   OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 *   SOFTWARE.
 */

const logger = require('../common/Logger.js');
const nodemailer = require('nodemailer');

function MailService() {

    this.transporter;
    this.settings;

    this.initialize = (settings) => {

        this.settings = settings;

        if(typeof this.transporter !== 'undefined'){
            return;
        }

        var smtpSettings = {
            host: settings.smtpHost,
            port: settings.smtpPort,
            auth: {
                user: settings.smtpUser,
                pass: settings.smtpPassword,
            },
            tls: {
                rejectUnauthorized: JSON.parse(settings.rejectUnauthorized.toLowerCase())
            }
        }

        if (settings.smtpSecure) {
            smtpSettings.secure = JSON.parse(settings.smtpSecure.toLowerCase());
        }

        if (settings.smtpTlsCiphers) {
            smtpSettings.tls = {};
            smtpSettings.tls.ciphers = settings.smtpTlsCiphers
        }

        this.transporter = nodemailer.createTransport(smtpSettings);
    }

    this.sendMail = async(params) => {

        return new Promise(async (resolve, reject) => {
            if (typeof params == "undefined") {
                reject("params is required to send an email");
            }
            // Comma separated list or an array of recipients e-mail addresses
            if (typeof params.to == "undefined") {
                reject("to is required to send an email");
            }
            if (typeof params.subject == "undefined") {
                reject("subject is required to send an email");
            }
            if (typeof params.html == "undefined") {
                reject("html message is required to send an email");
            }
    
            var mailOptions = {
                from: this.settings.from,
                to: params.to,
                subject: params.subject,
                html: params.html
            };
    
            try {
                var info = await this.transporter.sendMail(mailOptions);
                resolve({status:"sent", info: info})
            } catch (err) {
                reject({status:"failed", err: err})
            }
        });
    }

}

module.exports = MailService;