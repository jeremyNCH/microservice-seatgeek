import Router from 'next/router';
import useRequest from '../../hooks/use-request';

const TicketShow = ({ ticket }) => {
  const { doRequest, errors } = useRequest({
    url: '/api/orders',
    method: 'post',
    body: {
      ticketId: ticket.id
    },
    onSuccess: (order) => Router.push('/orders/[orderId]', `/orders/${order.id}`) // need to include the route templating to avoid doing a HARD redirect
  });

  return (
    <div>
      <h1>{ticket.title}</h1>
      <h4>Price: {ticket.price}</h4>

      {errors}

      {/* wrap doRequest so that onClick does Not auto-pass in the event/e object to doRequest and cause an error in use-request hook */}
      <button onClick={(e) => doRequest()} className="btn btn-primary">
        Purchase
      </button>
    </div>
  );
};

TicketShow.getInitialProps = async (context, axiosClient, currentUser) => {
  const { ticketId } = context.query;
  const { data } = await axiosClient.get(`/api/tickets/${ticketId}`);

  return { ticket: data };
};

export default TicketShow;
