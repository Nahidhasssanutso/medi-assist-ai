import { DashboardLayout } from "@/components/dashboard-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Apple, Pill, Fish, Leaf, Carrot } from "lucide-react";

const medicationSuggestions = [
  {
    name: "General Health",
    suggestion: "Consider a daily multivitamin to fill any nutritional gaps.",
    icon: Pill,
  },
  {
    name: "Headache",
    suggestion: "Over-the-counter pain relievers like Ibuprofen or Acetaminophen can be effective for tension headaches. Ensure to follow dosage instructions.",
    icon: Pill,
  },
  {
    name: "Fatigue",
    suggestion: "If fatigue persists, a Vitamin B12 supplement might be beneficial, but consult a doctor for underlying causes.",
    icon: Pill,
  },
];

const nutritionalAdvice = [
  {
    name: "Balanced Diet",
    suggestion: "Aim for a diet rich in fruits, vegetables, lean proteins, and whole grains. Proper hydration is also key.",
    icon: Apple,
  },
  {
    name: "Heart Health",
    suggestion: "Incorporate omega-3 fatty acids from sources like salmon or flaxseeds to support cardiovascular function.",
    icon: Fish,
  },
  {
    name: "Energy Boost",
    suggestion: "Complex carbohydrates like oats and brown rice provide sustained energy. Avoid sugary snacks that lead to energy crashes.",
    icon: Carrot,
  },
  {
    name: "Immune Support",
    suggestion: "Foods rich in Vitamin C (citrus fruits, bell peppers) and antioxidants (berries, leafy greens) can help strengthen your immune system.",
    icon: Leaf,
  },
];

export default function RecommendationsPage() {
  return (
    <DashboardLayout>
      <div className="grid gap-4 md:gap-8">
        <h1 className="text-2xl font-bold tracking-tight">AI Recommendations</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>Medication Suggestions</CardTitle>
            <CardDescription>
              General suggestions based on common symptoms. This is not a prescription.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {medicationSuggestions.map((item, index) => (
              <Card key={index} className="flex flex-col">
                <CardHeader className="flex flex-row items-center gap-4">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <item.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{item.name}</CardTitle>
                </CardHeader>
                <CardContent className="flex-1">
                  <p className="text-muted-foreground">{item.suggestion}</p>
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Nutritional Advice</CardTitle>
            <CardDescription>
              Tips for a healthier diet to support your well-being.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {nutritionalAdvice.map((item, index) => (
              <Card key={index} className="flex flex-col">
                <CardHeader className="flex flex-row items-center gap-4">
                   <div className="bg-accent/10 p-3 rounded-full">
                    <item.icon className="h-6 w-6 text-accent-foreground" />
                  </div>
                  <CardTitle className="text-lg">{item.name}</CardTitle>
                </CardHeader>
                <CardContent className="flex-1">
                  <p className="text-muted-foreground">{item.suggestion}</p>
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
