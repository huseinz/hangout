let glob = require('glob');
let fs = require('fs');
let path = require('path');

function filetree(cwd){
    let files = glob.sync("**/*.jpg", {"cwd":cwd, "realpath": true, "ignore":"node_modules"});

    if (files[0] === "[*]"){
        return [];
    }

    // list of { filename, isDir, files }
    let tree = [];
    for(let file of files){
        let diritems = [];
        if(fs.lstatSync(file).isDirectory()){
            diritems = filetree(file);
            isDir = true;
            tree.push({filename: path.basename(file), fullpath:file,  isDir:true, files: diritems});
        }
        else tree.push({filename: path.basename(file), fullpath:file, files: diritems});
    }

    return tree;
}

module.exports.filetree = filetree;