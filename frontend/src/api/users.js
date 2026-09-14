import axios from "./axios";

export const getUsersRequest = () => axios.get("/users");

export const updateUserRoleRequest = (id, role) =>
  axios.put(`/users/${id}`, { role });

export const deleteUserRequest = (id) => axios.delete(`/users/${id}`);