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
const ErrorHelper = require('../common/ErrorHelper.js');
const ShellHelper = require('../common/ShellHelper.js');
const StringHelper = require('../common/StringHelper.js');
const JavascriptHelper = require('../common/JavascriptHelper.js');
const MailService = require("../service/MailService.js");
const HtmlHelper = require('../common/HtmlHelper.js');
const yaml = require('js-yaml');
const fs = require('fs');

function Pipeline() {

    var mailNotificactionIsEnabled = false;

    this.executeFile = async (yamlFullLocation, variables, notificationSettings, uuidExecution) => {

        const mailService = new MailService();
        const htmlHelper = new HtmlHelper();

        logger.info("pipeline yaml: " + yamlFullLocation);
        logger.info("pipeline init variables: " + JSON.stringify(variables));
        var javascriptHelper = new JavascriptHelper();

        var yamlInstance;
        try {
            yamlInstance = await yaml.load(await fs.promises.readFile(yamlFullLocation, 'utf8'));
        } catch (err) {
            throw ErrorHelper.reThrow(`Failed to read yaml: ${yamlFullLocation}`, err)
        }

        if(notificationSettings && notificationSettings.smtpHost && notificationSettings.smtpPort && notificationSettings.smtpUser && notificationSettings.smtpPassword && notificationSettings.smtpSecure && notificationSettings.rejectUnauthorized && notificationSettings.from && yamlInstance.notification && yamlInstance.notification.recipients){
            mailService.initialize({
                smtpHost: notificationSettings.smtpHost,
                smtpPort: notificationSettings.smtpPort,
                smtpUser: notificationSettings.smtpUser,
                smtpPassword: notificationSettings.smtpPassword,
                smtpSecure: notificationSettings.smtpSecure,
                rejectUnauthorized: notificationSettings.rejectUnauthorized,
                from: notificationSettings.from
              });
              mailNotificactionIsEnabled = true;              
        }

        if(mailNotificactionIsEnabled===true){
            await mailService.sendMail({
                to: yamlInstance.notification.recipients,
                subject: `Build #${uuidExecution}: ${variables.repositoryName} - started`,
                html: `New build ${uuidExecution} for ${variables.repositoryName} has started`,
              });
        }

        var shellHelper = new ShellHelper();
        var response = {}, currentStepKey;
        var globalVariables = { ...yamlInstance.notification }
        for (var stepKey in yamlInstance.steps) {
            currentStepKey = stepKey;
            logger.info(`step: ${currentStepKey}`)
            globalVariables = { ...globalVariables, ...variables }

            var script = yamlInstance.steps[stepKey].script;
            var skip_error = yamlInstance.steps[stepKey].skip_error;
            var code = yamlInstance.steps[stepKey].code;
            if (script && code) {
                throw new Error(`step "${stepKey}" has script and code task. Only one is allowed`);
            }

            if (typeof script === 'undefined' || script.match(/^\s*$/)) {
                if (typeof code === 'undefined' || code.match(/^\s*$/)) {
                    throw new Error(`step "${stepKey}" has not script nor code. At least one is required`);
                } else {
                    var functionReturn;
                    try {
                        functionReturn = await javascriptHelper.executeSingleFunction(stepKey, code, globalVariables);
                    } catch (err) {
                        response = err
                        response.step = currentStepKey
                        response.code = -1;
                    }
                    logger.debug("code response")
                    logger.debug(functionReturn)
                    if(typeof functionReturn === 'boolean'){
                        if (functionReturn===false) {
                            logger.info(`step: ${currentStepKey} - failed`)
                            logger.info(`code returned false value which means an error`);
                            if(typeof skip_error === 'undefined' || skip_error===false){
                                break;
                            }else{
                                logger.debug("skip_error is true, so the error is skipped");
                            }
                        }
                    }else{
                        globalVariables = { ...functionReturn, ...globalVariables }
                    }
                    response.code = 0;
                }
            } else {
                try {
                    if (script.split("\n").length > 1) {
                        response = await shellHelper.executeSeveralLines(yamlInstance.steps[stepKey].script, globalVariables);
                    } else {
                        response = await shellHelper.executeSingleLine(yamlInstance.steps[stepKey].script, globalVariables);
                    }
                } catch (err) {
                    response = err
                    response.step = currentStepKey
                }

                logger.debug("script response")
                logger.debug(response)
                if (response.code != 0) {
                    logger.info(`step: ${currentStepKey} - failed`)
                    logger.info(`script returned a nonzero exit value which means an error`);
                    if(typeof skip_error === 'undefined' || skip_error===false){
                        break;
                    }else{
                        logger.debug("skip_error is true, so the error is skipped");
                    }
                }
    
                //apply smart variables detector
                var parsedVariables = StringHelper.parseKeyValue(response.rawPayload);
                logger.debug("parsed variables")
                logger.debug(parsedVariables)
                globalVariables = { ...parsedVariables, ...globalVariables, rawPayload: response.rawPayload }
            }

            var stepStatus = response.code===0 ? "success" : "failed";
            logger.info(`step: ${currentStepKey} - ${stepStatus}`)
        }

        var status = response.code===0 ? "success" : "failed";
        if(status==="failed"){
            logger.error(response)
        }

        if(mailNotificactionIsEnabled===true){
            
            var safeResponse = {...response};
            delete safeResponse.variables;
            delete safeResponse.fullStackTraceErr;
            //safeResponse.fullStackTraceErr = fullStackTraceErr.toString();
            var table = htmlHelper.createTableFromObject(safeResponse);
            var body = response.code===0 ? "All the steps were executed successfully" : 
                "At least one step thrown an error. Check the logs or contact the administrator: <br><br>"+ table;

            await mailService.sendMail({
                to: yamlInstance.notification.recipients,
                subject: `Build #${uuidExecution}: ${variables.repositoryName} - ${status}`,
                html: body
              });
        }

        return { ...response, finalVariables: globalVariables };
    }

}

module.exports = Pipeline;