function StringHelper() { }

StringHelper.parseKeyValue = (rawString) => {
    const re = /(\w+)=([^\s]+)/g;
    let dict = {}, m;
    while ((m = re.exec(rawString))) {
      dict[m[1]] = m[3] || m[2];
    }
    return dict;
}

module.exports = StringHelper;