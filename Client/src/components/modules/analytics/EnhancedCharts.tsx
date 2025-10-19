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

// Status Distribution Chart Component - Unique Radial Visualization
interface StatusData {
  status: string;
  count: number;
  avgScore: number;
}

interface StatusDistributionChartProps {
  data: StatusData[];
  width: number;
  height: number;
}

export const StatusDistributionChart: React.FC<
  StatusDistributionChartProps
> = ({ data, width, height }) => {
  const {
    tooltipOpen,
    tooltipLeft,
    tooltipTop,
    tooltipData,
    hideTooltip,
    showTooltip,
  } = useTooltip<StatusData>();

  const { containerRef, TooltipInPortal } = useTooltipInPortal({
    scroll: true,
  });

  const centerY = height / 2;
  const centerX = width / 2;
  const radius = Math.min(width, height) / 2 - 60;

  const total = data.reduce((sum, d) => sum + d.count, 0);

  // Status colors
  const statusColors: Record<string, string> = {
    PENDING: "#F59E0B", // Amber
    APPROVED: "#10B981", // Green
    INVESTIGATING: "#3B82F6", // Blue
    RESOLVED: "#8B5CF6", // Purple
    REJECTED: "#EF4444", // Red
  };

  // Calculate cumulative angles for pie slices
  let currentAngle = -Math.PI / 2; // Start from top

  return (
    <div ref={containerRef} style={{ position: "relative" }}>
      <svg height={height} width={width}>
        <Group left={centerX} top={centerY}>
          {data.map((d, i) => {
            const percentage = d.count / total;
            const angle = percentage * 2 * Math.PI;
            const startAngle = currentAngle;
            const endAngle = currentAngle + angle;

            // Calculate arc path
            const x1 = Math.cos(startAngle) * radius;
            const y1 = Math.sin(startAngle) * radius;
            const x2 = Math.cos(endAngle) * radius;
            const y2 = Math.sin(endAngle) * radius;

            const largeArcFlag = percentage > 0.5 ? 1 : 0;
            const pathData = [
              `M ${x1} ${y1}`,
              `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
              `L 0 0`,
              `Z`,
            ].join(" ");

            currentAngle = endAngle;

            return (
              <g key={`status-${i}`}>
                <path
                  d={pathData}
                  fill={statusColors[d.status] || "#6B7280"}
                  opacity={tooltipData === d ? 0.8 : 1}
                  style={{
                    cursor: "pointer",
                    transition: "opacity 0.2s",
                  }}
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
                {/* Status labels */}
                {percentage > 0.05 && (
                  <Text
                    dy=".33em"
                    fill="white"
                    fontSize={12}
                    fontWeight="bold"
                    textAnchor="middle"
                    x={Math.cos(startAngle + angle / 2) * (radius * 0.7)}
                    y={Math.sin(startAngle + angle / 2) * (radius * 0.7)}
                  >
                    {d.status}
                  </Text>
                )}
              </g>
            );
          })}

          {/* Center circle with total */}
          <circle
            cx={0}
            cy={0}
            fill="rgba(255,255,255,0.1)"
            r={radius * 0.4}
            stroke="rgba(255,255,255,0.2)"
            strokeWidth={2}
          />
          <Text
            fill="currentColor"
            fontSize={24}
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
            Total Reports
          </Text>
        </Group>
      </svg>

      {/* Legend */}
      <div className="mt-4 grid grid-cols-2 gap-2">
        {data.map((d, i) => (
          <div key={i} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: statusColors[d.status] || "#6B7280" }}
            />
            <span className="text-sm text-gray-600 dark:text-gray-300">
              {d.status}: {d.count} ({((d.count / total) * 100).toFixed(1)}%)
            </span>
          </div>
        ))}
      </div>

      {tooltipOpen && tooltipData && (
        <TooltipInPortal
          left={tooltipLeft}
          style={tooltipStyles}
          top={tooltipTop}
        >
          <strong>{tooltipData.status}</strong>
          <div>Count: {tooltipData.count}</div>
          <div>
            Percentage: {((tooltipData.count / total) * 100).toFixed(1)}%
          </div>
          <div>Avg Verification Score: {tooltipData.avgScore.toFixed(2)}</div>
        </TooltipInPortal>
      )}
    </div>
  );
};

// Crime Activity Timeline Component - Shows crime patterns across time periods
interface TimelineData {
  period: string;
  crimes: number;
  trend: "up" | "down" | "stable";
  intensity: number; // 0-1 scale
}

interface CrimeActivityTimelineProps {
  data: TimelineData[];
  width: number;
  height: number;
}

export const CrimeActivityTimeline: React.FC<CrimeActivityTimelineProps> = ({
  data,
  width,
  height,
}) => {
  const margin = { top: 40, right: 30, bottom: 60, left: 80 };
  const xMax = width - margin.left - margin.right;
  const yMax = height - margin.top - margin.bottom;

  const xScale = scaleBand<string>({
    range: [0, xMax],
    domain: data.map((d) => d.period),
    padding: 0.4,
  });

  const yScale = scaleLinear<number>({
    range: [yMax, 0],
    domain: [0, Math.max(...data.map((d) => d.crimes)) * 1.2],
    nice: true,
  });

  const getIntensityColor = (intensity: number) => {
    // Color gradient from light blue to dark blue based on intensity
    const r = Math.round(59 + intensity * 196); // 59 to 255
    const g = Math.round(130 + intensity * 125); // 130 to 255
    const b = Math.round(246 - intensity * 46); // 246 to 200

    return `rgb(${r}, ${g}, ${b})`;
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return "📈";
      case "down":
        return "📉";
      case "stable":
        return "➡️";
      default:
        return "➡️";
    }
  };

  return (
    <svg height={height} width={width}>
      <Group left={margin.left} top={margin.top}>
        {/* Background grid */}
        <GridRows
          scale={yScale}
          stroke="rgba(255,255,255,0.1)"
          strokeDasharray="2,2"
          width={xMax}
        />

        {/* Bars */}
        {data.map((d, i) => {
          const barWidth = xScale.bandwidth();
          const barHeight = yMax - (yScale(d.crimes) ?? 0);
          const barX = xScale(d.period) ?? 0;
          const barY = yMax - barHeight;

          return (
            <g key={`timeline-${i}`}>
              {/* Main bar */}
              <rect
                className="drop-shadow-sm"
                fill={getIntensityColor(d.intensity)}
                height={barHeight}
                rx={4}
                width={barWidth}
                x={barX}
                y={barY}
              />

              {/* Trend indicator */}
              <text
                dy=".33em"
                fill="currentColor"
                fontSize={16}
                textAnchor="middle"
                x={barX + barWidth / 2}
                y={barY - 15}
              >
                {getTrendIcon(d.trend)}
              </text>

              {/* Value label */}
              <text
                dy=".33em"
                fill="currentColor"
                fontSize={12}
                fontWeight="bold"
                textAnchor="middle"
                x={barX + barWidth / 2}
                y={barY - 35}
              >
                {d.crimes}
              </text>
            </g>
          );
        })}

        {/* X-axis */}
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

        {/* Y-axis */}
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

        {/* Title */}
        <text
          dy=".33em"
          fill="currentColor"
          fontSize={14}
          fontWeight="bold"
          textAnchor="middle"
          x={xMax / 2}
          y={-20}
        >
          Crime Activity Timeline
        </text>
      </Group>
    </svg>
  );
};
