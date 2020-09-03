const recursive = require('recursive-readdir');
const path = require('path');
const validFilename = require('valid-filename');
const xml2js = require('xml2js');
const fs = require('fs-extra');
const parser = new xml2js.Parser();

/**
 * 年份: [year]
 * 番號: [number]
 * 標籤: [tag]
 * 演員: [actor]
 */
let pattern = "[number][tag]";
let tagetPath = "/Volumes/Download/未命名檔案夾";
let outputDir = "output";
fs.ensureDirSync(path.join(tagetPath, outputDir));

function ignoreFunc(file, stats) {
    // `file` is the path to the file, and `stats` is an `fs.Stats`
    // object returned from `fs.lstat()`.
    return !stats.isDirectory() && path.extname(file) != ".nfo";
}

recursive(tagetPath, ["output", ignoreFunc], function (err, files) {
    for (let i = 0; i < files.length; ++i) {
        fs.readFile(files[i], function (err, data) {
            if (!fs.existsSync(files[i])) {
                return;
            }
            parser.parseString(data, function (err, result) {
                let actors = getActorString(result.movie.actor);
                let tags = getTagString(result.movie.tag);
                let folderName = pattern.replace(
                    'year', result.movie.year
                ).replace(
                    'number', result.movie.num
                ).replace(
                    'tag', tags
                ).replace(
                    'actor', actors
                );
                const currPath = path.dirname(files[i]);
                const newPath = path.join(path.dirname(currPath), folderName);
                fs.renameSync(currPath, newPath);
                // 1.建立資料夾-依照演員分類
                //let newDir = path.join(tagetPath, outputDir, actors, folderName);
                // 2.每片單獨一個資料夾
                let newDir = path.join(tagetPath, outputDir, folderName);
                //fs.ensureDirSync(newDir);
                fs.moveSync(newPath, newDir, { overwrite: true });
            });
        });
    }
});

function getActorString(actors) {
    if (actors == undefined) return 'Unknown';
    return actors.sort().map((item) => {
        return item.name;
    }).toString();
}

function getTagString(tags) {
    if (tags == undefined) return 'Unknown';
    return tags.sort().filter((item) => {
        return validFilename(item);
    }).map((item) => {
        return item;
    }).toString();
}
