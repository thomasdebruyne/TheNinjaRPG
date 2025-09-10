"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "src/libs/shadui";
import { api } from "@/app/_trpc/client";
import Loader from "@/layout/Loader";
import { showMutationToast } from "@/libs/toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { generateAudioSchema, type GenerateAudioInput } from "@/validators/audio";

interface ContentAudioSelectorProps {
  relationId: string;
  value?: string | null;
  onChange: (url: string) => void;
}

const ContentAudioSelector: React.FC<ContentAudioSelectorProps> = (props) => {
  const { relationId, value, onChange } = props;
  const utils = api.useUtils();
  const [isOpen, setIsOpen] = useState(false);
  const form = useForm<GenerateAudioInput>({
    resolver: zodResolver(generateAudioSchema),
    defaultValues: {
      relationId,
      prompt: "",
      negativePrompt: undefined,
      secondsTotal: 1,
    },
    mode: "onChange",
  });

  const gen = api.audio.generate.useMutation({
    onSuccess: async (res) => {
      showMutationToast(res);
      if (res.success && res.url) {
        onChange(res.url);
        await utils.audio.getHistorical.invalidate();
      }
    },
  });

  const {
    data: history,
    fetchNextPage,
    hasNextPage,
  } = api.audio.getHistorical.useInfiniteQuery(
    { relationId, limit: 20 },
    {
      getNextPageParam: (p) => p.nextCursor,
      placeholderData: (p) => p,
      enabled: isOpen,
    },
  );
  const items = history?.pages.flatMap((p) => p.data) || [];

  return (
    <div className="flex flex-col justify-start">
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="w-full justify-between">
            {value ? "Change Sound" : "Pick / Generate Sound"}
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Sound Effect</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-6">
            <div className="space-y-3">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit((values) => {
                    gen.mutate({
                      relationId: values.relationId,
                      prompt: values.prompt.trim(),
                      negativePrompt: values.negativePrompt?.trim() || undefined,
                      secondsTotal: values.secondsTotal,
                    });
                  })}
                  className="space-y-3"
                >
                  <FormField
                    control={form.control}
                    name="prompt"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Prompt</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Prompt" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="negativePrompt"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Negative prompt (optional)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Negative prompt (optional)"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="secondsTotal"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Duration (seconds)</FormLabel>
                        <div className="flex items-center gap-2">
                          <FormControl>
                            <Input
                              type="number"
                              min={1}
                              max={5}
                              step={1}
                              className="w-28"
                              value={field.value}
                              onChange={(e) =>
                                field.onChange(
                                  Number.isFinite(e.currentTarget.valueAsNumber)
                                    ? e.currentTarget.valueAsNumber
                                    : 1,
                                )
                              }
                            />
                          </FormControl>
                          <span className="text-sm text-muted-foreground">seconds</span>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" disabled={gen.isPending}>
                    {gen.isPending ? <Loader noPadding size={22} /> : "Generate"}
                  </Button>
                </form>
              </Form>
            </div>

            <div className="space-y-2">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-96 overflow-auto">
                {items.map((s) => {
                  const selected = value && s.url && value === s.url;
                  return (
                    <div
                      key={s.id}
                      className={cn(
                        "border rounded p-2 space-y-2",
                        selected ? "border-green-500 bg-green-50" : "",
                      )}
                    >
                      <audio src={s.url ?? undefined} controls className="w-full" />
                      {s.prompt ? (
                        <div className="text-xs text-muted-foreground break-words">
                          {s.prompt}
                        </div>
                      ) : null}
                      {s.negativePrompt ? (
                        <div className="text-[10px] text-muted-foreground break-words">
                          − {s.negativePrompt}
                        </div>
                      ) : null}
                      <Button
                        variant={selected ? "default" : "secondary"}
                        className="w-full"
                        onClick={() => {
                          if (s.url) onChange(s.url);
                          setIsOpen(false);
                        }}
                      >
                        {selected ? "Selected" : "Use this"}
                      </Button>
                    </div>
                  );
                })}
              </div>
              {hasNextPage && (
                <Button variant="outline" onClick={() => fetchNextPage()}>
                  Load more
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ContentAudioSelector;
