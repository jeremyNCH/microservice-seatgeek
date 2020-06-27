const OrderShow = ({ order }) => {
  console.log(order);
  return <div>OrderShow</div>;
};

OrderShow.getInitialProps = async (context, axiosClient, currentUser) => {
  const { orderId } = context.query;
  const { data } = await axiosClient.get(`/api/orders/${orderId}`);

  return { order: data };
};

export default OrderShow;
