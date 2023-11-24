const ErrorHelper = require('../common/ErrorHelper.js');
const fs = require('fs');
const path = require('path');
const os = require('os');


function DevopsTask(shellHelper, pipeline) {

    this.start = async (gitUrl, branchName, yamlFullLocation) => {
        if (typeof gitUrl === 'undefined') throw new Error("gitUrl is required");
        if (typeof branchName === 'undefined') throw new Error("branchName is required");

        var currentCommitId, previousCommitId;
        try {
            var response = await shellHelper.executeSingleLine(`git ls-remote ${gitUrl} ${branchName}`);
            currentCommitId = response.stdout.split(/\s+/)[0].trim();
        } catch (err) {
            throw ErrorHelper.reThrow(`Failed to read git commit`, err);
        }

        var repositoryName = gitUrl.split("/").pop().replace(".git", "");
        var fileInfoLocation = path.join(os.tmpdir(), `${repositoryName}-${branchName}`)
        var isFirstTime = false;
        try {
            previousCommitId = await fs.promises.readFile(fileInfoLocation, "utf-8");
        }
        catch (e) {
            console.log(e)
            //file does not exist so is the first time
            isFirstTime = true; 
            previousCommitId = currentCommitId;
            fs.promises.writeFile(fileInfoLocation, currentCommitId);
        }
        console.log("previousCommitId:"+previousCommitId)
        console.log("currentCommitId:"+currentCommitId)
        
        if(!isFirstTime && previousCommitId===currentCommitId){
            console.log("git repository and branch does not have changes")
            return {changed: false}
        }

        var response = await pipeline.executeFile(yamlFullLocation);
        return {...response, changed: true}
    };

}

module.exports = DevopsTask;
