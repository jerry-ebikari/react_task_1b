import React, { useReducer } from "react";
import MkdSDK from "./utils/MkdSDK";

export const AuthContext = React.createContext();

const initialState = {
  isAuthenticated: Boolean(localStorage.getItem("isAuthenticated")),
  user: null,
  token: localStorage.getItem("token"),
  role: localStorage.getItem("role"),
};

const reducer = (state, action) => {
  switch (action.type) {
    case "LOGIN":
      //TODO
      localStorage.setItem("token", action.payload.token)
      localStorage.setItem("role", action.payload.role)
      localStorage.setItem("isAuthenticated", true)
      return {
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
        role: action.payload.role
      };
    case "LOGOUT":
      localStorage.clear();
      return {
        ...state,
        isAuthenticated: false,
        user: null,
      };
    default:
      return state;
  }
};

let sdk = new MkdSDK();

export const tokenExpireError = (dispatch, errorMessage) => {
  const role = localStorage.getItem("role");
  if (localStorage.getItem("isAuthenticated") && errorMessage === "TOKEN_EXPIRED") {
    dispatch({
      type: "LOGOUT",
    });
    window.location.href = `/${role}/login`
  }
};

const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  React.useEffect(() => {
    //TODO
    if (localStorage.getItem("role")) {
      sdk.check(localStorage.getItem("role"))
      .then(() => {})
      .catch(() => {
        tokenExpireError(dispatch, "TOKEN_EXPIRED")
      })
      
    } else {
      tokenExpireError(dispatch, "TOKEN_EXPIRED")
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        state,
        dispatch,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
