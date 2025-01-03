import React, { useMemo, useCallback } from "react";
import { AreaClosed, Line, Bar } from "@visx/shape";
import { GridRows, GridColumns } from "@visx/grid";
import { scaleLinear, scaleUtc } from "@visx/scale";
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
import { useQuery } from "@tanstack/react-query";
import { http } from "../../axios";
import styles from "./spot.module.css";
import { AxisBottom, AxisLeft } from "@visx/axis";
import { Group } from "@visx/group";

export interface Price {
  price: number;
  startDate: string;
  endDate: string;
}

export interface SpotData {
  prices: Price[];
}

export const background = "#161616";
export const background2 = "#161616";
export const accentColor = "#78a9ff";
export const accentColorDark = "#be95ff";
const tooltipStyles = {
  ...defaultStyles,
  background,
  border: "1px solid white",
  color: "white",
};

// util
const formatDate = timeFormat("%b %d, '%y %H:%M");

// accessors
const getDate = (d: Price) => new Date(d.startDate);
const getPriceValue = (d: Price) => d.price;
const bisectDate = bisector<Price, Date>((d) => new Date(d.startDate)).left;

export type AreaProps = {
  width: number;
  height: number;
  margin?: { top: number; right: number; bottom: number; left: number };
};

const tickLabelProps = {
  fill: "white",
  fontSize: 12,
  fontFamily: "sans-serif",
  textAnchor: "middle",
} as const;

export const SpotComponent = withTooltip<AreaProps, Price>(
  ({
    width,
    height,
    margin = { top: 0, right: 0, bottom: 30, left: 20 },
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

    const prices = useMemo(
      () =>
        data?.prices.sort(
          (a, b) =>
            new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
        ) || [],
      [data],
    );

    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const dateScale = useMemo(
      () =>
        scaleUtc({
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

    // tooltip handler
    const handleTooltip = useCallback(
      (
        event:
          | React.TouchEvent<SVGRectElement>
          | React.MouseEvent<SVGRectElement>,
      ) => {
        const { x } = localPoint(event) || { x: 0 };
        const x0 = dateScale.invert(x - margin.left);

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
      [showTooltip, priceScale, dateScale, prices, margin.left],
    );
    if (isLoading) return <p>Loading...</p>;
    if (isError) return <p>Error fetching data</p>;
    if (!data) return null;

    return (
      <div className={styles.chart}>
        <h2 className={styles.title}>Spot Prices</h2>
        <svg width={width + margin.left} height={height + margin.bottom}>
          <rect
            x={0}
            y={0}
            width={width + margin.left}
            height={height + margin.bottom}
            fill="url(#area-background-gradient)"
          />
          <Group left={margin.left} top={margin.bottom}>
            <LinearGradient
              id="area-background-gradient"
              from={background2}
              to={background}
            />
            <LinearGradient
              id="area-gradient"
              from={accentColor}
              to={accentColor}
              toOpacity={0.4}
            />
            <GridRows
              left={margin.left}
              scale={priceScale}
              width={innerWidth}
              strokeDasharray="1,3"
              stroke={accentColor}
              strokeOpacity={0.2}
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
            />
            <Bar
              x={margin.left}
              y={margin.top}
              width={innerWidth}
              height={innerHeight}
              fill="transparent"
              onTouchStart={handleTooltip}
              onTouchMove={handleTooltip}
              onMouseMove={handleTooltip}
              onMouseLeave={() => hideTooltip()}
            />
            <AxisBottom
              scale={dateScale}
              top={innerHeight}
              numTicks={8}
              tickStroke={"white"}
              tickFormat={(date) => timeFormat("%b %d %H:%M")(date as Date)}
              tickLabelProps={tickLabelProps}
              labelProps={{
                x: width + 30,
                y: -10,
                fill: "white",
                fontSize: 18,
                strokeWidth: 0,
                stroke: "#fff",
                paintOrder: "stroke",
                fontFamily: "sans-serif",
                textAnchor: "start",
              }}
            />
            <AxisLeft
              scale={priceScale}
              tickStroke={"white"}
              tickLabelProps={tickLabelProps}
              hideZero
              numTicks={4}
              hideAxisLine
              left={margin.left - 5}
              labelProps={{
                fill: "white",
                fontSize: 18,
                strokeWidth: 0,
                stroke: "#fff",
                paintOrder: "stroke",
                fontFamily: "sans-serif",
                textAnchor: "start",
              }}
            />
            {tooltipData && (
              <g>
                <Line
                  from={{ x: tooltipLeft - margin.left, y: margin.top }}
                  to={{
                    x: tooltipLeft - margin.left,
                    y: innerHeight + margin.top,
                  }}
                  stroke={accentColorDark}
                  strokeWidth={2}
                  pointerEvents="none"
                  strokeDasharray="5,2"
                />
                <Line
                  from={{ x: 0, y: tooltipTop }}
                  to={{
                    x: innerWidth + margin.left,
                    y: tooltipTop,
                  }}
                  stroke={accentColorDark}
                  strokeWidth={2}
                  pointerEvents="none"
                  strokeDasharray="5,2"
                />
                <circle
                  cx={tooltipLeft - margin.left}
                  cy={tooltipTop + 1}
                  r={4}
                  fill="black"
                  fillOpacity={0.1}
                  stroke="black"
                  strokeOpacity={0.1}
                  strokeWidth={2}
                  pointerEvents="none"
                />
                <circle
                  cx={tooltipLeft - margin.left}
                  cy={tooltipTop}
                  r={4}
                  fill={accentColorDark}
                  stroke="white"
                  strokeWidth={2}
                  pointerEvents="none"
                />
              </g>
            )}
          </Group>
        </svg>
        {tooltipData && (
          <div>
            <TooltipWithBounds
              key={Math.random()}
              top={tooltipTop - 12}
              left={tooltipLeft + 12}
              style={tooltipStyles}
            >
              {`${getPriceValue(tooltipData)}c/kWh`}
            </TooltipWithBounds>
            <Tooltip
              top={innerHeight + margin.bottom}
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