import type { CustomElementOption } from 'echarts/types/src/chart/custom/CustomSeries.d.ts';

export type LiquidFillLabelFormatter =
  | string
  | ((params: { value: number; percent: number; index: number }) => string);

export interface LiquidFillLabelOption {
  show?: boolean;
  formatter?: LiquidFillLabelFormatter;
  position?: (number | string)[] | string;
  color?: string;
  insideColor?: string;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: string;
  fontStyle?: string;
  lineHeight?: number;
  align?: 'left' | 'center' | 'right';
  verticalAlign?: 'top' | 'middle' | 'bottom';
  rich?: Record<string, unknown>;
  backgroundColor?: string | Record<string, unknown>;
  borderColor?: string;
  borderWidth?: number;
  borderRadius?: number | number[];
  padding?: number | number[];
  shadowBlur?: number;
  shadowColor?: string;
  shadowOffsetX?: number;
  shadowOffsetY?: number;
}

interface CreateLabelParams {
  labelOption?: LiquidFillLabelOption;
  value: number;
  dataIndex: number;
  cx: number;
  cy: number;
  innerRadius: number;
  boundingLeft: number;
  boundingTop: number;
  boundingWidth: number;
  boundingHeight: number;
  wavePathData: string;
  waveInitialX: number;
  waveAnimation?: CustomElementOption['keyframeAnimation'];
  defaultColor: string;
}

export function createLabelGroup({
  labelOption,
  value,
  dataIndex,
  cx,
  cy,
  innerRadius,
  boundingLeft,
  boundingTop,
  boundingWidth,
  boundingHeight,
  wavePathData,
  waveInitialX,
  waveAnimation,
  defaultColor,
}: CreateLabelParams): CustomElementOption | undefined {
  if (!labelOption || labelOption.show === false) {
    return undefined;
  }

  const textContent = formatLabelText(labelOption.formatter, value, dataIndex);
  if (!textContent) {
    return undefined;
  }

  const position = resolvePosition(
    labelOption.position,
    cx,
    cy,
    innerRadius,
    boundingLeft,
    boundingTop,
    boundingWidth,
    boundingHeight
  );

  const baseStyle = buildBaseTextStyle(labelOption, position.x, position.y);
  const resolvedAlign = labelOption.align ?? position.align;
  const resolvedVerticalAlign =
    labelOption.verticalAlign ?? position.verticalAlign;
  baseStyle.align = resolvedAlign;
  baseStyle.textAlign = resolvedAlign;
  baseStyle.verticalAlign = resolvedVerticalAlign;
  baseStyle.textVerticalAlign = resolvedVerticalAlign;
  baseStyle.text = textContent;

  const outsideFill = labelOption.color || defaultColor;
  const insideFill = labelOption.insideColor || outsideFill;

  const outsideTextStyle = Object.assign({}, baseStyle, { fill: outsideFill });
  const insideTextStyle = Object.assign({}, baseStyle, { fill: insideFill });

  const outsideText: CustomElementOption = {
    type: 'text',
    silent: true,
    z2: 40,
    style: outsideTextStyle,
  };

  const insideText: CustomElementOption = {
    type: 'text',
    silent: true,
    z2: 41,
    style: insideTextStyle,
  };

  const waveClipPath: any = {
    type: 'path',
    shape: {
      pathData: wavePathData,
    },
    x: waveInitialX,
    clipPath: {
      type: 'circle',
      shape: {
        cx,
        cy,
        r: innerRadius,
      },
    },
  } as CustomElementOption;

  if (waveAnimation) {
    waveClipPath.keyframeAnimation = cloneAnimation(waveAnimation);
  }

  (insideText as any).clipPath = waveClipPath;

  return {
    type: 'group',
    silent: true,
    children: [outsideText, insideText],
  };
}

function formatLabelText(
  formatter: LiquidFillLabelFormatter | undefined,
  value: number,
  dataIndex: number
): string {
  const percent = isFinite(value) ? value * 100 : NaN;

  if (typeof formatter === 'function') {
    return formatter({ value, percent, index: dataIndex }) ?? '';
  }

  if (typeof formatter === 'string') {
    return formatter
      .replace('{value}', formatNumber(value))
      .replace('{percent}', formatNumber(percent));
  }

  if (isFinite(percent)) {
    return `${formatNumber(percent)}%`;
  }

  return formatNumber(value);
}

