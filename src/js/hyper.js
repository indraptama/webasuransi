/*
* Vanilla Hypher 0.1.0
* Based on https://github.com/bramstein/hypher
* @author Kyle Foster (@hkfoster)
* @license MIT
*/
(function () {

var module = {
  exports: null
};
/**
 * @constructor
 * @param {!{patterns: !Object, leftmin: !number, rightmin: !number}} language The language pattern file. Compatible with Hyphenator.js.
 */
function Hypher(language) {
    var exceptions = [],
        i = 0;
    /**
     * @type {!Hypher.TrieNode}
     */
    this.trie = this.createTrie(language['patterns']);

    /**
     * @type {!number}
     * @const
     */
    this.leftMin = language['leftmin'];

    /**
     * @type {!number}
     * @const
     */
    this.rightMin = language['rightmin'];

    /**
     * @type {!Object.<string, !Array.<string>>}
     */
    this.exceptions = {};

    if (language['exceptions']) {
        exceptions = language['exceptions'].split(/,\s?/g);

        for (; i < exceptions.length; i += 1) {
            this.exceptions[exceptions[i].replace(/\u2027/g, '').toLowerCase()] = new RegExp('(' + exceptions[i].split('\u2027').join(')(') + ')', 'i');
        }
    }
}

/**
 * @typedef {{_points: !Array.<number>}}
 */
Hypher.TrieNode;

/**
 * Creates a trie from a language pattern.
 * @private
 * @param {!Object} patternObject An object with language patterns.
 * @return {!Hypher.TrieNode} An object trie.
 */
Hypher.prototype.createTrie = function (patternObject) {
    var size = 0,
        i = 0,
        c = 0,
        p = 0,
        chars = null,
        points = null,
        codePoint = null,
        t = null,
        tree = {
            _points: []
        },
        patterns;

    for (size in patternObject) {
        if (patternObject.hasOwnProperty(size)) {
            patterns = patternObject[size].match(new RegExp('.{1,' + (+size) + '}', 'g'));

            for (i = 0; i < patterns.length; i += 1) {
                chars = patterns[i].replace(/[0-9]/g, '').split('');
                points = patterns[i].split(/\D/);
                t = tree;

                for (c = 0; c < chars.length; c += 1) {
                    codePoint = chars[c].charCodeAt(0);

                    if (!t[codePoint]) {
                        t[codePoint] = {};
                    }
                    t = t[codePoint];
                }

                t._points = [];

                for (p = 0; p < points.length; p += 1) {
                    t._points[p] = points[p] || 0;
                }
            }
        }
    }
    return tree;
};

/**
 * Hyphenates a text.
 *
 * @param {!string} str The text to hyphenate.
 * @return {!string} The same text with soft hyphens inserted in the right positions.
 */
Hypher.prototype.hyphenateText = function (str, minLength) {
    minLength = minLength || 4;

    // Regexp("\b", "g") splits on word boundaries,
    // compound separators and ZWNJ so we don't need
    // any special cases for those characters. Unfortunately
    // it does not support unicode word boundaries, so
    // we implement it manually.
    var words = str.split(/([a-zA-Z0-9_\u0027\u00DF-\u00EA\u00EC-\u00EF\u00F1-\u00F6\u00F8-\u00FD\u0101\u0103\u0105\u0107\u0109\u010D\u010F\u0111\u0113\u0117\u0119\u011B\u011D\u011F\u0123\u0125\u012B\u012F\u0131\u0135\u0137\u013C\u013E\u0142\u0144\u0146\u0148\u0151\u0153\u0155\u0159\u015B\u015D\u015F\u0161\u0165\u016B\u016D\u016F\u0171\u0173\u017A\u017C\u017E\u017F\u0219\u021B\u02BC\u0390\u03AC-\u03CE\u03F2\u0401\u0410-\u044F\u0451\u0454\u0456\u0457\u045E\u0491\u0531-\u0556\u0561-\u0587\u0902\u0903\u0905-\u090B\u090E-\u0910\u0912\u0914-\u0928\u092A-\u0939\u093E-\u0943\u0946-\u0948\u094A-\u094D\u0982\u0983\u0985-\u098B\u098F\u0990\u0994-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BE-\u09C3\u09C7\u09C8\u09CB-\u09CD\u09D7\u0A02\u0A03\u0A05-\u0A0A\u0A0F\u0A10\u0A14-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A3E-\u0A42\u0A47\u0A48\u0A4B-\u0A4D\u0A82\u0A83\u0A85-\u0A8B\u0A8F\u0A90\u0A94-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABE-\u0AC3\u0AC7\u0AC8\u0ACB-\u0ACD\u0B02\u0B03\u0B05-\u0B0B\u0B0F\u0B10\u0B14-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3E-\u0B43\u0B47\u0B48\u0B4B-\u0B4D\u0B57\u0B82\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB5\u0BB7-\u0BB9\u0BBE-\u0BC2\u0BC6-\u0BC8\u0BCA-\u0BCD\u0BD7\u0C02\u0C03\u0C05-\u0C0B\u0C0E-\u0C10\u0C12\u0C14-\u0C28\u0C2A-\u0C33\u0C35-\u0C39\u0C3E-\u0C43\u0C46-\u0C48\u0C4A-\u0C4D\u0C82\u0C83\u0C85-\u0C8B\u0C8E-\u0C90\u0C92\u0C94-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBE-\u0CC3\u0CC6-\u0CC8\u0CCA-\u0CCD\u0D02\u0D03\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D28\u0D2A-\u0D39\u0D3E-\u0D43\u0D46-\u0D48\u0D4A-\u0D4D\u0D57\u0D60\u0D61\u0D7A-\u0D7F\u1F00-\u1F07\u1F10-\u1F15\u1F20-\u1F27\u1F30-\u1F37\u1F40-\u1F45\u1F50-\u1F57\u1F60-\u1F67\u1F70-\u1F7D\u1F80-\u1F87\u1F90-\u1F97\u1FA0-\u1FA7\u1FB2-\u1FB4\u1FB6\u1FB7\u1FBD\u1FBF\u1FC2-\u1FC4\u1FC6\u1FC7\u1FD2\u1FD3\u1FD6\u1FD7\u1FE2-\u1FE7\u1FF2-\u1FF4\u1FF6\u1FF7\u200D\u2019]+)/g);

    for (var i = 0; i < words.length; i += 1) {
        if (words[i].indexOf('/') !== -1) {
            // Don't insert a zero width space if the slash is at the beginning or end
            // of the text, or right after or before a space.
            if (i !== 0 && i !== words.length - 1 && !(/\s+\/|\/\s+/.test(words[i]))) {
                words[i] += '\u200B';
            }
        } else if (words[i].length > minLength) {
            words[i] = this.hyphenate(words[i]).join('\u00AD');
        }
    }
    return words.join('');
};

/**
 * Hyphenates a word.
 *
 * @param {!string} word The word to hyphenate
 * @return {!Array.<!string>} An array of word fragments indicating valid hyphenation points.
 */
Hypher.prototype.hyphenate = function (word) {
    var characters,
        characterPoints = [],
        originalCharacters,
        i,
        j,
        k,
        node,
        points = [],
        wordLength,
        lowerCaseWord = word.toLowerCase(),
        nodePoints,
        nodePointsLength,
        m = Math.max,
        trie = this.trie,
        result = [''];

    if (this.exceptions.hasOwnProperty(lowerCaseWord)) {
        return word.match(this.exceptions[lowerCaseWord]).slice(1);
    }

    if (word.indexOf('\u00AD') !== -1) {
        return [word];
    }

    word = '_' + word + '_';

    characters = word.toLowerCase().split('');
    originalCharacters = word.split('');
    wordLength = characters.length;

    for (i = 0; i < wordLength; i += 1) {
        points[i] = 0;
        characterPoints[i] = characters[i].charCodeAt(0);
    }

    for (i = 0; i < wordLength; i += 1) {
        node = trie;
        for (j = i; j < wordLength; j += 1) {
            node = node[characterPoints[j]];

            if (node) {
                nodePoints = node._points;
                if (nodePoints) {
                    for (k = 0, nodePointsLength = nodePoints.length; k < nodePointsLength; k += 1) {
                        points[i + k] = m(points[i + k], nodePoints[k]);
                    }
                }
            } else {
                break;
            }
        }
    }

    for (i = 1; i < wordLength - 1; i += 1) {
        if (i > this.leftMin && i < (wordLength - this.rightMin) && points[i] % 2) {
            result.push(originalCharacters[i]);
        } else {
            result[result.length - 1] += originalCharacters[i];
        }
    }

    return result;
};

module.exports = Hypher;
window['Hypher'] = module.exports;

window['Hypher']['languages'] = {};
}());


