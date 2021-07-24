const fs = require('fs');
const envPathFirst = `${process.env.PWD}/../.env`;
const envPathSecond = `${process.env.PWD}/.env`;
const envPath = fs.existsSync(envPathFirst) ? envPathFirst : envPathSecond;
require('dotenv').config({path: envPath});

module.exports.okResult = (res, data = {}) => {
    res.json({result: true, data});
};

module.exports.errorResult = (res, message, data = {}) => {
    res.json({result: false, message, data});
};

module.exports.uuid = () => {
    return 'xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};
