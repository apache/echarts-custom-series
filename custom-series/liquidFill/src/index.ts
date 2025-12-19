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

import * as echarts from 'echarts';
import type {
  CustomRootElementOption,
  CustomSeriesRenderItem,
  CustomElementOption,
} from 'echarts/types/src/chart/custom/CustomSeries.d.ts';
import type {
  EChartsExtensionInstallRegisters,
  EChartsExtension,
} from 'echarts/types/src/extension.d.ts';
import { createLabelGroup, type RenderItemStyle } from './label';

interface LiquidFillItemPayload {
  radius?: string | number;
  center?: (string | number)[];
  amplitude?: number;
  waveLength?: string | number;
  phase?: number | 'auto';
  period?: number | 'auto' | ((value: number, index: number) => number);
  direction?: 'right' | 'left' | 'none';
  shape?:
    | 'circle'
    | 'rect'
    | 'roundRect'
    | 'triangle'
    | 'diamond'
    | 'pin'
    | 'arrow';
  waveAnimation?: boolean;
  animationDuration?: number;
  animationEasing?: string;
  outline?: {
    show?: boolean;
    borderDistance?: number;
    itemStyle?: {
      borderColor?: string;
      borderWidth?: number;
      shadowBlur?: number;
      shadowColor?: string;
    };
  };
  backgroundStyle?: {
    color?: string;
    borderColor?: string;
    borderWidth?: number;
    shadowBlur?: number;
    shadowColor?: string;
  };
  itemStyle?: {
    opacity?: number;
    shadowBlur?: number;
    shadowColor?: string;
  };
  labelInsideColor?: string;
}

/**
 * Using Bezier curves to fit sine wave.
 * There is 4 control points for each curve of wave,
 * which is at 1/4 wave length of the sine wave.
 */
