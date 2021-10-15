import { useContext } from "react";
import { AuthContext } from "../contexts/AuthContexts";
import { withSSRAuth } from "../utils/withSSRAuth";

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  return <h1>Hello {user?.email}</h1>;
};

export default Dashboard;

export const getServerSideProps = withSSRAuth(async (ctx) => {
  return {
    props: {},
  };
});
