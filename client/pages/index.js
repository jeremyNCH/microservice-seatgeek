/**
 *
 * @param {props} object
 * This function runs inside the brower
 * we cannot fetch request and update the state of this component since it only renders once during 1 SSR cycle
 * we need to fetch data from the NextJS server in getInitialProps
 */
const LandingPage = ({ currentUser, tickets }) => {
  const ticketList = tickets.map((ticket) => {
    return (
      <tr key={ticket.id}>
        <td>{ticket.title}</td>
        <td>{ticket.price}</td>
      </tr>
    );
  });

  return (
    <div>
      <h1>Tickets</h1>
      <table className="table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Price</th>
          </tr>
        </thead>
        <tbody>{ticketList}</tbody>
      </table>
    </div>
  );
};

/**
 * Here this code runs on the NextJS server that build the full HTML file to be rendered
 * Here we make the fetch data request and return it as a component `props` object inside the component
 * GOTCHA: getInitialProps will always run on the server on a hard reload/refresh/First time access/click on external domain link
 *         getInitialProps will run in the browser if we navigate from 1 page to another while inside the app/use next.js router
 */
LandingPage.getInitialProps = async (context, axiosClient, currentUser) => {
  const { data } = await axiosClient.get('/api/tickets');

  return { tickets: data };
};

export default LandingPage;
