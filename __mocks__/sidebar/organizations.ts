export const getOrganizations = () => {
  if (typeof window === "undefined") return []
  const raw = localStorage.getItem("orgs")
  return raw && raw !== "undefined" ? JSON.parse(raw) : []
}
