import axios from "./axios";

export const createMembershipRequest = (membership) =>
  axios.post("/memberShip", membership);

export const getMembershipsRequest = () => 
  axios.get("/memberShip");

export const getMembershipRequest = (id) => 
  axios.get(`/memberShip/${id}`);

export const updateMembershipRequest = (id, memberShip) =>
  axios.put(`/memberShip/${id}`, memberShip);

export const addPaymentsRequest = (id, amount) =>
  axios.put(`/memberShip/${id}/payments`, amount);

export const adjustDebtRequest = (id, data) =>
  axios.put(`/memberShip/${id}/adjust-debt`, data);

export const delateMembershipRequest = (id) =>
  axios.delete(`/memberShip/${id}`);
