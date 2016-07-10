var fs = require('fs');
var path = require('path');

var Lisplate = require('lisplate');
var engine = new Lisplate();

function tryLoadingStrings(stringsPath, langs, done) {
  var filepath = stringsPath;
  if (langs && langs.length) {
    filepath += '__' + langs.pop();
  }
  filepath += '.json';

  fs.readFile(filepath, 'utf-8', function(err, json) {
    if (err) {
      if (langs) {
        tryLoadingStrings(stringsPath, langs, done);
      } else {
        done();
      }
      return;
    }

    done(null, JSON.parse(json));
  });
}

function setupLoaders(options) {
  var viewModelLoader = null;
  var stringsLoader = null;

  if (options.viewModelDirectory) {
    if (typeof options.viewModelDirectory === 'function') {
      viewModelLoader = options.viewModelDirectory;
    } else {
      viewModelLoader = function(templatePath) {
        var filepath = path.resolve(
          options.relativeTo,
          options.viewModelDirectory,
          templatePath + '.js'
        );
        var viewmodel = null;

        try {
          viewmodel = require(filepath);
        } catch (e) {
        }

        return viewmodel;
      };
    }
  }

  if (options.stringsDirectory) {
    if (typeof options.stringsDirectory === 'function') {
      stringsLoader = options.stringsDirectory;
    } else {
      stringsLoader = function(templatePath, callback) {
        var filepath = path.resolve(
          options.relativeTo,
          options.stringsDirectory,
          templatePath
        );
        tryLoadingStrings(filepath, null, callback);
      };
    }
  }

  engine.viewModelLoader = viewModelLoader,
  engine.stringsLoader = stringsLoader
}

module.exports = function makeViewEngine(engineOptions) {
  return {
    module: {
      prepare: function(config, done) {
        setupLoaders({
          viewModelDirectory: engineOptions.viewModelDirectory,
          stringsDirectory: engineOptions.stringsDirectory,
          relativeTo: config.relativeTo
        });
        done();
      },

      compile: function(src, options, callback) {
        var templateName = options
          .filename
          .substring(
            (this.config.relativeTo.length + this.config.path.length + 2),
            (options.filename.length - this.suffix.length)
          );

        var compiled = null;
        var factory = null;

        try {
          compiled = Lisplate.Compiler.compile(templateName, src);
          factory = Lisplate.Utils.loadCompiledSource(compiled);
        } catch (e) {
          callback(e);
          return;
        }

        engine
          .loadTemplate({templateName: templateName, renderFactory: factory})
          .then(function(fn) {
            callback(null, function(context, renderOptions, done) {
              engine.renderTemplate(templateName, context, done);
            });
          })
          .catch(function(err) {
            callback(err);
          });
      },

      registerHelper: function(name, helper) {
        engine.helpers[name] = helper;
      }

    },
    compileMode: 'async'
  };
};

// module.exports.localizationInit = function(req, res, next) {
//   var languages = req.headers['accept-language'];
//   if (languages) {
//     languages = languages.split(',');

//     var scores = {};
//     languages = languages.map(function(langInfo) {
//       var parts = langInfo.split(';q=');
//       var lang = parts[0];
//       if (parts.length === 2) {
//         scores[lang] = parseFloat(parts[1]) || 0.0;
//       } else {
//         scores[lang] = 1.0;
//       }

//       return lang;
//     }).filter(function(lang) {
//       return scores[lang] > 0.0;
//     }).sort(function(a, b) {
//       // sorted smallest first, to use pop from array
//       return scores[a] < scores[b];
//     });
//   }

//   req.langs = languages;
//   res.locals.$_langs = languages;
//   next();
// };
