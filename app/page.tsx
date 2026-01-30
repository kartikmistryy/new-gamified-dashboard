import { redirect } from "next/navigation"

const DEFAULT_ORG_ID = "gitroll"

export default function Home() {
  redirect(`/org/${DEFAULT_ORG_ID}`)
}
