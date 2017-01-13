Promise = require('promise')
fs = require('fs')
read = require('./read')

types = [
  'bool'
  'boolean'
  'string'
  'array'
  'mixed'
  'object'
  'void'
]

modif = [
  'public'
  'private'
  'protected'
  'static'
]
regexp =
  'returnRex': new RegExp('\\*(\\s)?(@)(return)\\s?(' + types.join('|') + ')?([^\n]+)', 'i')
  'paramRex': /\\*([ \s])?@param([ \s])([a-z0-9_\-]*)[ \s](\$[a-z\-_0-9]+)(.*)?/i
  'functionRex': new RegExp('(' + modif.join('|') + ')?([ s])?function([ s])(.*)', 'ig')
  'namespaceRex': ''
  'useRex': ''
  'classRex': /^[\s]*class[\s]+([a-z0-9_]+)[\s]+(extends[\s]+[a-zA-Z0-9_\x7f-\xff\\]+)?[\s]*(implements[\s]+[a-zA-Z0-9_\x7f-\xff\\]+)?[\s\{]*$/i
  'extendsRex': /extends[\s]+([a-zA-Z0-9_\x7f-\xff\\]+)/i
  'implementsRex': /implements[\s]+([a-zA-Z0-9_\x7f-\xff\\]+)/i
  'variableRex': /^([\s]*)([^#(\/\/)]) ?(public |private |protected |static |\$|\'|\")([a-zA-Z0-9_\x7f-\xff\[\]\$\->]+)(\'|\")* *(=>?) *([\(\)a-zA-Z0-9_\x7f-\xff\'\"\,\s\$\-_\/>\[\]\{\}\|\?=:\.!¡@]+)(;|,){1}$/i
  'constRex': /^([\s]*)([^#(\/\/)]) ?const ([a-zA-Z0-9_\x7f-\xff]+) *= *([\(\)a-zA-Z0-9_\x7f-\xff\'\"\,\s\$\-_\/>\[\]\{\}\|\?=:\.!¡@]+)(;|,){1}$/ig

module.exports = (files) ->
  this_class = ''
  declarations = []
  _classes = []
  variables = []

  @callback = @async()

  files.forEach (file) ->
  	emit 'scan-start',
        'file': file,
       	'files': files.length

    buffer = fs.readFileSync(file)
    lineas = buffer.toString().split('\n')

    es_documentacion = false
    wait = false
    line = 0

    lineas.forEach (linea) ->
      `var lastone`
      `var parts`
      `var parts`
      `var parts`

      line++
      ultima = (if declarations.length < 1 then 1 else declarations.length) - 1
      short = linea.trim()

      # Beginning of documentation
      if short.substr(0, 3) == '/**'
        es_documentacion = true
        declarations.push
          'name': ''
          'parameters': []
          'return':
            'type': ''
            'description': ''
          'line': 0
          '_class': this_class
          'url': file
          'type': 'function'
          'description': ''

      else if es_documentacion and short.substr(0, 2) == '*/'
        es_documentacion = false
        wait = true

      else if wait
        lastone = declarations.length - 1

        if short.trim() != '' and declarations[lastone].name == ''
          if short.indexOf('function') > -1 and short.indexOf('@') == -1 and short.indexOf('*') == -1
            clean = short.replace(new RegExp('(' + modif.join('|') + ')', 'i'), '').replace('function', '').trim()
            parts = clean.split('(')

            if parts[0] != ''
              declarations[lastone].name = parts[0].trim()
              declarations[lastone].line = line
            wait = false

      else
        lastone = declarations.length - 1

        # Return type
        if regexp['returnRex'].test(short)
          parts = short.match(regexp['returnRex'])

          if types.indexOf(parts[5]) > -1
            declarations[lastone]['return'].type = parts[5].trim()

        else if regexp['paramRex'].test(short)
          parts = short.match(regexp['paramRex'])
          declarations[lastone].parameters.push
            'name': parts[4].trim()
            'type': parts[3]
            'description': if parts[5] and parts[5] != '' then parts[5].trim() else ''

        else if regexp['classRex'].test(short)
          parts = short.match(regexp['classRex'])
          extend = parts[0].match(regexp['extendsRex'])
          extendClass = if extend and extend.length > 1 then extend[1].replace('extends', '').trim() else ''

          if parts
            _classes.push
              'name': parts[1]
              'extends': extendClass
              'namespace': ''
              'uses': []
              'url': file
              'line': line
          this_class = parts[1]

        else if declarations[lastone] and short.indexOf('*') > -1 and short.indexOf('@') == -1 and es_documentacion
          declarations[lastone].description += short.replace(/\*/, '').trim()
      return

    return
  emit 'analysis-done',
    'functions': declarations.filter((func) ->
      func.name != ''
    )
    '_classes': _classes
    'variables': variables
  @callback()
