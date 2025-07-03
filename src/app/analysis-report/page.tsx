"use client";

import { useRouter, useSearchParams } from "next/navigation";
import React, { useState, useEffect } from "react";
import { type SymptomAnalysisOutput } from "@/ai/flows/symptom-analysis";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight, CheckCircle, HeartPulse, List, Pilcrow, Utensils, XCircle } from "lucide-react";

export default function AnalysisReportPage() {
  const router = useRouter();
  const [analysisResult, setAnalysisResult] = useState<SymptomAnalysisOutput | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const resultJson = localStorage.getItem("analysisResult");
    if (resultJson) {
      setAnalysisResult(JSON.parse(resultJson));
      // localStorage.removeItem("analysisResult"); // Or clear it after use
    }
    setLoading(false);
  }, []);

  const handleAskQuestion = () => {
    if (analysisResult) {
      localStorage.setItem("chatContext", JSON.stringify(analysisResult, null, 2));
    }
    router.push("/chat");
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-4">
          <Skeleton className="h-12 w-1/2" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </DashboardLayout>
    );
  }

  if (!analysisResult) {
    return (
      <DashboardLayout>
        <div className="text-center">
          <p>No analysis report found.</p>
          <Button onClick={() => router.push("/symptom-analyzer")} className="mt-4">
            Start a New Analysis
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const {
    diseaseInfo,
    whatToDoNow,
    recommendedMedicine,
    foodAndNutrition,
    whatNotToDo,
    recoveryEstimate,
    additionalInfo,
  } = analysisResult;

  return (
    <DashboardLayout>
      <div className="grid gap-6">
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                    <HeartPulse className="h-6 w-6 text-primary" />
                    Preliminary Analysis: {diseaseInfo.name} ({diseaseInfo.localName})
                </CardTitle>
                <CardDescription>{diseaseInfo.description}</CardDescription>
            </CardHeader>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
            <Card className="bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-green-800 dark:text-green-300">
                        <CheckCircle /> What To Do Now
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <ul className="list-disc space-y-2 pl-5">
                        {whatToDoNow.immediateSteps.map((step, i) => <li key={i}>{step}</li>)}
                    </ul>
                    <Alert>
                        <AlertTitle>Emergency Advice</AlertTitle>
                        <AlertDescription>{whatToDoNow.emergencyAdvice}</AlertDescription>
                    </Alert>
                </CardContent>
            </Card>

             <Card className="bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-red-800 dark:text-red-300">
                        <XCircle /> What NOT To Do
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <ul className="list-disc space-y-2 pl-5">
                        {whatNotToDo.map((item, i) => <li key={i}>{item}</li>)}
                    </ul>
                </CardContent>
            </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Pilcrow /> Medication Suggestions</CardTitle>
            <CardDescription>This is not a prescription. Consult a doctor before taking any medication.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recommendedMedicine.map((med, i) => (
              <div key={i} className="p-4 border rounded-lg">
                <h3 className="font-semibold">{med.name} ({med.localName})</h3>
                <p className="text-sm text-muted-foreground">{med.dosage} - {med.timing}</p>
                <p className="text-xs mt-1">{med.notes}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Utensils /> Food and Nutrition</CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                    <h4 className="font-semibold mb-2">Foods to Include</h4>
                    <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                        {foodAndNutrition.foodsToInclude.map((food, i) => <li key={i}>{food}</li>)}
                    </ul>
                </div>
                <div>
                    <h4 className="font-semibold mb-2">Foods to Avoid</h4>
                    <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                        {foodAndNutrition.foodsToAvoid.map((food, i) => <li key={i}>{food}</li>)}
                    </ul>
                </div>
                <div>
                    <h4 className="font-semibold mb-2">Hydration Tips</h4>
                    <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                        {foodAndNutrition.hydrationTips.map((tip, i) => <li key={i}>{tip}</li>)}
                    </ul>
                </div>
                 <div>
                    <h4 className="font-semibold mb-2">Lifestyle Guidelines</h4>
                    <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                        {foodAndNutrition.lifestyleGuidelines.map((tip, i) => <li key={i}>{tip}</li>)}
                    </ul>
                </div>
            </CardContent>
        </Card>

         <Card>
            <CardHeader>
                <CardTitle>Recovery & More Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <h4 className="font-semibold">Estimated Recovery Time</h4>
                    <p className="text-muted-foreground">{recoveryEstimate}</p>
                </div>
                <div>
                    <h4 className="font-semibold">Additional Information</h4>
                    <p className="text-muted-foreground">{additionalInfo}</p>
                </div>
            </CardContent>
        </Card>

        <div className="text-center py-4">
            <Button size="lg" onClick={handleAskQuestion}>
                Have a Question about this Report? Chat with AI
                <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
        </div>

      </div>
    </DashboardLayout>
  );
}
