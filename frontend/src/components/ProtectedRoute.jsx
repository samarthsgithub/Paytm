import PropTypes from "prop-types";
import { Navigate } from "react-router-dom";
import { getToken } from "../lib/api";

export default function ProtectedRoute({ children }) {
  return getToken() ? children : <Navigate to="/signin" replace />;
}

ProtectedRoute.propTypes = { children: PropTypes.node.isRequired };
