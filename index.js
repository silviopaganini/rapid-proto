#!/usr/bin/env node

var shelljs  = require('shelljs');
var jsonfile = require('jsonfile')
var colors   = require('colors');
var fs       = require('fs');

var protoName = process.argv.slice(2)[0];
if(!protoName)
{
  shelljs.echo('Need to specify the folder name');
  shelljs.exit(1);   
}

console.log("Starting new prototype: ".green + protoName.blue)

if (!shelljs.which('git')) {
  console.log("Sorry, this script requires git".red);
  return;
}

if(shelljs.exec("git clone https://github.com/silviopaganini/rapid-prototype.git " + protoName).code !==0)
{
    console.log("Error: git pull failed".red);
    return;
}

shelljs.cd(protoName);

console.log("Updating ".green + "package.json".italic.gray);
var USR=shelljs.exec("git config --global user.name", {silent:true}).output.split("\n").join("");
var file = "package.json";
jsonfile.readFile(file, function(err, obj){
    var newPackage = JSON.parse(JSON.stringify(obj));
    newPackage.name = protoName;
    newPackage.version = "0.0.1";
    newPackage.repository = {
      "type": "git",
      "url": "git://github.com/username/repository.git"
    };
    newPackage.bugs = "";
    newPackage.author = USR;

    jsonfile.writeFile(file, newPackage, function(err){
        generateReadme();
    })
})

function generateReadme()
{
    console.log("Generating ".green + "README.md".italic.gray);
    shelljs.rm("README.md");
    var readmeText = "#"+protoName+" \n\nDescription of your prototype\n\n\n###Usage:\n\n\`npm start\`";
    fs.writeFile("README.md", readmeText, continueInstall);
}

function continueInstall(err)
{
    if(err)
    {
        console.log(err.red);
        return;
    }
    console.log("Cleaning up...".green);
    // remove git from old prototype
    shelljs.rm("-rf", ".git");

    console.log("Installing dependencies...".green);
    shelljs.exec('npm install');
    console.log("\nReady to fly =)\n".black.inverse);
    shelljs.exec("open -a 'Sublime Text' .");
    shelljs.exec("/usr/bin/open -a \"/Applications/Google Chrome.app\" 'http://localhost:9966'");
    console.log("Starting local server".green.bold);
    shelljs.exec('npm start');
}
