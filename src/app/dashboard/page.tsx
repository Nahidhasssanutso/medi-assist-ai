
"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { DashboardLayout } from "@/components/dashboard-layout";
import { useAuth } from "@/context/auth-context";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, orderBy, limit } from "firebase/firestore";
import { type SymptomAnalysisOutput } from "@/ai/flows/symptom-analysis";
import { format } from "date-fns";

const chartData = [
  { month: "Jan", score: 65 },
  { month: "Feb", score: 72 },
  { month: "Mar", score: 78 },
  { month: "Apr", score: 75 },
  { month: "May", score: 82 },
  { month: "Jun", score: 85 },
];

interface AnalysisRecord {
  id: string;
  createdAt: { seconds: number; nanoseconds: number; };
  report: SymptomAnalysisOutput;
  symptoms: string;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [recentAnalyses, setRecentAnalyses] = useState<AnalysisRecord[]>([]);

  useEffect(() => {
    const fetchAnalyses = async () => {
      if (!user) {
        setLoading(false);
        return;
      };

      setLoading(true);
      try {
        const reportsRef = collection(db, "reports");
        const q = query(
          reportsRef, 
          where("userId", "==", user.uid), 
          orderBy("createdAt", "desc"),
          limit(5)
        );
        const querySnapshot = await getDocs(q);
        const analyses: AnalysisRecord[] = [];
        querySnapshot.forEach((doc) => {
          analyses.push({ id: doc.id, ...doc.data() } as AnalysisRecord);
        });
        setRecentAnalyses(analyses);
      } catch (error) {
        console.error("Error fetching analyses:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyses();
  }, [user]);

  return (
    <DashboardLayout>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Health Score</CardDescription>
            {loading ? (
              <Skeleton className="h-8 w-20 mt-1" />
            ) : (
              <CardTitle className="text-4xl text-primary">85</CardTitle>
            )}
          </CardHeader>
          <CardContent>
            {loading ? (
              <>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4 mt-2" />
              </>
            ) : (
              <>
                <div className="text-xs text-muted-foreground">
                  +5 since last month
                </div>
                <Progress value={85} className="mt-2 h-2" />
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Next Check-up</CardDescription>
            {loading ? (
              <Skeleton className="h-8 w-32 mt-1" />
            ) : (
              <CardTitle className="text-4xl">25</CardTitle>
            )}
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-4 w-full" />
            ) : (
              <div className="text-xs text-muted-foreground">Days remaining</div>
            )}
          </CardContent>
          <CardFooter>
            {loading ? (
              <Skeleton className="h-4 w-24" />
            ) : (
              <div className="text-sm text-muted-foreground">Annual Physical</div>
            )}
          </CardFooter>
        </Card>
        <Card className="sm:col-span-2 bg-gradient-to-br from-primary/80 to-primary text-primary-foreground">
          <CardHeader>
            <CardTitle>AI Wellness Tip</CardTitle>
            <CardDescription className="text-primary-foreground/80">
              Based on your recent activity
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-full bg-white/30" />
                <Skeleton className="h-4 w-4/5 bg-white/30" />
              </div>
            ) : (
              <p className="text-lg">
                Consider adding more leafy greens to your diet for a natural
                boost in energy and vitamins.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 mt-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Health Trends</CardTitle>
            <CardDescription>Your health score over time.</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            {loading ? (
              <Skeleton className="h-[250px] w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" stroke="#888888" fontSize={12} />
                  <YAxis stroke="#888888" fontSize={12} domain={[50, 100]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--background))",
                      border: "1px solid hsl(var(--border))",
                    }}
                  />
                  <Bar dataKey="score" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Recent Analyses</CardTitle>
            <CardDescription>
              Your recent interactions with the AI analyzer.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Diagnosis</TableHead>
                    <TableHead className="text-right">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentAnalyses.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={2} className="text-center h-24">No recent analyses found.</TableCell>
                    </TableRow>
                  ) : (
                    recentAnalyses.map((analysis) => (
                      <TableRow key={analysis.id}>
                        <TableCell>
                          <div className="font-medium">{analysis.report.diseaseInfo.name}</div>
                          <div className="text-sm text-muted-foreground truncate max-w-xs">
                            {analysis.symptoms}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          {analysis.createdAt ? format(new Date(analysis.createdAt.seconds * 1000), "PP") : "N/A"}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
