import { atom } from "recoil";

export const authState = atom({
  key: "authState",
  default: {
    isAuthenticated: !!localStorage.getItem("token"),
    token: localStorage.getItem("token") || null,
  },
});

