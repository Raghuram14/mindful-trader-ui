import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Keyboard } from "lucide-react";

interface KeyboardShortcutsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const shortcuts = [
  {
    category: "Navigation",
    items: [
      { keys: ["←"], description: "Previous page" },
      { keys: ["→"], description: "Next page" },
    ],
  },
  {
    category: "Views",
    items: [
      { keys: ["L"], description: "Switch to list view" },
      { keys: ["C"], description: "Switch to calendar view" },
    ],
  },
  {
    category: "Actions",
    items: [
      { keys: ["F"], description: "Toggle filters" },
      { keys: ["⌘", "K"], description: "Focus search (Cmd+K or Ctrl+K)" },
      { keys: ["Esc"], description: "Close dialogs" },
    ],
  },
  {
    category: "Help",
    items: [{ keys: ["?"], description: "Show keyboard shortcuts" }],
  },
];

export function KeyboardShortcutsDialog({
  open,
  onOpenChange,
}: KeyboardShortcutsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Keyboard className="w-5 h-5 text-primary" />
            <DialogTitle>Keyboard Shortcuts</DialogTitle>
          </div>
          <DialogDescription>
            Use these keyboard shortcuts to navigate faster
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {shortcuts.map((section) => (
            <div key={section.category}>
              <h3 className="text-sm font-semibold text-foreground mb-3">
                {section.category}
              </h3>
              <div className="space-y-2">
                {section.items.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between py-2 px-3 rounded-lg bg-secondary/50"
                  >
                    <span className="text-sm text-muted-foreground">
                      {item.description}
                    </span>
                    <div className="flex items-center gap-1">
                      {item.keys.map((key, keyIndex) => (
                        <span
                          key={keyIndex}
                          className="flex items-center gap-1"
                        >
                          {keyIndex > 0 && (
                            <span className="text-xs text-muted-foreground">
                              +
                            </span>
                          )}
                          <Badge
                            variant="outline"
                            className="font-mono text-xs px-2 py-1"
                          >
                            {key}
                          </Badge>
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
