export type MemberPerformanceRow = {
  level: "member";
  rank: number;
  memberName: string;
  memberAvatar: string;
  teamId: string;
  performanceLabel: string;
  performanceValue: number;
  trend: "up" | "down" | "flat";
  performanceBarColor: string;
  changePts?: number;
  typeDistribution: {
    star: number;
    timeBomb: number;
    keyRole: number;
    bottleneck: number;
    risky: number;
    legacy: number;
  };
};

export type MemberTableFilter = "mostProductive" | "leastProductive" | "mostOptimal" | "mostRisky";
