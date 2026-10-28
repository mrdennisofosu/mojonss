import { useState } from "react";
import { Link, Navigate, useLocation } from "react-router";
import Alert from "../../components/ui/Alert";
import AuthCard from "../../components/ui/AuthCard";
import Button from "../../components/ui/Button";
import Checkbox from "../../components/ui/Checkbox";
import Input from "../../components/ui/Input";
import PasswordInput from "../../components/ui/PasswordInput";
import Spinner from "../../components/ui/Spinner";
import DevAccountsHint from "../../components/dev/DevAccountsHint";
import { ROUTES } from "../../constants/routePaths";
import { useAuth } from "../../hooks/useAuth";
import { useForm } from "../../hooks/useForm";
import { useToast } from "../../hooks/useToast";
import { getPostLoginPath } from "../../utils/navigation";
import { compactErrors } from "../../utils/validators";

const initialValues = {
  identifier: "",
  password: "",
  rememberMe: false,
};

function validate(values) {
  return compactErrors({
    identifier: values.identifier ? "" : "Please enter your username or email.",
    password: values.password ? "" : "Enter your password.",
  });
}

const errorTitles = {
  INVALID_CREDENTIALS: "Sign in failed",
  ACCOUNT_DEACTIVATED: "Account deactivated",
  EMAIL_NOT_VERIFIED: "Email not verified",
};

function Login() {
  const { user, login } = useAuth();
  const { showToast } = useToast();
  const location = useLocation();
  const form = useForm({ initialValues, validate });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const from = location.state?.from?.pathname;

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitError(null);

    if (!form.validateAll()) return;

    setSubmitting(true);
    try {
      const signedInUser = await login(
        form.values.identifier.trim(),
        form.values.password,
      );

      form.reset();
      showToast({
        type: "success",
        message: `Welcome back, ${signedInUser.fullName}.`,
      });
    } catch (error) {
      setSubmitError({
        title: error.response?.data?.code
          ? errorTitles[error.response.data.code]
          : "Sign in failed",
        message: error.response?.data?.error || "Invalid credentials",
        code: error.response?.data?.code,
        identifier: form.values.identifier.trim(),
      });
    } finally {
      setSubmitting(false);
    }
  }

  if (user) {
    return <Navigate to={getPostLoginPath(user, from)} replace />;
  }

  return (
    <>
      <AuthCard>
        <h1 className="text-2xl font-bold text-slate-900">Sign in</h1>
        <p className="mt-1 text-slate-600">
          Welcome back. Enter your details to continue.
        </p>

        {submitError && (
          <div className="mt-4">
            <Alert variant="error" title={submitError.title}>
              {submitError.message}
              {submitError.code === "EMAIL_NOT_VERIFIED" && (
                <>
                  {" "}
                  <Link
                    to={ROUTES.VERIFY_EMAIL}
                    state={{ email: submitError.identifier }}
                    className="font-semibold underline"
                  >
                    Verify your email
                  </Link>
                </>
              )}
            </Alert>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">
          <Input
            label="Username or Email"
            name="identifier"
            type="text"
            autoComplete="username"
            autoCapitalize="none"
            spellCheck={false}
            placeholder="admin or admin@mojo.com"
            value={form.values.identifier}
            onChange={form.handleChange}
            onBlur={form.handleBlur}
            error={form.getError("identifier")}
          />

          <PasswordInput
            label="Password"
            name="password"
            autoComplete="current-password"
            value={form.values.password}
            onChange={form.handleChange}
            onBlur={form.handleBlur}
            error={form.getError("password")}
          />

          <div className="flex flex-wrap items-center justify-between gap-x-4">
            <Checkbox
              name="rememberMe"
              label="Remember me"
              checked={form.values.rememberMe}
              onChange={form.handleChange}
            />
            <Link
              to={ROUTES.FORGOT_PASSWORD}
              className="inline-flex min-h-11 items-center text-sm font-semibold text-brand-700 hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? (
              <>
                <Spinner light /> Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          Don&apos;t have an account?{" "}
          <Link
            to={ROUTES.REGISTER}
            className="inline-block py-2 font-semibold text-brand-700 hover:underline"
          >
            Register
          </Link>
        </p>
      </AuthCard>

      <div className="mx-auto w-full max-w-md px-4 pb-8">
        <DevAccountsHint
          onUse={(email, password) =>
            form.setValues((previous) => ({
              ...previous,
              identifier: email,
              password,
            }))
          }
        />
      </div>
    </>
  );
}

export default Login;
