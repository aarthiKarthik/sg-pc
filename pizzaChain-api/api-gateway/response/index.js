function Response(code, message, data, err) {
    this.code = code;
    this.message = message;
    this.data = data;
    if (err) {
        this.err = typeof err == "string" ? err : err.message;
    } else {
        this.err = null
    }

}

module.exports = Response