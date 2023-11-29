require('../common/LoggerHelper.js');
const ErrorHelper = require('../common/ErrorHelper.js');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { v4: uuidv4 } = require('uuid');

function DevopsTask(shellHelper, pipeline) {

    this.start = async (gitUrl, branchName, yamlFullLocation) => {

        console.log("job is starting...")

        if (typeof gitUrl === 'undefined') throw new Error("gitUrl is required");
        if (typeof branchName === 'undefined') throw new Error("branchName is required");

        var currentCommitId, previousCommitId;
        try {
            console.log("diff query: "+`git ls-remote ${gitUrl} ${branchName}`);
            var response = await shellHelper.executeSingleLine(`git ls-remote ${gitUrl} ${branchName}`);
            console.log("diff result: "+JSON.stringify(response));
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
            console.debug(e);
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

        var workspaceFullLocation = path.join(os.tmpdir(), uuidv4());
        await fs.promises.mkdir(workspaceFullLocation);
        var variables = {gitUrl, branchName, yamlFullLocation, currentCommitId, workspaceFullLocation};
        var response = await pipeline.executeFile(yamlFullLocation, variables);

        try {
            fs.promises.writeFile(fileInfoLocation, currentCommitId);
        }
        catch (e) {
            console.debug(e);
        }

        return {...response, changed: true}
    };

}

module.exports = DevopsTask;
