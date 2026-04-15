import '@testing-library/jest-dom';
import { render, screen, act, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FlashcardDeck } from '../components/FlashcardDeck';

const sampleCards = [
  { q: 'What is the powerhouse of the cell?', a: 'Mitochondria' },
  { q: 'Define systolic pressure', a: 'The pressure during ventricular contraction' },
  { q: 'What causes Type 1 Diabetes?', a: 'Autoimmune destruction of beta cells' },
];

describe('FlashcardDeck', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders null when no cards are provided', () => {
    const { container } = render(<FlashcardDeck cards={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders null when cards is undefined/empty', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { container } = render(<FlashcardDeck cards={null as any} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders the first card question on the front face', () => {
    render(<FlashcardDeck cards={sampleCards} />);
    expect(screen.getByText(sampleCards[0].q)).toBeInTheDocument();
  });

  it('renders the first card answer on the back face', () => {
    render(<FlashcardDeck cards={sampleCards} />);
    expect(screen.getByText(sampleCards[0].a)).toBeInTheDocument();
  });

  it('shows the correct card counter', () => {
    render(<FlashcardDeck cards={sampleCards} />);
    expect(screen.getByText(`1 / ${sampleCards.length}`)).toBeInTheDocument();
  });

  it('shows "Click to flip" hint on the front face', () => {
    render(<FlashcardDeck cards={sampleCards} />);
    expect(screen.getByText('Click to flip')).toBeInTheDocument();
  });

  it('navigates to the next card when the next button is clicked', () => {
    render(<FlashcardDeck cards={sampleCards} />);
    const buttons = screen.getAllByRole('button');
    const nextBtn = buttons[1]; // second button is Next (ChevronRight)

    act(() => {
      fireEvent.click(nextBtn);
      jest.advanceTimersByTime(200);
    });

    expect(screen.getByText('2 / 3')).toBeInTheDocument();
    expect(screen.getByText(sampleCards[1].q)).toBeInTheDocument();
  });

  it('navigates to the previous card when the previous button is clicked', () => {
    render(<FlashcardDeck cards={sampleCards} />);
    const buttons = screen.getAllByRole('button');
    const prevBtn = buttons[0]; // first button is Prev (ChevronLeft)
    const nextBtn = buttons[1];

    // Go to card 2 first
    act(() => {
      fireEvent.click(nextBtn);
      jest.advanceTimersByTime(200);
    });

    // Now go back
    act(() => {
      fireEvent.click(prevBtn);
      jest.advanceTimersByTime(200);
    });

    expect(screen.getByText('1 / 3')).toBeInTheDocument();
    expect(screen.getByText(sampleCards[0].q)).toBeInTheDocument();
  });

  it('wraps around to the last card when going previous from the first card', () => {
    render(<FlashcardDeck cards={sampleCards} />);
    const buttons = screen.getAllByRole('button');
    const prevBtn = buttons[0];

    act(() => {
      fireEvent.click(prevBtn);
      jest.advanceTimersByTime(200);
    });

    expect(screen.getByText(`3 / ${sampleCards.length}`)).toBeInTheDocument();
    expect(screen.getByText(sampleCards[2].q)).toBeInTheDocument();
  });

  it('wraps around to the first card when going next from the last card', () => {
    render(<FlashcardDeck cards={sampleCards} />);
    const buttons = screen.getAllByRole('button');
    const nextBtn = buttons[1];

    // Navigate to the last card (click 3 times to go 1→2→3→1)
    for (let i = 0; i < sampleCards.length; i++) {
      act(() => {
        fireEvent.click(nextBtn);
        jest.advanceTimersByTime(200);
      });
    }

    expect(screen.getByText('1 / 3')).toBeInTheDocument();
    expect(screen.getByText(sampleCards[0].q)).toBeInTheDocument();
  });

  it('renders with a single card and shows 1 / 1', () => {
    const singleCard = [{ q: 'Single question', a: 'Single answer' }];
    render(<FlashcardDeck cards={singleCard} />);
    expect(screen.getByText('1 / 1')).toBeInTheDocument();
    expect(screen.getByText('Single question')).toBeInTheDocument();
  });
});
