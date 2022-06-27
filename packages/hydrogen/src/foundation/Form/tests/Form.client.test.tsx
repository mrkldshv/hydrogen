import React from 'react';
import {mountWithProviders} from '../../../utilities/tests/shopifyMount';
import {Form} from '../Form.client';

// @ts-ignore
import {createFromFetch} from '@shopify/hydrogen/vendor/react-server-dom-vite';

jest.mock('@shopify/hydrogen/vendor/react-server-dom-vite', () => ({
  createFromFetch: jest.fn(),
}));

describe('<Form>', () => {
  beforeEach(() => {
    // @ts-ignore
    global.fetch = jest.fn(async (_url, _init) => {
      return {
        json: async () =>
          JSON.stringify({
            data: {},
          }),
      };
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the form', () => {
    const component = mountWithProviders(
      <Form action="/account" method="POST">
        <input type="text" name="username" defaultValue="test" />
        <button type="submit">Submit</button>
      </Form>
    );

    expect(component).toContainReactComponent('form', {
      action: '/account',
      method: 'POST',
      encType: 'application/x-www-form-urlencoded',
    });
  });

  it('submits the form with a fetch', () => {
    const component = mountWithProviders(
      <Form action="/account" method="POST">
        <input type="text" name="username" defaultValue="test" />
        <input type="text" name="password" defaultValue="pass" />
        <button type="submit">Submit</button>
      </Form>
    );

    const event = {
      preventDefault: jest.fn(),
    };

    component.find('form')?.trigger('onSubmit', event);
    expect(event.preventDefault).toHaveBeenCalled();
    expect(createFromFetch).toHaveBeenCalled();
    expect(global.fetch).toHaveBeenCalledWith('/account', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
        'Hydrogen-Client': 'Form-Action',
      },
      body: 'username=test&password=pass',
    });
  });

  it('calls custom onSubmit', () => {
    const component = mountWithProviders(
      <Form
        action="/account"
        method="POST"
        onSubmit={(e) => {
          e.preventDefault();
        }}
      >
        <input type="text" name="username" defaultValue="test" />
        <button type="submit">Submit</button>
      </Form>
    );

    const event = {
      defaultPrevented: false,
      preventDefault() {
        this.defaultPrevented = true;
      },
    };

    component.find('form')?.trigger('onSubmit', event);
    expect(createFromFetch).not.toHaveBeenCalled();
    expect(global.fetch).not.toHaveBeenCalled();
  });
});
