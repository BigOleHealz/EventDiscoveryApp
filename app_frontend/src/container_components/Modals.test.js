import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { CreateEventDetailsModal } from './Modals';
import { CreateEventContext } from '../utils/Contexts';

describe('CreateEventDetailsModal', () => {
  const mockOnSubmit = jest.fn();
  const mockOnRequestClose = jest.fn();

  const mockContext = {
    create_event_context: {},
    setCreateEventContext: jest.fn(),
  };

  it('renders without crashing', () => {
    render(
      <CreateEventContext.Provider value={mockContext}>
        <CreateEventDetailsModal
          isVisible={true}
          onSubmitButtonClick={mockOnSubmit}
          onRequestClose={mockOnRequestClose}
        />
      </CreateEventContext.Provider>
    );
  });

  it('handles input changes', () => {
    const { getByLabelText, getByTestId } = render(
      <CreateEventContext.Provider value={mockContext}>
        <CreateEventDetailsModal
          isVisible={true}
          onSubmitButtonClick={mockOnSubmit}
          onRequestClose={mockOnRequestClose}
        />
      </CreateEventContext.Provider>
    );

    fireEvent.change(getByLabelText('Event Name'), { target: { value: 'Test Event' } });
    fireEvent.change(getByLabelText('Event Description'), { target: { value: 'This is a test event.' } });
    fireEvent.click(getByTestId('switch-paid-event'));
    fireEvent.change(getByTestId('input-event-price'), { target: { value: '20' } });

    expect(getByLabelText('Event Name').value).toBe('Test Event');
    expect(getByLabelText('Event Description').value).toBe('This is a test event.');
    expect(getByTestId('input-event-price').value).toBe('20');
  });

  // Add more tests as needed...
});