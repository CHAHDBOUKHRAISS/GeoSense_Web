import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50">
      <Card className="w-full max-w-md mx-4 shadow-lg border-2 border-slate-200">
        <CardContent className="pt-6 pb-6 text-center space-y-4">
          <AlertCircle className="h-16 w-16 text-destructive mx-auto opacity-80" />
          <h1 className="text-3xl font-serif font-bold text-slate-900">404 Page Not Found</h1>
          <p className="text-muted-foreground text-sm">
            The resource you are looking for has been moved or does not exist.
          </p>
          <div className="pt-4">
            <Link href="/" className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
              Return to Dashboard
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
