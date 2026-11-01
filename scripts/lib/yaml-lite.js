/*
 * yaml-lite.js: reads and writes the simple YAML used in content/*.yaml.
 *
 * Plain Node, no packages. It understands the parts of YAML our content
 * files use, and nothing else:
 *
 *   name: Budget Bingo              text
 *   minutes: 15                     a number (true / false / null work too)
 *   summary: |-                     several lines of text, kept as written
 *     First line.
 *     Second line.
 *   materials:                      a list
 *     - Bingo cards
 *     - Markers
 *   options: ["Save it", "Spend it"]   a short list on one line (JSON style)
 *   prep:                           a group of named fields, indented 2 spaces
 *     openingScript: Hello!
 *   vocab:                          a list of groups
 *     - term: Budget
 *       def: A plan for money.
 *   # a whole-line comment
 *
 * Text that would otherwise be read as something else (a number, true/false,
 * or text starting with a quote or bracket) goes in double quotes: "42".
 * Indent with spaces, never tabs.
 */
"use strict";

function YamlError(line, msg) {
  var e = new Error("line " + line + ": " + msg);
  e.line = line;
  return e;
}

// ---------------------------------------------------------------- parse

function parse(text) {
  var raw = String(text).replace(/^﻿/, "").replace(/\r\n?/g, "\n").split("\n");
  var lines = raw.map(function (s, i) {
    if (/^\s*\t/.test(s)) throw YamlError(i + 1, "uses a tab to indent. Use spaces instead.");
    var t = s.replace(/\s+$/, "");
    var ind = t.length - t.replace(/^ +/, "").length;
    return { n: i + 1, raw: s, text: t.slice(ind), ind: ind, skip: !t.trim() || /^\s*#/.test(t) };
  });
  var pos = 0;

  function next() { while (pos < lines.length && lines[pos].skip) pos++; return lines[pos]; }

  function isSeq(l) { return l.text === "-" || l.text.slice(0, 2) === "- "; }

  // "key: rest" -> [key, rest], or null if the line isn't a key.
  function splitKey(t) {
    if (t.charAt(0) === '"') {
      var m = /^("(?:[^"\\]|\\.)*")\s*:(?: (.*)|)$/.exec(t);
      if (!m) return null;
      return [JSON.parse(m[1]), (m[2] || "").trim()];
    }
    var k = /^([^\s"'\[{#|>][^:]*?)\s*:(?: (.*)|)$/.exec(t);
    if (!k || k[1].slice(0, 2) === "- ") return null;
    return [k[1], (k[2] || "").trim()];
  }

  function scalar(s, n) {
    if (s === "") return "";
    var c = s.charAt(0);
    if (c === '"' || c === "[" || c === "{") {
      try { return JSON.parse(s); } catch (e) {
        throw YamlError(n, c === '"'
          ? "this quoted text isn't closed properly. Check for a missing \" at the end, or write \\\" for a quote inside."
          : "this one-line list isn't written correctly. It should look like [\"one\", \"two\"].");
      }
    }
    if (c === "'") {
      if (s.length < 2 || s.charAt(s.length - 1) !== "'") throw YamlError(n, "this quoted text isn't closed: add a ' at the end.");
      return s.slice(1, -1).replace(/''/g, "'");
    }
    if (s === "true") return true;
    if (s === "false") return false;
    if (s === "null" || s === "~") return null;
    if (/^-?\d+(\.\d+)?$/.test(s)) return Number(s);
    return s;
  }

  // Lines indented more than `ind` after the current one, as text.
  function blockText(ind, keep) {
    var out = [], min = Infinity, start = pos;
    while (pos < lines.length) {
      var l = lines[pos];
      if (l.raw.trim() && l.ind <= ind) break;
      if (l.raw.trim()) min = Math.min(min, l.ind);
      out.push(l);
      pos++;
    }
    while (out.length && !out[out.length - 1].raw.trim()) { out.pop(); }
    pos = start + out.length;
    if (min === Infinity) return "";
    var s = out.map(function (l) { return l.raw.trim() ? l.raw.replace(/\s+$/, "").slice(min) : ""; }).join("\n");
    return keep ? s + "\n" : s;
  }

  function value(rest, l, ind) {
    if (rest === "|" || rest === "|-") return blockText(ind, rest === "|");
    if (rest === ">" || rest === ">-") throw YamlError(l.n, 'use "|-" for text over several lines (">" isn\'t supported).');
    if (rest !== "") return scalar(rest, l.n);
    var c = next();
    if (!c) return null;
    if (c.ind > ind) return block(c.ind);
    if (c.ind === ind && isSeq(c)) return seq(ind);      // "key:" followed by "- item" at the same indent
    return null;
  }

  function block(ind) {
    var l = next();
    return isSeq(l) ? seq(ind) : map(ind);
  }

  function map(ind) {
    var obj = {};
    for (;;) {
      var l = next();
      if (!l || l.ind < ind) break;
      if (l.ind > ind) throw YamlError(l.n, "is indented more than the line above it expects.");
      if (isSeq(l)) {
        if (!Object.keys(obj).length) throw YamlError(l.n, "a list item (\"- \") is in the wrong place.");
        break;
      }
      var kv = splitKey(l.text);
      if (!kv) throw YamlError(l.n, 'should look like "name: value" (got "' + l.text.slice(0, 40) + '").');
      if (Object.prototype.hasOwnProperty.call(obj, kv[0])) throw YamlError(l.n, '"' + kv[0] + '" appears twice.');
      pos++;
      obj[kv[0]] = value(kv[1], l, ind);
    }
    return obj;
  }

  function seq(ind) {
    var arr = [];
    for (;;) {
      var l = next();
      if (!l || l.ind < ind) break;
      if (l.ind > ind) throw YamlError(l.n, "is indented more than the line above it expects.");
      if (!isSeq(l)) break;
      var rest = l.text === "-" ? "" : l.text.slice(2).replace(/^ +/, "");
      var childInd = ind + (l.text.length - rest.length);
      if (rest === "") { pos++; var c = next(); arr.push(c && c.ind > ind ? block(c.ind) : null); continue; }
      if (rest.slice(0, 2) === "- " || rest === "-" || splitKey(rest)) {
        // "- key: value" or "- - item": read it as a block that starts on this line.
        lines[pos] = { n: l.n, raw: new Array(childInd + 1).join(" ") + rest, text: rest, ind: childInd, skip: false };
        arr.push(block(childInd));
        continue;
      }
      pos++;
      arr.push(value(rest, l, ind));
    }
    return arr;
  }

  var first = next();
  if (!first) return {};
  if (first.ind !== 0) throw YamlError(first.n, "the first line shouldn't be indented.");
  var out = block(0);
  var left = next();
  if (left) throw YamlError(left.n, "doesn't line up with the lines above it. Check its indentation.");
  return out;
}

// ---------------------------------------------------------------- write

var KEY_OK = /^[A-Za-z0-9_][A-Za-z0-9_ .\/-]*$/;

function plainOk(s) {
  if (s === "" || s !== s.trim() || /\n/.test(s)) return false;
  if (/^["'\[{|>#]/.test(s) || s === "-" || s.slice(0, 2) === "- ") return false;
  if (/^(true|false|null|~|-?\d+(\.\d+)?)$/.test(s)) return false;
  return true;
}

function str(s, ind, inSeq) {
  if (/\n/.test(s) && !/[ \t]\n|[ \t]$/.test(s) && !/^\s/.test(s) && !/\n\s*\n\s*$/.test(s) && !/\n$/.test(s)) {
    var pad = new Array(ind + 3).join(" ");
    return "|-\n" + s.split("\n").map(function (l) { return l ? pad + l : ""; }).join("\n");
  }
  if (plainOk(s) && !(inSeq && /^[^\s"'\[{#|>][^:]*:( |$)/.test(s))) return s;
  return JSON.stringify(s);
}

function isScalar(v) { return v === null || typeof v !== "object"; }

function flowOk(arr) {
  if (!arr.every(function (x) { return isScalar(x) && (typeof x !== "string" || (x.length <= 40 && !/\n/.test(x))); })) return false;
  return JSON.stringify(arr).length <= 70;
}

function flow(arr) { return "[" + arr.map(function (x) { return JSON.stringify(x); }).join(", ") + "]"; }

function scalarText(v, ind, inSeq) {
  if (typeof v === "string") return str(v, ind, inSeq);
  return JSON.stringify(v);
}

function emitMap(obj, ind) {
  var pad = new Array(ind + 1).join(" ");
  return Object.keys(obj).map(function (k) {
    var key = KEY_OK.test(k) ? k : JSON.stringify(k);
    var v = obj[k];
    if (isScalar(v)) return pad + key + ": " + scalarText(v, ind, false);
    if (Array.isArray(v)) {
      if (!v.length) return pad + key + ": []";
      if (flowOk(v)) return pad + key + ": " + flow(v);
      return pad + key + ":\n" + emitSeq(v, ind + 2);
    }
    if (!Object.keys(v).length) return pad + key + ": {}";
    return pad + key + ":\n" + emitMap(v, ind + 2);
  }).join("\n");
}

function emitSeq(arr, ind) {
  var pad = new Array(ind + 1).join(" ");
  return arr.map(function (v) {
    if (isScalar(v)) return pad + "- " + scalarText(v, ind, true);
    if (Array.isArray(v)) {
      if (!v.length) return pad + "- []";
      if (flowOk(v)) return pad + "- " + flow(v);
      return pad + "- " + emitSeq(v, ind + 2).slice(ind + 2);
    }
    if (!Object.keys(v).length) return pad + "- {}";
    return pad + "- " + emitMap(v, ind + 2).slice(ind + 2);
  }).join("\n");
}

function stringify(obj) {
  return emitMap(obj, 0) + "\n";
}

module.exports = { parse: parse, stringify: stringify };
