﻿$engine JScript
$uname highlight
$dname Раскраска кода 1С
$addin global
$addin stdcommands
$addin stdlib

stdlib.require('TextWindow.js', SelfScript);

////////////////////////////////////////////////////////////////////////////////////////
////{ Cкрипт "Раскраска кода 1С" (highlight.js) для проекта "Снегопат"
////
//// Описание: Формирует html-код для выделенного текста модуля и выводит его форме 
//// в поле HTML-документа для копирования этого текста в текстовый редактор WYSIWYG 
//// с сохранением раскраски кода. Например, для оформления публикации в блоге или
//// подготовки сопровождающей документации.
////
//// Использует популярную библиотеку highlight.js Ивана Сагалаева 
//// http://softwaremaniacs.org/soft/highlight/
////
//// Автор Модуля раскраски кода 1С для highlight.js - Юрий Иванов <ivanov@supersoft.ru>
////
//// Автор скрипта: Александр Кунташов <kuntashov@gmail.com>, http://compaud.ru/blog
////}
////////////////////////////////////////////////////////////////////////////////////////



////////////////////////////////////////////////////////////////////////////////////////
////{ Макросы
////

SelfScript.Self['macrosРаскрасить выделенный текст'] = function () {

    var w = GetTextWindow();
    if (!w) return;
    
    var selText = w.GetSelectedText();
    if (!selText) return;

    var highlighter = new Highlighter(selText);
    highlighter.open();    
}

////}

StyleType = {
    'Default': 0,
    'BlackWhite': 1
}

pflStyleSetting = "Highlight/Style";
pflShowLineNumbers = "Highlight/ShowLineNumbers";

function Highlighter(code) {

    this.form = loadScriptForm(SelfScript.fullPath.replace(/js$/, 'ssf'), this);
    this.doc = this.form.Controls.HTMLDoc.document;
    this.code = this.replaceTabs(code);   
    
    profileRoot.createValue(pflStyleSetting, StyleType.Default, pflSnegopat);
    profileRoot.createValue(pflShowLineNumbers, false, pflSnegopat);    
    
    this.style = profileRoot.getValue(pflStyleSetting);
    this.form.Controls.Style.Value = this.style;
    
    this.showLineNumbers = profileRoot.getValue(pflShowLineNumbers);
    this.form.Controls.ShowLineNumbers.Value = this.showLineNumbers;
}

Highlighter.prototype.open = function () {
    this.form.Open();
}

Highlighter.prototype.startHTMLDoc = function () {
    this.doc.clear();
    this.doc.writeln("<!DOCTYPE html><body><style>");
    this.doc.writeln(this.getStylesheetSource());
    this.doc.writeln("</style>");
}

Highlighter.prototype.getStylesheetSource = function () {
    var style;
    switch (this.style)
    {
    case StyleType.BlackWhite:
        style = ""
        + "li { color: gray; }"
        + "font { color: black; font-size: 10pt; }"
        + "pre code {display: block; font: Courier New, padding: 0.5em; font-size: 10pt;}"
        + "pre code { color: black; }"
        + "pre .string { color: black; }"
        + "pre .comment { color: gray; font-style: italic; }"
        + "pre .number { color: black; }"
        + "pre .date { color: black; }"
        + "pre .keyword { color: black; font-weight: bold; }"
        + "pre .preprocessor { color: gray; font-weight: bold; font-style: italic; }"
        + "pre.operator { color: black; }";
        break;
        
    default:
        style = ""
        + "li { color: gray; }"
        + "font { color: blue; font-size: 10pt; }"
        + "pre code {display: block; font: Courier New, padding: 0.5em; background: white; font-size: 10pt; }"
        + "pre code { color: blue; }"
        + "pre .string { color: black; }"
        + "pre .comment { color: green; }"
        + "pre .number { color: black; }"
        + "pre .date { color: black; }"
        + "pre .keyword { color: red; }"
        + "pre .preprocessor { color: brown; }"
        + "pre.operator { color: red; }";
        break;
    }
    return style;
}

