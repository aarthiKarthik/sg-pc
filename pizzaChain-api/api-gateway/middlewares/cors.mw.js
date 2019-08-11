let corsFilter = (req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*")
    res.setHeader("Access-Control-Allow-Credentials", "true")
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type,Authorization, Accept");
    if (req.method == "OPTIONS") {
        res.end()
    } else {
        next()
    }
}

module.exports = corsFilter