import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/createAccount")({
  component: () => <div>Hello /_authenticated/createAccount!</div>,
});
