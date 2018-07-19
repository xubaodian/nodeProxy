/**
 * created br xubaodian  2018/7/18 15:00
 * decription: read the file of config and parse the content to an Object
 */

const fs = require('fs');

//set the Object property, obj is target Object, prop is the property
//prop support the format like xxx.xxx.xxx... 
let setProperty = (obj, prop, value) =>{
    let propArr = prop.split('.');
    let len = propArr.length;
    let tmpObj = obj;
    for (let i = 0; i < len; i++) {
        if (i === len -1) {
            tmpObj[propArr[i]] = value;
        } else if (!tmpObj[propArr[i]]) {
            tmpObj[propArr[i]] = {};
        }
        tmpObj = tmpObj[propArr[i]];
    }
}

//return a promise, and the paramete of then function is config Object
let configReader = (url) => {
    return new Promise((resolve, reject) => {
        fs.readFile(url, (err, data)=>{
            if (err) {
                console.error('error to read the config file,the error Code is：' + err.code);
                reject(err);
            }
            let configStr =  data.toString();
            let configArr = configStr.split(/\r\n/);
            let configJson = {};
            configArr.map(item => {
                let arr = item.replace(/^\s*||\s*$/, '').split(/\s*=\s*/);
                setProperty(configJson, arr[0], arr[1]);
            });
            resolve(configJson);
        });
    });
}

module.exports = configReader;