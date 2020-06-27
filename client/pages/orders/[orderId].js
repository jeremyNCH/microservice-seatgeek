import { useState, useEffect } from 'react';

const OrderShow = ({ order }) => {
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    const findTimeLeft = () => {
      const time = new Date(order.expiresAt) - new Date();
      setTimeLeft(Math.round(time / 1000));
    };

    findTimeLeft();
    const timerId = setInterval(findTimeLeft, 1000);

    /**
     * Whenever we return a function from useEffect:
     * this return function will only run if we navigate away OR stop showing this component, if we have empty [] in useEffect
     * this return function will be called if we navigate away OR on any rerender, if we have [valid dependency/changing variable to check for rerendering],
     */
    return () => {
      clearInterval(timerId);
    };
  }, [order]);

  if (timeLeft < 0) {
    return <div>Order Expired</div>;
  }

  return <div>Time left to complete payment: {timeLeft} seconds</div>;
};

OrderShow.getInitialProps = async (context, axiosClient, currentUser) => {
  const { orderId } = context.query;
  const { data } = await axiosClient.get(`/api/orders/${orderId}`);

  return { order: data };
};

export default OrderShow;
