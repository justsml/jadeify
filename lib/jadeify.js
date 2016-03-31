"use strict";

var through = require("through");
var jade = require("jade");

module.exports = function (fileName, options) {
    if (!/\.jade$/i.test(fileName)) {
        return through();
    }
    if (typeof(options) !== "object") {
        options = {};
    }
    options.locals      = options.locals      === undefined ? {}             : options.locals;
    options.runtimePath = options.runtimePath === undefined ? "jade/runtime" : options.runtimePath;

    var inputString = "";
    return through(
        function (chunk) {
            inputString += chunk;
        },
        function () {
            var result, tmplFn, moduleBody;

            options.filename = fileName;

            try {
                result = jade.compileClientWithDependenciesTracked(inputString, options);
                if (options.static) {
                    tmplFn = jade.compile(inputString, options);
                }
            } catch (e) {
                this.emit("error", e);
                return;
            }

            result.dependencies.forEach(function (dep) {
                this.emit("file", dep);
            }, this);

            if (!options.static) {
                moduleBody = "var jade = require(\"" + options.runtimePath + "\");\n\n" +
                             "module.exports = " + result.body + ";";
             } else {
                moduleBody = "module.exports = " + JSON.stringify(tmplFn(options.locals || {})) + ";";
             }

            this.queue(moduleBody);
            this.queue(null);
        }
    );
};
