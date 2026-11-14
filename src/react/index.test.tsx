// @vitest-environment happy-dom
import { act, StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import type { StreamBody, StreamId } from "../client/index.js";
import { useStream } from "./index.js";

// Stands in for the Convex subscription: a subscribed stream id returns the
// body stored for it, and "skip" returns nothing.
const persisted = new Map<string, StreamBody>();
vi.mock("convex/react", () => ({
  useQuery: (_query: unknown, args: { streamId: string } | "skip") =>
    args === "skip" ? undefined : persisted.get(args.streamId),
}));
// Tells React that `act` drives the renders, as testing libraries do.
Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

const query = {} as Parameters<typeof useStream>[0];
const address = "https://example.convex.site/chat-stream";

type FetchInit = { headers: Record<string, string>; signal: AbortSignal };
type Props = { url: URL; authToken: string; headers: Record<string, string> };
const fetchMock = vi.fn<(url: URL, init: FetchInit) => Promise<Response>>();

function Stream({ url, ...opts }: Props) {
  const { text, status } = useStream(query, url, true, "a" as StreamId, opts);
  return `${status}: ${text}`;
}

beforeEach(() => {
  persisted.clear();
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

test.each([
  ["the URL object", (p: Props) => ({ ...p, url: new URL(address) })],
  ["the token", (p: Props) => ({ ...p, authToken: "new" })],
  ["a header", (p: Props) => ({ ...p, headers: { "X-Trace": "new" } })],
])("changing %s does not restart the request", (_name, change) => {
  fetchMock.mockReturnValue(new Promise(() => {}));
  const props: Props = {
    url: new URL(address),
    authToken: "old",
    headers: { "X-Trace": "old" },
  };
  const root = createRoot(document.createElement("div"));
  act(() => root.render(<Stream {...props} />));

  act(() => root.render(<Stream {...change(props)} />));

  expect(fetchMock).toHaveBeenCalledTimes(1);
  expect(fetchMock.mock.calls[0][1].signal.aborted).toBe(false);
  expect(fetchMock.mock.calls[0][1].headers).toMatchObject({
    Authorization: "Bearer old",
    "X-Trace": "old",
  });
  act(() => root.unmount());
});

test("Strict Mode reads the database instead of sending the request again", () => {
  fetchMock.mockReturnValue(new Promise(() => {}));
  persisted.set("a", { text: "from the database", status: "streaming" });
  const container = document.createElement("div");
  const root = createRoot(container);
  act(() =>
    root.render(
      <StrictMode>
        <Stream url={new URL(address)} authToken="" headers={{}} />
      </StrictMode>,
    ),
  );

  expect(fetchMock).toHaveBeenCalledTimes(1);
  expect(container.textContent).toBe("streaming: from the database");
  act(() => root.unmount());
});
