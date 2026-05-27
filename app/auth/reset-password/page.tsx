"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Eye, EyeOff, Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { createClient } from "@/lib/supabase";
import Logo from "@/components/logo";

const resetSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .refine((p) => !/\s/.test(p), {
        message: "Password cannot contain spaces",
      }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ResetFormValues = z.infer<typeof resetSchema>;

export default function ResetPasswordPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);

  // Supabase sends the user back with a code in the URL fragment (#access_token=...)
  // The client SDK handles exchanging it automatically on load.
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        if (session) {
          setSessionReady(true);
        } else {
          router.replace("/forgot-password");
        }
      })
      .catch(() => {
        router.replace("/forgot-password");
      });
  }, [router]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetFormValues>({
    resolver: zodResolver(resetSchema),
  });

  const onSubmit = async (values: ResetFormValues) => {
    setServerError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: values.password });
    if (error) {
      setServerError(error.message);
      return;
    }
    setSuccess(true);
    setTimeout(() => router.replace("/dashboard"), 2000);
  };

  if (!sessionReady) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "linear-gradient(135deg,#f0fdf9 0%,#d1f0ec 100%)" }}>
        <Loader2 className="w-7 h-7 animate-spin" style={{ color: "#4AB7A6" }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0" style={{ background: "linear-gradient(135deg,#f0fdf9 0%,#e6f7f5 40%,#d1f0ec 70%,#b8e8e3 100%)" }} />
      <div className="absolute top-[-120px] right-[-120px] w-96 h-96 rounded-full opacity-20 blur-3xl" style={{ backgroundColor: "#4AB7A6" }} />
      <div className="absolute bottom-[-80px] left-[-80px] w-72 h-72 rounded-full opacity-15 blur-3xl" style={{ backgroundColor: "#4AB7A6" }} />

      <div className="relative z-10 w-full max-w-md px-4 py-8">
        <Card className="w-full shadow-xl border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader className="space-y-4 pb-4">
            <div className="flex items-center justify-center">
              <Logo href="/" size="md" />
            </div>
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900">Set new password</h1>
              <p className="text-sm text-gray-500 mt-1">Choose a strong password for your account</p>
            </div>
          </CardHeader>

          <CardContent>
            {success ? (
              <div className="flex flex-col items-center text-center gap-4 py-4">
                <CheckCircle className="w-12 h-12" style={{ color: "#4AB7A6" }} />
                <div>
                  <p className="font-semibold text-gray-900">Password updated!</p>
                  <p className="text-sm text-gray-500 mt-1">Redirecting you to your dashboard…</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
                {serverError && (
                  <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-sm text-red-600">{serverError}</div>
                )}

                <div className="space-y-1.5">
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700">New password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Min. 8 characters, no spaces"
                      className={`h-11 pr-10 ${errors.password ? "border-red-400" : ""}`}
                      onKeyDown={(e) => {
                        if (e.key === " ") e.preventDefault();
                      }}
                      {...register("password")}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      onClick={() => setShowPassword((v) => !v)}
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">Confirm new password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirm ? "text" : "password"}
                      placeholder="Repeat your password"
                      className={`h-11 pr-10 ${errors.confirmPassword ? "border-red-400" : ""}`}
                      onKeyDown={(e) => {
                        if (e.key === " ") e.preventDefault();
                      }}
                      {...register("confirmPassword")}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      onClick={() => setShowConfirm((v) => !v)}
                      tabIndex={-1}
                    >
                      {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="text-xs text-red-500">{errors.confirmPassword.message}</p>}
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 font-semibold rounded-full text-white"
                  style={{ backgroundColor: "#4AB7A6" }}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Updating…</>
                  ) : (
                    "Update Password"
                  )}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
