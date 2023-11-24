function ErrorHelper() { }

ErrorHelper.reThrow = (message, err) => {
    let e = new Error(message)
    e.original_error = err
    e.stack = e.stack.split('\n').slice(0, 2).join('\n') + '\n' +
        err.stack
    return e
}

module.exports = ErrorHelper;