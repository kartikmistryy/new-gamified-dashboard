import type { D3HierarchyNode, TooltipState } from "./skillGraphTypes";
import { getColorForDomain } from "./skillGraphUtils";

const buildCirclePolygon = (radius: number, steps = 80): [number, number][] => {
  const circle: [number, number][] = [];
  for (let i = 0; i < steps; i += 1) {
    const angle = (i / steps) * 2 * Math.PI;
    circle.push([Math.cos(angle) * radius, Math.sin(angle) * radius]);
  }
  return circle;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const applyVoronoiTreemap = (d3Lib: any, root: D3HierarchyNode, radius: number, clip?: [number, number][]) => {
  try {
    d3Lib
      .voronoiTreemap()
      .clip(clip ?? buildCirclePolygon(radius))
      .convergenceRatio(0.001)
      .maxIterationCount(120)
      .minWeightRatio(0.001)(root);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Voronoi treemap error:", error);
  }
};

const getNodeOwnership = (node: D3HierarchyNode): number =>
  node.data.value ?? node.value ?? 0;

const getNodeFrequency = (node: D3HierarchyNode): number =>
  node.data.frequency ?? node.data.value ?? node.value ?? 0;

const createOpacityScale = (nodes: D3HierarchyNode[]) => {
  const values = nodes.map(getNodeFrequency);
  const min = Math.min(...values);
  const max = Math.max(...values);
  return (node: D3HierarchyNode) => {
    if (!Number.isFinite(min) || !Number.isFinite(max) || min === max) return 0.75;
    const t = (getNodeFrequency(node) - min) / (max - min);
    return 0.35 + t * 0.6;
  };
};

const sumLeafValues = (data: { value?: number; children?: { value?: number; children?: unknown[] }[] }): number => {
  if (!data.children || data.children.length === 0) return data.value || 0;
  return data.children.reduce((sum, child) => sum + sumLeafValues(child), 0);
};

const getTopDomainNameFromNode = (node: D3HierarchyNode, rootLabel: string): string => {
  let current: D3HierarchyNode | null = node;
  while (current?.parent && current.parent.data.name !== rootLabel) {
    current = current.parent;
  }
  return current?.data.name || rootLabel;
};



// eslint-disable-next-line @typescript-eslint/no-explicit-any
const colorWithOpacity = (d3Lib: any, baseColor: string, opacity: number): string => {
  const color = d3Lib.color(baseColor);
  if (!color) return baseColor;
  color.opacity = opacity;
  return color.formatRgb();
};

const getTopDomainName = (node: D3HierarchyNode, rootLabel: string): string => {
  let current: D3HierarchyNode | null = node;
  while (current?.parent && current.parent.data.name !== rootLabel) {
    current = current.parent;
  }
  return current?.data.name || rootLabel;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const renderSkillLabels = (d3Lib: any, g: any, nodes: D3HierarchyNode[]) => {
  nodes.forEach((node) => {
    if (!node.polygon) return;
    const area = Math.abs(d3Lib.polygonArea(node.polygon));
    if (area < 900) return;

    const centroid = d3Lib.polygonCentroid(node.polygon);
    const fontSize = Math.max(8, Math.min(14, Math.sqrt(area) / 7));
    const maxChars = area > 12000 ? 18 : area > 8000 ? 14 : area > 5000 ? 11 : area > 3000 ? 9 : 7;
    const label = node.data.name.length > maxChars
      ? `${node.data.name.slice(0, Math.max(3, maxChars - 1))}…`
      : node.data.name;

    if (area < 1400) return;

    g.append("text")
      .attr("x", centroid[0])
      .attr("y", centroid[1])
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle")
      .attr("fill", "#fff")
      .attr("font-size", `${fontSize}px`)
      .attr("font-weight", 600)
      .style("pointer-events", "none")
      .text(label);
  });
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const renderBadge = (
  svg: any,
  label: string,
  color: string,
  x: number,
  y: number,
  shadowId: string
) => {
  const group = svg.append("g").attr("class", "skill-badge").style("pointer-events", "none");
  const text = group
    .append("text")
    .attr("x", x)
    .attr("y", y)
    .attr("text-anchor", "middle")
    .attr("dominant-baseline", "middle")
    .attr("fill", "#fff")
    .attr("font-size", "12px")
    .attr("font-weight", 600)
    .text(label);

  const bbox = (text.node() as SVGTextElement).getBBox();
  group
    .insert("rect", "text")
    .attr("x", bbox.x - 4)
    .attr("y", bbox.y - 2)
    .attr("width", bbox.width + 8)
    .attr("height", bbox.height + 4)
    .attr("rx", 6)
    .attr("fill", color)
    .attr("filter", shadowId ? `url(#${shadowId})` : null);
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const renderDomainBadges = (
  d3Lib: any,
  svg: any,
  domains: D3HierarchyNode[],
  centerX: number,
  centerY: number,
  radius: number,
  shadowId: string
) => {
  const touchesEdge = (domain: D3HierarchyNode) => {
    if (!domain.polygon) return false;
    const threshold = radius * 0.94;
    return domain.polygon.some((point) => Math.hypot(point[0], point[1]) >= threshold);
  };

  const computeArcMidpoint = (domain: D3HierarchyNode) => {
    if (!domain.polygon) return null;
    const edgeThreshold = radius * 0.9;
    const edgePoints = domain.polygon.filter((point) => Math.hypot(point[0], point[1]) >= edgeThreshold);
    if (edgePoints.length === 0) return null;

    const angles = edgePoints.map((point) => Math.atan2(point[1], point[0]));
    angles.sort((a, b) => a - b);
    const withWrap = [...angles, angles[0] + Math.PI * 2];
    let maxGap = 0;
    let gapIndex = 0;
    for (let i = 0; i < withWrap.length - 1; i += 1) {
      const gap = withWrap[i + 1] - withWrap[i];
      if (gap > maxGap) {
        maxGap = gap;
        gapIndex = i;
      }
    }

    const start = withWrap[gapIndex + 1];
    const end = withWrap[gapIndex] + Math.PI * 2;
    const mid = (start + end) / 2;
    return { angle: mid };
  };

  domains.forEach((domain) => {
    if (!domain.polygon) return;
    const centroid = d3Lib.polygonCentroid(domain.polygon) as [number, number];

    if (!touchesEdge(domain)) {
      renderBadge(
        svg,
        domain.data.name,
        getColorForDomain(domain.data.name),
        centerX + centroid[0],
        centerY + centroid[1],
        shadowId
      );
      return;
    }

    const arcMid = computeArcMidpoint(domain);
    const angle = arcMid ? arcMid.angle : Math.atan2(centroid[1], centroid[0]);
    const labelRadius = radius + 36;
    const x = centerX + Math.cos(angle) * labelRadius;
    const y = centerY + Math.sin(angle) * labelRadius;
    const anchorX = centerX + Math.cos(angle) * radius;
    const anchorY = centerY + Math.sin(angle) * radius;

    renderBadge(svg, domain.data.name, getColorForDomain(domain.data.name), x, y, shadowId);
  });
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const attachNodeInteractions = (
  d3Lib: any,
  selection: any,
  root: D3HierarchyNode,
  tooltipLabel: string,
  setTooltip: (t: TooltipState) => void,
  onNodeClick: (node: D3HierarchyNode) => void
) => {
  selection
    .style("cursor", "pointer")
    .on("mouseover", function (this: SVGPathElement, event: MouseEvent, node: D3HierarchyNode) {
      d3Lib.select(this).attr("stroke-width", 3);
      const ownership = getNodeOwnership(node);
      const frequency = getNodeFrequency(node);
      const pct = root.value ? ((ownership / root.value) * 100).toFixed(1) : "0";
      const parentLabel = node.parent?.data.name ? ` · ${node.parent.data.name}` : "";
      setTooltip({
        show: true,
        x: event.pageX + 10,
        y: event.pageY + 10,
        content: `<strong>${node.data.name}${parentLabel}</strong><div>Ownership: ${ownership}</div><div>Frequency: ${frequency}</div><div>% of ${tooltipLabel}: ${pct}%</div>`,
      });
    })
    .on("mouseout", function (this: SVGPathElement) {
      d3Lib.select(this).attr("stroke-width", 2);
      setTooltip({ show: false, x: 0, y: 0, content: "" });
    })
    .on("click", function (event: MouseEvent, node: D3HierarchyNode) {
      event.stopPropagation();
      onNodeClick(node);
    });
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function renderWorldView(
  d3Lib: any,
  g: any,
  svg: any,
  root: D3HierarchyNode,
  radius: number,
  centerX: number,
  centerY: number,
  setTooltip: (t: TooltipState) => void,
  onNodeClick: (node: D3HierarchyNode) => void,
  rootLabel: string,
  badgeShadowId: string
) {
  const focusDomainName = "Frontend";

  const domainByNode = new WeakMap<object, string>();
  const mapDomains = (data: SkillData, currentDomain?: string) => {
    const domainName = currentDomain;
    domainByNode.set(data as object, domainName ?? data.name);
    if (data.children && data.children.length > 0) {
      data.children.forEach((child) => {
        const nextDomain = data.name === rootLabel ? child.name : currentDomain;
        mapDomains(child, nextDomain);
      });
    }
  };
  mapDomains(root.data, root.data.name);

  const domainTotals = new Map<string, number>();
  (root.data.children || []).forEach((domain) => {
    domainTotals.set(domain.name, sumLeafValues(domain));
  });

  const boosts = new Map<string, number>();
  domainTotals.forEach((_, name) => boosts.set(name, 1));

  const touchesEdge = (domain: D3HierarchyNode) =>
    domain.polygon && domain.polygon.some((point) => Math.hypot(point[0], point[1]) >= radius * 0.94);

  let layoutRoot: D3HierarchyNode | null = null;
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const othersSum = Array.from(domainTotals.entries())
      .filter(([name]) => name !== focusDomainName)
      .reduce((sum, [name, value]) => sum + value * (boosts.get(name) || 1), 0) || 0.001;
    const focusBase = domainTotals.get(focusDomainName) || 0.001;
    const focusBoost = (0.4 * othersSum) / (0.6 * focusBase);

    layoutRoot = d3Lib.hierarchy(root.data)
      .sum((d: SkillData) => {
        if (d.children && d.children.length > 0) return 0;
        const domainName = domainByNode.get(d as object) || focusDomainName;
        const multiplier = domainName === focusDomainName ? focusBoost : (boosts.get(domainName) || 1);
        return Math.max(0.001, (d.value || 0) * multiplier);
      })
      .sort((a: { value?: number }, b: { value?: number }) => (b.value || 0) - (a.value || 0)) as D3HierarchyNode;

    applyVoronoiTreemap(d3Lib, layoutRoot, radius);

    const domains = (layoutRoot.children || []) as D3HierarchyNode[];
    const isolated = domains.filter((domain) => !touchesEdge(domain));
    if (isolated.length === 0) break;

    isolated.forEach((domain) => {
      const name = domain.data.name;
      boosts.set(name, (boosts.get(name) || 1) * 1.25);
    });
  }

  if (!layoutRoot) return;

  const domains = (layoutRoot.children || []) as D3HierarchyNode[];
  const leaves = layoutRoot.leaves() as D3HierarchyNode[];
  const opacityScale = createOpacityScale(leaves);

  const cells = g
    .selectAll(".skill-cell")
    .data(leaves)
    .join("path")
    .attr("class", "skill-cell")
    .attr("d", (node: D3HierarchyNode) =>
      node.polygon ? `M${node.polygon.join("L")}Z` : null
    )
    .attr("fill", (node: D3HierarchyNode) => {
      const domainName = getTopDomainName(node, rootLabel);
      const baseColor = getColorForDomain(domainName);
      return colorWithOpacity(d3Lib, baseColor, opacityScale(node));
    })
    .attr("stroke", "#fff")
    .attr("stroke-width", 2);

  attachNodeInteractions(d3Lib, cells, layoutRoot, "Total", setTooltip, onNodeClick);

  g
    .selectAll(".domain-border")
    .data(domains)
    .join("path")
    .attr("class", "domain-border")
    .attr("d", (domain: D3HierarchyNode) =>
      domain.polygon ? `M${domain.polygon.map((p) => `${p[0]},${p[1]}`).join("L")}Z` : null
    )
    .attr("fill", "none")
    .attr("stroke", "#fff")
    .attr("stroke-width", 3)
    .style("pointer-events", "none");

  renderSkillLabels(d3Lib, g, leaves);
  renderDomainBadges(d3Lib, svg, domains, centerX, centerY, radius, badgeShadowId);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function renderDrilldownView(
  d3Lib: any,
  g: any,
  svg: any,
  root: D3HierarchyNode,
  radius: number,
  centerX: number,
  centerY: number,
  setTooltip: (t: TooltipState) => void,
  onNodeClick: (node: D3HierarchyNode) => void,
  activeLabel: string,
  activeDomain: string,
  badgeShadowId: string
) {
  applyVoronoiTreemap(d3Lib, root, radius);

  const nodes = (root.children && root.children.length > 0 ? root.children : root.leaves()) as D3HierarchyNode[];
  const opacityScale = createOpacityScale(nodes);
  const baseColor = getColorForDomain(activeDomain);

  const cells = g
    .selectAll(".skill-cell")
    .data(nodes)
    .join("path")
    .attr("class", "skill-cell")
    .attr("d", (node: D3HierarchyNode) =>
      node.polygon ? `M${node.polygon.join("L")}Z` : null
    )
    .attr("fill", (node: D3HierarchyNode) => colorWithOpacity(d3Lib, baseColor, opacityScale(node)))
    .attr("stroke", "#fff")
    .attr("stroke-width", 2);

  attachNodeInteractions(d3Lib, cells, root, activeLabel, setTooltip, onNodeClick);
  renderSkillLabels(d3Lib, g, nodes);

  const labelY = Math.max(24, centerY - radius - 26);
  renderBadge(svg, activeLabel, baseColor, centerX, labelY, badgeShadowId);
}
