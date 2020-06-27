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
    <div className="table-responsive">
      <h1>Ticket Details</h1>
      <table className="table table-striped table-hover">
        <thead>
          <tr>
            <th>Title</th>
            <th>Price</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          <tr key={ticket.id}>
            <td>{ticket.title}</td>
            <td>{ticket.price}</td>
            <td>
              {/* wrap doRequest so that onClick does Not auto-pass in the event/e object to doRequest and cause an error in use-request hook */}
              <button onClick={(e) => doRequest()} className="btn btn-primary">
                Purchase
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      {errors}
    </div>
  );
};

TicketShow.getInitialProps = async (context, axiosClient, currentUser) => {
  const { ticketId } = context.query;
  const { data } = await axiosClient.get(`/api/tickets/${ticketId}`);

  return { ticket: data };
};

export default TicketShow;
