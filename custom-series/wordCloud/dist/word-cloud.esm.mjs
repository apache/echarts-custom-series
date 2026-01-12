/*
* Licensed to the Apache Software Foundation (ASF) under one
* or more contributor license agreements.  See the NOTICE file
* distributed with this work for additional information
* regarding copyright ownership.  The ASF licenses this file
* to you under the Apache License, Version 2.0 (the
* "License"); you may not use this file except in compliance
* with the License.  You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing,
* software distributed under the License is distributed on an
* "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
* KIND, either express or implied.  See the License for the
* specific language governing permissions and limitations
* under the License.
*/

import { number } from 'echarts';

if (!window.setImmediate) {
    window.setImmediate = (function setupSetImmediate() {
        return (window.msSetImmediate ||
            window.webkitSetImmediate ||
            window.mozSetImmediate ||
            window.oSetImmediate ||
            (function setupSetZeroTimeout() {
                if (!window.postMessage || !window.addEventListener) {
                    return null;
                }
                var callbacks = [undefined];
                var message = 'zero-timeout-message';
                var setZeroTimeout = function setZeroTimeout(callback) {
                    var id = callbacks.length;
                    callbacks.push(callback);
                    window.postMessage(message + id.toString(36), '*');
                    return id;
                };
                window.addEventListener('message', function setZeroTimeoutMessage(evt) {
                    if (typeof evt.data !== 'string' ||
                        evt.data.substr(0, message.length) !== message) {
                        return;
                    }
                    evt.stopImmediatePropagation();
                    var id = parseInt(evt.data.substr(message.length), 36);
                    var callback = callbacks[id];
                    if (!callback) {
                        return;
                    }
                    callback();
                    callbacks[id] = undefined;
                }, true);
                window.clearImmediate = function clearZeroTimeout(id) {
                    if (!callbacks[id]) {
                        return;
                    }
                    callbacks[id] = undefined;
                };
                return setZeroTimeout;
            })() ||
            function setImmediateFallback(fn) {
                window.setTimeout(fn, 0);
            });
    })();
}
if (!window.clearImmediate) {
    window.clearImmediate = (function setupClearImmediate() {
        return (window.msClearImmediate ||
            window.webkitClearImmediate ||
            window.mozClearImmediate ||
            window.oClearImmediate ||
            function clearImmediateFallback(timer) {
                window.clearTimeout(timer);
            });
    })();
}
var isSupported = (function isSupported() {
    var canvas = document.createElement('canvas');
    if (!canvas || !canvas.getContext) {
        return false;
    }
    var ctx = canvas.getContext('2d');
    if (!ctx) {
        return false;
    }
    if (!ctx.getImageData) {
        return false;
    }
    if (!ctx.fillText) {
        return false;
    }
    if (!Array.prototype.some) {
        return false;
    }
    if (!Array.prototype.push) {
        return false;
    }
    return true;
})();
var minFontSize = (function getMinFontSize() {
    if (!isSupported) {
        return;
    }
    var ctx = document.createElement('canvas').getContext('2d');
    if (!ctx) {
        return 0;
    }
    var size = 20;
    var hanWidth, mWidth;
    while (size) {
        ctx.font = size.toString(10) + 'px sans-serif';
        if (ctx.measureText('\uFF37').width === hanWidth &&
            ctx.measureText('m').width === mWidth) {
            return size + 1;
        }
        hanWidth = ctx.measureText('\uFF37').width;
        mWidth = ctx.measureText('m').width;
        size--;
    }
    return 0;
})();
var getItemExtraData = function (item) {
    if (Array.isArray(item)) {
        var itemCopy = item.slice();
        itemCopy.splice(0, 2);
        return itemCopy;
    }
    else {
        return [];
    }
};
var shuffleArray = function shuffleArray(arr) {
    for (var j, x, i = arr.length; i;) {
        j = Math.floor(Math.random() * i);
        x = arr[--i];
        arr[i] = arr[j];
        arr[j] = x;
    }
    return arr;
};
var timer = {};
var WordCloud = function WordCloud(elements, options) {
    if (!isSupported) {
        return;
    }
    var timerId = Math.floor(Math.random() * Date.now());
    if (!Array.isArray(elements)) {
        elements = [elements];
    }
    elements.forEach(function (el, i) {
        if (typeof el === 'string') {
            elements[i] = document.getElementById(el);
            if (!elements[i]) {
                throw new Error('The element id specified is not found.');
            }
        }
        else if (!el.tagName && !el.appendChild) {
            throw new Error('You must pass valid HTML elements, or ID of the element.');
        }
    });
    var settings = {
        list: [],
        fontFamily: '"Trebuchet MS", "Heiti TC", "微軟正黑體", ' +
            '"Arial Unicode MS", "Droid Fallback Sans", sans-serif',
        fontWeight: 'normal',
        color: 'random-dark',
        minSize: 0,
        weightFactor: 1,
        clearCanvas: true,
        backgroundColor: '#fff',
        gridSize: 8,
        drawOutOfBound: false,
        shrinkToFit: false,
        origin: null,
        drawMask: false,
        maskColor: 'rgba(255,0,0,0.3)',
        maskGapWidth: 0.3,
        layoutAnimation: true,
        wait: 0,
        abortThreshold: 0,
        abort: function noop() { },
        minRotation: -Math.PI / 2,
        maxRotation: Math.PI / 2,
        rotationStep: 0.1,
        shuffle: true,
        rotateRatio: 0.1,
        shape: 'circle',
        ellipticity: 0.65,
        classes: null,
        hover: null,
        click: null,
    };
    if (options) {
        for (var key in options) {
            if (key in settings) {
                settings[key] = options[key];
            }
        }
    }
    if (typeof settings.weightFactor !== 'function') {
        var factor = settings.weightFactor;
        settings.weightFactor = function weightFactor(pt) {
            return pt * factor;
        };
    }
    if (typeof settings.shape !== 'function') {
        switch (settings.shape) {
            case 'circle':
            default:
                settings.shape = 'circle';
                break;
            case 'cardioid':
                settings.shape = function shapeCardioid(theta) {
                    return 1 - Math.sin(theta);
                };
                break;
            case 'diamond':
                settings.shape = function shapeSquare(theta) {
                    var thetaPrime = theta % ((2 * Math.PI) / 4);
                    return 1 / (Math.cos(thetaPrime) + Math.sin(thetaPrime));
                };
                break;
            case 'square':
                settings.shape = function shapeSquare(theta) {
                    return Math.min(1 / Math.abs(Math.cos(theta)), 1 / Math.abs(Math.sin(theta)));
                };
                break;
            case 'triangle-forward':
                settings.shape = function shapeTriangle(theta) {
                    var thetaPrime = theta % ((2 * Math.PI) / 3);
                    return (1 / (Math.cos(thetaPrime) + Math.sqrt(3) * Math.sin(thetaPrime)));
                };
                break;
            case 'triangle':
            case 'triangle-upright':
                settings.shape = function shapeTriangle(theta) {
                    var thetaPrime = (theta + (Math.PI * 3) / 2) % ((2 * Math.PI) / 3);
                    return (1 / (Math.cos(thetaPrime) + Math.sqrt(3) * Math.sin(thetaPrime)));
                };
                break;
            case 'pentagon':
                settings.shape = function shapePentagon(theta) {
                    var thetaPrime = (theta + 0.955) % ((2 * Math.PI) / 5);
                    return 1 / (Math.cos(thetaPrime) + 0.726543 * Math.sin(thetaPrime));
                };
                break;
            case 'star':
                settings.shape = function shapeStar(theta) {
                    var thetaPrime = (theta + 0.955) % ((2 * Math.PI) / 10);
                    if (((theta + 0.955) % ((2 * Math.PI) / 5)) - (2 * Math.PI) / 10 >=
                        0) {
                        return (1 /
                            (Math.cos((2 * Math.PI) / 10 - thetaPrime) +
                                3.07768 * Math.sin((2 * Math.PI) / 10 - thetaPrime)));
                    }
                    else {
                        return 1 / (Math.cos(thetaPrime) + 3.07768 * Math.sin(thetaPrime));
                    }
                };
                break;
        }
    }
    settings.gridSize = Math.max(Math.floor(settings.gridSize), 4);
    var g = settings.gridSize;
    var maskRectWidth = g - settings.maskGapWidth;
    var rotationRange = Math.abs(settings.maxRotation - settings.minRotation);
    var minRotation = Math.min(settings.maxRotation, settings.minRotation);
    var rotationStep = settings.rotationStep;
    var grid, ngx, ngy, center, maxRadius;
    var escapeTime;
    var getTextColor;
    function randomHslColor(min, max) {
        return ('hsl(' +
            (Math.random() * 360).toFixed() +
            ',' +
            (Math.random() * 30 + 70).toFixed() +
            '%,' +
            (Math.random() * (max - min) + min).toFixed() +
            '%)');
    }
    switch (settings.color) {
        case 'random-dark':
            getTextColor = function getRandomDarkColor() {
                return randomHslColor(10, 50);
            };
            break;
        case 'random-light':
            getTextColor = function getRandomLightColor() {
                return randomHslColor(50, 90);
            };
            break;
        default:
            if (typeof settings.color === 'function') {
                getTextColor = settings.color;
            }
            break;
    }
    var getTextFontWeight;
    if (typeof settings.fontWeight === 'function') {
        getTextFontWeight = settings.fontWeight;
    }
    var getTextClasses = null;
    if (typeof settings.classes === 'function') {
        getTextClasses = settings.classes;
    }
    var interactive = false;
    var infoGrid = [];
    var hovered;
    var getInfoGridFromMouseTouchEvent = function getInfoGridFromMouseTouchEvent(evt) {
        var canvas = evt.currentTarget;
        var rect = canvas.getBoundingClientRect();
        var clientX;
        var clientY;
        if (evt.touches) {
            clientX = evt.touches[0].clientX;
            clientY = evt.touches[0].clientY;
        }
        else {
            clientX = evt.clientX;
            clientY = evt.clientY;
        }
        var eventX = clientX - rect.left;
        var eventY = clientY - rect.top;
        var x = Math.floor((eventX * (canvas.width / rect.width || 1)) / g);
        var y = Math.floor((eventY * (canvas.height / rect.height || 1)) / g);
        if (!infoGrid[x]) {
            return null;
        }
        return infoGrid[x][y];
    };
    var wordcloudhover = function wordcloudhover(evt) {
        var info = getInfoGridFromMouseTouchEvent(evt);
        if (hovered === info) {
            return;
        }
        hovered = info;
        if (!info) {
            if (settings.hover) {
                settings.hover(undefined, undefined, evt);
            }
            return;
        }
        if (settings.hover) {
            settings.hover(info.item, info.dimension, evt);
        }
    };
    var wordcloudclick = function wordcloudclick(evt) {
        var info = getInfoGridFromMouseTouchEvent(evt);
        if (!info) {
            return;
        }
        if (settings.click) {
            settings.click(info.item, info.dimension, evt);
        }
        evt.preventDefault();
    };
    var pointsAtRadius = [];
    var getPointsAtRadius = function getPointsAtRadius(radius) {
        if (pointsAtRadius[radius]) {
            return pointsAtRadius[radius];
        }
        var T = radius * 8;
        var t = T;
        var points = [];
        if (radius === 0) {
            points.push([center[0], center[1], 0]);
        }
        while (t--) {
            var rx = 1;
            if (typeof settings.shape === 'function') {
                rx = settings.shape((t / T) * 2 * Math.PI);
            }
            points.push([
                center[0] + radius * rx * Math.cos((-t / T) * 2 * Math.PI),
                center[1] +
                    radius * rx * Math.sin((-t / T) * 2 * Math.PI) * settings.ellipticity,
                (t / T) * 2 * Math.PI,
            ]);
        }
        pointsAtRadius[radius] = points;
        return points;
    };
    var exceedTime = function exceedTime() {
        return (settings.abortThreshold > 0 &&
            new Date().getTime() - escapeTime > settings.abortThreshold);
    };
    var getRotateDeg = function getRotateDeg() {
        if (settings.rotateRatio === 0) {
            return 0;
        }
        if (Math.random() > settings.rotateRatio) {
            return 0;
        }
        if (rotationRange === 0) {
            return minRotation;
        }
        return (minRotation +
            Math.round((Math.random() * rotationRange) / rotationStep) * rotationStep);
    };
    var getTextInfo = function getTextInfo(word, weight, rotateDeg, extraDataArray) {
        var fontSize = settings.weightFactor(weight);
        if (fontSize <= settings.minSize) {
            return false;
        }
        var mu = 1;
        if (fontSize < (minFontSize || 0)) {
            mu = (function calculateScaleFactor() {
                var mu = 2;
                while (mu * fontSize < (minFontSize || 0)) {
                    mu += 2;
                }
                return mu;
            })();
        }
        var fontWeight;
        if (getTextFontWeight) {
            fontWeight = getTextFontWeight(word, weight, fontSize, extraDataArray);
        }
        else {
            fontWeight = settings.fontWeight;
        }
        var fcanvas = document.createElement('canvas');
        var fctx = fcanvas.getContext('2d', { willReadFrequently: true });
        if (!fctx) {
            return false;
        }
        fctx.font =
            fontWeight +
                ' ' +
                (fontSize * mu).toString(10) +
                'px ' +
                settings.fontFamily;
        var fw = fctx.measureText(word).width / mu;
        var fh = Math.max(fontSize * mu, fctx.measureText('m').width, fctx.measureText('\uFF37').width) / mu;
        var boxWidth = fw + fh * 2;
        var boxHeight = fh * 3;
        var fgw = Math.ceil(boxWidth / g);
        var fgh = Math.ceil(boxHeight / g);
        boxWidth = fgw * g;
        boxHeight = fgh * g;
        var fillTextOffsetX = -fw / 2;
        var fillTextOffsetY = -fh * 0.4;
        var cgh = Math.ceil((boxWidth * Math.abs(Math.sin(rotateDeg)) +
            boxHeight * Math.abs(Math.cos(rotateDeg))) /
            g);
        var cgw = Math.ceil((boxWidth * Math.abs(Math.cos(rotateDeg)) +
            boxHeight * Math.abs(Math.sin(rotateDeg))) /
            g);
        var width = cgw * g;
        var height = cgh * g;
        fcanvas.setAttribute('width', width.toString());
        fcanvas.setAttribute('height', height.toString());
        fctx.scale(1 / mu, 1 / mu);
        fctx.translate((width * mu) / 2, (height * mu) / 2);
        fctx.rotate(-rotateDeg);
        fctx.font =
            fontWeight +
                ' ' +
                (fontSize * mu).toString(10) +
                'px ' +
                settings.fontFamily;
        fctx.fillStyle = '#000';
        fctx.textBaseline = 'middle';
        fctx.fillText(word, fillTextOffsetX * mu, (fillTextOffsetY + fontSize * 0.5) * mu);
        var imageData = fctx.getImageData(0, 0, width, height).data;
        if (exceedTime()) {
            return false;
        }
        var occupied = [];
        var gx = cgw;
        var gy, x, y;
        var bounds = [cgh / 2, cgw / 2, cgh / 2, cgw / 2];
        while (gx--) {
            gy = cgh;
            while (gy--) {
                y = g;
                singleGridLoop: while (y--) {
                    x = g;
                    while (x--) {
                        if (imageData[((gy * g + y) * width + (gx * g + x)) * 4 + 3]) {
                            occupied.push([gx, gy]);
                            if (gx < bounds[3]) {
                                bounds[3] = gx;
                            }
                            if (gx > bounds[1]) {
                                bounds[1] = gx;
                            }
                            if (gy < bounds[0]) {
                                bounds[0] = gy;
                            }
                            if (gy > bounds[2]) {
                                bounds[2] = gy;
                            }
                            break singleGridLoop;
                        }
                    }
                }
            }
        }
        return {
            mu: mu,
            occupied: occupied,
            bounds: bounds,
            gw: cgw,
            gh: cgh,
            fillTextOffsetX: fillTextOffsetX,
            fillTextOffsetY: fillTextOffsetY,
            fillTextWidth: fw,
            fillTextHeight: fh,
            fontSize: fontSize,
        };
    };
    var canFitText = function canFitText(gx, gy, gw, gh, occupied) {
        var i = occupied.length;
        while (i--) {
            var px = gx + occupied[i][0];
            var py = gy + occupied[i][1];
            if (px >= ngx || py >= ngy || px < 0 || py < 0) {
                if (!settings.drawOutOfBound) {
                    return false;
                }
                continue;
            }
            if (!grid[px][py]) {
                return false;
            }
        }
        return true;
    };
    var drawText = function drawText(gx, gy, info, word, weight, distance, theta, rotateDeg, attributes, extraDataArray) {
        var fontSize = info.fontSize;
        var color;
        if (getTextColor) {
            color = getTextColor(word, weight, fontSize, distance, theta, extraDataArray);
        }
        else {
            color = settings.color;
        }
        var fontWeight;
        if (getTextFontWeight) {
            fontWeight = getTextFontWeight(word, weight, fontSize, extraDataArray);
        }
        else {
            fontWeight = settings.fontWeight;
        }
        var classes;
        if (getTextClasses) {
            classes = getTextClasses(word, weight, fontSize, extraDataArray);
        }
        else {
            classes = settings.classes;
        }
        elements.forEach(function (el) {
            if (el.getContext) {
                var ctx = el.getContext('2d');
                var mu = info.mu;
                ctx.save();
                ctx.scale(1 / mu, 1 / mu);
                ctx.font =
                    fontWeight +
                        ' ' +
                        (fontSize * mu).toString(10) +
                        'px ' +
                        settings.fontFamily;
                ctx.fillStyle = color;
                ctx.translate((gx + info.gw / 2) * g * mu, (gy + info.gh / 2) * g * mu);
                if (rotateDeg !== 0) {
                    ctx.rotate(-rotateDeg);
                }
                ctx.textBaseline = 'middle';
                ctx.fillText(word, info.fillTextOffsetX * mu, (info.fillTextOffsetY + fontSize * 0.5) * mu);
                ctx.restore();
            }
            else {
                var span = document.createElement('span');
                var transformRule = '';
                transformRule = 'rotate(' + (-rotateDeg / Math.PI) * 180 + 'deg) ';
                if (info.mu !== 1) {
                    transformRule +=
                        'translateX(-' +
                            info.fillTextWidth / 4 +
                            'px) ' +
                            'scale(' +
                            1 / info.mu +
                            ')';
                }
                var styleRules = {
                    position: 'absolute',
                    display: 'block',
                    font: fontWeight + ' ' + fontSize * info.mu + 'px ' + settings.fontFamily,
                    left: (gx + info.gw / 2) * g + info.fillTextOffsetX + 'px',
                    top: (gy + info.gh / 2) * g + info.fillTextOffsetY + 'px',
                    width: info.fillTextWidth + 'px',
                    height: info.fillTextHeight + 'px',
                    lineHeight: fontSize + 'px',
                    whiteSpace: 'nowrap',
                    transform: transformRule,
                    webkitTransform: transformRule,
                    msTransform: transformRule,
                    transformOrigin: '50% 40%',
                    webkitTransformOrigin: '50% 40%',
                    msTransformOrigin: '50% 40%',
                };
                if (color) {
                    styleRules.color = color;
                }
                span.textContent = word;
                for (var cssProp in styleRules) {
                    span.style[cssProp] = styleRules[cssProp];
                }
                if (attributes) {
                    for (var attribute in attributes) {
                        span.setAttribute(attribute, attributes[attribute]);
                    }
                }
                if (classes) {
                    span.className += classes;
                }
                el.appendChild(span);
            }
        });
    };
    var fillGridAt = function fillGridAt(x, y, drawMask, dimension, item) {
        if (x >= ngx || y >= ngy || x < 0 || y < 0) {
            return;
        }
        grid[x][y] = false;
        if (drawMask) {
            var ctx = elements[0].getContext('2d');
            ctx.fillRect(x * g, y * g, maskRectWidth, maskRectWidth);
        }
        if (interactive) {
            infoGrid[x][y] = { item: item, dimension: dimension };
        }
    };
    var updateGrid = function updateGrid(gx, gy, gw, gh, info, item) {
        var occupied = info.occupied;
        var drawMask = settings.drawMask;
        var ctx;
        if (drawMask) {
            ctx = elements[0].getContext('2d');
            ctx.save();
            ctx.fillStyle = settings.maskColor;
        }
        var dimension;
        if (interactive) {
            var bounds = info.bounds;
            dimension = {
                x: (gx + bounds[3]) * g,
                y: (gy + bounds[0]) * g,
                w: (bounds[1] - bounds[3] + 1) * g,
                h: (bounds[2] - bounds[0] + 1) * g,
            };
        }
        var i = occupied.length;
        while (i--) {
            var px = gx + occupied[i][0];
            var py = gy + occupied[i][1];
            if (px >= ngx || py >= ngy || px < 0 || py < 0) {
                continue;
            }
            fillGridAt(px, py, drawMask, dimension, item);
        }
        if (drawMask) {
            ctx.restore();
        }
    };
    var putWord = function putWord(item, loopIndex) {
        if (loopIndex > 20) {
            return null;
        }
        var word, weight, attributes;
        if (Array.isArray(item)) {
            word = item[0];
            weight = item[1];
        }
        else {
            word = item.word;
            weight = item.weight;
            attributes = item.attributes;
        }
        var rotateDeg = getRotateDeg();
        var extraDataArray = getItemExtraData(item);
        var info = getTextInfo(word, weight, rotateDeg, extraDataArray);
        if (!info) {
            return false;
        }
        if (exceedTime()) {
            return false;
        }
        if (!settings.drawOutOfBound && !settings.shrinkToFit) {
            var bounds = info.bounds;
            if (bounds[1] - bounds[3] + 1 > ngx || bounds[2] - bounds[0] + 1 > ngy) {
                return false;
            }
        }
        var r = maxRadius + 1;
        var tryToPutWordAtPoint = function (gxy) {
            var gx = Math.floor(gxy[0] - info.gw / 2);
            var gy = Math.floor(gxy[1] - info.gh / 2);
            var gw = info.gw;
            var gh = info.gh;
            if (!canFitText(gx, gy, gw, gh, info.occupied)) {
                return false;
            }
            drawText(gx, gy, info, word, weight, maxRadius - r, gxy[2], rotateDeg, attributes, extraDataArray);
            updateGrid(gx, gy, gw, gh, info, item);
            return {
                gx: gx,
                gy: gy,
                rot: rotateDeg,
                info: info,
            };
        };
        while (r--) {
            var points = getPointsAtRadius(maxRadius - r);
            if (settings.shuffle) {
                points = [].concat(points);
                shuffleArray(points);
            }
            for (var i = 0; i < points.length; i++) {
                var res = tryToPutWordAtPoint(points[i]);
                if (res) {
                    return res;
                }
            }
        }
        if (settings.shrinkToFit) {
            if (Array.isArray(item)) {
                item[1] = (item[1] * 3) / 4;
            }
            else {
                item.weight = (item.weight * 3) / 4;
            }
            return putWord(item, loopIndex + 1);
        }
        return null;
    };
    var sendEvent = function sendEvent(type, cancelable, details) {
        if (cancelable) {
            return !elements.some(function (el) {
                var event = new CustomEvent(type, {
                    detail: details || {},
                    cancelable: cancelable,
                });
                return !el.dispatchEvent(event);
            });
        }
        else {
            elements.forEach(function (el) {
                var event = new CustomEvent(type, {
                    detail: details || {},
                    cancelable: cancelable,
                });
                el.dispatchEvent(event);
            });
        }
    };
    var start = function start() {
        var canvas = elements[0];
        if (canvas.getContext) {
            ngx = Math.ceil(canvas.width / g);
            ngy = Math.ceil(canvas.height / g);
        }
        else {
            var rect = canvas.getBoundingClientRect();
            ngx = Math.ceil(rect.width / g);
            ngy = Math.ceil(rect.height / g);
        }
        if (!sendEvent('wordcloudstart', true)) {
            return;
        }
        center = settings.origin
            ? [settings.origin[0] / g, settings.origin[1] / g]
            : [ngx / 2, ngy / 2];
        maxRadius = Math.floor(Math.sqrt(ngx * ngx + ngy * ngy));
        grid = [];
        var gx, gy, i;
        if (!canvas.getContext || settings.clearCanvas) {
            elements.forEach(function (el) {
                if (el.getContext) {
                    var ctx = el.getContext('2d');
                    ctx.fillStyle = settings.backgroundColor;
                    ctx.clearRect(0, 0, ngx * (g + 1), ngy * (g + 1));
                    ctx.fillRect(0, 0, ngx * (g + 1), ngy * (g + 1));
                }
                else {
                    el.textContent = '';
                    el.style.backgroundColor = settings.backgroundColor;
                    el.style.position = 'relative';
                }
            });
            gx = ngx;
            while (gx--) {
                grid[gx] = [];
                gy = ngy;
                while (gy--) {
                    grid[gx][gy] = true;
                }
            }
        }
        else {
            var bctx = document.createElement('canvas').getContext('2d');
            if (!bctx) {
                return;
            }
            bctx.fillStyle = settings.backgroundColor;
            bctx.fillRect(0, 0, 1, 1);
            var bgPixel = bctx.getImageData(0, 0, 1, 1).data;
            var imageData = canvas
                .getContext('2d')
                .getImageData(0, 0, ngx * g, ngy * g).data;
            gx = ngx;
            var x, y;
            while (gx--) {
                grid[gx] = [];
                gy = ngy;
                while (gy--) {
                    y = g;
                    singleGridLoop: while (y--) {
                        x = g;
                        while (x--) {
                            i = 4;
                            while (i--) {
                                if (imageData[((gy * g + y) * ngx * g + (gx * g + x)) * 4 + i] !==
                                    bgPixel[i]) {
                                    grid[gx][gy] = false;
                                    break singleGridLoop;
                                }
                            }
                        }
                    }
                    if (grid[gx][gy] !== false) {
                        grid[gx][gy] = true;
                    }
                }
            }
            imageData = bctx = bgPixel = undefined;
        }
        if (settings.hover || settings.click) {
            interactive = true;
            gx = ngx + 1;
            while (gx--) {
                infoGrid[gx] = [];
            }
            if (settings.hover) {
                canvas.addEventListener('mousemove', wordcloudhover);
            }
            if (settings.click) {
                canvas.addEventListener('click', wordcloudclick);
                canvas.addEventListener('touchstart', wordcloudclick);
                canvas.addEventListener('touchend', function (e) {
                    e.preventDefault();
                });
                canvas.style.webkitTapHighlightColor = 'rgba(0, 0, 0, 0)';
            }
            canvas.addEventListener('wordcloudstart', function stopInteraction() {
                canvas.removeEventListener('wordcloudstart', stopInteraction);
                canvas.removeEventListener('mousemove', wordcloudhover);
                canvas.removeEventListener('click', wordcloudclick);
                hovered = undefined;
            });
        }
        i = 0;
        var loopingFunction, stoppingFunction;
        var layouting = true;
        if (!settings.layoutAnimation) {
            loopingFunction = function (cb) {
                cb();
            };
            stoppingFunction = function () {
                layouting = false;
            };
        }
        else if (settings.wait !== 0) {
            loopingFunction = window.setTimeout;
            stoppingFunction = window.clearTimeout;
        }
        else {
            loopingFunction = window.setImmediate;
            stoppingFunction = window.clearImmediate;
        }
        var addEventListener = function addEventListener(type, listener) {
            elements.forEach(function (el) {
                el.addEventListener(type, listener);
            });
        };
        var removeEventListener = function removeEventListener(type, listener) {
            elements.forEach(function (el) {
                el.removeEventListener(type, listener);
            });
        };
        var anotherWordCloudStart = function anotherWordCloudStart() {
            removeEventListener('wordcloudstart', anotherWordCloudStart);
            stoppingFunction(timer[timerId]);
        };
        addEventListener('wordcloudstart', anotherWordCloudStart);
        timer[timerId] = (settings.layoutAnimation
            ? loopingFunction
            : function (f) {
                f();
            })(function loop() {
            if (!layouting) {
                return;
            }
            if (i >= settings.list.length) {
                stoppingFunction(timer[timerId]);
                sendEvent('wordcloudstop', false);
                removeEventListener('wordcloudstart', anotherWordCloudStart);
                delete timer[timerId];
                return;
            }
            escapeTime = new Date().getTime();
            var drawn = putWord(settings.list[i], 0);
            var canceled = !sendEvent('wordclouddrawn', true, {
                item: settings.list[i],
                drawn: drawn,
            });
            if (exceedTime() || canceled) {
                stoppingFunction(timer[timerId]);
                settings.abort();
                sendEvent('wordcloudabort', false);
                sendEvent('wordcloudstop', false);
                removeEventListener('wordcloudstart', anotherWordCloudStart);
                return;
            }
            i++;
            timer[timerId] = loopingFunction(loop, settings.wait);
        }, settings.wait);
    };
    start();
};
WordCloud.isSupported = isSupported;
WordCloud.minFontSize = minFontSize;

