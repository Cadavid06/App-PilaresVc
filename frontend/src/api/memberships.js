import axios from "./axios";

export const createMembershipRequest = (membership) =>
  axios.post("/memberShip", membership);

export const getMembershipsRequest = () => 
  axios.get("/memberShip");

export const getMembershipRequest = (id) => 
  axios.get(`/memberShip/${id}`);

export const getDaysLeftRequest = (id) =>
  axios.get(`/memberShip/${id}/expired`);

export const updateMembershipRequest = (id, memberShip) =>
  axios.put(`/memberShip/${id}`, memberShip);

export const addPaymentsRequest = (id, amount) =>
  axios.put(`/memberShip/${id}/payments`, amount);

export const renewMembershipRequest = (id, memberShip) =>
  axios.put(`/memberShip/${id}/renew`, memberShip);

export const delateMembershipRequest = (id) =>
  axios.delete(`/memberShip/${id}`);
