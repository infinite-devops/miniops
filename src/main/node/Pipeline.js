const ErrorHelper = require('./common/ErrorHelper.js');
const ShellHelper = require('./common/ShellHelper.js');
const yaml = require('js-yaml');
const fs = require('fs');

function Pipeline() {

    this.executeFile = async (yamlFullLocation) => {
        
        var yamlInstance;
        try {
            yamlInstance = await yaml.load(await fs.promises.readFile(yamlFullLocation, 'utf8'));
        } catch (err) {
            throw ErrorHelper.reThrow(`Failed to read yaml: ${yamlFullLocation}`, err)
        }

        console.log(yamlInstance);
        var shellHelper = new ShellHelper();
        var response;
        for(var stepKey in yamlInstance.steps){
            console.log(stepKey)
            
            var script = yamlInstance.steps[stepKey].script;
            if(script.match(/^\s*$/)){
                throw new Error(`step "${stepKey}" has empty script`);
            }
            
            if(script.split("\n").length > 1){
                response = await shellHelper.executeSeveralLines(yamlInstance.steps[stepKey].script);
            }else{
                response = await shellHelper.executeSingleLine(yamlInstance.steps[stepKey].script);
            }
            
        }

        return response;
    }

}

module.exports = Pipeline;