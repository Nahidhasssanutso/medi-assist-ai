
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
    createUserWithEmailAndPassword, 
    updateProfile,
    GoogleAuthProvider,
    FacebookAuthProvider,
    OAuthProvider,
    signInWithPopup,
    type AuthProvider as FirebaseAuthProvider
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";


export default function SignupPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [fullName, setFullName] = useState("");
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
    if (password.length < 6) {
      toast({
        variant: "destructive",
        title: "Signup Failed",
        description: "Password must be at least 6 characters long.",
      });
      return;
    }
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
      await createUserWithEmailAndPassword(auth, email, password);
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, { displayName: fullName });
      }
      toast({
        title: "Account Created",
        description: "You have been successfully signed up.",
      });
      router.push("/symptom-analyzer");
    } catch (error: any) {
      console.error("Signup failed:", error);
      let description = "An unexpected error occurred. Please try again.";
      if (error.code === 'auth/email-already-in-use') {
        description = "This email is already in use. Please use a different email or try logging in.";
      } else if (error.code === 'auth/invalid-email') {
        description = "Please enter a valid email address.";
      } else if (error.code === 'auth/weak-password') {
        description = "Password is too weak. It must be at least 6 characters long.";
      }
      
      toast({
        variant: "destructive",
        title: "Signup Failed",
        description,
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
          <CardTitle className="text-2xl">Create an Account</CardTitle>
          <CardDescription>
            Enter your information to get started with medi assist ai.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="full-name">Full Name</Label>
              <Input 
                id="full-name" 
                placeholder="John Doe" 
                required 
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={loading}
              />
            </div>
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
              <Label htmlFor="password">Password (min. 6 characters)</Label>
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
              Create an account
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
            Already have an account?{" "}
            <Link href="/" className="underline">
              Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