Highlighter.prototype.endHTMLDoc = function () {
    this.doc.writeln('</body>');
    this.doc.writeln('</html>');
}

Highlighter.prototype.replaceTabs = function (code) {
    var tabSize = profileRoot.getValue("ModuleTextEditor/TabSize");
    var tabReplace = '';
    for (var i=0; i < tabSize; i++)
        tabReplace += ' ';
    return hljs.fixMarkup(code, tabReplace);
}

Highlighter.prototype.highlightCode = function () {

    this.startHTMLDoc();
    
    var obj = hljs.highlight('1c', this.code);
    
    if (this.showLineNumbers) 
    {
        this.doc.writeln('<pre><code><ol>');
    
        var a = obj.value.replace(/^\s+/, '').replace(/\s*$/,'').replace(/^\s*$/gm, "&nbsp;\n").split(/\n/);
        for (var i=0; i<a.length; i++)
            this.doc.writeln('<li><font>' + a[i] + '</font></li>');
        this.doc.writeln('</ol></code></pre>');   
    }
    else
    {
        this.doc.writeln('<pre><code>');
        this.doc.writeln(obj.value);
        this.doc.writeln('</code></pre>');    
    }
    
    this.endHTMLDoc(); 
}

Highlighter.prototype.reload = function () {
    this.doc.getElementsByTagName('body')[0].innerHTML = '';
    this.highlightCode();
}

Highlighter.prototype.OnOpen = function () {
    this.highlightCode();    
}

Highlighter.prototype.CmdBarReload = function (Кнопка) {
    this.reload();
}

Highlighter.prototype.StyleOnChange = function (Элемент) {
    this.style = this.form.Controls.Style.Value;
    profileRoot.setValue(pflStyleSetting, this.style);    
    this.reload();
}

Highlighter.prototype.ShowLineNumbersOnChange = function (Элемент) {
	this.showLineNumbers = this.form.Controls.ShowLineNumbers.Value;
    profileRoot.setValue(pflShowLineNumbers, this.showLineNumbers);
    this.reload();
}

Highlighter.prototype.CmdBarShowHTML = function (Кнопка) {
    Message(this.doc.getElementsByTagName('body')[0].innerHTML);
}



////////////////////////////////////////////////////////////////////////////////////////
////{ highlight.js by Ivan Sagalaev http://softwaremaniacs.org/soft/highlight/
////

/*
Syntax highlighting with language autodetection.
http://softwaremaniacs.org/soft/highlight/
*/

