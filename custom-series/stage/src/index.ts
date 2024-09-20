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
    if (envelope.show !== false) {
      const margin = echarts.zrUtil.retrieve2(envelope.margin as number, 5);
      // Sort boxes by x, then by y
      boxes.sort((a, b) => a.x - b.x || a.y - b.y);
      console.log(boxes);
      // Render envelope so that the stage chart looks exactly like
      // the Apple Health sleep chart

      const paths: CustomElementOption[] = [];
      for (let i = 0; i < boxes.length; i++) {
        // Expand by margin
        const box = boxes[i];
        paths.push({
          type: 'rect',
          shape: {
            x: box.x - margin,
            y: box.y - margin,
            width: box.width + 2 * margin,
            height: box.height + 2 * margin,
            // r: borderRadius + margin,
          },
          style: {
            fill: 'red',
            opacity: 0.2,
          },
          z2: -1,
        });

        if (i > 0) {
          const prev = boxes[i - 1];
          const current = boxes[i];
          paths.push({
            type: 'rect',
            shape: {
              x: prev.x + prev.width + margin,
              y: prev.y - margin,
              width: current.x - prev.x - prev.width - margin * 2,
              height: current.y + current.height + margin - (prev.y - margin),
            },
            style: {
              fill: 'blue',
              opacity: 0.2,
            },
            z2: -1,
          });
        }
      }

      children.push({
        type: 'group',
        children: paths,
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
