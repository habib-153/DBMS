"use client";
import React from "react";
import { Group } from "@visx/group";
import { Bar } from "@visx/shape";
import { scaleLinear, scaleBand } from "@visx/scale";
import { AxisBottom, AxisLeft } from "@visx/axis";
import { GridRows } from "@visx/grid";
import { useTooltip, useTooltipInPortal, defaultStyles } from "@visx/tooltip";
import { localPoint } from "@visx/event";
import { Pie } from "@visx/shape";
import { Text } from "@visx/text";

// Tooltip styles
const tooltipStyles = {
  ...defaultStyles,
  background: "rgba(0,0,0,0.9)",
  color: "white",
  padding: "12px",
  borderRadius: "8px",
  fontSize: "14px",
};

// Enhanced Bar Chart Component
interface BarChartData {
  label: string;
  value: number;
  color?: string;
}

interface EnhancedBarChartProps {
  data: BarChartData[];
  width: number;
  height: number;
  title?: string;
}

export const EnhancedBarChart: React.FC<EnhancedBarChartProps> = ({
  data,
  width,
  height,
  title,
}) => {
  const {
    tooltipOpen,
    tooltipLeft,
    tooltipTop,
    tooltipData,
    hideTooltip,
    showTooltip,
  } = useTooltip<BarChartData>();

  const { containerRef, TooltipInPortal } = useTooltipInPortal({
    scroll: true,
  });

  const margin = { top: 40, right: 30, bottom: 60, left: 60 };
  const xMax = width - margin.left - margin.right;
  const yMax = height - margin.top - margin.bottom;

  const xScale = scaleBand<string>({
    range: [0, xMax],
    domain: data.map((d) => d.label),
    padding: 0.3,
  });

  const yScale = scaleLinear<number>({
    range: [yMax, 0],
    domain: [0, Math.max(...data.map((d) => d.value)) * 1.1],
    nice: true,
  });

  return (
    <div style={{ position: "relative" }}>
      <svg ref={containerRef} height={height} width={width}>
        <Group left={margin.left} top={margin.top}>
          <GridRows
            scale={yScale}
            stroke="rgba(255,255,255,0.1)"
            strokeDasharray="2,2"
            width={xMax}
          />
          {data.map((d, i) => {
            const barWidth = xScale.bandwidth();
            const barHeight = yMax - (yScale(d.value) ?? 0);
            const barX = xScale(d.label);
            const barY = yMax - barHeight;

            return (
              <Bar
                key={`bar-${i}`}
                fill={d.color || "#FF8042"}
                height={barHeight}
                opacity={tooltipData === d ? 0.8 : 1}
                style={{
                  cursor: "pointer",
                  transition: "opacity 0.2s",
                }}
                width={barWidth}
                x={barX}
                y={barY}
                onMouseLeave={() => hideTooltip()}
                onMouseMove={(event) => {
                  const coords = localPoint(event);

                  showTooltip({
                    tooltipData: d,
                    tooltipLeft: coords?.x,
                    tooltipTop: coords?.y,
                  });
                }}
              />
            );
          })}
          <AxisBottom
            scale={xScale}
            stroke="rgba(255,255,255,0.3)"
            tickLabelProps={() => ({
              fill: "currentColor",
              fontSize: 11,
              textAnchor: "middle",
            })}
            tickStroke="rgba(255,255,255,0.3)"
            top={yMax}
          />
          <AxisLeft
            scale={yScale}
            stroke="rgba(255,255,255,0.3)"
            tickLabelProps={() => ({
              fill: "currentColor",
              fontSize: 11,
              textAnchor: "end",
              dy: "0.33em",
            })}
            tickStroke="rgba(255,255,255,0.3)"
          />
        </Group>
      </svg>
      {tooltipOpen && tooltipData && (
        <TooltipInPortal
          left={tooltipLeft}
          style={tooltipStyles}
          top={tooltipTop}
        >
          <strong>{tooltipData.label}</strong>
          <div>Count: {tooltipData.value}</div>
        </TooltipInPortal>
      )}
    </div>
  );
};

// Enhanced Pie Chart Component
interface PieChartData {
  label: string;
  value: number;
  color: string;
}

interface EnhancedPieChartProps {
  data: PieChartData[];
  width: number;
  height: number;
}

