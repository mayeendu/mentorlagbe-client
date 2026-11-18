import { AuthForm } from "@/components/auth-form";
import { SiteFooter } from "@/components/site-footer";
import { SiteNavbar } from "@/components/site-navbar";

export default function SignInPage() {
  return <><SiteNavbar /><AuthForm register={false} /><SiteFooter /></>;
}
