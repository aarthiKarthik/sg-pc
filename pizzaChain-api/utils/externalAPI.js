const rp = require('request-promise');

function getOptions(url, reqMethod, obj){
    console.log("externalAPI : getOptions : obj = ",obj);
    var options = {
        method: reqMethod,
        uri: url,
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(obj)
    };
    return options;
};

module.exports = {
 
    fnPOST : (url, obj) => {
        return rp(getOptions(url, 'POST', obj))
        .then(function (res) {
            return JSON.parse(res);
        })
        .catch(function (err) {
            console.log(err);
        });
    },

    fnGET : (url) => {
        return rp(getOptions(url, 'GET'))
        .then(function (res) {
            return JSON.parse(res);
        })
        .catch(function (err) {
            console.log(err);
        });
    }
}