export const EnhancedPieChart: React.FC<EnhancedPieChartProps> = ({
  data,
  width,
  height,
}) => {
  const {
    tooltipOpen,
    tooltipLeft,
    tooltipTop,
    tooltipData,
    hideTooltip,
    showTooltip,
  } = useTooltip<PieChartData>();

  const { containerRef, TooltipInPortal } = useTooltipInPortal({
    scroll: true,
  });

  const centerY = height / 2;
  const centerX = width / 2;
  const radius = Math.min(width, height) / 2 - 40;

  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <div style={{ position: "relative" }}>
      <svg ref={containerRef} height={height} width={width}>
        <Group left={centerX} top={centerY}>
          <Pie
            cornerRadius={3}
            data={data}
            innerRadius={radius * 0.6}
            outerRadius={radius}
            padAngle={0.02}
            pieValue={(d) => d.value}
          >
            {(pie) => {
              return pie.arcs.map((arc, i) => {
                const [centroidX, centroidY] = pie.path.centroid(arc);
                const hasSpaceForLabel = arc.endAngle - arc.startAngle >= 0.1;
                const arcPath = pie.path(arc) || "";
                const percentage = ((arc.data.value / total) * 100).toFixed(1);

                return (
                  <g
                    key={`arc-${i}`}
                    onMouseLeave={() => hideTooltip()}
                    onMouseMove={(event) => {
                      const coords = localPoint(event);

                      showTooltip({
                        tooltipData: arc.data,
                        tooltipLeft: coords?.x,
                        tooltipTop: coords?.y,
                      });
                    }}
                  >
                    <path
                      d={arcPath}
                      fill={arc.data.color}
                      opacity={tooltipData === arc.data ? 0.8 : 1}
                      style={{
                        cursor: "pointer",
                        transition: "opacity 0.2s",
                      }}
                    />
                    {hasSpaceForLabel && (
                      <Text
                        dy=".33em"
                        fill="white"
                        fontSize={12}
                        pointerEvents="none"
                        textAnchor="middle"
                        x={centroidX}
                        y={centroidY}
                      >
                        {`${percentage}%`}
                      </Text>
                    )}
                  </g>
                );
              });
            }}
          </Pie>
          {/* Center text */}
          <Text
            fill="currentColor"
            fontSize={20}
            fontWeight="bold"
            textAnchor="middle"
            verticalAnchor="middle"
          >
            {total}
          </Text>
          <Text
            dy={20}
            fill="currentColor"
            fontSize={12}
            textAnchor="middle"
            verticalAnchor="middle"
          >
            Total Crimes
          </Text>
        </Group>
      </svg>
      {tooltipOpen && tooltipData && (
        <TooltipInPortal
          left={tooltipLeft}
          style={tooltipStyles}
          top={tooltipTop}
        >
          <strong>{tooltipData.label}</strong>
          <div>Count: {tooltipData.value}</div>
          <div>
            Percentage: {((tooltipData.value / total) * 100).toFixed(1)}%
          </div>
        </TooltipInPortal>
      )}
    </div>
  );
};

// Heatmap Component for Day of Week Analysis
interface HeatmapData {
  day: string;
  hour: number;
  value: number;
}

interface HeatmapProps {
  data: HeatmapData[];
  width: number;
  height: number;
}

export const Heatmap: React.FC<HeatmapProps> = ({ data, width, height }) => {
  const margin = { top: 40, right: 20, bottom: 60, left: 80 };
  const xMax = width - margin.left - margin.right;
  const yMax = height - margin.top - margin.bottom;

  const days = Array.from(new Set(data.map((d) => d.day)));
  const hours = Array.from(new Set(data.map((d) => d.hour))).sort(
    (a, b) => a - b
  );

  const maxValue = Math.max(...data.map((d) => d.value));

  const xScale = scaleBand<number>({
    range: [0, xMax],
    domain: hours,
    padding: 0.1,
  });

  const yScale = scaleBand<string>({
    range: [0, yMax],
    domain: days,
    padding: 0.1,
  });

  const colorScale = (value: number) => {
    const intensity = value / maxValue;

    return `rgba(255, 128, 66, ${Math.max(0.2, intensity)})`;
  };

  return (
    <svg height={height} width={width}>
      <Group left={margin.left} top={margin.top}>
        {data.map((d, i) => {
          const barWidth = xScale.bandwidth();
          const barHeight = yScale.bandwidth();
          const barX = xScale(d.hour);
          const barY = yScale(d.day);

          return (
            <rect
              key={`heatmap-${i}`}
              fill={colorScale(d.value)}
              height={barHeight}
              stroke="rgba(255,255,255,0.1)"
              width={barWidth}
              x={barX}
              y={barY}
            />
          );
        })}
        <AxisBottom
          scale={xScale}
          stroke="rgba(255,255,255,0.3)"
          tickFormat={(hour) => `${hour}:00`}
          tickLabelProps={() => ({
            fill: "currentColor",
            fontSize: 10,
            textAnchor: "middle",
          })}
          tickStroke="rgba(255,255,255,0.3)"
          top={yMax}
        />
        <AxisLeft
          scale={yScale}
          stroke="rgba(255,255,255,0.3)"
          tickLabelProps={() => ({
            fill: "currentColor",
            fontSize: 11,
            textAnchor: "end",
          })}
          tickStroke="rgba(255,255,255,0.3)"
        />
      </Group>
    </svg>
  );
};
