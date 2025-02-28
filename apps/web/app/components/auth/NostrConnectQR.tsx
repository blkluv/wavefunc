"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { nostrService } from "@/services/ndk";
import {
  NDKEvent,
  NDKKind,
  NDKNip46Signer,
  NDKPrivateKeySigner,
} from "@nostr-dev-kit/ndk";
import { CopyIcon, Loader2 } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useEffect, useMemo, useState } from "react";
import { useSetAtom } from "jotai";
import { loginWithNip46 } from "../../atoms/auth";

interface NostrConnectQRProps {
  onError?: (error: string) => void;
}

export const NOSTR_CONNECT_KEY = "nostr_connect_url";
export const NOSTR_LOCAL_SIGNER_KEY = "nostr_local_signer";

export function NostrConnectQR({ onError }: NostrConnectQRProps) {
  const loginWithNip46Signer = useSetAtom(loginWithNip46);
  const [localSigner, setLocalSigner] = useState<NDKPrivateKeySigner | null>(
    null
  );
  const [localPubkey, setLocalPubkey] = useState<string | null>(null);
  const [tempSecret, setTempSecret] = useState<string | null>(null);
  const [listening, setListening] = useState(false);
  const [generatingConnectionUrl, setGeneratingConnectionUrl] = useState(false);

  useEffect(() => {
    setGeneratingConnectionUrl(true);
    const signer = NDKPrivateKeySigner.generate();
    setLocalSigner(signer);
    signer.user().then((user) => {
      setLocalPubkey(user.pubkey);
      setGeneratingConnectionUrl(false);
    });

    return () => {
      setLocalSigner(null);
      setLocalPubkey(null);
    };
  }, []);

  const connectionUrl = useMemo(() => {
    if (!localPubkey) return null;
    const localMachineIp = process.env.NEXT_PUBLIC_LOCAL_MACHINE_IP;
    const relay = `ws://${localMachineIp}:3002`;
    const host = location.protocol + "//" + localMachineIp;
    const secret = Math.random().toString(36).substring(2, 15);

    setTempSecret(secret);

    const params = new URLSearchParams();
    params.set("relay", relay);
    params.set("name", "WaveFunc");
    params.set("url", host);
    params.set("secret", secret);

    return `nostrconnect://${localPubkey}?` + params.toString();
  }, [localPubkey]);

  const constructBunkerUrl = (event: NDKEvent) => {
    const pTag = event.tags.find((tag) => tag[0] === "p");
    if (!pTag?.[1]) throw new Error("No pubkey in p tag");

    const baseUrl = `bunker://${event.pubkey}?`;
    const localMachineIp = process.env.NEXT_PUBLIC_LOCAL_MACHINE_IP;
    const relay = `ws://${localMachineIp}:3002`;

    const params = new URLSearchParams();
    params.set("relay", relay);
    params.set("secret", tempSecret ?? "");

    return baseUrl + params.toString();
  };

  useEffect(() => {
    if (!localPubkey || !localSigner) return;

    setListening(true);
    const ndk = nostrService.getNDK();
    const ackSub = ndk.subscribe({
      kinds: [NDKKind.NostrConnect],
      "#p": [localPubkey],
      since: Math.floor(Date.now() / 1000),
      limit: 1,
    });

    ackSub.on("event", async (event) => {
      try {
        await event.decrypt(undefined, localSigner);
        const response = JSON.parse(event.content);

        if (response.result && response.result === tempSecret) {
          const bunkerUrl = constructBunkerUrl(event);
          const nip46Signer = new NDKNip46Signer(ndk, bunkerUrl, localSigner);
          await nip46Signer.blockUntilReady();
          setListening(false);

          localStorage.setItem(
            NOSTR_LOCAL_SIGNER_KEY,
            localSigner.privateKey ?? ""
          );
          localStorage.setItem(NOSTR_CONNECT_KEY, bunkerUrl);

          await loginWithNip46Signer(nip46Signer);
        }
      } catch (error) {
        console.error("Failed to process event:", error);
        onError?.(error instanceof Error ? error.message : "Failed to connect");
      }
    });

    return () => {
      ackSub.stop();
      setListening(false);
    };
  }, [
    connectionUrl,
    localPubkey,
    localSigner,
    loginWithNip46Signer,
    onError,
    tempSecret,
  ]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).catch((err) => {
      console.warn("Failed to copy:", err);
    });
  };

  return (
    <div className="flex flex-col items-center gap-4 py-4">
      {generatingConnectionUrl ?
        <div className="flex flex-col items-center gap-2 py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-sm text-muted-foreground">
            Generating connection...
          </p>
        </div>
      : connectionUrl ?
        <>
          <a
            href={connectionUrl}
            className="block hover:opacity-90 transition-opacity"
            target="_blank"
            rel="noopener noreferrer"
          >
            <QRCodeSVG value={connectionUrl} size={300} />
          </a>
          <div className="flex items-center gap-2 w-full">
            <Input
              value={connectionUrl}
              readOnly
              onClick={(e) => e.currentTarget.select()}
            />
            <Button
              variant="outline"
              size="icon"
              onClick={() => copyToClipboard(connectionUrl)}
            >
              <CopyIcon className="h-4 w-4" />
            </Button>
            {listening && <Loader2 className="h-4 w-4 animate-spin" />}
          </div>
        </>
      : <div className="flex flex-col items-center gap-2 py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-sm text-muted-foreground">
            Waiting for connection...
          </p>
        </div>
      }
    </div>
  );
}
