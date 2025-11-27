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

interface LiquidFillItemPayload {
  radius?: string | number;
  center?: (string | number)[];
  amplitude?: number;
  waveLength?: string | number;
  phase?: number;
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
  radius: number,
  waterLevel: number,
  amplitude: number,
  waveLength: number,
  phase: number,
  cx: number,
  cy: number
): string {
  const curves = Math.max(Math.ceil(((2 * radius) / waveLength) * 4) * 2, 8);

  // map phase to [-Math.PI * 2, 0]
  while (phase < -Math.PI * 2) {
    phase += Math.PI * 2;
  }
  while (phase > 0) {
    phase -= Math.PI * 2;
  }
  const phaseOffset = (phase / Math.PI / 2) * waveLength;
  const left = cx - radius + phaseOffset - radius * 2;

  let path = `M ${left} ${waterLevel}`;

  let waveRight = 0;
  for (let c = 0; c < curves; ++c) {
    const stage = c % 4;
    const pos = getWaterPositions(
      (c * waveLength) / 4,
      stage,
      waveLength,
      amplitude
    );
    path +=
      ` C ${pos[0][0] + left} ${-pos[0][1] + waterLevel}` +
      ` ${pos[1][0] + left} ${-pos[1][1] + waterLevel}` +
      ` ${pos[2][0] + left} ${-pos[2][1] + waterLevel}`;

    if (c === curves - 1) {
      waveRight = pos[2][0];
    }
  }

  // Close path
  path += ` L ${waveRight + left} ${cy + radius}`;
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
  // We render all waves in the last iteration to handle layering correctly if needed,
  // but custom series renders per data item.
  // However, liquid fill usually has multiple values for one "series" (multiple waves).
  // In custom series, usually data is [val1, val2...].
  // If we want multiple waves, we iterate through all data items here if we are at the last one?
  // Or simply render one wave per data item.
  // Let's assume standard custom series behavior: renderItem is called for each data item.
  // But liquid fill waves overlap.

  // To mimic liquid fill, we need the context of all data items to determine opacity/layering,
  // but renderItem is isolated.
  // We can just render the wave for the current data item.

  const value = api.value(0) as number;
  // Normalize value to 0-1 if it isn't? Liquid fill usually expects 0-1 for percentage.
  // If user passes raw values, they might need to handle normalization or we assume 0-1.

  const waterLevel = cyVal + innerRadius - value * innerRadius * 2;
  const amplitude = itemPayload.amplitude || (8 * size) / 500; // Rough default scaling
  const waveLength =
    typeof itemPayload.waveLength === 'string'
      ? (parseFloat(itemPayload.waveLength) / 100) * innerRadius * 2
      : itemPayload.waveLength || innerRadius * 1.6;

  const phase = (itemPayload.phase || 0) + (params.dataIndex * Math.PI) / 4;

  // Animation state
  // We use a custom property to animate phase
  // In custom series, we can't easily run a continuous loop without external triggers or using the `transition` feature effectively.
  // However, we can try to use the `enterFrom` / `updateFrom` for basic transitions,
  // but continuous wave animation (moving left/right) is tricky in pure custom series without a loop.
  // We will render a static wave for now, or a wave that transitions to a new phase if data updates.

  // To achieve the "flowing" effect, we would typically use the `keyframeAnimation`.
  // Since we are in a custom series, let's use a large phase shift for animation if possible.

  const wavePath = createWavePath(
    innerRadius,
    waterLevel,
    amplitude,
    waveLength,
    phase,
    cxVal,
    cyVal
  );

  // Since keyframe animation of path string calculation isn't supported directly,
  // we use a Group with translation for the wave effect.
  // The wave path is generated much wider than the container.

  const groupChildren: CustomElementOption[] = [];

  // Re-generate path to be very wide for translation animation
  // We need it to repeat.
  // Simplified approach: Just render the static shape for this demo,
  // or use the `transition` on a custom attribute if we were updating frequently.
  // For a true liquid fill wave animation in custom series, we'd need to register a timer in the main app
  // or use a custom shader/graphic element which is out of scope for standard `renderItem`.
  // However, we can simulate it by rendering a very long wave and animating x.

  const waveGroup: CustomElementOption = {
    type: 'group',
    x: 0,
    y: 0,
    children: [
      {
        type: 'path',
        shape: {
          pathData: wavePath,
        },
        style: {
          fill: api.visual('color'),
          opacity: itemPayload.itemStyle?.opacity || 0.95,
        },
        // Use keyframe animation to move the wave horizontally
        keyframeAnimation:
          itemPayload.waveAnimation !== false
            ? {
                duration: 2000,
                loop: true,
                keyframes: [
                  {
                    percent: 1,
                    x: waveLength, // Move by one wavelength
                  },
                ],
              }
            : undefined,
      } as CustomElementOption,
    ],
    // clipPath: {
    //   type: 'circle',
    //   shape: {
    //       cx: cxVal,
    //       cy: cyVal,
    //       r: innerRadius
    //   }
    // },
    // z2: 10
  };

  children.push(waveGroup);
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