var renderItem = function (params, api) {
    var context = params.context;
    var itemPayload = params.itemPayload;
    if (!context.layoutResults) {
        context.layoutResults = performLayout(params, api, itemPayload);
    }
    var layout = context.layoutResults[params.dataIndexInside];
    if (!layout) {
        return null;
    }
    var style = api.style();
    return {
        type: 'text',
        x: layout.x,
        y: layout.y,
        rotation: layout.rotation,
        scaleX: layout.scaleX,
        scaleY: layout.scaleY,
        style: {
            text: api.value(0),
            x: layout.textX,
            y: layout.textY,
            fontSize: layout.fontSize,
            fontWeight: style.fontWeight,
            fontFamily: style.fontFamily,
            fontStyle: style.fontStyle,
            fill: api.visual('color') || '#000',
            align: 'left',
            verticalAlign: 'middle',
        },
    };
};
function updateCanvasMask(maskCanvas) {
    var ctx = maskCanvas.getContext('2d');
    var imageData = ctx.getImageData(0, 0, maskCanvas.width, maskCanvas.height);
    var newImageData = ctx.createImageData(imageData);
    var toneSum = 0;
    var toneCnt = 0;
    for (var i = 0; i < imageData.data.length; i += 4) {
        var alpha = imageData.data[i + 3];
        if (alpha > 128) {
            var tone = imageData.data[i] + imageData.data[i + 1] + imageData.data[i + 2];
            toneSum += tone;
            ++toneCnt;
        }
    }
    var threshold = toneSum / toneCnt;
    for (var i = 0; i < imageData.data.length; i += 4) {
        var tone = imageData.data[i] + imageData.data[i + 1] + imageData.data[i + 2];
        var alpha = imageData.data[i + 3];
        if (alpha < 128 || tone > threshold) {
            newImageData.data[i] = 0;
            newImageData.data[i + 1] = 0;
            newImageData.data[i + 2] = 0;
            newImageData.data[i + 3] = 0;
        }
        else {
            newImageData.data[i] = 255;
            newImageData.data[i + 1] = 255;
            newImageData.data[i + 2] = 255;
            newImageData.data[i + 3] = 255;
        }
    }
    ctx.putImageData(newImageData, 0, 0);
}
function adjustRectAspect(gridRect, aspect) {
    var width = gridRect.width;
    var height = gridRect.height;
    if (width > height * aspect) {
        gridRect.x += (width - height * aspect) / 2;
        gridRect.width = height * aspect;
    }
    else {
        gridRect.y += (height - width / aspect) / 2;
        gridRect.height = width / aspect;
    }
}
function performLayout(params, api, payload) {
    var width = api.getWidth();
    var height = api.getHeight();
    var left = number.parsePercent(payload.left || 0, width);
    var right = number.parsePercent(payload.right || 0, width);
    var top = number.parsePercent(payload.top || 0, height);
    var bottom = number.parsePercent(payload.bottom || 0, height);
    var boxWidth = width - left - right;
    var boxHeight = height - top - bottom;
    if (boxWidth <= 0 || boxHeight <= 0) {
        return [];
    }
    var gridRect = {
        x: left,
        y: top,
        width: boxWidth,
        height: boxHeight,
    };
    var keepAspect = payload.keepAspect;
    var maskImage = payload.maskImage;
    if (keepAspect && maskImage) {
        var ratio = maskImage.width / maskImage.height;
        adjustRectAspect(gridRect, ratio);
    }
    var canvas = document.createElement('canvas');
    canvas.width = gridRect.width;
    canvas.height = gridRect.height;
    if (maskImage) {
        var ctx = canvas.getContext('2d');
        ctx.drawImage(maskImage, 0, 0, canvas.width, canvas.height);
        updateCanvasMask(canvas);
    }
    var gridSize = Math.max(Math.floor(payload.gridSize || 8), 4);
    var sizeRange = payload.sizeRange || [12, 60];
    var rotationRange = payload.rotationRange || [-90, 90];
    var rotationStep = (payload.rotationStep || 45) * (Math.PI / 180);
    var count = params.dataInsideLength;
    var data = [];
    for (var i = 0; i < count; i++) {
        data.push({
            name: api.value(0, i),
            value: api.value(1, i),
            index: i,
        });
    }
    if (data.length === 0) {
        return [];
    }
    var values = data.map(function (d) { return d.value; });
    var minVal = Math.min.apply(Math, values);
    var maxVal = Math.max.apply(Math, values);
    var list = data
        .map(function (item) {
        var fontSize = maxVal === minVal
            ? sizeRange[0]
            : ((item.value - minVal) / (maxVal - minVal)) *
                (sizeRange[1] - sizeRange[0]) +
                sizeRange[0];
        return [item.name, fontSize, item.index];
    })
        .sort(function (a, b) { return b[1] - a[1]; });
    var results = new Array(count).fill(null);
    var onWordCloudDrawn = function (e) {
        var item = e.detail.item;
        if (e.detail.drawn) {
            var drawn = e.detail.drawn;
            var info = drawn.info;
            results[item[2]] = {
                x: gridRect.x + (drawn.gx + info.gw / 2) * gridSize,
                y: gridRect.y + (drawn.gy + info.gh / 2) * gridSize,
                fontSize: item[1],
                rotation: drawn.rot,
                scaleX: 1 / info.mu,
                scaleY: 1 / info.mu,
                textX: info.fillTextOffsetX,
                textY: info.fillTextOffsetY + item[1] * 0.5,
            };
        }
    };
    canvas.addEventListener('wordclouddrawn', onWordCloudDrawn);
    var style = api.style();
    WordCloud(canvas, {
        list: list,
        gridSize: gridSize,
        fontFamily: style.fontFamily,
        fontWeight: style.fontWeight,
        ellipticity: gridRect.height / gridRect.width,
        minRotation: rotationRange[0] * (Math.PI / 180),
        maxRotation: rotationRange[1] * (Math.PI / 180),
        rotationStep: rotationStep,
        clearCanvas: !maskImage,
        rotateRatio: 1,
        layoutAnimation: false,
        shuffle: false,
        shape: payload.shape || 'circle',
        shrinkToFit: payload.shrinkToFit,
        drawOutOfBound: payload.drawOutOfBound,
        abort: function () { },
    });
    return results;
}
var index = {
    install: function (registers) {
        registers.registerCustomSeries('wordCloud', renderItem);
    },
};

export { index as default };
