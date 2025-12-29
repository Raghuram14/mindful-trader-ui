/**
 * Export Insights Button Component
 *
 * Allows users to export their insights data as CSV
 */

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { insightsHistoryApi } from "../api/insightsHistory.api";
import { useToast } from "@/hooks/use-toast";

export function ExportInsightsButton() {
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const handleExport = async (days?: number) => {
    try {
      setIsExporting(true);

      // Calculate date range
      const endDate = new Date();
      const startDate = days
        ? new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000)
        : undefined;

      const blob = await insightsHistoryApi.exportData(
        startDate?.toISOString().split("T")[0],
        endDate.toISOString().split("T")[0]
      );

      // Download the file
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `mindful-trader-insights-${
        endDate.toISOString().split("T")[0]
      }.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Export successful",
        description: "Your insights data has been downloaded",
      });
    } catch (error) {
      console.error("Export failed:", error);
      toast({
        title: "Export failed",
        description: "Failed to export insights data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={isExporting}
          className="gap-2"
        >
          {isExporting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Exporting...
            </>
          ) : (
            <>
              <Download className="h-4 w-4" />
              Export
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>Export Time Range</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => handleExport(30)}>
          Last 30 days
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport(90)}>
          Last 90 days
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport(180)}>
          Last 6 months
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => handleExport()}>
          All data
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
