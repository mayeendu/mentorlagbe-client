import { AuthForm } from "@/components/auth-form";
import { SiteFooter } from "@/components/site-footer";
import { SiteNavbar } from "@/components/site-navbar";

export default function SignUpPage() {
  return <><SiteNavbar /><AuthForm register /><SiteFooter /></>;
}
