import { AuthForm } from "@/components/auth-form";
import { SiteNavbar } from "@/components/site-navbar";

export default function SignInPage() {
  return <><SiteNavbar /><AuthForm register={false} /></>;
}
