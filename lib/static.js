"use strict";

var through = require("through");
var jade = require("jade");

// ref/credit: https://github.com/joliss/js-string-escape/blob/master/index.js
var jsEncode = function (string) {
  return ('' + string).replace(/["'\\\n\r\u2028\u2029]/g, function (character) {
    // Escape all not in SingleStringCharacters and DoubleStringCharacters on
    // http://www.ecma-international.org/ecma-262/5.1/#sec-7.8.4
    switch (character) {
      case '"':
      case "'":
      case '\\':
        return '\\' + character
      // Four possible LineTerminator characters need to be escaped:
      case '\n':
        return '\\n'
      case '\r':
        return '\\r'
      case '\u2028':
        return '\\u2028'
      case '\u2029':
        return '\\u2029'
    }
  })
}
module.exports = function _jadeStringify(fileName, options) {
    if (!/\.jade$/i.test(fileName)) {
        return through();
    }
    if (typeof(options) !== "object") {
        options = {};
    }
    options.runtimePath = options.runtimePath === undefined ? "jade/runtime" : options.runtimePath;

    var inputString = "";
    return through(
        function _data(chunk) {
            inputString += chunk;
        },
        function _end() {
            options.filename = fileName;

            var result, tmplFn;
            try {
                result = jade.compileClientWithDependenciesTracked(inputString, options);
                tmplFn = jade.compile(inputString, options);
            } catch (e) {
                this.emit("error", e);
                return;
            }
            // console.log('result',result);
            console.log("options=", options);

            result.dependencies.forEach(function (dep) {
                this.emit("file", dep);
            }, this);
            var moduleBody = "module.exports = " + JSON.stringify(tmplFn(options)) + ";";
            // var moduleBody = "module.exports = \"" + encodeURIComponent(tmplFn(options)) + "\";";
            console.log("moduleString=", moduleBody);

            this.queue(moduleBody);
            this.queue(null);
        }
    );
};
