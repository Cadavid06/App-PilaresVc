import { createContext, useContext, useEffect, useState } from "react";
import {
  createMembershipRequest,
  getMembershipsRequest,
  getMembershipRequest,
  updateMembershipRequest,
  addPaymentsRequest,
  renewMembershipRequest,
  delateMembershipRequest,
  getDaysLeftRequest,
} from "../api/memberships";

const MembershipContext = createContext();

export const useMembership = () => {
  const context = useContext(MembershipContext);
  if (!context) {
    throw new Error("useAuht must be used within a AuthProvider");
  }
  return context;
};

export const MembershipProvider = ({ children }) => {
  const [membership, setMembership] = useState([]);
  const [errors, setErrors] = useState();

  useEffect(() => {
    if (errors !== "") {
      const timer = setTimeout(() => {
        setErrors("");
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [errors]);

  const createMembership = async (membership) => {
    try {
      const res = await createMembershipRequest(membership);
      console.log(res.data);
    } catch (error) {
      console.log(error.response);
      setErrors(error.response?.data || ["Unexpected error"]);
    }
  };

  const getMemberships = async () => {
    try {
      const res = await getMembershipsRequest();
      setMembership(res.data);
    } catch (error) {
      console.error(error);
      setErrors(error.response?.data || ["Unexpected error"]);
    }
  };

  const getMembershipById = async (id) => {
    try {
      const res = await getMembershipRequest(id);
      return res.data;
    } catch (error) {
      console.error("Error get membership:", error);
      setErrors(error.response?.data || ["Unexpected error"]);
    }
  };

  const getDaysLeft = async (id) => {
    try {
      const res = await getDaysLeftRequest(id);
      return res.data;
    } catch (error) {
      console.error("Error get membership:", error);
      setErrors(error.response?.data || ["Unexpected error"]);
    }
  };

const updateMembership = async (id, data) => {
  try {
    const res = await updateMembershipRequest(id, data);
    
    // Obtén el objeto del usuario actualizado desde la respuesta
    const updatedUser = res.data.user; 
    
    setMembership(
      membership.map((m) =>
        m._id === id
          ? { ...m, ...updatedUser } // Combina el objeto original 'm' con los datos actualizados
          : m
      )
    );
  } catch (error) {
    console.error("Error al actualizar la membresía:", error);
    setErrors(error.response?.data || ["Error inesperado"]);
    throw error;
  }
};

  const addPayments = async (id, amount) => {
    try {
      const res = await addPaymentsRequest(id, amount);
      setMembership((prev) => prev.map((m) => (m._id === id ? res.data : m)));
    } catch (error) {
      console.error("Error add payments:", error);
      setErrors(error.response?.data || ["Unexpected error"]);
      throw error;
    }
  };

  const renewMembership = async (id, membership) => {
    try {
      const res = await renewMembershipRequest(id, membership);

      setMembership((prev) =>
        prev.map((m) =>
          m._id === id
            ? { ...m, ...res.data } // merge para no perder datos
            : m
        )
      );
    } catch (error) {
      console.error("Error renew membership:", error);
      setErrors(error.response?.data || ["Unexpected error"]);
      throw error;
    }
  };

  const deleteMembership = async (id) => {
    try {
      await delateMembershipRequest(id);
      setMembership(membership.filter((membership) => membership._id !== id));
    } catch (error) {
      console.error("Error deleting membership:", error);
    }
  };

  return (
    <MembershipContext.Provider
      value={{
        createMembership,
        getMemberships,
        getMembershipById,
        updateMembership,
        addPayments,
        renewMembership,
        deleteMembership,
        getDaysLeft,
        membership,
        errors,
      }}
    >
      {children}
    </MembershipContext.Provider>
  );
};
