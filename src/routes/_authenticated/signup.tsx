import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/signup")({
  component: () => <div>Hello /_authenticated/signup!</div>,
});
