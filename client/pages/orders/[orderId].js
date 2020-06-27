import { useState, useEffect } from 'react';
import StripeCheckout from 'react-stripe-checkout';
import Router from 'next/router';
import useRequest from '../../hooks/use-request';

const OrderDetails = ({ order }) => {
  return (
    <div>
      <h1>Orders</h1>
      <table className="table table-striped table-hover">
        <thead>
          <tr>
            <th>Title</th>
            <th>Price</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr key={order.id}>
            <td>{order.ticket.title}</td>
            <td>{order.ticket.price}</td>
            <td>{order.status}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

const OrderShow = ({ order, currentUser }) => {
  const [timeLeft, setTimeLeft] = useState(0);
  const { doRequest, errors } = useRequest({
    url: '/api/payments',
    method: 'post',
    body: {
      orderId: order.id
    },
    onSuccess: (payment) => Router.push('/orders')
  });

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

  return (
    <div>
      <OrderDetails order={order} />
      {timeLeft >= 0 && <div>Time left to complete payment: {timeLeft} seconds</div>}
      {timeLeft >= 0 && (
        <div style={{ marginTop: 15 }}>
          <StripeCheckout
            token={({ id }) => doRequest({ token: id })}
            stripeKey="pk_test_51GwmPYIV2KtXkt72EbYDd57eiBE1EZWIqpJEIAvaZuQl1xmUdhmJcb7VldLUgmpiPIaanu0FxoGNxpIMfSzKasnL00395FqNyR"
            amount={order.ticket.price * 100}
            email={currentUser.email}
          />
        </div>
      )}
      <div>{errors}</div>
    </div>
  );
};

OrderShow.getInitialProps = async (context, axiosClient, currentUser) => {
  const { orderId } = context.query;
  const { data } = await axiosClient.get(`/api/orders/${orderId}`);

  return { order: data };
};

export default OrderShow;
