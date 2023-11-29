const ErrorHelper = require('../common/ErrorHelper.js');
const ShellHelper = require('../common/ShellHelper.js');
const StringHelper = require('../common/StringHelper.js');
const JavascriptHelper = require('../common/JavascriptHelper.js');
const yaml = require('js-yaml');
const fs = require('fs');

function Pipeline() {

    this.executeFile = async (yamlFullLocation, variables) => {

        console.log("pipeline init variables: " + JSON.stringify(variables));
        var javascriptHelper = new JavascriptHelper();

        var yamlInstance;
        try {
            yamlInstance = await yaml.load(await fs.promises.readFile(yamlFullLocation, 'utf8'));
        } catch (err) {
            throw ErrorHelper.reThrow(`Failed to read yaml: ${yamlFullLocation}`, err)
        }

        var shellHelper = new ShellHelper();
        var response = {}, currentStepKey;
        var globalVariables = { ...yamlInstance.parameters }
        for (var stepKey in yamlInstance.steps) {
            currentStepKey = stepKey;
            console.log(stepKey)
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
                    console.debug("code response")
                    console.debug(functionReturn)
                    if(typeof functionReturn === 'boolean'){
                        if (functionReturn===false) {
                            console.log(`code returned false value which means an error`);
                            if(typeof skip_error === 'undefined' || skip_error===false){
                                break;
                            }else{
                                console.debug("skip_error is true, so the error is skipped");
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

                console.debug("script response")
                console.debug(response)
                if (response.code != 0) {
                    console.log(`script returned a nonzero exit value which means an error`);
                    if(typeof skip_error === 'undefined' || skip_error===false){
                        break;
                    }else{
                        console.debug("skip_error is true, so the error is skipped");
                    }
                }
    
                //apply smart variables detector
                var parsedVariables = StringHelper.parseKeyValue(response.rawPayload);
                console.debug("parsed variables")
                console.debug(parsedVariables)
                globalVariables = { ...parsedVariables, ...globalVariables, rawPayload: response.rawPayload }
            }
        }
        return { ...response, finalVariables: globalVariables };
    }

}

module.exports = Pipeline;