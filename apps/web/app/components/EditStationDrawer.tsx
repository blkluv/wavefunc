"use client";

import React from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { Plus, Trash, X, AlertCircle } from "lucide-react";
import {
  Station,
  StationSchema,
  StationFormData,
  createRadioEvent,
} from "@wavefunc/common";
import { Textarea } from "@/components/ui/textarea";
import { nostrService } from "@/services/ndk";
import { NDKEvent } from "@nostr-dev-kit/ndk";
import {
  deleteStation,
  updateStation,
} from "@wavefunc/common/src/nostr/publish";

interface EditStationDrawerProps {
  station?: Station;
  isOpen: boolean;
  onClose: () => void;
  onSave: (station: Partial<Station>) => void;
  onDelete?: (stationId: string) => void;
}

const emptyStream = {
  url: "",
  format: "audio/mpeg",
  quality: {
    bitrate: 128000,
    codec: "mp3",
    sampleRate: 44100,
  },
  primary: true,
};

export function EditStationDrawer({
  station,
  isOpen,
  onClose,
  onSave,
  onDelete,
}: EditStationDrawerProps) {
  const [isDeleting, setIsDeleting] = React.useState(false);

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<StationFormData>({
    resolver: zodResolver(StationSchema),
    defaultValues: station || {
      name: "",
      description: "",
      website: "",
      genre: "",
      imageUrl: "",
      streams: [emptyStream],
      tags: [],
    },
  });

  React.useEffect(() => {
    if (station) {
      reset(station);
    }
  }, [station, reset]);

  const streams = watch("streams");

  const onSubmit = async (data: StationFormData) => {
    try {
      const ndk = nostrService.getNDK();

      // Determine if this is an update or new creation
      if (station?.naddr) {
        // If naddr exists, this is an update to an existing station
        console.log("Updating existing station with naddr:", station.naddr);

        // Use the dedicated updateStation function
        const ndkEvent = await updateStation(ndk, station, {
          name: data.name,
          description: data.description,
          website: data.website,
          streams: data.streams,
          genre: data.genre,
          imageUrl: data.imageUrl,
        });

        // Log the d-tag after publishing
        const publishedDTag = ndkEvent.tags.find((tag) => tag[0] === "d");
        console.log("D-tag in updated event:", publishedDTag);

        // Create updated station with preserved naddr
        const updatedStation = {
          ...data,
          naddr: station.naddr,
          id: station.id,
          pubkey: station.pubkey || ndkEvent.pubkey,
          tags: ndkEvent.tags,
        };

        onSave(updatedStation);
        onClose();
      } else {
        // This is a new station creation
        // Create tags array
        const tags = [
          ["genre", data.genre],
          ["thumbnail", data.imageUrl],
          ["client", "nostr_radio"],
        ];

        const event = createRadioEvent(
          {
            name: data.name,
            description: data.description,
            website: data.website,
            streams: data.streams,
          },
          tags
        );

        const ndkEvent = new NDKEvent(ndk, event);

        if (ndkEvent) {
          await ndkEvent.publish();

          // Log the created d-tag
          const dTag = ndkEvent.tags.find((tag) => tag[0] === "d");
          console.log("D-tag in new station:", dTag);

          const newStation = {
            ...data,
            id: ndkEvent.id,
            pubkey: ndkEvent.pubkey,
            tags: ndkEvent.tags,
            // The naddr will be populated when mapping from subscription
          };

          onSave(newStation);
          onClose();
        }
      }
    } catch (error) {
      console.error("Error creating/updating station:", error);
    }
  };

  const handleAddStream = () => {
    setValue("streams", [...streams, { ...emptyStream, primary: false }]);
  };

  const handleRemoveStream = (index: number) => {
    setValue(
      "streams",
      streams.filter((_, i) => i !== index)
    );
  };

  const handleDeleteStation = async () => {
    if (!station || !station.id) return;

    try {
      const ndk = nostrService.getNDK();
      await deleteStation(ndk, station.id);

      if (onDelete) {
        onDelete(station.id);
      }

      onClose();
    } catch (error) {
      console.error("Error deleting station:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-[90vw] sm:max-w-[540px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-primary text-lg font-press-start-2p">
            {station ? "Edit Station" : "Create Station"}
          </SheetTitle>
          <SheetDescription className="font-press-start-2p text-xs">
            {station ?
              "Make changes to your radio station here."
            : "Create a new radio station."}
          </SheetDescription>
        </SheetHeader>

        {isDeleting ?
          <div className="mt-6 space-y-4">
            <div className="flex items-center space-x-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <h3 className="font-semibold">
                Are you sure you want to delete this station?
              </h3>
            </div>
            <p className="text-sm text-muted-foreground">
              This action cannot be undone. The station will be permanently
              deleted.
            </p>
            <div className="flex space-x-2 mt-6">
              <Button
                variant="destructive"
                onClick={handleDeleteStation}
                className="mr-2"
              >
                <Trash className="h-4 w-4 mr-2" />
                Yes, Delete Station
              </Button>
              <Button variant="outline" onClick={() => setIsDeleting(false)}>
                Cancel
              </Button>
            </div>
          </div>
        : <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-6">
            {station?.naddr}
            <div className="space-y-2">
              <Label htmlFor="name">Station Name</Label>
              <Controller
                name="name"
                control={control}
                render={({ field }) => <Input {...field} />}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={watch("description") || ""}
                onChange={(e) => setValue("description", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                type="url"
                value={watch("website") || ""}
                onChange={(e) => setValue("website", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="genre">Genre</Label>
              <Input
                id="genre"
                value={watch("genre") || ""}
                onChange={(e) => setValue("genre", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="imageUrl">Thumbnail URL</Label>
              <Input
                id="imageUrl"
                type="url"
                value={watch("imageUrl") || ""}
                onChange={(e) => setValue("imageUrl", e.target.value)}
                required
              />
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label>Streams</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddStream}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Stream
                </Button>
              </div>
              {streams.map((stream, index) => (
                <div key={index} className="space-y-2 p-4 border rounded-lg">
                  <div className="flex justify-between">
                    <Label>Stream {index + 1}</Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveStream(index)}
                      disabled={streams.length === 1}
                    >
                      <Trash className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                  <Controller
                    name={`streams.${index}.url`}
                    control={control}
                    render={({ field }) => (
                      <Input {...field} placeholder="Stream URL" />
                    )}
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label>Format</Label>
                      <Input
                        value={stream.format || ""}
                        onChange={(e) =>
                          setValue(`streams.${index}.format`, e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <Label>Primary</Label>
                      <input
                        type="checkbox"
                        checked={stream.primary}
                        onChange={(e) =>
                          setValue(`streams.${index}.primary`, e.target.checked)
                        }
                        className="mt-2"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between space-x-2">
              <Button type="submit" className="bg-primary text-white">
                {station ? "Save Changes" : "Create Station"}
              </Button>
              <div className="flex space-x-2">
                {station && (
                  <Button
                    type="button"
                    onClick={() => setIsDeleting(true)}
                    variant="destructive"
                  >
                    <Trash className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                )}
                <Button type="button" onClick={onClose} variant="outline">
                  <X className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
              </div>
            </div>
          </form>
        }
      </SheetContent>
    </Sheet>
  );
}
