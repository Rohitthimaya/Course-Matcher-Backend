import { atom } from "recoil";

export const coursesState = atom({
  key: "coursesState", // Unique key for this atom
  default: [], // Default value is an empty array
});
