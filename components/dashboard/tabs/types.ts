export type ProfileTabKey =
  | "overview"
  | "performance"
  | "skillgraph"
  | "design"
  | "spof"

export type ProfileTab = {
  key: ProfileTabKey
  label: string
  count?: number
}
