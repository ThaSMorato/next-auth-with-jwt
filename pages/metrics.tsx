import { withSSRAuth } from "../utils/withSSRAuth";

const Dashboard = () => {
  return (
    <>
      <h1>Metrics</h1>
    </>
  );
};

export default Dashboard;

export const getServerSideProps = withSSRAuth(
  async (ctx) => {
    return {
      props: {},
    };
  },
  {
    permissions: ["metrics.list"],
    roles: ["administrator", "editor"],
  }
);