var hljs = new function() {

  /* Utility functions */

  function escape(value) {
    return value.replace(/&/gm, '&amp;').replace(/</gm, '&lt;');
  }

  function langRe(language, value, global) {
    return RegExp(
      value,
      'm' + (language.case_insensitive ? 'i' : '') + (global ? 'g' : '')
    );
  }

  function findCode(pre) {
    for (var i = 0; i < pre.childNodes.length; i++) {
      var node = pre.childNodes[i];
      if (node.nodeName == 'CODE')
        return node;
      if (!(node.nodeType == 3 && node.nodeValue.match(/\s+/)))
        break;
    }
  }

  function blockText(block, ignoreNewLines) {
    var result = '';
    for (var i = 0; i < block.childNodes.length; i++)
      if (block.childNodes[i].nodeType == 3) {
        var chunk = block.childNodes[i].nodeValue;
        if (ignoreNewLines)
          chunk = chunk.replace(/\n/g, '');
        result += chunk;
      } else if (block.childNodes[i].nodeName == 'BR')
        result += '\n';
      else
        result += blockText(block.childNodes[i]);
    // Thank you, MSIE...
    if (/MSIE [678]/.test(navigator.userAgent))
      result = result.replace(/\r/g, '\n');
    return result;
  }

  function blockLanguage(block) {
    var classes = block.className.split(/\s+/)
    classes = classes.concat(block.parentNode.className.split(/\s+/));
    for (var i = 0; i < classes.length; i++) {
      var class_ = classes[i].replace(/^language-/, '');
      if (languages[class_] || class_ == 'no-highlight') {
        return class_;
      }
    }
  }

  /* Stream merging */

  function nodeStream(node) {
    var result = [];
    (function (node, offset) {
      for (var i = 0; i < node.childNodes.length; i++) {
        if (node.childNodes[i].nodeType == 3)
          offset += node.childNodes[i].nodeValue.length;
        else if (node.childNodes[i].nodeName == 'BR')
          offset += 1
        else {
          result.push({
            event: 'start',
            offset: offset,
            node: node.childNodes[i]
          });
          offset = arguments.callee(node.childNodes[i], offset)
          result.push({
            event: 'stop',
            offset: offset,
            node: node.childNodes[i]
          });
        }
      }
      return offset;
    })(node, 0);
    return result;
  }

  function mergeStreams(stream1, stream2, value) {
    var processed = 0;
    var result = '';
    var nodeStack = [];

    function selectStream() {
      if (stream1.length && stream2.length) {
        if (stream1[0].offset != stream2[0].offset)
          return (stream1[0].offset < stream2[0].offset) ? stream1 : stream2;
        else {
          /*
          To avoid starting the stream just before it should stop the order is
          ensured that stream1 always starts first and closes last:

          if (event1 == 'start' && event2 == 'start')
            return stream1;
          if (event1 == 'start' && event2 == 'stop')
            return stream2;
          if (event1 == 'stop' && event2 == 'start')
            return stream1;
          if (event1 == 'stop' && event2 == 'stop')
            return stream2;

          ... which is collapsed to:
          */
          return stream2[0].event == 'start' ? stream1 : stream2;
        }
      } else {
        return stream1.length ? stream1 : stream2;
      }
    }

    function open(node) {
      var result = '<' + node.nodeName.toLowerCase();
      for (var i = 0; i < node.attributes.length; i++) {
        var attribute = node.attributes[i];
        result += ' ' + attribute.nodeName.toLowerCase();
        if (attribute.nodeValue != undefined && attribute.nodeValue != false && attribute.nodeValue != null) {
          result += '="' + escape(attribute.nodeValue) + '"';
        }
      }
      return result + '>';
    }

    while (stream1.length || stream2.length) {
      var current = selectStream().splice(0, 1)[0];
      result += escape(value.substr(processed, current.offset - processed));
      processed = current.offset;
      if ( current.event == 'start') {
        result += open(current.node);
        nodeStack.push(current.node);
      } else if (current.event == 'stop') {
        var i = nodeStack.length;
        do {
          i--;
          var node = nodeStack[i];
          result += ('</' + node.nodeName.toLowerCase() + '>');
        } while (node != current.node);
        nodeStack.splice(i, 1);
        while (i < nodeStack.length) {
          result += open(nodeStack[i]);
          i++;
        }
      }
    }
    result += value.substr(processed);
    return result;
  }

  /* Initialization */

  function compileModes() {

    function compileMode(mode, language, is_default) {
      if (mode.compiled)
        return;

      if (!is_default) {
        mode.beginRe = langRe(language, mode.begin ? mode.begin : '\\B|\\b');
        if (!mode.end && !mode.endsWithParent)
          mode.end = '\\B|\\b'
        if (mode.end)
          mode.endRe = langRe(language, mode.end);
      }
      if (mode.illegal)
        mode.illegalRe = langRe(language, mode.illegal);
      if (mode.relevance == undefined)
        mode.relevance = 1;
      if (mode.keywords)
        mode.lexemsRe = langRe(language, mode.lexems || hljs.IDENT_RE, true);
      for (var key in mode.keywords) {
        if (!mode.keywords.hasOwnProperty(key))
          continue;
        if (mode.keywords[key] instanceof Object)
          mode.keywordGroups = mode.keywords;
        else
          mode.keywordGroups = {'keyword': mode.keywords};
        break;
      }
      if (!mode.contains) {
        mode.contains = [];
      }
      // compiled flag is set before compiling submodes to avoid self-recursion
      // (see lisp where quoted_list contains quoted_list)
      mode.compiled = true;
      for (var i = 0; i < mode.contains.length; i++) {
        compileMode(mode.contains[i], language, false);
      }
      if (mode.starts) {
        compileMode(mode.starts, language, false);
      }
    }

    for (var i in languages) {
      if (!languages.hasOwnProperty(i))
        continue;
      compileMode(languages[i].defaultMode, languages[i], true);
    }
  }

  /*
  Core highlighting function. Accepts a language name and a string with the
  code to highlight. Returns an object with the following properties:

  - relevance (int)
  - keyword_count (int)
  - value (an HTML string with highlighting markup)

  */
  function highlight(language_name, value) {
    if (!compileModes.called) {
      compileModes();
      compileModes.called = true;
    }

    function subMode(lexem, mode) {
      for (var i = 0; i < mode.contains.length; i++) {
        if (mode.contains[i].beginRe.test(lexem)) {
          return mode.contains[i];
        }
      }
    }

    function endOfMode(mode_index, lexem) {
      if (modes[mode_index].end && modes[mode_index].endRe.test(lexem))
        return 1;
      if (modes[mode_index].endsWithParent) {
        var level = endOfMode(mode_index - 1, lexem);
        return level ? level + 1 : 0;
      }
      return 0;
    }

    function isIllegal(lexem, mode) {
      return mode.illegalRe && mode.illegalRe.test(lexem);
    }

    function compileTerminators(mode, language) {
      var terminators = [];

      for (var i = 0; i < mode.contains.length; i++) {
        terminators.push(mode.contains[i].begin);
      }

      var index = modes.length - 1;
      do {
        if (modes[index].end) {
          terminators.push(modes[index].end);
        }
        index--;
      } while (modes[index + 1].endsWithParent);

      if (mode.illegal) {
        terminators.push(mode.illegal);
      }

      return langRe(language, '(' + terminators.join('|') + ')', true);
    }

    function eatModeChunk(value, index) {
      var mode = modes[modes.length - 1];
      if (!mode.terminators) {
        mode.terminators = compileTerminators(mode, language);
      }
      mode.terminators.lastIndex = index;
      var match = mode.terminators.exec(value);
      if (match)
        return [value.substr(index, match.index - index), match[0], false];
      else
        return [value.substr(index), '', true];
    }

    function keywordMatch(mode, match) {
      var match_str = language.case_insensitive ? match[0].toLowerCase() : match[0]
      for (var className in mode.keywordGroups) {
        if (!mode.keywordGroups.hasOwnProperty(className))
          continue;
        var value = mode.keywordGroups[className].hasOwnProperty(match_str);
        if (value)
          return [className, value];
      }
      return false;
    }

    function processKeywords(buffer, mode) {
      if (!mode.keywords)
        return escape(buffer);
      var result = '';
      var last_index = 0;
      mode.lexemsRe.lastIndex = 0;
      var match = mode.lexemsRe.exec(buffer);
      while (match) {
        result += escape(buffer.substr(last_index, match.index - last_index));
        var keyword_match = keywordMatch(mode, match);
        if (keyword_match) {
          keyword_count += keyword_match[1];
          result += '<span class="'+ keyword_match[0] +'">' + escape(match[0]) + '</span>';
        } else {
          result += escape(match[0]);
        }
        last_index = mode.lexemsRe.lastIndex;
        match = mode.lexemsRe.exec(buffer);
      }
      result += escape(buffer.substr(last_index, buffer.length - last_index));
      return result;
    }

    function processBuffer(buffer, mode) {
      if (mode.subLanguage && languages[mode.subLanguage]) {
        var result = highlight(mode.subLanguage, buffer);
        keyword_count += result.keyword_count;
        return result.value;
      } else {
        return processKeywords(buffer, mode);
      }
    }

    function startNewMode(mode, lexem) {
      var markup = mode.className?'<span class="' + mode.className + '">':'';
      if (mode.returnBegin) {
        result += markup;
        mode.buffer = '';
      } else if (mode.excludeBegin) {
        result += escape(lexem) + markup;
        mode.buffer = '';
      } else {
        result += markup;
        mode.buffer = lexem;
      }
      modes.push(mode);
      relevance += mode.relevance;
    }

    function processModeInfo(buffer, lexem, end) {
      var current_mode = modes[modes.length - 1];
      if (end) {
        result += processBuffer(current_mode.buffer + buffer, current_mode);
        return false;
      }

      var new_mode = subMode(lexem, current_mode);
      if (new_mode) {
        result += processBuffer(current_mode.buffer + buffer, current_mode);
        startNewMode(new_mode, lexem);
        return new_mode.returnBegin;
      }

      var end_level = endOfMode(modes.length - 1, lexem);
      if (end_level) {
        var markup = current_mode.className?'</span>':'';
        if (current_mode.returnEnd) {
          result += processBuffer(current_mode.buffer + buffer, current_mode) + markup;
        } else if (current_mode.excludeEnd) {
          result += processBuffer(current_mode.buffer + buffer, current_mode) + markup + escape(lexem);
        } else {
          result += processBuffer(current_mode.buffer + buffer + lexem, current_mode) + markup;
        }
        while (end_level > 1) {
          markup = modes[modes.length - 2].className?'</span>':'';
          result += markup;
          end_level--;
          modes.length--;
        }
        var last_ended_mode = modes[modes.length - 1];
        modes.length--;
        modes[modes.length - 1].buffer = '';
        if (last_ended_mode.starts) {
          startNewMode(last_ended_mode.starts, '');
        }
        return current_mode.returnEnd;
      }

      if (isIllegal(lexem, current_mode))
        throw 'Illegal';
    }

    var language = languages[language_name];
    var modes = [language.defaultMode];
    var relevance = 0;
    var keyword_count = 0;
    var result = '';
    try {
      var index = 0;
      language.defaultMode.buffer = '';
      do {
        var mode_info = eatModeChunk(value, index);
        var return_lexem = processModeInfo(mode_info[0], mode_info[1], mode_info[2]);
        index += mode_info[0].length;
        if (!return_lexem) {
          index += mode_info[1].length;
        }
      } while (!mode_info[2]);
      if(modes.length > 1)
        throw 'Illegal';
      return {
        relevance: relevance,
        keyword_count: keyword_count,
        value: result
      }
    } catch (e) {
      if (e == 'Illegal') {
        return {
          relevance: 0,
          keyword_count: 0,
          value: escape(value)
        }
      } else {
        throw e;
      }
    }
  }

  /*
  Highlighting with language detection. Accepts a string with the code to
  highlight. Returns an object with the following properties:

  - language (detected language)
  - relevance (int)
  - keyword_count (int)
  - value (an HTML string with highlighting markup)
  - second_best (object with the same structure for second-best heuristically
    detected language, may be absent)

  */
  function highlightAuto(text) {
    var result = {
      keyword_count: 0,
      relevance: 0,
      value: escape(text)
    };
    var second_best = result;
    for (var key in languages) {
      if (!languages.hasOwnProperty(key))
        continue;
      var current = highlight(key, text);
      current.language = key;
      if (current.keyword_count + current.relevance > second_best.keyword_count + second_best.relevance) {
        second_best = current;
      }
      if (current.keyword_count + current.relevance > result.keyword_count + result.relevance) {
        second_best = result;
        result = current;
      }
    }
    if (second_best.language) {
      result.second_best = second_best;
    }
    return result;
  }

  /*
  Post-processing of the highlighted markup:

  - replace TABs with something more useful
  - replace real line-breaks with '<br>' for non-pre containers

  */
  function fixMarkup(value, tabReplace, useBR) {
    if (tabReplace) {
      value = value.replace(/^((<[^>]+>|\t)+)/gm, function(match, p1, offset, s) {
        return p1.replace(/\t/g, tabReplace);
      })
    }
    if (useBR) {
      value = value.replace(/\n/g, '<br>');
    }
    return value;
  }

  /*
  Applies highlighting to a DOM node containing code. Accepts a DOM node and
  two optional parameters for fixMarkup.
  */
  function highlightBlock(block, tabReplace, useBR) {
    var text = blockText(block, useBR);
    var language = blockLanguage(block);
    if (language == 'no-highlight')
        return;
    if (language) {
      var result = highlight(language, text);
    } else {
      var result = highlightAuto(text);
      language = result.language;
    }
    var original = nodeStream(block);
    if (original.length) {
      var pre = document.createElement('pre');
      pre.innerHTML = result.value;
      result.value = mergeStreams(original, nodeStream(pre), text);
    }
    result.value = fixMarkup(result.value, tabReplace, useBR);

    var class_name = block.className;
    if (!class_name.match('(\\s|^)(language-)?' + language + '(\\s|$)')) {
      class_name = class_name ? (class_name + ' ' + language) : language;
    }
    if (/MSIE [678]/.test(navigator.userAgent) && block.tagName == 'CODE' && block.parentNode.tagName == 'PRE') {
      // This is for backwards compatibility only. IE needs this strange
      // hack becasue it cannot just cleanly replace <code> block contents.
      var pre = block.parentNode;
      var container = document.createElement('div');
      container.innerHTML = '<pre><code>' + result.value + '</code></pre>';
      block = container.firstChild.firstChild;
      container.firstChild.className = pre.className;
      pre.parentNode.replaceChild(container.firstChild, pre);
    } else {
      block.innerHTML = result.value;
    }
    block.className = class_name;
    block.result = {
      language: language,
      kw: result.keyword_count,
      re: result.relevance
    };
    if (result.second_best) {
      block.second_best = {
        language: result.second_best.language,
        kw: result.second_best.keyword_count,
        re: result.second_best.relevance
      };
    }
  }

  /*
  Applies highlighting to all <pre><code>..</code></pre> blocks on a page.
  */
  function initHighlighting() {
    if (initHighlighting.called)
      return;
    initHighlighting.called = true;
    var pres = document.getElementsByTagName('pre');
    for (var i = 0; i < pres.length; i++) {
      var code = findCode(pres[i]);
      if (code)
        highlightBlock(code, hljs.tabReplace);
    }
  }

  /*
  Attaches highlighting to the page load event.
  */
  function initHighlightingOnLoad() {
    if (window.addEventListener) {
      window.addEventListener('DOMContentLoaded', initHighlighting, false);
      window.addEventListener('load', initHighlighting, false);
    } else if (window.attachEvent)
      window.attachEvent('onload', initHighlighting);
    else
      window.onload = initHighlighting;
  }

  var languages = {}; // a shortcut to avoid writing "this." everywhere

  /* Interface definition */

  this.LANGUAGES = languages;
  this.highlight = highlight;
  this.highlightAuto = highlightAuto;
  this.fixMarkup = fixMarkup;
  this.highlightBlock = highlightBlock;
  this.initHighlighting = initHighlighting;
  this.initHighlightingOnLoad = initHighlightingOnLoad;

  // Common regexps
  this.IDENT_RE = '[a-zA-Z][a-zA-Z0-9_]*';
  this.UNDERSCORE_IDENT_RE = '[a-zA-Z_][a-zA-Z0-9_]*';
  this.NUMBER_RE = '\\b\\d+(\\.\\d+)?';
  this.C_NUMBER_RE = '\\b(0x[A-Za-z0-9]+|\\d+(\\.\\d+)?)';
  this.RE_STARTERS_RE = '!|!=|!==|%|%=|&|&&|&=|\\*|\\*=|\\+|\\+=|,|\\.|-|-=|/|/=|:|;|<|<<|<<=|<=|=|==|===|>|>=|>>|>>=|>>>|>>>=|\\?|\\[|\\{|\\(|\\^|\\^=|\\||\\|=|\\|\\||~';

  // Common modes
  this.BACKSLASH_ESCAPE = {
    begin: '\\\\.', relevance: 0
  };
  this.APOS_STRING_MODE = {
    className: 'string',
    begin: '\'', end: '\'',
    illegal: '\\n',
    contains: [this.BACKSLASH_ESCAPE],
    relevance: 0
  };
  this.QUOTE_STRING_MODE = {
    className: 'string',
    begin: '"', end: '"',
    illegal: '\\n',
    contains: [this.BACKSLASH_ESCAPE],
    relevance: 0
  };
  this.C_LINE_COMMENT_MODE = {
    className: 'comment',
    begin: '//', end: '$'
  };
  this.C_BLOCK_COMMENT_MODE = {
    className: 'comment',
    begin: '/\\*', end: '\\*/'
  };
  this.HASH_COMMENT_MODE = {
    className: 'comment',
    begin: '#', end: '$'
  };
  this.NUMBER_MODE = {
    className: 'number',
    begin: this.NUMBER_RE,
    relevance: 0
  };
  this.C_NUMBER_MODE = {
    className: 'number',
    begin: this.C_NUMBER_RE,
    relevance: 0
  };

  // Utility functions
  this.inherit = function(parent, obj) {
    var result = {}
    for (var key in parent)
      result[key] = parent[key];
    if (obj)
      for (var key in obj)
        result[key] = obj[key];
    return result;
  }
}();

