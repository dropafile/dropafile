import { useState } from "react";
import {
  ArrowRight,
  Download,
  Link2,
  LoaderCircle,
  LogIn,
  QrCode,
  Shield,
  Upload,
  Users,
  Zap,
} from "lucide-react";
import { Dropzone } from "@/components/Dropzone";
import { JoinSessionDialog } from "@/components/JoinSessionDialog";
import { PendingUploadsList } from "@/components/SessionFilesList";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useSession } from "@/contexts/session-context";

const steps = [
  {
    icon: Upload,
    title: "Drop a file",
    description:
      "Drag and drop or browse. A live session spins up the moment your file is ready.",
  },
  {
    icon: QrCode,
    title: "Share the session",
    description:
      "Send a QR code or link. Anyone on the page joins the same room instantly.",
  },
  {
    icon: Download,
    title: "Download while live",
    description:
      "Peers see your files in real time and download directly while you stay connected.",
  },
] as const;

const useCases = [
  {
    icon: Users,
    title: "Meeting handoffs",
    description:
      "Swap decks, screenshots, or exports with everyone in the room without email threads.",
  },
  {
    icon: Zap,
    title: "Quick cross-device sends",
    description:
      "Move a file from laptop to phone by opening the same session link on both devices.",
  },
  {
    icon: Link2,
    title: "Client deliverables",
    description:
      "Share a temporary link for a review package. Remove files when the handoff is done.",
  },
  {
    icon: Shield,
    title: "Ephemeral by design",
    description:
      "No accounts, no permanent cloud storage. Files disappear when owners leave or remove them.",
  },
] as const;

export function LandingPage() {
  const { enqueueFiles, pendingUploads, createLiveSession, creating } =
    useSession();
  const [joinOpen, setJoinOpen] = useState(false);

  return (
    <div className="space-y-20 pb-12 md:space-y-28">
      <JoinSessionDialog
        open={joinOpen}
        onClose={() => setJoinOpen(false)}
      />
      <section className="relative overflow-hidden rounded-2xl border bg-muted/30">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:28px_28px] [mask-image:radial-gradient(ellipse_80%_60%_at_50%_0%,#000_70%,transparent_110%)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 left-1/2 size-[28rem] -translate-x-1/2 rounded-full bg-primary/5 blur-3xl"
        />

        <div className="relative px-6 py-14 md:px-12 md:py-20">
          <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
            <Badge variant="secondary" className="mb-5">
              Live file sharing
            </Badge>

            <h1 className="text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
              Drop a file.
              <span className="block text-muted-foreground">
                Everyone gets it live.
              </span>
            </h1>

            <p className="mt-5 max-w-2xl text-base text-muted-foreground md:text-lg">
              dropafile creates a real-time session the moment you upload.
              Share a QR or link so others can join, see what you shared, and
              download while you&apos;re online.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Button
                type="button"
                size="lg"
                onClick={() => {
                  void createLiveSession();
                }}
                disabled={creating}
              >
                {creating ? (
                  <LoaderCircle className="size-4 animate-spin" />
                ) : (
                  <Link2 className="size-4" />
                )}
                Start live session
              </Button>
              <Button
                type="button"
                size="lg"
                variant="outline"
                onClick={() => setJoinOpen(true)}
                disabled={creating}
              >
                <LogIn className="size-4" />
                Join session
              </Button>
              <Button
                type="button"
                size="lg"
                variant="outline"
                onClick={() => {
                  document
                    .getElementById("landing-dropzone")
                    ?.scrollIntoView({ behavior: "smooth", block: "center" });
                }}
              >
                Drop a file instead
                <ArrowRight className="size-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section id="landing-dropzone" className="scroll-mt-8">
        <Card className="overflow-hidden shadow-sm">
          <CardHeader className="border-b bg-muted/20">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div className="space-y-1">
                <CardTitle className="text-xl">Start with a file</CardTitle>
                <CardDescription className="max-w-xl text-base">
                  Your first upload opens a live session automatically. Or use
                  the header button to create a room first and share the link.
                </CardDescription>
              </div>
              <Badge variant="outline" className="w-fit shrink-0">
                No sign-up
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <PendingUploadsList uploads={pendingUploads} />
            <Dropzone onFilesSelected={enqueueFiles} />
          </CardContent>
        </Card>
      </section>

      <section className="space-y-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight">How it works</h2>
          <p className="mt-3 text-muted-foreground">
            Three steps from drop to download — built around live sessions, not
            static upload links.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {steps.map((step, index) => (
            <Card key={step.title} className="relative gap-4 py-5 shadow-sm">
              <CardHeader className="gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-lg border bg-muted/50">
                    <step.icon className="size-5 text-foreground" />
                  </div>
                  <span className="text-sm font-medium text-muted-foreground">
                    Step {index + 1}
                  </span>
                </div>
                <CardTitle className="text-lg">{step.title}</CardTitle>
                <CardDescription className="text-sm leading-relaxed">
                  {step.description}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      <section className="space-y-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight">Built for</h2>
          <p className="mt-3 text-muted-foreground">
            When you need files in front of people right now — not buried in
            inboxes or waiting on sync folders.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {useCases.map((item) => (
            <Card
              key={item.title}
              className={cn("gap-4 py-5 shadow-sm transition-colors hover:bg-muted/20")}
            >
              <CardHeader className="gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg border bg-background">
                  <item.icon className="size-5" />
                </div>
                <CardTitle className="text-lg">{item.title}</CardTitle>
                <CardDescription className="text-sm leading-relaxed">
                  {item.description}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border bg-muted/30 px-6 py-12 text-center md:px-12">
        <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
          Ready when you are
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
          Start empty and share the link, or drop a file and go live in one
          move. Leave the session anytime — your room closes when you do.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button
            type="button"
            size="lg"
            onClick={() => {
              void createLiveSession();
            }}
            disabled={creating}
          >
            {creating ? (
              <LoaderCircle className="size-4 animate-spin" />
            ) : (
              <Link2 className="size-4" />
            )}
            Create a session
          </Button>
          <Button
            type="button"
            size="lg"
            variant="ghost"
            onClick={() => {
              document
                .getElementById("landing-dropzone")
                ?.scrollIntoView({ behavior: "smooth", block: "center" });
            }}
          >
            Upload a file
          </Button>
        </div>
      </section>
    </div>
  );
}