function getWaterPositions(
  x: number,
  stage: number,
  waveLength: number,
  amplitude: number
) {
  if (stage === 0) {
    return [
      [x + ((1 / 2) * waveLength) / Math.PI / 2, amplitude / 2],
      [x + ((1 / 2) * waveLength) / Math.PI, amplitude],
      [x + waveLength / 4, amplitude],
    ];
  } else if (stage === 1) {
    return [
      [x + (((1 / 2) * waveLength) / Math.PI / 2) * (Math.PI - 2), amplitude],
      [
        x + (((1 / 2) * waveLength) / Math.PI / 2) * (Math.PI - 1),
        amplitude / 2,
      ],
      [x + waveLength / 4, 0],
    ];
  } else if (stage === 2) {
    return [
      [x + ((1 / 2) * waveLength) / Math.PI / 2, -amplitude / 2],
      [x + ((1 / 2) * waveLength) / Math.PI, -amplitude],
      [x + waveLength / 4, -amplitude],
    ];
  } else {
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

function createWavePath(
  left: number,
  totalWaveWidth: number,
  waterLevel: number,
  amplitude: number,
  waveLength: number,
  radius: number,
  cy: number
): string {
  const safeWaveLength = waveLength || 1;
  const cycleCount = Math.max(1, Math.ceil(totalWaveWidth / safeWaveLength));
  const curves = cycleCount * 4;

  let path = `M ${left} ${waterLevel}`;

  for (let c = 0; c < curves; ++c) {
    const stage = c % 4;
    const pos = getWaterPositions(
      (c * safeWaveLength) / 4,
      stage,
      safeWaveLength,
      amplitude
    );
    path +=
      ` C ${pos[0][0] + left} ${-pos[0][1] + waterLevel}` +
      ` ${pos[1][0] + left} ${-pos[1][1] + waterLevel}` +
      ` ${pos[2][0] + left} ${-pos[2][1] + waterLevel}`;
  }

  const waveRight = left + cycleCount * safeWaveLength;

  path += ` L ${waveRight} ${cy + radius}`;
  path += ` L ${left} ${cy + radius}`;
  path += ` L ${left} ${waterLevel}`;
  path += ' Z';

  return path;
}

const renderItem = (
  params: echarts.CustomSeriesRenderItemParams,
  api: echarts.CustomSeriesRenderItemAPI
) => {
  const itemPayload = params.itemPayload as LiquidFillItemPayload;
  const width = api.getWidth();
  const height = api.getHeight();
  const size = Math.min(width, height);
  const elementStyle = api.style() as RenderItemStyle;
  const styleAny = elementStyle as Record<string, any>;

  const center = itemPayload.center || ['50%', '50%'];
  const cxVal =
    typeof center[0] === 'string'
      ? (parseFloat(center[0]) / 100) * width
      : (center[0] as number);
  const cyVal =
    typeof center[1] === 'string'
      ? (parseFloat(center[1]) / 100) * height
      : (center[1] as number);

  const radiusStr = itemPayload.radius || '50%';
  const radius =
    typeof radiusStr === 'string'
      ? ((parseFloat(radiusStr) / 100) * size) / 2
      : radiusStr;

  const outlineShow = itemPayload.outline?.show !== false;
  const outlineDistance = itemPayload.outline?.borderDistance || 8;
  const outlineBorderWidth = itemPayload.outline?.itemStyle?.borderWidth || 8;

  const innerRadius =
    radius - (outlineShow ? outlineBorderWidth / 2 + outlineDistance : 0);

  const children: CustomElementOption[] = [];

  // 1. Background
  const id = params.dataIndex;
  if (id === 0) {
    // Render background only once
    children.push({
      type: 'circle',
      shape: {
        cx: cxVal,
        cy: cyVal,
        r: innerRadius,
      },
      style: {
        fill: itemPayload.backgroundStyle?.color || '#E3F7FF',
        stroke: 'none',
      },
      z2: 0,
    });
  }

  // 2. Waves
  const cnt = params.dataInsideLength;
  // renderItem is called once per data entry, so we draw one wave here.
  // Overlapping waves rely on their own z ordering; no need to inspect siblings.

  const value = api.value(0) as number;

  const waterLevel = cyVal + innerRadius - value * innerRadius * 2;
  const amplitude = itemPayload.amplitude || (8 * size) / 500; // Rough default scaling
  let waveLength =
    typeof itemPayload.waveLength === 'string'
      ? (parseFloat(itemPayload.waveLength) / 100) * innerRadius * 2
      : itemPayload.waveLength || innerRadius * 1.6;
  if (!isFinite(waveLength) || waveLength <= 0) {
    waveLength = innerRadius || 1;
  }
  const safeWaveLength = waveLength || 1;

  const phaseSetting =
    itemPayload.phase === undefined ? 'auto' : itemPayload.phase;
  const phaseValue: number =
    phaseSetting === 'auto' ? (params.dataIndex * Math.PI) / 4 : phaseSetting;
  const normalizedPhase =
    ((phaseValue % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
  const phaseRatio = normalizedPhase / (Math.PI * 2);
  const phaseOffsetPx = phaseRatio * safeWaveLength;

  const direction = itemPayload.direction ?? 'right';
  const directionSign =
    direction === 'left' ? 1 : direction === 'right' ? -1 : 0;

  const extraLeftMargin = directionSign === 1 ? safeWaveLength : 0;
  const extraRightMargin = directionSign === -1 ? safeWaveLength : 0;
  const requiredWaveWidth =
    innerRadius * 2 + extraLeftMargin + extraRightMargin;
  const waveCount = Math.max(1, Math.ceil(requiredWaveWidth / safeWaveLength));
  const totalWaveWidth = waveCount * safeWaveLength;
  const waveLeft = cxVal - innerRadius - extraLeftMargin;

  const wavePath = createWavePath(
    waveLeft,
    totalWaveWidth,
    waterLevel,
    amplitude,
    safeWaveLength,
    innerRadius,
    cyVal
  );

  const periodSetting = itemPayload.period ?? 'auto';
  let periodMs: number;
  if (periodSetting === 'auto') {
    const dataCount = Math.max(cnt, 1);
    const base = 5000;
    const weight =
      cnt === 0 ? 1 : 0.2 + ((cnt - params.dataIndex) / dataCount) * 0.8;
    periodMs = base * weight;
  } else if (typeof periodSetting === 'function') {
    periodMs = periodSetting(value, params.dataIndex);
  } else {
    periodMs = periodSetting;
  }
  if (!isFinite(periodMs) || periodMs <= 0) {
    periodMs = 2000;
  }

  const initialOffsetX = -phaseOffsetPx;
  let animationDuration = periodMs;
  const customAnimationDuration = itemPayload.animationDuration;
  if (
    customAnimationDuration != null &&
    isFinite(customAnimationDuration) &&
    customAnimationDuration > 0
  ) {
    animationDuration = customAnimationDuration;
  }
  if (!isFinite(animationDuration) || animationDuration <= 0) {
    animationDuration = 0;
  }
  const effectiveWaveSpeed =
    animationDuration > 0 && safeWaveLength > 0
      ? safeWaveLength / animationDuration
      : 0;
  const animationDelay =
    directionSign === 0 || effectiveWaveSpeed === 0
      ? 0
      : -phaseOffsetPx / effectiveWaveSpeed;
  const animationEasing = itemPayload.animationEasing;

  let waveAnimationOption: CustomElementOption['keyframeAnimation'];

  const waveFill =
    (styleAny.fill as string | undefined) || (api.visual('color') as string);
  const waveOpacity =
    styleAny.opacity != null
      ? Number(styleAny.opacity)
      : itemPayload.itemStyle?.opacity ?? 0.95;
  const waveShadowBlur =
    (styleAny.shadowBlur as number | undefined) ??
    itemPayload.itemStyle?.shadowBlur;
  const waveShadowColor =
    (styleAny.shadowColor as string | undefined) ??
    itemPayload.itemStyle?.shadowColor;

  const wavePathElement: CustomElementOption = {
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

  const waveGroup: CustomElementOption = {
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

  if (
    itemPayload.waveAnimation !== false &&
    directionSign !== 0 &&
    safeWaveLength > 0 &&
    animationDuration > 0 &&
    effectiveWaveSpeed > 0
  ) {
    const keyframeAnimation: CustomElementOption['keyframeAnimation'] & {
      easing?: string;
    } = {
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
      keyframeAnimation.easing = animationEasing as any;
    }
    waveAnimationOption = keyframeAnimation;
  }

  if (waveAnimationOption) {
    (
      wavePathElement as CustomElementOption & { keyframeAnimation?: any }
    ).keyframeAnimation = waveAnimationOption;
  }

  children.push(waveGroup);

  if (params.dataIndex === 0) {
    const defaultLabelColor =
      (styleAny.textFill as string | undefined) ??
      (styleAny.fill as string | undefined) ??
      waveFill;

    const labelGroup = createLabelGroup({
      style: elementStyle,
      cx: cxVal,
      cy: cyVal,
      innerRadius,
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
    children,
  } as CustomRootElementOption;
};

export default {
  install(registers: EChartsExtensionInstallRegisters) {
    registers.registerCustomSeries(
      'liquidFill',
      renderItem as unknown as CustomSeriesRenderItem
    );
  },
} as EChartsExtension;
