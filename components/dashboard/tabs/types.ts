export type ProfileTabKey =
  | "overview"
  | "performance"
  | "skillgraph"
  | "outliers"
  | "spof"

export type ProfileTab = {
  key: ProfileTabKey
  label: string
  count?: number
}
