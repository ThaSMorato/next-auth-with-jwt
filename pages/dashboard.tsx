import { useContext } from "react";
import { Can } from "../components/Can";
import { AuthContext, signOut } from "../contexts/AuthContexts";
import { withSSRAuth } from "../utils/withSSRAuth";

const Dashboard = () => {
  const { user } = useContext(AuthContext);

  return (
    <>
      <h1>Hello {user?.email}</h1>
      <button onClick={signOut}>signOut</button>
      <Can permissions={["metrics.list"]} roles={["administrator", "editor"]}>
        <div>Metricas</div>
      </Can>
    </>
  );
};

export default Dashboard;

export const getServerSideProps = withSSRAuth(async (ctx) => {
  return {
    props: {},
  };
}, {});