/**
 * 'Hyphenate' wrapper function
 */
;(function( window, document, undefined ) {

  'use strict';

  // Extend function
  function extend( a, b ) {
    for( var key in b ) {
      if( b.hasOwnProperty( key ) ) {
        a[ key ] = b[ key ];
      }
    }
    return a;
  }

  // Main function definition
  function hyphenate( selector, language ) {
    this.selector = document.querySelectorAll( selector );
    this.language = language;
    this.init();
  }

  // Overridable defaults
  hyphenate.prototype = {

    // Init function
    init : function( selector ) {
      var self     = this,
          selector = self.selector,
          language = self.language;

      if (window['Hypher']['languages'][language]) {

      return Array.prototype.forEach.call(
        selector, function( selectors ) {
          var i = 0, len = selectors.childNodes.length;

          for (; i < len; i += 1) {
            if (selectors.childNodes[i].nodeType === 3) {
              selectors.childNodes[i].nodeValue = window['Hypher']['languages'][language].hyphenateText(selectors.childNodes[i].nodeValue);
            }
          }
        }, false
      );

       }
    }
  };

  window.hyphenate = hyphenate;

})( window, document );


/**
 * Indonesia language pattern
 */
(function () {

var module = {
    exports: null
}

module.exports = {
    'id': ['id', 'id'],
    'leftmin': 2,
    'rightmin': 2,
    'patterns': {
        2 : "a1i1o1u1e1",
        3 : "a2ia2uo2i",
        4 : "2b1d2b1j2b1k2b1n2b1s2b1t2c1k2c1n2d1k2d1n2d1p2f1d2f1k2f1n2f1t2g1g2g1k2g1n2h1k2h1l2h1m2h1n2h1w2i1o2j1k2j1n2k1b2k1k2k1m2k1n2k1r2k1s2k1t2l1b2l1f2l1g2l1h2l1k2l1m2l1n2l1s2l1t2l1q2m1b2m1k2m1l2m1m2m1n2m1p2m1r2m1s2n1c2n1d2n1f2n1j2n1k2n1n2n1p2n1s2n1t2n1v2p1k2p1n2p1p2p1r2p1t2r1b2r1c2r1f2r1g2r1h2r1j2r1k2r1l2r1m2r1n2r1p2r1ra2ir2ny_2ng_",
        5 : "2ng1n1lah_2ng1k2ng1hi2o1n2ng1g2ng1s",
        6 : "_te2r3_pe2r32p1an_2z1an_2v1an_2t1an_2n3s2t2r1an__be2r32b1an_2c1an_2d1an_2f1an_2g1an_2h1an_2j1an_2l1an_2m1an_2n1an_2s1an_",
        7 : "_a2ta2u2n1kan_2p1kan_2r1kan_2s1kan_2t1kan_2v1kan_2z1kan__me2ng32n1lah_2b1kan_2c1kan_2d1kan_2f1kan_2g1kan_2h1kan_2j1kan_2ng1an_2l1kan_2m1kan_",
        8 : "2ng1kan_1ba1ga2i",
        9 : "_me3ng4o4_me3ng4e4_me3ng4u4_me3ng4i4_me3ng4a4",
        10 : "_de3ng4an__ta3ng4an__le3ng4an__ja3ng4an__ma3ng4an__pa3ng4an__ri3ng4an_3s4k4ri4p3"
    },
    exceptions: 'be\u2027ra\u2027be, be\u2027ra\u2027hi, be\u2027rak, be\u2027ran\u2027da, be\u2027ran\u2027dal, be\u2027rang, be\u2027ra\u2027ngas\u2027an, be\u2027rang\u2027sang, be\u2027ra\u2027ngus, be\u2027ra\u2027ni, be\u2027ran\u2027tak\u2027an, be\u2027ran\u2027tam, be\u2027ran\u2027tas, be\u2027ra\u2027pa, be\u2027ras, be\u2027ren\u2027deng, be\u2027re\u2027ngut, be\u2027re\u2027rot, be\u2027res, be\u2027re\u2027wok, be\u2027ri, be\u2027ri\u2027ngas, be\u2027ri\u2027sik, be\u2027ri\u2027ta, be\u2027rok, be\u2027ron\u2027dong, be\u2027ron\u2027tak, be\u2027ru\u2027du, be\u2027ruk, be\u2027run\u2027tun, peng\u2027eks\u2027por, peng\u2027im\u2027por, te\u2027ra, te\u2027rang, te\u2027ras, te\u2027ra\u2027si, te\u2027ra\u2027tai, te\u2027ra\u2027wang, te\u2027ra\u2027weh, te\u2027ri\u2027ak, te\u2027ri\u2027gu, te\u2027rik, te\u2027ri\u2027ma, te\u2027ri\u2027pang, te\u2027ro\u2027bos, te\u2027ro\u2027bos\u2027an, te\u2027ro\u2027mol, te\u2027rom\u2027pah, te\u2027rom\u2027pet, te\u2027ro\u2027pong, te\u2027ro\u2027wong\u2027an, te\u2027ru\u2027buk, te\u2027ru\u2027na, te\u2027rus, te\u2027ru\u2027si, pe\u2027rang\u2027kat, pe\u2027rin\u2027tah'
};

var h = new window['Hypher'](module.exports);

if (typeof module.exports.id === 'string') {
    module.exports.id = [module.exports.id];
}

for (var i = 0; i < module.exports.id.length; i += 1) {
  window['Hypher']['languages'][module.exports.id[i]] = h;
}

}());

// Hyphenate paragraph text
new hyphenate( 'p, ul, ol, dl, article', 'id' );
