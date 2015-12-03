# A Browserify Transform for Jade

**Jadeify** lets you use [Jade][] templates with [browserify][] in the simplest way possible:

```js
var template = require("./template.jade");

document.getElementById("my-thing").innerHTML = template({
    localVar: "value",
    anotherOne: "another value"
});
```

## New Mode: Pre-Compile to plain ol' strings

This is especially useful if you already use client-side templating; probably something like AngularJS, handlebars, EJS, mustache, etc.
If this sounds like you, feed your existing template engine WITH PRE-COMPILED JADE strings. [View Example Angular Directive](#example-angular-directive).


```js
// Alternative mode:
bundle.transform(require("jadeify/static"), {pretty: true, locals: { foo: "bar"} }});
```

or if you are a command line cowboy, something along the lines of

```js
browserify -t 'jadeify/static' entry.js -o bundle.js
```



## Setup

When creating your browserify bundle, just add this line:

```js
bundle.transform(require("jadeify"));
```

or if you are a command line cowboy, something along the lines of

```js
browserify -t jadeify entry.js -o bundle.js
```

Note that this project peer-depends on Jade and each template will do `require("jade/runtime")`, so everything will just work: there's no need to add any Jade-related stuff to your bundle manually. (See below if your need to customize this.)

So yeah, now `require`ing any `.jade` files will give you back a template function. Have fun!

## Configuration

As with most browserify transforms, you can configure jadeify via the second argument to `bundle.transform`:

```js
bundle.transform(require("jadeify"), { compileDebug: true, pretty: true });
```

or inside your `package.json` configuration:

```json
{
    "name": "my-spiffy-package",
    "browserify": {
        "transform": [
            ["jadeify", { "compileDebug": true, "pretty": true }]
        ]
    }
}
```

Most options given to jadeify will be passed through to [Jade's API][].

### `runtimePath` option

There is one additional option, `runtimePath`, which can be used to customize the `require` statement inserted at the top of every resulting template. If supplied, instead of `require("jade/runtime")`, the given module ID will be required.

This can be useful if you are using jadeify as a dependency in a standalone library. For example, if your package `demo-package` depends on both `jade` and `jadeify`, you can do

```js
bundle.transform(require("jadeify"), { runtimePath: require.resolve("jade/runtime") });
```

inside your package. If your package is then located at `node_modules/demo-package`, and thus its `jade` dependency is located at `node_modules/demo-package/node_modules/jade`, this will ensure that the template files output by your library contain the equivalent of `require("demo-package/node_modules/jade/runtime")`, instead of the default `require("jade/runtime")`. This way your library completely encapsulates the presence of Jade, and doesn't require its installation at top level.



## Example Angular Directive

Review the 2 example files below. The component file, `user-roster.js` references the template using `require('./user-roster.jade')` which embeds the template as a plain string.

AngularJS v1.x happens to be used for this example:

```js
// user-roster.js
angular.directive('userRoster', function _userRoster(userService) {
  return {
    template: require('./user-roster.jade'),
    scope: { members: '=' },
    link: function (scope, element, attrs, controller) {
      // directive code here
    }
  };
})
```

> `user-roster.jade` - an example angular template.
> Note: the Angular template expression: '{{ m.name }}'

```jade
ul: li(ng-repeat='m in members') {{ m.name }}
```


[Jade]: http://jade-lang.com/
[browserify]: https://github.com/substack/node-browserify
[Jade's API]: http://jade-lang.com/api/
