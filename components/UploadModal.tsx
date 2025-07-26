"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Dropzone from "react-dropzone";
import React, { useCallback, useState } from "react";
import { toast } from "sonner";
import useSupabaseUpload from "./hooks/useSupabaseUpload";
import { useRouter } from "next/navigation";
import { trpc } from "@/trpc/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { RecordingBasics } from "./RecordingBasics";
import { RecordingMinutesLeft } from "./RecordingMinutesLeft";
import { useApiKeys } from "./ApiKeyProvider";
import useLocalStorage from "./hooks/useLocalStorage";
import { useLimits } from "./hooks/useLimits";

// Move getDuration outside handleDrop
const getDuration = (file: File) =>
  new Promise<number>((resolve, reject) => {
    const audio = document.createElement("audio");
    audio.preload = "metadata";
    audio.onloadedmetadata = () => {
      resolve(audio.duration);
    };
    audio.onerror = () => reject("Failed to load audio");
    audio.src = URL.createObjectURL(file);
  });

export function UploadModal({ onClose }: { onClose: () => void }) {
  const [language, setLanguage] = useLocalStorage("language", "en");

  const [isProcessing, setIsProcessing] = useState<
    "idle" | "uploading" | "transcribing"
  >("idle");

  const [isDragActive, setIsDragActive] = useState(false);
  const { uploadToSupabase } = useSupabaseUpload();
  const router = useRouter();
  const { assemblyAiKey } = useApiKeys();
  const isBYOK = !!assemblyAiKey;
  const transcribeMutation = useMutation({
    mutationFn: trpc.whisper.transcribeFromS3.mutate
  });
  const queryClient = useQueryClient();
  const { minutesData, isLoading } = useLimits();

  const handleDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) {
        toast.error(
          "Bad file selected. Please make sure to select an audio file."
        );
        return;
      }
      setIsProcessing("uploading");
      try {
        // Run duration extraction and Supabase upload in parallel
        const [duration, { url }] = await Promise.all([
          getDuration(file),
          uploadToSupabase(file),
        ]);
        // Call tRPC mutation
        setIsProcessing("transcribing");
        const { id } = await transcribeMutation.mutateAsync({
          audioUrl: url,
          language,
          durationSeconds: Math.round(duration),
        });
        // Invalidate dashboard query
        await queryClient.invalidateQueries({
          queryKey: trpc.whisper.listWhispers.queryKey(),
        });
        router.push(`/whispers/${id}`);
      } catch (err) {
        toast.error("Failed to transcribe audio. Please try again.");
        setIsProcessing("idle");
      }
    },
    [uploadToSupabase, transcribeMutation, router, language]
  );

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent
        showCloseButton={false}
        className="!max-w-[392px] !p-0 border border-gray-200 rounded-tl-xl rounded-tr-xl bg-white overflow-hidden gap-0"
      >
        <DialogHeader className="p-0">
          <DialogTitle className="sr-only">Upload Voice Audio</DialogTitle>
        </DialogHeader>

        {isProcessing !== "idle" ? (
          <div className="flex flex-col items-center justify-center h-full gap-4 p-4">
            <img
              src="/loading.svg"
              alt="Loading"
              className="w-8 h-8 animate-spin"
            />
            <p className="text-gray-500">
              {isProcessing === "uploading"
                ? "Uploading audio file"
                : "Transcribing audio..."}
              <span className="animate-pulse">...</span>
            </p>
          </div>
        ) : (
          <>
            <div className="flex flex-col items-center w-full bg-white">
              <RecordingBasics
                language={language}
                setLanguage={setLanguage}
              />
            </div>

            <div className="p-4 pt-0">
              <Dropzone
                onDrop={handleDrop}
                onDragEnter={() => setIsDragActive(true)}
                onDragLeave={() => setIsDragActive(false)}
                accept={{
                  "audio/*": [
                    ".mp3",
                    ".wav",
                    ".m4a",
                    ".webm",
                    ".mp4",
                    ".aac",
                    ".flac",
                  ],
                }}
              >
                {({ getRootProps, getInputProps }) => (
                  <div
                    {...getRootProps()}
                    className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
                      isDragActive
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                  >
                    <input {...getInputProps()} />
                    <div className="flex flex-col items-center justify-center gap-2">
                      <img
                        src="/upload.svg"
                        alt="Upload"
                        className="w-8 h-8 mb-2"
                      />
                      <p className="text-sm text-gray-600">
                        Drag and drop an audio file here, or click to select
                      </p>
                      <p className="text-xs text-gray-500">
                        Supports MP3, WAV, M4A, and more
                      </p>
                    </div>
                  </div>
                )}
              </Dropzone>

              <RecordingMinutesLeft
                className="mt-4"
                isBYOK={isBYOK}
                isLoading={isLoading}
                minutesData={minutesData}
              />
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
