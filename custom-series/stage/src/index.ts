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
    const allColors: string[] = [];
    for (let i = 0; i < params.dataInsideLength; i++) {
      allColors.push(api.visual('color', i) as string);
    }

    const envelope: Envelope = params.itemPayload.envelope || {};
    if (envelope.show !== false && boxes.length > 1) {
      const margin = echarts.zrUtil.retrieve2(envelope.margin as number, 5);

      // Sort boxes by x, then by y
      boxes.sort((a, b) => a.x - b.x || a.y - b.y);
      console.log(boxes);

      const canvas = document.createElement('canvas');
      const coordSys = params.coordSys as any;
      const dpr = window.devicePixelRatio || 1;
      const canvasWidth = coordSys.width * dpr;
      const canvasHeight = coordSys.height * dpr;
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;

      const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

      if (allColors.length > 0 && !envelope.color) {
        const gradient = ctx.createLinearGradient(0, 0, 0, canvasHeight);
        for (let i = 0; i < allColors.length; i++) {
          gradient.addColorStop(i / (allColors.length - 1), allColors[i]);
        }
        ctx.fillStyle = gradient;
      } else {
        ctx.fillStyle = envelope.color || '#888';
      }

      for (let i = 0; i < boxes.length; i++) {
        const box = boxes[i];

        ctx.fillStyle = '#888';
        drawRoundedRect(
          ctx,
          (box.x - margin - coordSys.x) * dpr,
          (box.y - margin - coordSys.y) * dpr,
          (box.width + margin * 2) * dpr,
          (box.height + margin * 2) * dpr,
          (Math.min(borderRadius, box.width / 2) + margin) * dpr
        );

        if (i > 0) {
          const prevBox = boxes[i - 1];
          const isPrevLower = prevBox.y > box.y + box.height;
          const height = isPrevLower
            ? prevBox.y - box.y - box.height + borderRadius * 2
            : box.y - prevBox.y - prevBox.height + borderRadius * 2;
          const y = isPrevLower
            ? box.y + box.height - borderRadius
            : prevBox.y + prevBox.height - borderRadius;

          // Draw outer border-radius
          ctx.beginPath();
          if (isPrevLower) {
            ctx.fillStyle = '#f00';
            if (box.x - margin - prevBox.x > 0) {
              const right = Math.ceil((box.x - margin - coordSys.x) * dpr);
              const bottom = (prevBox.y - margin - coordSys.y) * dpr;
              const r =
                Math.min(
                  (box.x - margin - prevBox.x) / 2,
                  margin + borderRadius
                ) * dpr;
              ctx.moveTo(right, bottom + r);
              ctx.arc(right - r, bottom - r, r, 0, Math.PI / 2);
              ctx.lineTo(right, bottom + margin * dpr);
              ctx.lineTo(right, bottom - r);
            }

            if (box.x + box.width - prevBox.x - prevBox.width - margin > 0) {
              const top = (box.y + box.height + margin - coordSys.y) * dpr;
              const left = Math.floor(
                (prevBox.x + prevBox.width + margin - coordSys.x) * dpr
              );
              const r =
                Math.min(
                  (box.x + box.width - prevBox.x - prevBox.width - margin) / 2,
                  margin + borderRadius
                ) * dpr;
              ctx.moveTo(left, top + r);
              ctx.arc(left + r, top + r, r, Math.PI, Math.PI * 1.5);
              ctx.lineTo(left, top - margin * dpr);
              ctx.lineTo(left, top);
            }
          } else {
            ctx.fillStyle = '#0f0';
            if (box.x - margin - prevBox.x > 0) {
              const right = Math.ceil((box.x - margin - coordSys.x) * dpr);
              const top =
                (prevBox.y + prevBox.height + margin - coordSys.y) * dpr;
              const r =
                Math.min(
                  (box.x - margin - prevBox.x) / 2,
                  margin + borderRadius
                ) * dpr;
              ctx.moveTo(right, top + r);
              ctx.arc(right - r, top + r, r, -Math.PI / 2, 0);
              ctx.lineTo(right, top - margin * dpr);
              ctx.lineTo(right - r, top);
            }

            if (box.x + box.width - prevBox.x - prevBox.width - margin > 0) {
              const bottom = (box.y - margin - coordSys.y) * dpr;
              const left = Math.floor(
                (prevBox.x + prevBox.width + margin - coordSys.x) * dpr
              );
              const r =
                Math.min(
                  (box.x + box.width - prevBox.x - prevBox.width - margin) / 2,
                  margin + borderRadius
                ) * dpr;
              ctx.moveTo(left + r, bottom);
              ctx.arc(left + r, bottom - r, r, Math.PI / 2, Math.PI);
              ctx.lineTo(left, bottom + margin * dpr);
              ctx.lineTo(left, bottom);
            }
          }
          ctx.closePath();
          ctx.fill();

          // Draw bars between boxes
          ctx.fillRect(
            (prevBox.x + prevBox.width + margin - coordSys.x) * dpr,
            (y - coordSys.y) * dpr,
            (box.x - prevBox.x - prevBox.width - margin * 2) * dpr,
            height * dpr
          );
        }
      }

      children.push({
        type: 'image',
        style: {
          image: canvas,
          x: coordSys.x,
          y: coordSys.y,
          opacity: 0.5,
        },
      });
    }
  }

  return {
    type: 'group',
    children,
  } as CustomRootElementOption;
};

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y); // Move to the top-left corner
  ctx.lineTo(x + width - radius, y); // Top edge
  ctx.arc(x + width - radius, y + radius, radius, -Math.PI / 2, 0, false); // Top-right corner
  ctx.lineTo(x + width, y + height - radius); // Right edge
  ctx.arc(
    x + width - radius,
    y + height - radius,
    radius,
    0,
    Math.PI / 2,
    false
  ); // Bottom-right corner
  ctx.lineTo(x + radius, y + height); // Bottom edge
  ctx.arc(x + radius, y + height - radius, radius, Math.PI / 2, Math.PI, false); // Bottom-left corner
  ctx.lineTo(x, y + radius); // Left edge
  ctx.arc(x + radius, y + radius, radius, Math.PI, Math.PI * 1.5, false); // Top-left corner
  ctx.closePath();
  ctx.fill();
}

export default {
  install(registers: EChartsExtensionInstallRegisters) {
    registers.registerCustomSeries(
      'stage',
      renderItem as unknown as CustomSeriesRenderItem
    );
  },
};
