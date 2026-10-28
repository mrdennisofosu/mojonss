import Button from "../ui/Button";
import { ROUTES } from "../../constants/routePaths";
import { ROLES } from "../../constants/roles";
import { APP_NAME } from "../../constants/app";
import { useAuth } from "../../hooks/useAuth";

function HeroSection() {
  const { user } = useAuth();

  const dashboardPath =
    user?.role === ROLES.ADMIN ? ROUTES.ADMIN.OVERVIEW : ROUTES.USER.DASHBOARD;

  return (
    <section className="bg-brand-50">
      <div className="mx-auto max-w-5xl px-4 py-12 text-center sm:px-6 sm:py-16 lg:py-24">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
          Secure access and user management,{" "}
          <span className="text-brand-600">made simple</span>
        </h1>

        <p className="mx-auto mt-4 max-w-2xl text-base text-slate-600 sm:text-lg">
          {APP_NAME} gives every person a secure account, and gives
          administrators one place to manage users, announcements and support
          requests.
        </p>

        {/* On phones the buttons stack and fill the width; from "sm" they sit side by side */}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          {user ? (
            <Button to={dashboardPath}>Go to my dashboard</Button>
          ) : (
            <>
              <Button to={ROUTES.LOGIN}>Sign In</Button>
              <Button to={ROUTES.REGISTER} variant="secondary">
                Create an account
              </Button>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
