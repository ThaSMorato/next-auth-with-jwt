import { useContext } from "react";
import { AuthContext } from "../contexts/AuthContexts";

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  return <h1>Hello {user?.email}</h1>;
};

export default Dashboard;
