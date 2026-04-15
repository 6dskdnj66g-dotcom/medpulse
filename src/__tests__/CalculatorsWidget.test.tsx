import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CalculatorsWidget } from '../components/CalculatorsWidget';

describe('CalculatorsWidget', () => {
  it('renders the closed floating button initially', () => {
    render(<CalculatorsWidget />);
    expect(screen.getByRole('button')).toBeInTheDocument();
    // Widget panel should not be visible
    expect(screen.queryByText('Clinical Calculators')).not.toBeInTheDocument();
  });

  it('opens the widget panel on button click', async () => {
    render(<CalculatorsWidget />);
    await userEvent.click(screen.getByRole('button'));
    expect(screen.getByText('Clinical Calculators')).toBeInTheDocument();
  });

  it('shows both calculator options in the menu', async () => {
    render(<CalculatorsWidget />);
    await userEvent.click(screen.getByRole('button'));
    expect(screen.getByText('Glasgow Coma Scale')).toBeInTheDocument();
    expect(screen.getByText(/CHA₂DS₂-VASc/)).toBeInTheDocument();
  });

  it('closes the widget when the close button is clicked', async () => {
    render(<CalculatorsWidget />);
    await userEvent.click(screen.getByRole('button'));
    expect(screen.getByText('Clinical Calculators')).toBeInTheDocument();

    // The close button (X icon) is the first button in the header panel
    const allButtons = screen.getAllByRole('button');
    const closeButton = allButtons[0]; // X button is first in the header
    await userEvent.click(closeButton);
    expect(screen.queryByText('Clinical Calculators')).not.toBeInTheDocument();
  });

  it('navigates to the GCS calculator from the menu', async () => {
    render(<CalculatorsWidget />);
    await userEvent.click(screen.getByRole('button'));
    await userEvent.click(screen.getByText('Glasgow Coma Scale'));
    expect(screen.getByText('GCS Calculator')).toBeInTheDocument();
    expect(screen.getByText('Total Score')).toBeInTheDocument();
  });

  it('shows the correct default GCS score of 15', async () => {
    render(<CalculatorsWidget />);
    await userEvent.click(screen.getByRole('button'));
    await userEvent.click(screen.getByText('Glasgow Coma Scale'));
    // Default: eye=4 + verbal=5 + motor=6 = 15
    expect(screen.getByText('15')).toBeInTheDocument();
  });

  it('shows GCS verbal descriptor for default value (Oriented)', async () => {
    render(<CalculatorsWidget />);
    await userEvent.click(screen.getByRole('button'));
    await userEvent.click(screen.getByText('Glasgow Coma Scale'));
    expect(screen.getByText(/Oriented/)).toBeInTheDocument();
  });

  it('shows GCS motor descriptor for default value (Obeys)', async () => {
    render(<CalculatorsWidget />);
    await userEvent.click(screen.getByRole('button'));
    await userEvent.click(screen.getByText('Glasgow Coma Scale'));
    expect(screen.getByText(/Obeys/)).toBeInTheDocument();
  });

  it('navigates back to the menu from GCS via the Back button', async () => {
    render(<CalculatorsWidget />);
    await userEvent.click(screen.getByRole('button'));
    await userEvent.click(screen.getByText('Glasgow Coma Scale'));
    await userEvent.click(screen.getByText('Back'));
    expect(screen.getByText('Clinical Calculators')).toBeInTheDocument();
  });

  it('navigates to the CHADS₂-VASc calculator from the menu', async () => {
    render(<CalculatorsWidget />);
    await userEvent.click(screen.getByRole('button'));
    await userEvent.click(screen.getByText(/CHA₂DS₂-VASc/));
    expect(screen.getByText('CHADS₂-VASc')).toBeInTheDocument();
    expect(screen.getByText('Total Score')).toBeInTheDocument();
  });

  it('shows the default CHADS score of 0', async () => {
    render(<CalculatorsWidget />);
    await userEvent.click(screen.getByRole('button'));
    await userEvent.click(screen.getByText(/CHA₂DS₂-VASc/));
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('increments CHADS score by 1 when a +1 factor is checked', async () => {
    render(<CalculatorsWidget />);
    await userEvent.click(screen.getByRole('button'));
    await userEvent.click(screen.getByText(/CHA₂DS₂-VASc/));

    // Check "Congestive Heart Failure (+1)"
    const chfCheckbox = screen.getByRole('checkbox', { name: /Congestive Heart Failure/i });
    await userEvent.click(chfCheckbox);

    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('increments CHADS score by 2 when a +2 factor is checked', async () => {
    render(<CalculatorsWidget />);
    await userEvent.click(screen.getByRole('button'));
    await userEvent.click(screen.getByText(/CHA₂DS₂-VASc/));

    // Check "Age ≥ 75 (+2)"
    const age75Checkbox = screen.getByRole('checkbox', { name: /Age ≥ 75/i });
    await userEvent.click(age75Checkbox);

    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('accumulates CHADS score across multiple checked factors', async () => {
    render(<CalculatorsWidget />);
    await userEvent.click(screen.getByRole('button'));
    await userEvent.click(screen.getByText(/CHA₂DS₂-VASc/));

    // CHF (+1) + Age≥75 (+2) + Hypertension (+1) = 4
    await userEvent.click(screen.getByRole('checkbox', { name: /Congestive Heart Failure/i }));
    await userEvent.click(screen.getByRole('checkbox', { name: /Age ≥ 75/i }));
    await userEvent.click(screen.getByRole('checkbox', { name: /Hypertension/i }));

    expect(screen.getByText('4')).toBeInTheDocument();
  });

  it('decrements CHADS score when a checked factor is unchecked', async () => {
    render(<CalculatorsWidget />);
    await userEvent.click(screen.getByRole('button'));
    await userEvent.click(screen.getByText(/CHA₂DS₂-VASc/));

    const chfCheckbox = screen.getByRole('checkbox', { name: /Congestive Heart Failure/i });
    await userEvent.click(chfCheckbox); // score = 1
    await userEvent.click(chfCheckbox); // score = 0

    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('navigates back to the menu from CHADS via the Back button', async () => {
    render(<CalculatorsWidget />);
    await userEvent.click(screen.getByRole('button'));
    await userEvent.click(screen.getByText(/CHA₂DS₂-VASc/));
    await userEvent.click(screen.getByText('Back'));
    expect(screen.getByText('Clinical Calculators')).toBeInTheDocument();
  });
});
