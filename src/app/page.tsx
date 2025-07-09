import { redirect } from "next/navigation";

export default function Home() {
  redirect("/users/login"); // ⬅️ otomatis redirect ke login user
}
