import { createRouter } from "@tanstack/react-router";
import { routeTree } from "../routeTree.gen";

export const router = createRouter({
  routeTree,
  context: {
    session: null,
    userProfile: null,
    logout() {
      throw new Error("logout() not implemented");
    },
    verifyOtp() {
      throw new Error("verifyOtp() not implemented");
    },
    signInByPhone() {
      throw new Error("signInByPhone() not implemented");
    },
    setUserProfile() {
      throw new Error("setUserProfile() not implemented");
    },
  },
});

declare module "@tanstack/react-router" {
  interface Register {
    // This infers the type of our router and registers it across your entire project
    router: typeof router;
  }
}
