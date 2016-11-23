(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

// usage:
// imgFill(target, imgSrc)
// require es6


var setCSS = function setCSS(element) {
  var CSS = {
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat"
  };
  // create multiple CSS Property
  for (var i in CSS) {
    element.style[i] = CSS[i];
  }
};

var imgFill = function imgFill(target, srcClass) {
  var imgConts = Array.from(document.querySelectorAll(target));
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = imgConts[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var img = _step.value;


      // define image source class
      var imgSrc = img.querySelector(srcClass);

      // Get image source url
      var imgSrcURL = imgSrc.getAttribute('src');

      // hide source images
      imgSrc.style.display = 'none';
      // Set Multiple CSS Property
      img.style.backgroundImage = 'url(' + imgSrcURL + ')';
      setCSS(img);
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator.return) {
        _iterator.return();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }
};

imgFill('.img-fill', '.img-fill-src')

},{}]},{},[1])


//# sourceMappingURL=bundle.js.map
