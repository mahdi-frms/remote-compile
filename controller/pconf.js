const path = require('path');

function validateTree(tree) {
    for (const entry in tree) {
        if (tree[entry] instanceof Object) {
            if (!validateTree(tree[entry]))
                return false;
        }
        else if (!tree[entry] instanceof Number)
            return false;
    }
    return true;
}

function TreeFiles(tree) {
    let arr = [];
    for (const entry in tree) {
        if (tree[entry] instanceof Object) {
            arr = arr.concat(TreeFiles(tree[entry]));
        }
        else {
            arr.push(tree[entry]);
        }
    }
    return arr;
}

function allUnique(arr) {
    return arr.length == [...new Set(arr)].length;
}

function validateAddr(addr) {
    addr = path.normalize(addr);
    if (path.isAbsolute(addr))
        return false;
    if (addr.length >= 3 && addr.slice(3) == '../' || addr.length == 2 && addr == '..')
        return false;
    return true;
}

function validateIncludeList(list) {
    for (let i = 0; i < list.length; i++) {
        if (!validateAddr(list[i]))
            return false;
    }
    return true;
}

function validateSrc(list) {
    for (const src of list) {
        if (!src instanceof Number)
            return false;
    }
    return true;
}

function validateTarget(target) {

    if (!target.src)
        return false;
    if (!target.output)
        target.output = 'bin'
    for (const arg in target) {
        if (arg == 'src') {
            let list = target.src;
            if (!list instanceof Array || list.length == 0)
                return false;
            if (!validateSrc(list))
                return false;
        }
        else if (arg == 'include') {
            let list = target.include;
            if (!list instanceof Array || list.length == 0)
                return false;
            if (!validateIncludeList(list))
                return false;
        }
        else if (arg == 'output') {
            if (!target.output in ['bin', 'ar'])
                return false;
        }
        else
            return false;
    }
    if (!allUnique(target.src))
        return false;
    return true;
}

function validate(config) {
    if (Object.keys(config).length != 2)
        return false;

    if (!config.tree || !config.tree instanceof Object)
        return false;
    if (!validateTree(config.tree))
        return false;
    const treeFiles = TreeFiles(config.tree);
    if (!allUnique(treeFiles))
        return false;

    if (!config.targets || !config.targets instanceof Object || Object.keys(config.targets).length == 0)
        return false;
    for (const target in config.targets) {
        if (!validateTarget(config.targets[target]))
            return false;
        for (const file of config.targets[target].src)
            if (!file in treeFiles)
                return false;
    }
    return true;
}

exports.validate = validate;