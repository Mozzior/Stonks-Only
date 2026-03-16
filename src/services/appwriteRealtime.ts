import { appwrite } from "../utils/appwrite";

export type RealtimeHandler<TPayload = unknown> = (payload: TPayload) => void;

export function subscribeAppwriteRealtime<TPayload = unknown>(
  channels: string[],
  onEvent: RealtimeHandler<TPayload>,
) {
  return appwrite.client.subscribe(channels, (event: { payload: unknown }) => {
    onEvent(event.payload as TPayload);
  });
}
