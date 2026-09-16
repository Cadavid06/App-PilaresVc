import axios from "./axios";

export const getAdjustmentsByMemberRequest = (memberShipId) =>
  axios.get(`/adjustments/${memberShipId}`);

export const createAdjustmentRequest = (memberShipId, data) =>
  axios.post(`/adjustments/${memberShipId}`, data);

export const deleteAdjustmentRequest = (id) =>
  axios.delete(`/adjustments/${id}`);

export const getAdjustmentsSummaryRequest = () =>
  axios.get("/adjustments/summary");