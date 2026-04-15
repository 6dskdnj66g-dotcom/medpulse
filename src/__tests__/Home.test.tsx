import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import Home from '../app/page';

describe('Home Dashboard', () => {
  it('renders the welcome heading', () => {
    render(<Home />);
    
    // Check if the dashboard title loads
    const heading = screen.getByText(/Welcome back, Dr. User/i);
    expect(heading).toBeInTheDocument();
  });
});
