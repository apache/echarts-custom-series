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

import echarts from 'echarts';
import type {
  CustomElementOption,
  CustomRootElementOption,
  CustomSeriesRenderItem,
} from 'echarts/types/src/chart/custom/CustomSeries.d.ts';
import type { EChartsExtensionInstallRegisters } from 'echarts/src/extension.ts';

type Envelope = {
  show?: boolean;
  color?: 'auto' | string;
  opacity?: number;
  margin?: number;
};

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
  const barMargin = 8;
  const color = api.visual('color');
  const borderRadius = (params.itemPayload.borderRadius as number) || 8;
  const barMinHeight = 2;

  const children: CustomElementOption[] = [];
  const boxes: { x: number; y: number; width: number; height: number }[] =
    (params.context.boxes as {
      x: number;
      y: number;
      width: number;
      height: number;
    }[]) || [];

  const span = endCoord[0] - startCoord[0];
  const height = Math.max(span, barMinHeight);
  const shape = {
    x: startCoord[0] - (height - span) / 2,
    y: startCoord[1] - bandWidth / 2 + textMargin + fontSize + barMargin,
    width: height,
    height: bandWidth - fontSize - textMargin - 2 * barMargin,
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
  });
  boxes.push(shape);
  params.context.boxes = boxes;

  if (!params.context.renderedStages) {
    params.context.renderedStages = [];
  }
  const renderedStages = params.context.renderedStages as boolean[];
  if (!renderedStages[stageIndex]) {
    // Each stage only render once as axis label
    children.push({
      type: 'text',
      style: {
        x: (params.coordSys as any).x + textMargin,
        y: startCoord[1] - bandWidth / 2 + textMargin + fontSize,
        fill: (params.itemPayload.axisLabelColor as string) || '#777',
        text: api.ordinalRawValue(2) as string,
        verticalAlign: 'bottom',
      },
    });
    renderedStages[stageIndex] = true;
  }

  // If is the last item, render envelope
  if (params.dataIndex === params.dataInsideLength - 1) {
    const envelope: Envelope = params.itemPayload.envelope || {};
    if (envelope.show !== false && boxes.length > 1) {
      const margin = echarts.zrUtil.retrieve2(envelope.margin as number, 5);

      // Sort boxes by x, then by y
      boxes.sort((a, b) => a.x - b.x || a.y - b.y);
      console.log(boxes);

      // Top-left of the first box
      const firstBox = boxes[0];
      const firstRadius =
        Math.min(firstBox.height, Math.min(firstBox.width, borderRadius * 2)) /
          2 +
        margin;
      let path: string = `M ${firstBox.x - margin} ${
        firstBox.y - margin + firstRadius
      }`;
      for (let i = 0; i < boxes.length - 1; i++) {
        const box = boxes[i];
        const innerRadius =
          Math.min(box.height, Math.min(box.width, borderRadius * 2)) / 2;
        const radius = innerRadius + margin;
        const nextBox = boxes[i + 1];

        // Go downside
        path += `L ${box.x - margin} ${box.y + box.height + margin - radius}`;
        path += `A ${radius} ${radius} 0 0 0 ${Math.min(
          box.x - margin + radius,
          nextBox.x - margin
        )} ${box.y + box.height + margin}`;

        if (nextBox.y + nextBox.height > box.y + box.height) {
          // Go right
          path += `L ${nextBox.x - margin - radius} ${
            box.y + box.height + margin
          }`;
          path += `A ${radius} ${radius} 0 0 1 ${nextBox.x - margin} ${
            box.y + box.height + margin + radius
          }`;
          // Go down to the bottom of the next box
          path += `L ${nextBox.x - margin} ${
            nextBox.y + nextBox.height + margin - radius
          }`;
          path += `A ${radius} ${radius} 0 0 0 ${nextBox.x - margin + radius} ${
            nextBox.y + nextBox.height + margin
          }`;
        } else {
          // Go right to the right of the current box
          path += `L ${box.x + box.width + margin - radius} ${
            box.y + box.height + margin
          }`;
          path += `A ${radius} ${radius} 0 0 0 ${box.x + box.width + margin} ${
            box.y + box.height + margin - radius
          }`;
          // Go up till the bottom of the next box
          path += `L ${box.x + box.width + margin} ${
            nextBox.y + nextBox.height + margin + radius
          }`;
          path += `A ${radius} ${radius} 0 0 1 ${
            box.x + box.width + margin + radius
          } ${nextBox.y + nextBox.height + margin}`;
        }
      }
      // Go right and up for the last box
      const lastBox = boxes[boxes.length - 1];
      const lastRadius =
        Math.min(lastBox.height, Math.min(lastBox.width, borderRadius * 2)) /
          2 +
        margin;
      path += `L ${lastBox.x + lastBox.width + margin - lastRadius} ${
        lastBox.y + lastBox.height + margin
      }`;
      path += `A ${lastRadius} ${lastRadius} 0 0 0 ${
        lastBox.x + lastBox.width + margin
      } ${lastBox.y + lastBox.height + margin - lastRadius}`;
      path += `L ${lastBox.x + lastBox.width + margin} ${
        lastBox.y - margin + lastRadius
      }`;
      path += `A ${lastRadius} ${lastRadius} 0 0 0 ${
        lastBox.x + lastBox.width + margin - lastRadius
      } ${lastBox.y - margin}`;

      // Then, there's a similar progress to close the path
      for (let i = boxes.length - 1; i > 0; i--) {
        const box = boxes[i];
        const innerRadius =
          Math.min(box.height, Math.min(box.width, borderRadius * 2)) / 2;
        const radius = innerRadius + margin;

        path += `L ${box.x + box.width + margin} ${box.y - margin}`;
        const prevBox = boxes[i - 1];
        if (prevBox.y < box.y) {
          // Go left
          path += `L ${prevBox.x + prevBox.width + margin + radius} ${
            box.y - margin
          }`;
          path += `A ${radius} ${radius} 0 0 1 ${
            prevBox.x + prevBox.width + margin
          } ${box.y - margin - radius}`;
          // Go up to the top of the prev box
          path += `L ${prevBox.x + prevBox.width + margin} ${
            prevBox.y - margin + radius
          }`;
          path += `A ${radius} ${radius} 0 0 0 ${
            prevBox.x + prevBox.width + margin - radius
          } ${prevBox.y - margin}`;
        } else {
          // Go left to the left of the current box
          path += `L ${box.x - margin + radius} ${box.y - margin}`;
          path += `A ${radius} ${radius} 0 0 0 ${box.x - margin} ${
            box.y - margin + radius
          }`;
          // Go down till the top of the prev box
          path += `L ${box.x - margin} ${prevBox.y - margin - radius}`;
          path += `A ${radius} ${radius} 0 0 1 ${box.x - margin - radius} ${
            prevBox.y - margin
          }`;
        }
      }
      path += `L ${firstBox.x - margin + firstRadius} ${firstBox.y - margin}`;
      path += `A ${firstRadius} ${firstRadius} 0 0 0 ${firstBox.x - margin} ${
        firstBox.y - margin + firstRadius
      }`;

      const envelopeEl = {
        type: 'path' as const,
        shape: {
          d: path,
        },
        style: {
          fill: 'blue',
          opacity: 0.3,
        },
        silent: true,
      };
      console.log(path);

      children.push(envelopeEl);

      console.log(children);
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
