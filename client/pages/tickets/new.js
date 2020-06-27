import { useState } from 'react';
import Router from 'next/router';
import useRequest from '../../hooks/use-request';

export default () => {
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState(''); // price as string to make sure 0 is NOT displayed in the input field on init/default
  const { doRequest, errors } = useRequest({
    url: '/api/tickets',
    method: 'post',
    body: {
      title,
      price
    },
    onSuccess: () => Router.push('/')
  });

  const onSubmit = async (e) => {
    e.preventDefault();

    await doRequest();

    setTitle('');
    setPrice('');
  };

  const onBlur = () => {
    const v = parseFloat(price);

    if (isNaN(v)) {
      return;
    }

    setPrice(v.toFixed(2));
  };

  return (
    <div>
      <h1>Create a ticket</h1>
      <form onSubmit={onSubmit}>
        <div className="form-group">
          <label>Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="form-control"
          />
        </div>
        <div className="form-group">
          <label>Price</label>
          <input
            value={price}
            onBlur={onBlur}
            onChange={(e) => setPrice(e.target.value)}
            className="form-control"
          />
        </div>

        {errors}

        <button className="btn btn-primary">Submit</button>
      </form>
    </div>
  );
};
