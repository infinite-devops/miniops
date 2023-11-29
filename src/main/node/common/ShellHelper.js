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

require('../common/LoggerHelper.js');
const exec = require('child_process').exec;
const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawn } = require('child_process');
const { v4: uuidv4 } = require('uuid');

function ShellHelper() {

    this.executeSingleLine = async (rawStatement, variables) => {
        console.debug("script")
        console.debug(rawStatement)
        console.debug("variables");
        console.debug(variables);

        return new Promise(function (resolve, reject) {
            var rawCommands = rawStatement.trim();

            var code;
            instance = exec(rawCommands, { shell: true, env: variables, windowsHide:true }, (err, stdout, stderr) => {
                if (err) {
                    var stackTrace = err.toString();
                    return reject({ code, stdout, stderr, stackTrace, fullStackTraceErr: err });
                } else {
                    resolve({ code, stdout, stderr });
                }
            })
            
            instance.on('exit', (_code) => {
                code = _code;
            })

        });

    }

    this.executeSeveralLines = async (rawStatement, variables) => {
        console.debug("script")
        console.debug(rawStatement)        
        console.debug("variables");
        console.debug(variables);
        return new Promise(async function (resolve, reject) {

            var extension = os.platform == 'win32' ? ".bat" : ".sh";
            const tempFile = path.join(os.tmpdir(), uuidv4() + extension)
            console.log(tempFile)
            await fs.promises.writeFile(tempFile, rawStatement.trim());

            const process = spawn(tempFile, [], { env: variables, windowsHide:true });

            // You can also use a variable to save the output 
            // for when the script closes later
            var stdoutCollection = [];
            var stderrCollection = [];

            process.stdout.setEncoding('utf8');
            process.stdout.on('data', function (data) {
                //Here is where the output goes
                var rawString = data.toString();
                stdoutCollection.push(rawString);
            });

            process.stderr.setEncoding('utf8');
            process.stderr.on('data', function (data) {
                //Here is where the error output goes
                var rawString = data.toString();
                stderrCollection.push(rawString);
            });
            process.on('error', function (err) {
                // *** Process creation failed
                deleteFile(tempFile);
                var stackTrace = err.toString();
                var stdout, stderr, rawPayload;

                if(stdoutCollection.length>0){
                    stdout = stdoutCollection.join(""); 
                    rawPayload = stdout.trim().split(/\n\r\n/).pop()
                }
                
                if(stderrCollection.length>0){
                    stderr = stderrCollection.join("\n");
                } 

                reject({ code, stdout, stderr, stackTrace, rawPayload, fullStackTraceErr: err });
            });
            process.on('close', function (code) { // Should probably be 'exit', not 'close'
                // *** Process completed
                deleteFile(tempFile);
                var stdout, stderr, rawPayload;

                if(stdoutCollection.length>0){
                    stdout = stdoutCollection.join(""); 
                    rawPayload = stdout.trim().split(/\n\r\n/).pop()
                }
                
                if(stderrCollection.length>0){
                    stderr = stderrCollection.join("");
                }

                resolve({ code, stdout, stderr , rawPayload});
            });            
        });
    }

    function deleteFile(location) {
        fs.unlink(location, (err) => {
            if (err) throw err;
            console.log('successfully deleted: ' + location);
        });
    }

}

module.exports = ShellHelper;