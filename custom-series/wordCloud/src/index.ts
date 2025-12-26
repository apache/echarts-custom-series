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

import type {
  CustomRootElementOption,
  CustomSeriesRenderItem,
  CustomSeriesRenderItemParams,
  CustomSeriesRenderItemAPI,
} from 'echarts/types/src/chart/custom/CustomSeries.d.ts';
import type {
  EChartsExtensionInstallRegisters,
  EChartsExtension,
} from 'echarts/types/src/extension.d.ts';

type WordCloudItemPayload = {
  gridSize?: number;
  sizeRange?: [number, number];
  rotationRange?: [number, number];
  rotationStep?: number;
  maskImage?: HTMLImageElement | HTMLCanvasElement;
  keepAspect?: boolean;
};

interface LayoutResult {
  x: number;
  y: number;
  fontSize: number;
  rotation: number;
}

const renderItem = (
  params: CustomSeriesRenderItemParams,
  api: CustomSeriesRenderItemAPI
) => {
  const context = params.context as any;
  const itemPayload = params.itemPayload as WordCloudItemPayload;

  if (!context.layoutResults) {
    context.layoutResults = performLayout(params, api, itemPayload);
  }

  const layout = context.layoutResults[params.dataIndex];
  if (!layout) {
    return;
  }

  return {
    type: 'text',
    x: layout.x,
    y: layout.y,
    rotation: layout.rotation,
    style: {
      text: api.value(0) as string,
      fontSize: layout.fontSize,
      fill: api.visual('color'),
      align: 'center',
      verticalAlign: 'middle',
    },
  } as CustomRootElementOption;
};

function performLayout(
  params: CustomSeriesRenderItemParams,
  api: CustomSeriesRenderItemAPI,
  payload: WordCloudItemPayload
): (LayoutResult | null)[] {
  let width = api.getWidth();
  let height = api.getHeight();
  let offsetX = 0;
  let offsetY = 0;

  if (payload.keepAspect && payload.maskImage) {
    const maskRatio = payload.maskImage.width / payload.maskImage.height;
    const canvasRatio = width / height;
    if (canvasRatio > maskRatio) {
      const newWidth = height * maskRatio;
      offsetX = (width - newWidth) / 2;
      width = newWidth;
    } else {
      const newHeight = width / maskRatio;
      offsetY = (height - newHeight) / 2;
      height = newHeight;
    }
  }

  const gridSize = payload.gridSize || 8;
  const sizeRange = payload.sizeRange || [12, 60];
  const rotationRange = payload.rotationRange || [-90, 90];
  const rotationStep = (payload.rotationStep || 45) * (Math.PI / 180);

  const count = params.dataInsideLength;
  const data = [];
  for (let i = 0; i < count; i++) {
    data.push({
      name: api.value(0, i) as string,
      value: api.value(1, i) as number,
      index: i,
    });
  }

  data.sort((a, b) => b.value - a.value);

  const values = data.map((d) => d.value);
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);

  const gridWidth = Math.ceil(width / gridSize);
  const gridHeight = Math.ceil(height / gridSize);
  const grid = new Uint8Array(gridWidth * gridHeight);

  if (payload.maskImage) {
    const maskCanvas = document.createElement('canvas');
    maskCanvas.width = width;
    maskCanvas.height = height;
    const maskCtx = maskCanvas.getContext('2d')!;
    maskCtx.drawImage(payload.maskImage, 0, 0, width, height);
    const imageData = maskCtx.getImageData(0, 0, width, height).data;

    for (let gy = 0; gy < gridHeight; gy++) {
      for (let gx = 0; gx < gridWidth; gx++) {
        const x = Math.min(Math.floor(gx * gridSize + gridSize / 2), width - 1);
        const y = Math.min(Math.floor(gy * gridSize + gridSize / 2), height - 1);
        const idx = (y * width + x) * 4;
        const alpha = imageData[idx + 3];
        const r = imageData[idx];
        const g = imageData[idx + 1];
        const b = imageData[idx + 2];
        // If it's transparent or too bright, mark as occupied (don't draw)
        if (alpha < 128 || (r + g + b) / 3 > 128) {
          grid[gy * gridWidth + gx] = 1;
        }
      }
    }
  }

  const results: (LayoutResult | null)[] = new Array(count).fill(null);

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;

  data.forEach((item) => {
    const fontSize =
      maxVal === minVal
        ? sizeRange[0]
        : ((item.value - minVal) / (maxVal - minVal)) *
            (sizeRange[1] - sizeRange[0]) +
          sizeRange[0];

    ctx.font = `${fontSize}px sans-serif`;
    const metrics = ctx.measureText(item.name);
    const textWidth = metrics.width;
    const textHeight = fontSize;

    const rotations = [];
    for (
      let r = rotationRange[0] * (Math.PI / 180);
      r <= rotationRange[1] * (Math.PI / 180);
      r += rotationStep
    ) {
      rotations.push(r);
    }
    const rotation = rotations[Math.floor(Math.random() * rotations.length)];

    const cos = Math.abs(Math.cos(rotation));
    const sin = Math.abs(Math.sin(rotation));
    const bWidth = textWidth * cos + textHeight * sin;
    const bHeight = textWidth * sin + textHeight * cos;

    const gw = Math.ceil(bWidth / gridSize);
    const gh = Math.ceil(bHeight / gridSize);

    let placed = false;
    const maxRadius = Math.max(gridWidth, gridHeight);

    for (let r = 0; r < maxRadius; r += 1) {
      const steps = 8 * r || 1;
      for (let s = 0; s < steps; s++) {
        const theta = (s / steps) * 2 * Math.PI;
        const gx = Math.floor(gridWidth / 2 + r * Math.cos(theta) - gw / 2);
        const gy = Math.floor(gridHeight / 2 + r * Math.sin(theta) - gh / 2);

        if (
          gx >= 0 &&
          gx + gw <= gridWidth &&
          gy >= 0 &&
          gy + gh <= gridHeight
        ) {
          if (!checkCollision(grid, gx, gy, gw, gh, gridWidth)) {
            markGrid(grid, gx, gy, gw, gh, gridWidth);
            results[item.index] = {
              x: offsetX + (gx + gw / 2) * gridSize,
              y: offsetY + (gy + gh / 2) * gridSize,
              fontSize,
              rotation: -rotation,
            };
            placed = true;
            break;
          }
        }
      }
      if (placed) break;
    }
  });

  return results;
}

function checkCollision(
  grid: Uint8Array,
  gx: number,
  gy: number,
  gw: number,
  gh: number,
  gridWidth: number
): boolean {
  for (let y = gy; y < gy + gh; y++) {
    for (let x = gx; x < gx + gw; x++) {
      if (grid[y * gridWidth + x]) {
        return true;
      }
    }
  }
  return false;
}

function markGrid(
  grid: Uint8Array,
  gx: number,
  gy: number,
  gw: number,
  gh: number,
  gridWidth: number
) {
  for (let y = gy; y < gy + gh; y++) {
    for (let x = gx; x < gx + gw; x++) {
      grid[y * gridWidth + x] = 1;
    }
  }
}

export default {
  install(registers: EChartsExtensionInstallRegisters) {
    registers.registerCustomSeries(
      'wordCloud',
      renderItem as unknown as CustomSeriesRenderItem
    );
  },
} as EChartsExtension;
