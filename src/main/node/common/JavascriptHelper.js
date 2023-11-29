const { exec } = require('child_process')
const util = require('util')
const execute = util.promisify(exec);

function JavascriptHelper() {

  this.executeSingleFunction = async (alias, functionString, variables) => {

    if (typeof alias === "undefined" || alias === "") {
      throw new Error("alias is required");
    }

    if (typeof functionString === "undefined" || functionString === "") {
      throw new Error("function content is required");
    }

    console.debug("code")
    console.debug(functionString);
    console.debug("variables")
    console.debug(variables)

    //create an array of variable names and at the end, the script
    //https://stackoverflow.com/a/4183662/3957754
    // var keys = Object.keys(variables);
    var keys = ["params"];
    //add the script
    keys.push(functionString);
    var jsFunction = Function.apply(null, keys);
    return await jsFunction(variables);

  }

}

module.exports = JavascriptHelper;
