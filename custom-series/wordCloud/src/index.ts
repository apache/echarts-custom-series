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
import { number } from 'echarts';
import WordCloud from './layout';

type WordCloudItemPayload = {
  left?: number | string;
  top?: number | string;
  right?: number | string;
  bottom?: number | string;
  width?: number | string;
  height?: number | string;
  gridSize?: number;
  sizeRange?: [number, number];
  rotationRange?: [number, number];
  rotationStep?: number;
  maskImage?: HTMLImageElement | HTMLCanvasElement;
  keepAspect?: boolean;
  shape?: string;
  shrinkToFit?: boolean;
  drawOutOfBound?: boolean;
};

interface LayoutResult {
  x: number;
  y: number;
  fontSize: number;
  rotation: number;
  scaleX: number;
  scaleY: number;
  textX: number;
  textY: number;
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

  const layout = context.layoutResults[params.dataIndexInside];
  if (!layout) {
    return null;
  }

  const style = api.style() as any;

  return {
    type: 'text',
    x: layout.x,
    y: layout.y,
    rotation: layout.rotation,
    scaleX: layout.scaleX,
    scaleY: layout.scaleY,
    style: {
      text: api.value(0) as string,
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
  } as CustomRootElementOption;
};

function updateCanvasMask(maskCanvas: HTMLCanvasElement) {
  var ctx = maskCanvas.getContext('2d')!;
  var imageData = ctx.getImageData(0, 0, maskCanvas.width, maskCanvas.height);
  var newImageData = ctx.createImageData(imageData);

  var toneSum = 0;
  var toneCnt = 0;
  for (var i = 0; i < imageData.data.length; i += 4) {
    var alpha = imageData.data[i + 3];
    if (alpha > 128) {
      var tone =
        imageData.data[i] + imageData.data[i + 1] + imageData.data[i + 2];
      toneSum += tone;
      ++toneCnt;
    }
  }
  var threshold = toneSum / toneCnt;

  for (var i = 0; i < imageData.data.length; i += 4) {
    var tone =
      imageData.data[i] + imageData.data[i + 1] + imageData.data[i + 2];
    var alpha = imageData.data[i + 3];

    if (alpha < 128 || tone > threshold) {
      // Area not to draw
      newImageData.data[i] = 0;
      newImageData.data[i + 1] = 0;
      newImageData.data[i + 2] = 0;
      newImageData.data[i + 3] = 0;
    } else {
      // Area to draw
      // The color must be same with backgroundColor
      newImageData.data[i] = 255;
      newImageData.data[i + 1] = 255;
      newImageData.data[i + 2] = 255;
      newImageData.data[i + 3] = 255;
    }
  }

  ctx.putImageData(newImageData, 0, 0);
}

function adjustRectAspect(gridRect: any, aspect: number) {
  var width = gridRect.width;
  var height = gridRect.height;
  if (width > height * aspect) {
    gridRect.x += (width - height * aspect) / 2;
    gridRect.width = height * aspect;
  } else {
    gridRect.y += (height - width / aspect) / 2;
    gridRect.height = width / aspect;
  }
}

function performLayout(
  params: CustomSeriesRenderItemParams,
  api: CustomSeriesRenderItemAPI,
  payload: WordCloudItemPayload
): (LayoutResult | null)[] {
  const width = api.getWidth();
  const height = api.getHeight();

  const left = number.parsePercent(payload.left || 0, width);
  const right = number.parsePercent(payload.right || 0, width);
  const top = number.parsePercent(payload.top || 0, height);
  const bottom = number.parsePercent(payload.bottom || 0, height);

  const boxWidth = width - left - right;
  const boxHeight = height - top - bottom;

  if (boxWidth <= 0 || boxHeight <= 0) {
    return [];
  }

  const gridRect = {
    x: left,
    y: top,
    width: boxWidth,
    height: boxHeight,
  };

  const keepAspect = payload.keepAspect;
  const maskImage = payload.maskImage;
  if (keepAspect && maskImage) {
    const ratio = maskImage.width / maskImage.height;
    adjustRectAspect(gridRect, ratio);
  }

  const canvas = document.createElement('canvas');
  canvas.width = gridRect.width;
  canvas.height = gridRect.height;

  if (maskImage) {
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(maskImage, 0, 0, canvas.width, canvas.height);
    updateCanvasMask(canvas);
  }

  const gridSize = Math.max(Math.floor(payload.gridSize || 8), 4);
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

  if (data.length === 0) {
    return [];
  }

  const values = data.map((d) => d.value);
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);

  const list = data
    .map((item) => {
      const fontSize =
        maxVal === minVal
          ? sizeRange[0]
          : ((item.value - minVal) / (maxVal - minVal)) *
              (sizeRange[1] - sizeRange[0]) +
            sizeRange[0];
      return [item.name, fontSize, item.index];
    })
    .sort((a, b) => (b[1] as number) - (a[1] as number));

  const results: (LayoutResult | null)[] = new Array(count).fill(null);

  const onWordCloudDrawn = (e: any) => {
    const item = e.detail.item;
    if (e.detail.drawn) {
      const drawn = e.detail.drawn;
      const info = drawn.info;
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

  const style = api.style() as any;
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
    abort: () => {},
  });

  return results;
}

export default {
  install(registers: EChartsExtensionInstallRegisters) {
    registers.registerCustomSeries(
      'wordCloud',
      renderItem as unknown as CustomSeriesRenderItem
    );
  },
} as EChartsExtension;
