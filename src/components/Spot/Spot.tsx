import React, { useMemo, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { http } from "../../axios";
import { AreaClosed, Bar } from "@visx/shape";
import { curveMonotoneX } from "@visx/curve";
import { GridRows, GridColumns } from "@visx/grid";
import { scaleTime, scaleLinear } from "@visx/scale";
import {
  withTooltip,
  Tooltip,
  TooltipWithBounds,
  defaultStyles,
} from "@visx/tooltip";
import { WithTooltipProvidedProps } from "@visx/tooltip/lib/enhancers/withTooltip";
import { localPoint } from "@visx/event";
import { LinearGradient } from "@visx/gradient";
import { max, extent, bisector } from "@visx/vendor/d3-array";
import { timeFormat } from "@visx/vendor/d3-time-format";

export interface Price {
  price: number;
  startDate: string;
  endDate: string;
}

export interface SpotData {
  prices: Price[];
}

const background = "#3b6978";
const background2 = "#204051";
const accentColor = "#edffea";
// const accentColorDark = "#75daad";
const tooltipStyles = {
  ...defaultStyles,
  background,
  border: "1px solid white",
  color: "white",
};

const formatDate = timeFormat("%b %d, %Y");
const getDate = (d: Price) => new Date(d.startDate);
const getPriceValue = (d: Price) => d.price;
const bisectDate = bisector<Price, Date>((d) => new Date(d.startDate)).left;

export type AreaProps = {
  width: number;
  height: number;
  margin?: { top: number; right: number; bottom: number; left: number };
};

export const SpotComponent = withTooltip<AreaProps, Price>(
  ({
    width,
    height,
    margin = { top: 0, right: 0, bottom: 0, left: 0 },
    showTooltip,
    hideTooltip,
    tooltipData,
    tooltipTop = 0,
    tooltipLeft = 0,
  }: AreaProps & WithTooltipProvidedProps<Price>) => {
    const { data, isLoading, isError } = useQuery<SpotData>({
      queryKey: ["spot"],
      queryFn: () => http.get("/spot").then((res) => res.data),
    });

    const prices = useMemo(() => data?.prices || [], [data]);

    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const dateScale = useMemo(
      () =>
        scaleTime({
          range: [margin.left, innerWidth + margin.left],
          domain: extent(prices, getDate) as [Date, Date],
        }),
      [innerWidth, margin.left, prices],
    );

    const priceScale = useMemo(
      () =>
        scaleLinear({
          range: [innerHeight + margin.top, margin.top],
          domain: [0, (max(prices, getPriceValue) || 0) + innerHeight / 3],
          nice: true,
        }),
      [margin.top, innerHeight, prices],
    );

    const handleTooltip = useCallback(
      (
        event:
          | React.TouchEvent<SVGRectElement>
          | React.MouseEvent<SVGRectElement>,
      ) => {
        const { x } = localPoint(event) || { x: 0 };
        const x0 = dateScale.invert(x);
        const index = bisectDate(prices, x0, 1);
        const d0 = prices[index - 1];
        const d1 = prices[index];
        let d = d0;
        if (d1 && getDate(d1)) {
          d =
            x0.valueOf() - getDate(d0).valueOf() >
            getDate(d1).valueOf() - x0.valueOf()
              ? d1
              : d0;
        }
        showTooltip({
          tooltipData: d,
          tooltipLeft: x,
          tooltipTop: priceScale(getPriceValue(d)),
        });
      },
      [showTooltip, priceScale, dateScale, prices],
    );

    if (isLoading) return <p>Loading...</p>;
    if (isError) return <p>Error fetching data</p>;
    if (!data) return null;

    return (
      <div>
        <svg width={width} height={height}>
          <rect
            x={0}
            y={0}
            width={width}
            height={height}
            fill="url(#area-background-gradient)"
            rx={14}
          />
          <LinearGradient
            id="area-background-gradient"
            from={background}
            to={background2}
          />
          <LinearGradient
            id="area-gradient"
            from={accentColor}
            to={accentColor}
            toOpacity={0.1}
          />
          <GridRows
            left={margin.left}
            scale={priceScale}
            width={innerWidth}
            strokeDasharray="1,3"
            stroke={accentColor}
            strokeOpacity={0}
            pointerEvents="none"
          />
          <GridColumns
            top={margin.top}
            scale={dateScale}
            height={innerHeight}
            strokeDasharray="1,3"
            stroke={accentColor}
            strokeOpacity={0.2}
            pointerEvents="none"
          />
          <AreaClosed<Price>
            data={prices}
            x={(d) => dateScale(getDate(d)) ?? 0}
            y={(d) => priceScale(getPriceValue(d)) ?? 0}
            yScale={priceScale}
            strokeWidth={1}
            stroke="url(#area-gradient)"
            fill="url(#area-gradient)"
            curve={curveMonotoneX}
          />
          <Bar
            x={margin.left}
            y={margin.top}
            width={innerWidth}
            height={innerHeight}
            fill="transparent"
            rx={14}
            onTouchStart={handleTooltip}
            onTouchMove={handleTooltip}
            onMouseMove={handleTooltip}
            onMouseLeave={() => hideTooltip()}
          />
        </svg>
        {tooltipData && (
          <div>
            <TooltipWithBounds
              top={tooltipTop - 12}
              left={tooltipLeft + 12}
              style={tooltipStyles}
            >
              {`$${getPriceValue(tooltipData)}`}
            </TooltipWithBounds>
            <Tooltip
              top={innerHeight + margin.top - 14}
              left={tooltipLeft}
              style={{
                ...defaultStyles,
                minWidth: 72,
                textAlign: "center",
                transform: "translateX(-50%)",
              }}
            >
              {formatDate(getDate(tooltipData))}
            </Tooltip>
          </div>
        )}
      </div>
    );
  },
);
