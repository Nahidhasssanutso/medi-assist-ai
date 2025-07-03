
"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { analyzeSymptoms } from "@/ai/flows/symptom-analysis";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Upload, X } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useAuth } from "@/context/auth-context";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

const toDataURL = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

export default function SymptomAnalyzerPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [symptoms, setSymptoms] = useState("");
  const [affectedPlaceImage, setAffectedPlaceImage] = useState<File | null>(null);
  const [affectedPlaceImagePreview, setAffectedPlaceImagePreview] = useState<string | null>(null);
  const [doctorReportImage, setDoctorReportImage] = useState<File | null>(null);
  const [doctorReportImagePreview, setDoctorReportImagePreview] = useState<string | null>(null);
  const [seenDoctor, setSeenDoctor] = useState("no");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: React.Dispatch<React.SetStateAction<File | null>>,
    previewSetter: React.Dispatch<React.SetStateAction<string | null>>
  ) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setter(file);
      previewSetter(URL.createObjectURL(file));
    }
  };

  const removeImage = (
    setter: React.Dispatch<React.SetStateAction<File | null>>,
    previewSetter: React.Dispatch<React.SetStateAction<string | null>>
  ) => {
    setter(null);
    previewSetter(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!symptoms.trim()) {
      setError("Please describe your symptoms.");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const affectedPlacePhoto = affectedPlaceImage ? await toDataURL(affectedPlaceImage) : undefined;
      const doctorReportPhoto = doctorReportImage ? await toDataURL(doctorReportImage) : undefined;

      const result = await analyzeSymptoms({
        symptoms,
        seenDoctor: seenDoctor === "yes",
        affectedPlacePhoto,
        doctorReportPhoto,
      });

      if (user) {
        await addDoc(collection(db, "reports"), {
          userId: user.uid,
          createdAt: serverTimestamp(),
          symptoms: symptoms,
          seenDoctor: seenDoctor === 'yes',
          report: result,
        });
      }

      localStorage.setItem("analysisResult", JSON.stringify(result));
      router.push("/analysis-report");

    } catch (err) {
      setError("An error occurred during analysis. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="grid flex-1 items-start gap-4 md:gap-8">
        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>AI Symptom Analyzer</CardTitle>
              <CardDescription>
                Provide details about your symptoms for a preliminary AI analysis.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
              <div className="grid gap-2">
                <Label htmlFor="symptoms">1. Describe Your Symptoms</Label>
                <Textarea
                  id="symptoms"
                  placeholder="e.g., I have a persistent dry cough, a slight fever, and feel tired..."
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  rows={5}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label>2. Upload a Photo of the Affected Area (Optional)</Label>
                {affectedPlaceImagePreview ? (
                   <div className="relative group w-40 h-40">
                      <Image src={affectedPlaceImagePreview} alt="Affected area preview" layout="fill" className="rounded-lg object-cover" />
                      <button type="button" onClick={() => removeImage(setAffectedPlaceImage, setAffectedPlaceImagePreview)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                ) : (
                    <Label htmlFor="affected-place-image" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted/75">
                        <Upload className="w-8 h-8 mb-3 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span></p>
                        <Input id="affected-place-image" type="file" className="hidden" onChange={(e) => handleImageChange(e, setAffectedPlaceImage, setAffectedPlaceImagePreview)} accept="image/*" />
                    </Label>
                )}
              </div>

              <div className="grid gap-2">
                <Label>3. Have you visited a doctor for this issue?</Label>
                <RadioGroup value={seenDoctor} onValueChange={setSeenDoctor} className="flex gap-4">
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id="r-yes" />
                        <Label htmlFor="r-yes">Yes</Label>
                    </div>
                     <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id="r-no" />
                        <Label htmlFor="r-no">No</Label>
                    </div>
                </RadioGroup>
              </div>

              {seenDoctor === 'yes' && (
                <div className="grid gap-2">
                    <Label>4. Upload Doctor's Report (Optional)</Label>
                     {doctorReportImagePreview ? (
                        <div className="relative group w-40 h-40">
                            <Image src={doctorReportImagePreview} alt="Doctor report preview" layout="fill" className="rounded-lg object-cover" />
                            <button type="button" onClick={() => removeImage(setDoctorReportImage, setDoctorReportImagePreview)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    ) : (
                        <Label htmlFor="doctor-report-image" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted/75">
                            <Upload className="w-8 h-8 mb-3 text-muted-foreground" />
                            <p className="text-sm text-muted-foreground"><span className="font-semibold">Click to upload report</span></p>
                            <Input id="doctor-report-image" type="file" className="hidden" onChange={(e) => handleImageChange(e, setDoctorReportImage, setDoctorReportImagePreview)} accept="image/*" />
                        </Label>
                    )}
                </div>
              )}

            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={loading} size="lg">
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Analyze My Symptoms
              </Button>
            </CardFooter>
          </Card>
        </form>

        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </div>
    </DashboardLayout>
  );
}
