
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo, GoogleIcon, FacebookIcon, AppleIcon } from "@/components/icons";
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  FacebookAuthProvider,
  OAuthProvider,
  signInWithPopup,
  type AuthProvider as FirebaseAuthProvider,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<string | null>(null);


  const handleSocialLogin = async (providerName: 'google' | 'facebook' | 'apple') => {
    setSocialLoading(providerName);
    let provider: FirebaseAuthProvider;

    if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
      toast({
        variant: "destructive",
        title: "Configuration Error",
        description: "Firebase API Key is missing. Please configure your .env file.",
      });
      setSocialLoading(null);
      return;
    }

    switch (providerName) {
      case 'google':
        provider = new GoogleAuthProvider();
        break;
      case 'facebook':
        provider = new FacebookAuthProvider();
        break;
      case 'apple':
        provider = new OAuthProvider('apple.com');
        break;
      default:
        toast({
          variant: "destructive",
          title: "Error",
          description: "Unknown provider.",
        });
        setSocialLoading(null);
        return;
    }
    
    try {
      await signInWithPopup(auth, provider);
      router.push("/symptom-analyzer");
    } catch (error: any) {
      console.error(`${providerName} login failed:`, error);
      let description = "An unexpected error occurred. Please try again.";
      if (error.code === 'auth/account-exists-with-different-credential') {
        description = "An account already exists with the same email address but different sign-in credentials.";
      }
      toast({
        variant: "destructive",
        title: "Login Failed",
        description,
      });
    } finally {
      setSocialLoading(null);
    }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
      toast({
        variant: "destructive",
        title: "Configuration Error",
        description: "Firebase API Key is missing. Please configure your .env file.",
      });
      setLoading(false);
      return;
    }
    
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/symptom-analyzer");
    } catch (error: any) {
      console.error("Login failed:", error);
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: "Please check your credentials and try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="mx-auto max-w-sm w-full">
        <CardHeader className="text-center">
          <div className="flex justify-center items-center mb-4">
            <Logo className="h-10 w-10" />
          </div>
          <CardTitle className="text-2xl">Welcome to medi assist ai</CardTitle>
          <CardDescription>
            Your personal AI health companion.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
                <Link
                  href="/forgot-password"
                  className="ml-auto inline-block text-sm underline"
                >
                  Forgot your password?
                </Link>
              </div>
              <Input 
                id="password" 
                type="password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading || !!socialLoading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Login
            </Button>
          </form>
            <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">
                        Or continue with
                    </span>
                </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
                <Button variant="outline" type="button" onClick={() => handleSocialLogin('google')} disabled={!!socialLoading}>
                    {socialLoading === 'google' ? <Loader2 className="animate-spin" /> : <GoogleIcon className="h-5 w-5" />}
                </Button>
                <Button variant="outline" type="button" onClick={() => handleSocialLogin('facebook')} disabled={!!socialLoading}>
                     {socialLoading === 'facebook' ? <Loader2 className="animate-spin" /> : <FacebookIcon className="h-5 w-5" />}
                </Button>
                <Button variant="outline" type="button" onClick={() => handleSocialLogin('apple')} disabled={!!socialLoading}>
                     {socialLoading === 'apple' ? <Loader2 className="animate-spin" /> : <AppleIcon className="h-5 w-5" />}
                </Button>
            </div>
          <div className="mt-4 text-center text-sm">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="underline">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
