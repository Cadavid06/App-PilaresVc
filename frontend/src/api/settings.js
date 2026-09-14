import axios from "./axios";

export const getSettingsRequest = () => axios.get("/settings");

export const updateSettingsRequest = (settings) =>
  axios.put("/settings", settings);