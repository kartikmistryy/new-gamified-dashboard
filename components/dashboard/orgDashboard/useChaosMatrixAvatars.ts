/** Custom hook for Chaos Matrix avatar rendering */

import { useCallback, useEffect, useRef, type RefObject } from "react";
import type { StackedPoint } from "@/lib/orgDashboard/chaosMatrixConfig";
import { CATEGORY_COLORS } from "@/lib/orgDashboard/chaosMatrixData";
import { getTeamAvatarUrl } from "@/components/shared/TeamAvatar";

export function useChaosMatrixAvatars(
  renderMode: "circles" | "avatars",
  stackedFiltered: StackedPoint[],
  clipId: string,
  plotRef: RefObject<HTMLDivElement | null>,
  svgOverlayRef: RefObject<SVGSVGElement | null>
) {
  const renderAvatars = useCallback(() => {
    if (renderMode !== "avatars" || !svgOverlayRef.current || !plotRef.current) return;
    const plotDiv = plotRef.current.querySelector(".js-plotly-plot") as HTMLElement;
    if (!plotDiv) return;

    const _fullLayout = (plotDiv as any)._fullLayout;
    if (!_fullLayout || !_fullLayout.xaxis || !_fullLayout.yaxis) return;

    const xaxis = _fullLayout.xaxis;
    const yaxis = _fullLayout.yaxis;
    const dataToPixel = (x: number, y: number) => ({
      x: xaxis.l2p(x) + xaxis._offset,
      y: yaxis.l2p(y) + yaxis._offset,
    });

    const svg = svgOverlayRef.current;
    while (svg.firstChild) svg.removeChild(svg.firstChild);

    const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
    svg.appendChild(defs);

    stackedFiltered.forEach((point, index) => {
      const { x, y } = dataToPixel(point.medianWeeklyKp, point.churnRatePct);
      const avatarUrl = getTeamAvatarUrl(point.name, 64);
      const avatarSize = 22;
      const half = avatarSize / 2;

      const clipPath = document.createElementNS("http://www.w3.org/2000/svg", "clipPath");
      clipPath.id = `avatar-clip-${clipId}-${index}`;
      const clipCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      clipCircle.setAttribute("cx", x.toString());
      clipCircle.setAttribute("cy", y.toString());
      clipCircle.setAttribute("r", half.toString());
      clipPath.appendChild(clipCircle);
      defs.appendChild(clipPath);

      const image = document.createElementNS("http://www.w3.org/2000/svg", "image");
      image.setAttribute("href", avatarUrl);
      image.setAttribute("x", (x - half).toString());
      image.setAttribute("y", (y - half).toString());
      image.setAttribute("width", avatarSize.toString());
      image.setAttribute("height", avatarSize.toString());
      image.setAttribute("clip-path", `url(#avatar-clip-${clipId}-${index})`);
      image.setAttribute("preserveAspectRatio", "xMidYMid slice");
      svg.appendChild(image);

      const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      circle.setAttribute("cx", x.toString());
      circle.setAttribute("cy", y.toString());
      circle.setAttribute("r", half.toString());
      circle.setAttribute("fill", "none");
      circle.setAttribute("stroke", CATEGORY_COLORS[point.category]);
      circle.setAttribute("stroke-width", "2.5");
      svg.appendChild(circle);
    });
  }, [renderMode, stackedFiltered, clipId, plotRef, svgOverlayRef]);

  useEffect(() => {
    if (renderMode !== "avatars") return;
    const timeoutId = setTimeout(renderAvatars, 100);
    const plotDiv = plotRef.current?.querySelector(".js-plotly-plot") as HTMLElement;

    if (plotDiv) {
      plotDiv.addEventListener("plotly_afterplot", renderAvatars);
      plotDiv.addEventListener("plotly_relayout", renderAvatars);
      plotDiv.addEventListener("plotly_redraw", renderAvatars);
      plotDiv.addEventListener("plotly_restyle", renderAvatars);
    }

    return () => {
      clearTimeout(timeoutId);
      if (plotDiv) {
        plotDiv.removeEventListener("plotly_afterplot", renderAvatars);
        plotDiv.removeEventListener("plotly_relayout", renderAvatars);
        plotDiv.removeEventListener("plotly_redraw", renderAvatars);
        plotDiv.removeEventListener("plotly_restyle", renderAvatars);
      }
    };
  }, [renderMode, renderAvatars, plotRef]);

  useEffect(() => {
    let resizeTimeoutId: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimeoutId);
      resizeTimeoutId = setTimeout(() => {
        const plotDiv = plotRef.current?.querySelector(".js-plotly-plot") as HTMLElement;
        if (!plotDiv) return;
        const Plotly = (window as any).Plotly;
        if (Plotly && Plotly.Plots && Plotly.Plots.resize) {
          Plotly.Plots.resize(plotDiv);
        }
        if (renderMode === "avatars") {
          setTimeout(renderAvatars, 50);
        }
      }, 150);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(resizeTimeoutId);
    };
  }, [renderMode, renderAvatars, plotRef]);
}
