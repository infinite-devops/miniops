const exec = require('child_process').exec;
const fs = require('fs');
const path = require('path');
const execFile = require('child_process').execFile;
const os = require('os');
const { spawn } = require('child_process');
const { file } = require('tmp-promise');
const { v4: uuidv4 } = require('uuid');

function ShellHelper() {

    this.executeSingleLine = async (rawStatement) => {
        return new Promise(function (resolve, reject) {
            var rawCommands = rawStatement.trim();

            var code;
            instance = exec(rawCommands, { shell: true }, (err, stdout, stderr) => {
                if (err) {
                    var stackTrace = err.toString();
                    return reject({ code, stdout, stderr, stackTrace });
                } else {
                    resolve({ code, stdout, stderr });
                }
            })
            
            instance.on('exit', (_code) => {
                code = _code;
            })

        });

    }

    this.executeSeveralLines = async (rawStatement) => {
        return new Promise(async function (resolve, reject) {

            var extension = os.platform == 'win32' ? ".bat" : ".sh";
            const tempFile = path.join(os.tmpdir(), uuidv4() + extension)
            console.log(tempFile)
            await fs.promises.writeFile(tempFile, rawStatement.trim());

            const process = spawn(tempFile, []);

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
                stderrCollection.push(data.toString());
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

                reject({ code, stdout, stderr, stackTrace, rawPayload });
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