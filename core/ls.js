let glob = require('glob');
let fs = require('fs');
let path = require('path');

function filetree(cwd, root){
    let files = glob.sync("*", {"cwd":cwd, "realpath": true, "ignore":"node_modules"});

    // list of { filename, isDir, files }
    let tree = [];
    for(let file of files){
        let diritems = [];
        let relpath = file.replace(root, '');
        if(fs.lstatSync(file).isDirectory()){
            diritems = filetree(file, root);
            tree.push({filename: path.basename(file), relpath: relpath,  isDir:true, files: diritems});
        }
        else tree.push({filename: path.basename(file), relpath: relpath, files: diritems});
    }

    return tree;
}

module.exports.filetree = filetree;