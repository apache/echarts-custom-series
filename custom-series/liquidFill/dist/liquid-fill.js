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

(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.liquidFillCustomSeriesInstaller = factory());
})(this, (function () { 'use strict';

    function createLabelGroup(_a) {
        var _b, _c, _d, _e, _f, _g, _h;
        var style = _a.style, cx = _a.cx, cy = _a.cy, innerRadius = _a.innerRadius, boundingLeft = _a.boundingLeft, boundingTop = _a.boundingTop, boundingWidth = _a.boundingWidth, boundingHeight = _a.boundingHeight, wavePathData = _a.wavePathData, waveInitialX = _a.waveInitialX, waveAnimation = _a.waveAnimation, defaultColor = _a.defaultColor, insideColorOverride = _a.insideColorOverride;
        if (!style) {
            return undefined;
        }
        var styleAny = style;
        var textContent = styleAny.text;
        if (textContent == null || "".concat(textContent) === '') {
            return undefined;
        }
        var position = resolvePosition(styleAny.textPosition, cx, cy, innerRadius, boundingLeft, boundingTop, boundingWidth, boundingHeight);
        var baseStyle = buildBaseTextStyle(styleAny, position.x, position.y);
        var resolvedAlign = ((_c = (_b = styleAny.textAlign) !== null && _b !== void 0 ? _b : styleAny.align) !== null && _c !== void 0 ? _c : position.align);
        var resolvedVerticalAlign = ((_d = resolveVerticalAlign(styleAny)) !== null && _d !== void 0 ? _d : position.verticalAlign);
        baseStyle.align = resolvedAlign;
        baseStyle.textAlign = resolvedAlign;
        baseStyle.verticalAlign = resolvedVerticalAlign;
        baseStyle.textVerticalAlign = resolvedVerticalAlign;
        baseStyle.text = String(textContent);
        var outsideFill = (_f = (_e = styleAny.textFill) !== null && _e !== void 0 ? _e : styleAny.fill) !== null && _f !== void 0 ? _f : defaultColor;
        var insideFill = (_h = (_g = insideColorOverride !== null && insideColorOverride !== void 0 ? insideColorOverride : styleAny.textInsideColor) !== null && _g !== void 0 ? _g : styleAny.insideColor) !== null && _h !== void 0 ? _h : outsideFill;
        var outsideText = {
            type: 'text',
            silent: true,
            z2: 40,
            style: Object.assign({}, baseStyle, { fill: outsideFill }),
        };
        var insideText = {
            type: 'text',
            silent: true,
            z2: 41,
            style: Object.assign({}, baseStyle, { fill: insideFill }),
        };
        var waveClipPath = {
            type: 'path',
            shape: {
                pathData: wavePathData,
            },
            x: waveInitialX,
            clipPath: {
                type: 'circle',
                shape: {
                    cx: cx,
                    cy: cy,
                    r: innerRadius,
                },
            },
        };
        if (waveAnimation) {
            waveClipPath.keyframeAnimation = cloneAnimation(waveAnimation);
        }
        insideText.clipPath = waveClipPath;
        return {
            type: 'group',
            silent: true,
            children: [outsideText, insideText],
        };
    }
    function buildBaseTextStyle(styleAny, x, y) {
        var _a;
        var result = {
            x: x,
            y: y,
        };
        assignIfDefined(result, 'fontSize', styleAny.fontSize);
        assignIfDefined(result, 'fontFamily', styleAny.fontFamily);
        assignIfDefined(result, 'fontWeight', styleAny.fontWeight);
        assignIfDefined(result, 'fontStyle', styleAny.fontStyle);
        assignIfDefined(result, 'lineHeight', styleAny.lineHeight);
        assignIfDefined(result, 'rich', styleAny.rich);
        assignIfDefined(result, 'backgroundColor', styleAny.backgroundColor);
        assignIfDefined(result, 'borderColor', styleAny.borderColor);
        assignIfDefined(result, 'borderWidth', styleAny.borderWidth);
        assignIfDefined(result, 'borderRadius', styleAny.borderRadius);
        assignIfDefined(result, 'padding', styleAny.padding);
        var shadowBlur = styleAny.textShadowBlur != null
            ? styleAny.textShadowBlur
            : styleAny.shadowBlur;
        var shadowColor = styleAny.textShadowColor != null
            ? styleAny.textShadowColor
            : styleAny.shadowColor;
        var shadowOffsetX = styleAny.textShadowOffsetX != null
            ? styleAny.textShadowOffsetX
            : styleAny.shadowOffsetX;
        var shadowOffsetY = styleAny.textShadowOffsetY != null
            ? styleAny.textShadowOffsetY
            : styleAny.shadowOffsetY;
        assignIfDefined(result, 'shadowBlur', shadowBlur);
        assignIfDefined(result, 'shadowColor', shadowColor);
        assignIfDefined(result, 'shadowOffsetX', shadowOffsetX);
        assignIfDefined(result, 'shadowOffsetY', shadowOffsetY);
        var stroke = styleAny.textStroke != null ? styleAny.textStroke : styleAny.stroke;
        var strokeWidth = styleAny.textStrokeWidth != null
            ? styleAny.textStrokeWidth
            : (_a = styleAny.lineWidth) !== null && _a !== void 0 ? _a : styleAny.strokeWidth;
        assignIfDefined(result, 'stroke', stroke);
        assignIfDefined(result, 'lineWidth', strokeWidth);
        return result;
    }
    function resolveVerticalAlign(style) {
        var _a, _b;
        var direct = (_a = style.textVerticalAlign) !== null && _a !== void 0 ? _a : style.verticalAlign;
        if (direct === 'top' || direct === 'middle' || direct === 'bottom') {
            return direct;
        }
        if (direct === 'center') {
            return 'middle';
        }
        var baseline = (_b = style.textBaseline) !== null && _b !== void 0 ? _b : style.baseline;
        if (baseline === 'top') {
            return 'top';
        }
        if (baseline === 'middle' || baseline === 'center') {
            return 'middle';
        }
        if (baseline === 'bottom' || baseline === 'baseline') {
            return 'bottom';
        }
        return undefined;
    }
    function resolvePosition(position, cx, cy, radius, left, top, width, height) {
        if (Array.isArray(position)) {
            return {
                x: parseCoordinate(position[0], width, cx - left) + left,
                y: parseCoordinate(position[1], height, cy - top) + top,
                align: 'center',
                verticalAlign: 'middle',
            };
        }
        switch (position) {
            case 'inside':
                return {
                    x: cx,
                    y: cy,
                    align: 'center',
                    verticalAlign: 'middle',
                };
            case 'left':
            case 'insideLeft':
                return {
                    x: cx - radius * 0.6,
                    y: cy,
                    align: 'left',
                    verticalAlign: 'middle',
                };
            case 'right':
            case 'insideRight':
                return {
                    x: cx + radius * 0.6,
                    y: cy,
                    align: 'right',
                    verticalAlign: 'middle',
                };
            case 'top':
            case 'insideTop':
                return {
                    x: cx,
                    y: cy - radius * 0.6,
                    align: 'center',
                    verticalAlign: 'top',
                };
            case 'bottom':
            case 'insideBottom':
                return {
                    x: cx,
                    y: cy + radius * 0.6,
                    align: 'center',
                    verticalAlign: 'bottom',
                };
            default:
                return {
                    x: cx,
                    y: cy,
                    align: 'center',
                    verticalAlign: 'middle',
                };
        }
    }
    function parseCoordinate(value, size, fallback) {
        if (typeof value === 'number' && isFinite(value)) {
            return value;
        }
        if (typeof value === 'string') {
            var percent = parsePercent(value);
            if (percent != null) {
                return percent * size;
            }
            var numeric = Number(value);
            if (!Number.isNaN(numeric)) {
                return numeric;
            }
        }
        return fallback;
    }
    function parsePercent(value) {
        var match = value.match(/^(-?\d+(?:\.\d+)?)%$/);
        if (!match) {
            return null;
        }
        return parseFloat(match[1]) / 100;
    }
    function assignIfDefined(target, key, value) {
        if (value !== undefined && value !== null) {
            target[key] = value;
        }
    }
    function cloneAnimation(animation) {
        if (!animation) {
            return animation;
        }
        if (Array.isArray(animation)) {
            return animation.map(function (item) { return cloneAnimation(item); });
        }
        var cloned = {};
        for (var key in animation) {
            if (Object.prototype.hasOwnProperty.call(animation, key)) {
                cloned[key] = animation[key];
            }
        }
        if (Array.isArray(animation.keyframes)) {
            cloned.keyframes = animation.keyframes.map(function (frame) {
                var frameCopy = {};
                for (var key in frame) {
                    if (Object.prototype.hasOwnProperty.call(frame, key)) {
                        frameCopy[key] = frame[key];
                    }
                }
                return frameCopy;
            });
        }
        return cloned;
    }

    function getWaterPositions(x, stage, waveLength, amplitude) {
        if (stage === 0) {
            return [
                [x + ((1 / 2) * waveLength) / Math.PI / 2, amplitude / 2],
                [x + ((1 / 2) * waveLength) / Math.PI, amplitude],
                [x + waveLength / 4, amplitude],
            ];
        }
        else if (stage === 1) {
            return [
                [x + (((1 / 2) * waveLength) / Math.PI / 2) * (Math.PI - 2), amplitude],
                [
                    x + (((1 / 2) * waveLength) / Math.PI / 2) * (Math.PI - 1),
                    amplitude / 2,
                ],
                [x + waveLength / 4, 0],
            ];
        }
        else if (stage === 2) {
            return [
                [x + ((1 / 2) * waveLength) / Math.PI / 2, -amplitude / 2],
                [x + ((1 / 2) * waveLength) / Math.PI, -amplitude],
                [x + waveLength / 4, -amplitude],
            ];
        }
        else {
            return [
                [x + (((1 / 2) * waveLength) / Math.PI / 2) * (Math.PI - 2), -amplitude],
                [
                    x + (((1 / 2) * waveLength) / Math.PI / 2) * (Math.PI - 1),
                    -amplitude / 2,
                ],
                [x + waveLength / 4, 0],
            ];
        }
    }
    function createWavePath(left, totalWaveWidth, waterLevel, amplitude, waveLength, radius, cy) {
        var safeWaveLength = waveLength || 1;
        var cycleCount = Math.max(1, Math.ceil(totalWaveWidth / safeWaveLength));
        var curves = cycleCount * 4;
        var path = "M ".concat(left, " ").concat(waterLevel);
        for (var c = 0; c < curves; ++c) {
            var stage = c % 4;
            var pos = getWaterPositions((c * safeWaveLength) / 4, stage, safeWaveLength, amplitude);
            path +=
                " C ".concat(pos[0][0] + left, " ").concat(-pos[0][1] + waterLevel) +
                    " ".concat(pos[1][0] + left, " ").concat(-pos[1][1] + waterLevel) +
                    " ".concat(pos[2][0] + left, " ").concat(-pos[2][1] + waterLevel);
        }
        var waveRight = left + cycleCount * safeWaveLength;
        path += " L ".concat(waveRight, " ").concat(cy + radius);
        path += " L ".concat(left, " ").concat(cy + radius);
        path += " L ".concat(left, " ").concat(waterLevel);
        path += ' Z';
        return path;
    }
    var renderItem = function (params, api) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q;
        var itemPayload = params.itemPayload;
        var width = api.getWidth();
        var height = api.getHeight();
        var size = Math.min(width, height);
        var elementStyle = api.style();
        var styleAny = elementStyle;
        var center = itemPayload.center || ['50%', '50%'];
        var cxVal = typeof center[0] === 'string'
            ? (parseFloat(center[0]) / 100) * width
            : center[0];
        var cyVal = typeof center[1] === 'string'
            ? (parseFloat(center[1]) / 100) * height
            : center[1];
        var radiusStr = itemPayload.radius || '50%';
        var radius = typeof radiusStr === 'string'
            ? ((parseFloat(radiusStr) / 100) * size) / 2
            : radiusStr;
        var outlineShow = ((_a = itemPayload.outline) === null || _a === void 0 ? void 0 : _a.show) !== false;
        var outlineDistance = ((_b = itemPayload.outline) === null || _b === void 0 ? void 0 : _b.borderDistance) || 8;
        var outlineBorderWidth = ((_d = (_c = itemPayload.outline) === null || _c === void 0 ? void 0 : _c.itemStyle) === null || _d === void 0 ? void 0 : _d.borderWidth) || 8;
        var innerRadius = radius - (outlineShow ? outlineBorderWidth / 2 + outlineDistance : 0);
        var children = [];
        var id = params.dataIndex;
        if (id === 0) {
            children.push({
                type: 'circle',
                shape: {
                    cx: cxVal,
                    cy: cyVal,
                    r: innerRadius,
                },
                style: {
                    fill: ((_e = itemPayload.backgroundStyle) === null || _e === void 0 ? void 0 : _e.color) || '#E3F7FF',
                    stroke: 'none',
                },
                z2: 0,
            });
        }
        var cnt = params.dataInsideLength;
        var value = api.value(0);
        var waterLevel = cyVal + innerRadius - value * innerRadius * 2;
        var amplitude = itemPayload.amplitude || (8 * size) / 500;
        var waveLength = typeof itemPayload.waveLength === 'string'
            ? (parseFloat(itemPayload.waveLength) / 100) * innerRadius * 2
            : itemPayload.waveLength || innerRadius * 1.6;
        if (!isFinite(waveLength) || waveLength <= 0) {
            waveLength = innerRadius || 1;
        }
        var safeWaveLength = waveLength || 1;
        var phaseSetting = itemPayload.phase === undefined ? 'auto' : itemPayload.phase;
        var phaseValue = phaseSetting === 'auto' ? (params.dataIndex * Math.PI) / 4 : phaseSetting;
        var normalizedPhase = ((phaseValue % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
        var phaseRatio = normalizedPhase / (Math.PI * 2);
        var phaseOffsetPx = phaseRatio * safeWaveLength;
        var direction = (_f = itemPayload.direction) !== null && _f !== void 0 ? _f : 'right';
        var directionSign = direction === 'left' ? 1 : direction === 'right' ? -1 : 0;
        var extraLeftMargin = directionSign === 1 ? safeWaveLength : 0;
        var extraRightMargin = directionSign === -1 ? safeWaveLength : 0;
        var requiredWaveWidth = innerRadius * 2 + extraLeftMargin + extraRightMargin;
        var waveCount = Math.max(1, Math.ceil(requiredWaveWidth / safeWaveLength));
        var totalWaveWidth = waveCount * safeWaveLength;
        var waveLeft = cxVal - innerRadius - extraLeftMargin;
        var wavePath = createWavePath(waveLeft, totalWaveWidth, waterLevel, amplitude, safeWaveLength, innerRadius, cyVal);
        var periodSetting = (_g = itemPayload.period) !== null && _g !== void 0 ? _g : 'auto';
        var periodMs;
        if (periodSetting === 'auto') {
            var dataCount = Math.max(cnt, 1);
            var base = 5000;
            var weight = cnt === 0 ? 1 : 0.2 + ((cnt - params.dataIndex) / dataCount) * 0.8;
            periodMs = base * weight;
        }
        else if (typeof periodSetting === 'function') {
            periodMs = periodSetting(value, params.dataIndex);
        }
        else {
            periodMs = periodSetting;
        }
        if (!isFinite(periodMs) || periodMs <= 0) {
            periodMs = 2000;
        }
        var initialOffsetX = -phaseOffsetPx;
        var animationDuration = periodMs;
        var customAnimationDuration = itemPayload.animationDuration;
        if (customAnimationDuration != null &&
            isFinite(customAnimationDuration) &&
            customAnimationDuration > 0) {
            animationDuration = customAnimationDuration;
        }
        if (!isFinite(animationDuration) || animationDuration <= 0) {
            animationDuration = 0;
        }
        var effectiveWaveSpeed = animationDuration > 0 && safeWaveLength > 0
            ? safeWaveLength / animationDuration
            : 0;
        var animationDelay = directionSign === 0 || effectiveWaveSpeed === 0
            ? 0
            : -phaseOffsetPx / effectiveWaveSpeed;
        var animationEasing = itemPayload.animationEasing;
        var waveAnimationOption;
        var waveFill = styleAny.fill || api.visual('color');
        var waveOpacity = styleAny.opacity != null
            ? Number(styleAny.opacity)
            : (_j = (_h = itemPayload.itemStyle) === null || _h === void 0 ? void 0 : _h.opacity) !== null && _j !== void 0 ? _j : 0.95;
        var waveShadowBlur = (_k = styleAny.shadowBlur) !== null && _k !== void 0 ? _k : (_l = itemPayload.itemStyle) === null || _l === void 0 ? void 0 : _l.shadowBlur;
        var waveShadowColor = (_m = styleAny.shadowColor) !== null && _m !== void 0 ? _m : (_o = itemPayload.itemStyle) === null || _o === void 0 ? void 0 : _o.shadowColor;
        var wavePathElement = {
            type: 'path',
            shape: {
                pathData: wavePath,
            },
            x: initialOffsetX,
            style: {
                fill: waveFill,
                opacity: waveOpacity,
                shadowBlur: waveShadowBlur,
                shadowColor: waveShadowColor,
            },
            z2: 10 + params.dataIndex,
        };
        var waveGroup = {
            type: 'group',
            y: 0,
            clipPath: {
                type: 'circle',
                shape: {
                    cx: cxVal,
                    cy: cyVal,
                    r: innerRadius,
                },
            },
            children: [wavePathElement],
        };
        if (itemPayload.waveAnimation !== false &&
            directionSign !== 0 &&
            safeWaveLength > 0 &&
            animationDuration > 0 &&
            effectiveWaveSpeed > 0) {
            var keyframeAnimation = {
                duration: animationDuration,
                loop: true,
                delay: animationDelay,
                keyframes: [
                    {
                        percent: 0,
                        x: initialOffsetX,
                    },
                    {
                        percent: 1,
                        x: initialOffsetX + directionSign * safeWaveLength,
                    },
                ],
            };
            if (animationEasing) {
                keyframeAnimation.easing = animationEasing;
            }
            waveAnimationOption = keyframeAnimation;
        }
        if (waveAnimationOption) {
            wavePathElement.keyframeAnimation = waveAnimationOption;
        }
        children.push(waveGroup);
        if (params.dataIndex === 0) {
            var defaultLabelColor = (_q = (_p = styleAny.textFill) !== null && _p !== void 0 ? _p : styleAny.fill) !== null && _q !== void 0 ? _q : waveFill;
            var labelGroup = createLabelGroup({
                style: elementStyle,
                cx: cxVal,
                cy: cyVal,
                innerRadius: innerRadius,
                boundingLeft: cxVal - innerRadius,
                boundingTop: cyVal - innerRadius,
                boundingWidth: innerRadius * 2,
                boundingHeight: innerRadius * 2,
                wavePathData: wavePath,
                waveInitialX: initialOffsetX,
                waveAnimation: waveAnimationOption,
                defaultColor: defaultLabelColor,
                insideColorOverride: itemPayload.labelInsideColor,
            });
            if (labelGroup) {
                children.push(labelGroup);
            }
        }
        return {
            type: 'group',
            children: children,
        };
    };
    var index = {
        install: function (registers) {
            registers.registerCustomSeries('liquidFill', renderItem);
        },
    };

    return index;

}));