function buildBaseTextStyle(
  labelOption: LiquidFillLabelOption,
  x: number,
  y: number
) {
  return {
    x,
    y,
    fontSize: labelOption.fontSize,
    fontFamily: labelOption.fontFamily,
    fontWeight: labelOption.fontWeight,
    fontStyle: labelOption.fontStyle,
    lineHeight: labelOption.lineHeight,
    rich: labelOption.rich,
    backgroundColor: labelOption.backgroundColor,
    borderColor: labelOption.borderColor,
    borderWidth: labelOption.borderWidth,
    borderRadius: labelOption.borderRadius,
    padding: labelOption.padding,
    shadowBlur: labelOption.shadowBlur,
    shadowColor: labelOption.shadowColor,
    shadowOffsetX: labelOption.shadowOffsetX,
    shadowOffsetY: labelOption.shadowOffsetY,
  } as Record<string, unknown>;
}

function resolvePosition(
  position: LiquidFillLabelOption['position'],
  cx: number,
  cy: number,
  radius: number,
  left: number,
  top: number,
  width: number,
  height: number
) {
  console.log(cx, cy);
  if (Array.isArray(position)) {
    return {
      x: parseCoordinate(position[0], width, cx - left) + left,
      y: parseCoordinate(position[1], height, cy - top) + top,
      align: 'center' as const,
      verticalAlign: 'middle' as const,
    };
  }

  switch (position) {
    case 'left':
    case 'insideLeft':
      return {
        x: cx - radius * 0.6,
        y: cy,
        align: 'left' as const,
        verticalAlign: 'middle' as const,
      };
    case 'right':
    case 'insideRight':
      return {
        x: cx + radius * 0.6,
        y: cy,
        align: 'right' as const,
        verticalAlign: 'middle' as const,
      };
    case 'top':
    case 'insideTop':
      return {
        x: cx,
        y: cy - radius * 0.6,
        align: 'center' as const,
        verticalAlign: 'top' as const,
      };
    case 'bottom':
    case 'insideBottom':
      return {
        x: cx,
        y: cy + radius * 0.6,
        align: 'center' as const,
        verticalAlign: 'bottom' as const,
      };
    default:
      return {
        x: cx,
        y: cy,
        align: 'center' as const,
        verticalAlign: 'middle' as const,
      };
  }
}

function parseCoordinate(
  value: string | number | undefined,
  size: number,
  fallback: number
) {
  if (typeof value === 'number' && isFinite(value)) {
    return value;
  }
  if (typeof value === 'string') {
    const percent = parsePercent(value);
    if (percent != null) {
      return percent * size;
    }
    const numeric = Number(value);
    if (!Number.isNaN(numeric)) {
      return numeric;
    }
  }
  return fallback;
}

function parsePercent(value: string): number | null {
  const match = value.match(/^(-?\d+(?:\.\d+)?)%$/);
  if (!match) {
    return null;
  }
  return parseFloat(match[1]) / 100;
}

function formatNumber(num: number): string {
  if (!isFinite(num)) {
    return '';
  }
  const abs = Math.abs(num);
  if (abs === 0 || abs >= 1) {
    return Math.round(num).toString();
  }
  return num.toFixed(2);
}

function cloneAnimation(
  animation: CustomElementOption['keyframeAnimation']
): CustomElementOption['keyframeAnimation'] {
  if (!animation) {
    return animation;
  }
  if (Array.isArray(animation)) {
    return animation.map((item) => cloneAnimation(item)) as typeof animation;
  }

  const cloned: Record<string, unknown> = {};
  for (const key in animation) {
    if (Object.prototype.hasOwnProperty.call(animation, key)) {
      (cloned as any)[key] = (animation as any)[key];
    }
  }

  if (Array.isArray(animation.keyframes)) {
    cloned.keyframes = animation.keyframes.map((frame) => {
      const frameCopy: Record<string, unknown> = {};
      for (const key in frame) {
        if (Object.prototype.hasOwnProperty.call(frame, key)) {
          frameCopy[key] = (frame as Record<string, unknown>)[key];
        }
      }
      return frameCopy;
    });
  }

  return cloned as CustomElementOption['keyframeAnimation'];
}
