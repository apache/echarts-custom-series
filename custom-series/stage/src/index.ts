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

import echarts, { zrUtil } from 'echarts';
import type {
  CustomElementOption,
  CustomRootElementOption,
  CustomSeriesRenderItem,
} from 'echarts/types/src/chart/custom/CustomSeries.d.ts';
import type { EChartsExtensionInstallRegisters } from 'echarts/src/extension.ts';

interface Envelope {
  show?: boolean;
  color?: 'auto' | string;
  externalRadius?: number;
  opacity?: number;
  margin?: number;
  dpr?: number;
}

interface ItemStyle {
  borderRadius?: number;
  verticalMargin?: number;
  minHorizontalSize?: number;
}

interface AxisLabel {
  color?: string;
  formatter?: (value: string, index: number) => string;
}

interface StageItemPayload {
  itemStyle?: ItemStyle;
  axisLabel?: AxisLabel;
  envelope?: Envelope;
}

const renderItem = (
  params: echarts.CustomSeriesRenderItemParams,
  api: echarts.CustomSeriesRenderItemAPI
) => {
  const start = api.value(0);
  const end = api.value(1);
  const stageIndex = api.value(2);

  const startCoord = api.coord([start, stageIndex]);
  const endCoord = api.coord([end, stageIndex]);

  const bandWidth = api.coord([0, 0])[1] - api.coord([0, 1])[1];
  const fontSize = 14;
  const textMargin = 5;
  const color = api.visual('color');
  const itemPayload = params.itemPayload as StageItemPayload;
  const itemStyle = itemPayload.itemStyle || {};
  const borderRadius = itemStyle.borderRadius || 8;
  const externalRadius = zrUtil.retrieve2(
    itemPayload.envelope?.externalRadius,
    6
  ) as number;
  const barVerticalMargin = zrUtil.retrieve2(
    itemStyle.verticalMargin,
    8
  ) as number;
  const barMinWidth = zrUtil.retrieve2(
    itemStyle.minHorizontalSize,
    3
  ) as number;

  const children: CustomElementOption[] = [];
  const boxes: { x: number; y: number; width: number; height: number }[] =
    (params.context.boxes as {
      x: number;
      y: number;
      width: number;
      height: number;
    }[]) || [];

  const span = endCoord[0] - startCoord[0];
  const height = Math.max(span, barMinWidth);
  const shape = {
    x: startCoord[0] - (height - span) / 2,
    y:
      startCoord[1] - bandWidth / 2 + textMargin + fontSize + barVerticalMargin,
    width: height,
    height: bandWidth - fontSize - textMargin - 2 * barVerticalMargin,
  };
  children.push({
    type: 'rect',
    shape: {
      x: shape.x,
      y: shape.y,
      width: shape.width,
      height: shape.height,
      r: borderRadius,
    },
    style: {
      fill: color,
    },
    z2: 10,
  });
  boxes.push(shape);
  params.context.boxes = boxes;

  if (!params.context.renderedStages) {
    params.context.renderedStages = [];
  }
  const renderedStages = params.context.renderedStages as boolean[];
  if (!renderedStages[stageIndex]) {
    const axisLabel: AxisLabel = itemPayload.axisLabel || {};
    let text = api.ordinalRawValue(2) as string;
    if (typeof axisLabel.formatter === 'function') {
      text = axisLabel.formatter(text, stageIndex as number);
    }
    // Each stage only render once as axis label
    children.push({
      type: 'text',
      style: {
        x: (params.coordSys as any).x + textMargin,
        y: startCoord[1] - bandWidth / 2 + textMargin + fontSize,
        fill: axisLabel.color || '#8A8A8A',
        text,
        verticalAlign: 'bottom',
      },
      z2: 20,
    });
    renderedStages[stageIndex] = true;
  }

  // If is the last item, render envelope
  if (params.dataIndex === params.dataInsideLength - 1) {
    const allColors: string[] = [];
    for (let i = 0; i < params.dataInsideLength; i++) {
      const color = api.visual('color', i) as string;
      if (allColors.indexOf(color) < 0) {
        allColors.push(color);
      }
    }

    const envelope: Envelope = itemPayload.envelope || {};
    if (envelope.show !== false && boxes.length > 1) {
      const envelopePaths: CustomElementOption[] = [];
      const margin = echarts.zrUtil.retrieve2(envelope.margin as number, 2);

      // Sort boxes by x, then by y
      boxes.sort((a, b) => a.x - b.x || a.y - b.y);

      let envelopeFill: any = envelope.color || '#888';
      if (allColors.length > 0 && !envelope.color) {
        const stops: { offset: number; color: string }[] = [];
        for (let i = 0; i < allColors.length; i++) {
          // For example, if there are 4 colors, the gradient stops are 1/8,
          // 3/8, 5/8, 7/8.
          stops.push({
            offset: (i * 2 + 1) / (allColors.length * 2),
            color: allColors[i],
          });
        }
        envelopeFill = {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          global: false,
          colorStops: stops,
        };
      }
      const opacity = zrUtil.retrieve2(envelope.opacity as number, 0.25);

      for (let i = 0; i < boxes.length; i++) {
        const box = boxes[i];

        envelopePaths.push({
          type: 'rect',
          shape: {
            x: box.x - margin,
            y: box.y - margin,
            width: box.width + margin * 2,
            height: box.height + margin * 2,
            r: Math.min(borderRadius, box.width / 2) + margin,
          },
        });

        if (i > 0) {
          const prevBox = boxes[i - 1];
          const isPrevLower = prevBox.y > box.y + box.height;
          const height = isPrevLower
            ? prevBox.y - box.y - box.height + borderRadius * 2
            : box.y - prevBox.y - prevBox.height + borderRadius * 2;
          const y = isPrevLower
            ? box.y + box.height - borderRadius
            : prevBox.y + prevBox.height - borderRadius;

          if (box.x - margin >= prevBox.x + prevBox.width + margin) {
            // No overlapping
            continue;
          }

          // Draw outer border-radius
          if (isPrevLower) {
            if (box.x - margin - prevBox.x > 0) {
              const right = Math.ceil(box.x - margin);
              const bottom = prevBox.y - margin;
              const r = Math.min(
                (box.x - margin - prevBox.x) / 2,
                externalRadius
              );

              envelopePaths.push({
                type: 'path',
                shape: {
                  pathData: `M${right - r} ${bottom}A${r} ${r} 0 0 0 ${right} ${
                    bottom - r
                  }L${right},${bottom + margin}L${right - r},${bottom}Z`,
                },
              });
            }
            if (box.x + box.width - prevBox.x - prevBox.width - margin > 0) {
              const top = box.y + box.height + margin;
              const left = Math.floor(prevBox.x + prevBox.width + margin);
              const r = Math.min(
                (box.x + box.width - prevBox.x - prevBox.width - margin) / 2,
                externalRadius
              );

              envelopePaths.push({
                type: 'path',
                shape: {
                  pathData: `M${left + r} ${top}A${r} ${r} 0 0 0 ${left} ${
                    top + r
                  }L${left},${top - margin}L${left + r},${top}Z`,
                },
              });
            }
          } else {
            if (box.x - margin - prevBox.x > 0) {
              const right = Math.ceil(box.x - margin);
              const top = prevBox.y + prevBox.height + margin;
              const r = Math.min(
                (box.x - margin - prevBox.x) / 2,
                externalRadius
              );

              envelopePaths.push({
                type: 'path',
                shape: {
                  pathData: `M${right} ${top + r}A${r} ${r} 0 0 0 ${
                    right - r
                  } ${top}L${right},${top - margin}L${right},${top + r}Z`,
                },
              });
            }
            if (box.x + box.width - prevBox.x - prevBox.width - margin > 0) {
              const bottom = box.y - margin;
              const left = Math.floor(prevBox.x + prevBox.width + margin);
              const r = Math.min(
                (box.x + box.width - prevBox.x - prevBox.width - margin) / 2,
                externalRadius
              );

              envelopePaths.push({
                type: 'path',
                shape: {
                  pathData: `M${left} ${bottom - r}A${r} ${r} 0 0 0 ${
                    left + r
                  } ${bottom}L${left},${bottom + margin}L${left},${
                    bottom - r
                  }Z`,
                },
              });
            }
          }

          // Draw bars between boxes
          envelopePaths.push({
            type: 'rect',
            shape: {
              x: prevBox.x + prevBox.width + margin,
              y: y + height,
              width: box.x - prevBox.x - prevBox.width - margin * 2,
              height: -height,
            },
          });
        }
      }

      children.push({
        type: 'compoundPath',
        shape: {
          paths: envelopePaths,
        },
        style: {
          fill: envelopeFill,
          opacity,
        },
        silent: true,
      });
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
      'stage',
      renderItem as unknown as CustomSeriesRenderItem
    );
  },
};