////}

////////////////////////////////////////////////////////////////////////////////////////
////{ 1C language description for highlight.js 
////

/*
Language: 1C
Author: Yuri Ivanov <ivanov@supersoft.ru>
Contributors: Sergey Baranov <segyrn@yandex.ru>
*/

hljs.LANGUAGES['1c'] = function(){
  
  var IDENT_RE_RU = '[a-zA-Zа-яА-Я_][a-zA-Z0-9_а-яА-Я]*';
  
  var OneS_KEYWORDS = {'новый': 1, 'возврат':1,'для':1,'если':1,'и':1,'или':1, 'из':1, 'иначе':1,'иначеесли':1,
    'исключение':1,'конецесли':1,'конецпопытки':1,'конецпроцедуры':1,'конецфункции':1,'конеццикла':1, 'каждого':1,
    'новый':1, 'не':1,'перейти':1,'перем':1,'перечисление':1,'по':1,'каждого':1, 'пока':1,'попытка':1,'прервать':1,
    'продолжить':1, 'процедура':1, 'строка':1,'тогда':1,'функция':1,'цикл':1,'число':1,'экспорт':1, 
    'вызватьисключение':1, 'добавитьобработчик':1, 'удалитьобработчик':1, 'выполнить':1};
    
  var DQUOTE =  {className: 'dquote',  begin: '""'};
  var STR_START = {
      className: 'string',
      begin: '"', end: '"|$',
      contains: [DQUOTE],
      relevance: 0
    };
  var STR_CONT = {
    className: 'string',
    begin: '\\|', end: '"|$',
    contains: [DQUOTE]
  };

  return {
    case_insensitive: true,
    defaultMode: {
      lexems: IDENT_RE_RU,
      keywords: {'keyword':OneS_KEYWORDS},
      contains: [
        hljs.C_LINE_COMMENT_MODE,
        hljs.NUMBER_MODE,
        STR_START, STR_CONT,
        {
          className: 'function',
          begin: '(процедура|функция)', end: '$',
          lexems: IDENT_RE_RU,
          keywords: {'процедура': 1, 'экспорт': 1, 'функция': 1},
          contains: [
            {className: 'title', begin: IDENT_RE_RU},
            {
              className: 'tail',
              endsWithParent: true,
              contains: [
                {
                  className: 'params',
                  begin: '\\(', end: '\\)',
                  lexems: IDENT_RE_RU,
                  keywords: {'знач':1},
                  contains: [STR_START, STR_CONT]
                },
                {
                  className: 'export',
                  begin: 'экспорт', endsWithParent: true,
                  lexems: IDENT_RE_RU,
                  keywords: {'экспорт': 1},
                  contains: [hljs.C_LINE_COMMENT_MODE]
                }
              ]
            },
            hljs.C_LINE_COMMENT_MODE
          ]
        },
        {className: 'preprocessor', begin: '#', end: '$'},
        {className: 'date', begin: '\'\\d{2}\\.\\d{2}\\.(\\d{2}|\\d{4})\''}
      ]
    }
  };
}();

////}

