import { jest } from '@jest/globals';
import React, { useCallback, useContext } from 'react';
import ReactDom from 'react-dom';
import { act, render, cleanup, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import renderer from 'react-test-renderer';

import '@testing-library/jest-dom/extend-expect';

import { Empty, LowerHiragana, Simple, Size4 } from './providers';

import { CrosswordProviderImperative } from '../CrosswordProvider';
import { CrosswordContext } from '../context';

afterEach(cleanup);

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDom.render(<Empty />, div);
  ReactDom.unmountComponentAtNode(div);
});

it('renders component correctly', () => {
  const { container, getByText } = render(<Simple withGrid withClues />);
  expect(container.firstChild).toHaveClass('crossword');
  expect(getByText('ACROSS')).toHaveTextContent('ACROSS');
  expect(getByText('DOWN')).toHaveTextContent('DOWN');
});

it('renders component correctly when using storage', () => {
  const { container, getByText } = render(
    <Simple withGrid withClues useStorage />
  );
  expect(container.firstChild).toHaveClass('crossword');
  expect(getByText('ACROSS')).toHaveTextContent('ACROSS');
  expect(getByText('DOWN')).toHaveTextContent('DOWN');
});

it('matches snapshot', () => {
  const tree = renderer.create(<Simple />).toJSON();
  expect(tree).toMatchSnapshot();
});

// it('creates new gridData when the data changes', () => {
//   const clueMatch = /one plus one/;
//   const { queryByText, rerender } = render(<Crossword />);
//   expect(queryByText(clueMatch)).toBeNull();

//   rerender(<Crossword data={simpleData} />);
//   expect(queryByText(clueMatch)).toBeTruthy();
// });

it('handles typing', () => {
  const { getByLabelText } = render(<Simple withGrid />);
  const input = getByLabelText('crossword-input');
  userEvent.type(input, 'あ', { skipClick: true });
});

describe('keyboard navigation', () => {
  it('basic typing', () => {
    const { getByLabelText, getByText } = render(<Size4 withGrid withClues />);
    const input = getByLabelText('crossword-input');

    userEvent.click(getByLabelText('clue-1-across'));

    fireEvent.keyDown(input, { key: 'ArrowLeft' });
    userEvent.paste(input, 'た');
    let { x, y } = posForText(getByText('た'));
    expect(x).toBe('0.125');
    expect(y).toBe('0.125');

    userEvent.paste(input, 'さ');
    ({ x, y } = posForText(getByText('さ')));
    expect(x).toBe('10.125');
    expect(y).toBe('0.125');
  });

  it('home and end (across)', () => {
    const { getByLabelText, getByText } = render(<Size4 withGrid withClues />);
    const input = getByLabelText('crossword-input');

    userEvent.click(getByLabelText('clue-1-across'));

    fireEvent.keyDown(input, { key: 'Home' });
    userEvent.paste(input, 'い');
    let { x, y } = posForText(getByText('い'));
    expect(x).toBe('0.125');
    expect(y).toBe('0.125');

    fireEvent.keyDown(input, { key: 'End' });
    userEvent.paste(input, 'あ');
    ({ x, y } = posForText(getByText('あ')));
    expect(x).toBe('20.125');
    expect(y).toBe('0.125');
  });

  it('home and end (down)', () => {
    const { getByLabelText, getByText } = render(<Size4 withGrid withClues />);
    const input = getByLabelText('crossword-input');

    userEvent.click(getByLabelText('clue-2-down'));

    // fireEvent.keyDown(input, { key: 'Home' });
    userEvent.paste(input, 'い');

    let { x, y } = posForText(getByText('い'));

    expect(x).toBe('20.125');
    expect(y).toBe('0.125');

    fireEvent.keyDown(input, { key: 'End' });
    userEvent.paste(input, 'あ');
    ({ x, y } = posForText(getByText('あ')));
    expect(x).toBe('20.125');
    expect(y).toBe('20.125');
  });

  it('left and right (across)', () => {
    const { getByLabelText, getByText } = render(<Size4 withGrid withClues />);
    const input = getByLabelText('crossword-input');

    userEvent.click(getByLabelText('clue-1-across'));

    fireEvent.keyDown(input, { key: 'ArrowLeft' });
    userEvent.paste(input, 'い');
    let { x, y } = posForText(getByText('い'));
    expect(x).toBe('0.125');
    expect(y).toBe('0.125');

    fireEvent.keyDown(input, { key: 'ArrowRight' });
    userEvent.paste(input, 'あ');
    ({ x, y } = posForText(getByText('あ')));
    expect(x).toBe('20.125');
    expect(y).toBe('0.125');
  });

  it('up and down (down)', () => {
    const { getByLabelText, getByText } = render(<Size4 withGrid withClues />);
    const input = getByLabelText('crossword-input');

    userEvent.click(getByLabelText('clue-2-down'));

    fireEvent.keyDown(input, { key: 'ArrowUp' });
    userEvent.paste(input, 'い');
    let { x, y } = posForText(getByText('い'));
    expect(x).toBe('20.125');
    expect(y).toBe('0.125');

    fireEvent.keyDown(input, { key: 'ArrowDown' });
    userEvent.paste(input, 'あ');
    ({ x, y } = posForText(getByText('あ')));
    expect(x).toBe('20.125');
    expect(y).toBe('20.125');
  });

  it('tab switches direction (across to down)', () => {
    const { getByLabelText, getByText } = render(<Size4 withGrid withClues />);
    const input = getByLabelText('crossword-input');

    userEvent.click(getByLabelText('clue-1-across'));
    fireEvent.keyDown(input, { key: 'End' });

    fireEvent.keyDown(input, { key: 'Tab' }); // switches to 2-down
    fireEvent.keyDown(input, { key: 'End' });
    userEvent.paste(input, 'い');
    const { x, y } = posForText(getByText('い'));
    expect(x).toBe('20.125');
    expect(y).toBe('20.125');
  });

  it('tab switches direction (down to across)', () => {
    const { getByLabelText, getByText } = render(<Size4 withGrid withClues />);
    const input = getByLabelText('crossword-input');

    userEvent.click(getByLabelText('clue-2-down'));

    fireEvent.keyDown(input, { key: 'Tab' }); // switches to 1-across
    fireEvent.keyDown(input, { key: 'Home' });
    userEvent.paste(input, 'い');
    const { x, y } = posForText(getByText('い'));
    expect(x).toBe('0.125');
    expect(y).toBe('0.125');
  });

  it('space switches direction (across to down)', () => {
    const { getByLabelText, getByText } = render(<Size4 withGrid withClues />);
    const input = getByLabelText('crossword-input');

    userEvent.click(getByLabelText('clue-1-across'));
    fireEvent.keyDown(input, { key: 'End' });

    fireEvent.keyDown(input, { key: ' ' }); // switches to 2-down
    fireEvent.keyDown(input, { key: 'End' });
    userEvent.paste(input, 'い');
    const { x, y } = posForText(getByText('い'));
    expect(x).toBe('20.125');
    expect(y).toBe('20.125');
  });

  it('space switches direction (down to across)', () => {
    const { getByLabelText, getByText } = render(<Size4 withGrid withClues />);
    const input = getByLabelText('crossword-input');

    userEvent.click(getByLabelText('clue-2-down'));

    fireEvent.keyDown(input, { key: ' ' }); // switches to 1-across
    fireEvent.keyDown(input, { key: 'Home' });
    userEvent.paste(input, 'い');
    const { x, y } = posForText(getByText('い'));
    expect(x).toBe('0.125');
    expect(y).toBe('0.125');
  });

  it('clicking on input switches direction (across to down)', () => {
    const { getByLabelText, getByText } = render(<Size4 withGrid withClues />);
    const input = getByLabelText('crossword-input');

    userEvent.click(getByLabelText('clue-1-across'));
    fireEvent.keyDown(input, { key: 'End' });

    userEvent.click(input); // switches to 2-down
    fireEvent.keyDown(input, { key: 'End' });
    userEvent.paste(input, 'い');
    const { x, y } = posForText(getByText('い'));
    expect(x).toBe('20.125');
    expect(y).toBe('20.125');
  });

  it('clicking on input switches direction (down to across)', () => {
    const { getByLabelText, getByText } = render(<Size4 withGrid withClues />);
    const input = getByLabelText('crossword-input');

    userEvent.click(getByLabelText('clue-2-down'));

    userEvent.click(input); // switches to 1-across
    fireEvent.keyDown(input, { key: 'Home' });
    userEvent.paste(input, 'い');
    const { x, y } = posForText(getByText('い'));
    expect(x).toBe('0.125');
    expect(y).toBe('0.125');
  });

  it('clicking on cell when focused switches direction (across to down)', () => {
    const { getByLabelText, getByText } = render(<Size4 withGrid withClues />);
    const input = getByLabelText('crossword-input');

    userEvent.click(getByLabelText('clue-1-across'));
    fireEvent.keyDown(input, { key: 'End' });
    userEvent.paste(input, 'あ');
    userEvent.click(getByText('あ')); // switches to 2-down

    fireEvent.keyDown(input, { key: 'End' });
    userEvent.paste(input, 'い');
    const { x, y } = posForText(getByText('い'));
    expect(x).toBe('20.125');
    expect(y).toBe('20.125');
  });

  it('clicking on cell when focused switches direction (down to across)', () => {
    const { getByLabelText, getByText } = render(<Size4 withGrid withClues />);
    const input = getByLabelText('crossword-input');

    userEvent.click(getByLabelText('clue-2-down'));
    userEvent.paste(input, 'あ');
    fireEvent.keyDown(input, { key: 'ArrowUp' });
    userEvent.click(getByText('あ')); // switches to 1-across

    fireEvent.keyDown(input, { key: 'Home' });
    userEvent.paste(input, 'い');
    const { x, y } = posForText(getByText('い'));
    expect(x).toBe('0.125');
    expect(y).toBe('0.125');
  });

  it('backspace clears and moves back (across)', () => {
    const { getByLabelText, getByText, queryByText } = render(
      <Size4 withGrid withClues />
    );
    const input = getByLabelText('crossword-input');

    userEvent.click(getByLabelText('clue-1-across'));
    fireEvent.keyDown(input, { key: 'End' });
    userEvent.paste(input, 'あ');
    let { x, y } = posForText(getByText('あ'));
    expect(x).toBe('20.125');
    expect(y).toBe('0.125');

    fireEvent.keyDown(input, { key: 'Backspace' });
    expect(queryByText('あ')).toBeNull();

    userEvent.paste(input, 'あ');
    ({ x, y } = posForText(getByText('あ')));
    expect(x).toBe('10.125'); // second col!
    expect(y).toBe('0.125');
  });

  it('backspace clears and moves up (down)', () => {
    const { getByLabelText, getByText, queryByText } = render(
      <Size4 withGrid withClues />
    );
    const input = getByLabelText('crossword-input');

    userEvent.click(getByLabelText('clue-2-down'));
    fireEvent.keyDown(input, { key: 'End' });
    userEvent.paste(input, 'あ');
    let { x, y } = posForText(getByText('あ'));
    expect(x).toBe('20.125');
    expect(y).toBe('20.125');

    fireEvent.keyDown(input, { key: 'Backspace' });
    expect(queryByText('あ')).toBeNull();

    userEvent.paste(input, 'あ');
    ({ x, y } = posForText(getByText('あ')));
    expect(x).toBe('20.125');
    expect(y).toBe('10.125'); // second row!
  });

  it('delete clears and does not move back (across)', () => {
    const { getByLabelText, getByText, queryByText } = render(
      <Size4 withGrid withClues />
    );
    const input = getByLabelText('crossword-input');

    userEvent.click(getByLabelText('clue-1-across'));
    fireEvent.keyDown(input, { key: 'End' });
    userEvent.paste(input, 'あ');
    let { x, y } = posForText(getByText('あ'));
    expect(x).toBe('20.125');
    expect(y).toBe('0.125');

    fireEvent.keyDown(input, { key: 'Delete' });
    expect(queryByText('Z')).toBeNull();

    userEvent.paste(input, 'あ');
    ({ x, y } = posForText(getByText('あ')));
    expect(x).toBe('20.125'); // still third col!
    expect(y).toBe('0.125');
  });

  it('delete clears and does not move up (down)', () => {
    const { getByLabelText, getByText, queryByText } = render(
      <Size4 withGrid withClues />
    );
    const input = getByLabelText('crossword-input');

    userEvent.click(getByLabelText('clue-2-down'));
    fireEvent.keyDown(input, { key: 'End' });
    userEvent.paste(input, 'あ');
    let { x, y } = posForText(getByText('あ'));
    expect(x).toBe('20.125');
    expect(y).toBe('20.125');

    fireEvent.keyDown(input, { key: 'Delete' });
    expect(queryByText('あ')).toBeNull();

    userEvent.paste(input, 'あ');
    ({ x, y } = posForText(getByText('あ')));
    expect(x).toBe('20.125');
    expect(y).toBe('20.125'); // still third row!
  });

  it('handles "bulk" input (pasting)', () => {
    const { getByLabelText, getByText } = render(<Size4 withGrid withClues />);
    const input = getByLabelText('crossword-input');

    userEvent.click(getByLabelText('clue-1-across'));

    fireEvent.change(input, { target: { value: 'あいう' } });

    let { x, y } = posForText(getByText('あ'));
    expect(x).toBe('0.125');
    expect(y).toBe('0.125');

    ({ x, y } = posForText(getByText('い')));
    expect(x).toBe('10.125');
    expect(y).toBe('0.125');

    ({ x, y } = posForText(getByText('う')));
    expect(x).toBe('20.125');
    expect(y).toBe('0.125');
  });
});

describe('onAnswerComplete', () => {
  it('fires onAnswerComplete when all cells in an answer are filled correctly', () => {
    const onAnswerComplete = jest.fn();
    const { getByLabelText } = render(
      <Simple withGrid withClues onAnswerComplete={onAnswerComplete} />
    );

    userEvent.click(getByLabelText('clue-1-across'));
    // we don't need to await this, as the onCorrect handler is taking care of
    // that for us...
    userEvent.paste(getByLabelText('crossword-input'), 'りんご');

    expect(onAnswerComplete).toBeCalledTimes(1);
    expect(onAnswerComplete).toBeCalledWith('across', '1', true, 'りんご');
  });

  it('fires onAnswerComplete when all cells in an answer are filled, even if incorrectly', () => {
    const onAnswerComplete = jest.fn();
    const { getByLabelText } = render(
      <Simple withGrid withClues onAnswerComplete={onAnswerComplete} />
    );

    userEvent.click(getByLabelText('clue-1-across'));
    userEvent.paste(getByLabelText('crossword-input'), 'あああ');

    expect(onAnswerComplete).toBeCalledTimes(1);
    expect(onAnswerComplete).toBeCalledWith('across', '1', false, 'りんご');
  });
});

['onAnswerCorrect', 'onCorrect'].forEach((handler) => {
  describe(`${handler} callback`, () => {
    it(`fires ${handler} when an answer is entered correctly`, () => {
      const onAnswerCorrect = jest.fn();
      const handlerProp = { [handler]: onAnswerCorrect };
      const { getByLabelText } = render(
        <Simple withGrid withClues {...handlerProp} />
      );

      userEvent.click(getByLabelText('clue-1-across'));
      userEvent.paste(getByLabelText('crossword-input'), 'りんご');

      expect(onAnswerCorrect).toBeCalledTimes(1);
      expect(onAnswerCorrect).toBeCalledWith('across', '1', 'りんご');
    });

    it(`fires ${handler} when an mixed lowercase hiragana`, () => {
      const onAnswerCorrect = jest.fn();
      const handlerProp = { [handler]: onAnswerCorrect };
      const { getByLabelText } = render(
        <LowerHiragana withGrid withClues {...handlerProp} />
      );

      userEvent.click(getByLabelText('clue-1-across'));
      userEvent.paste(getByLabelText('crossword-input'), 'らつこ');

      expect(onAnswerCorrect).toBeCalledTimes(1);
      expect(onAnswerCorrect).toBeCalledWith('across', '1', 'らっこ');
    });

    it(`does not fire ${handler} when a wrong answer is entered`, () => {
      const onAnswerCorrect = jest.fn();
      const handlerProp = { [handler]: onAnswerCorrect };
      const { getByLabelText } = render(
        <Simple withGrid withClues {...handlerProp} />
      );

      const input = getByLabelText('crossword-input');

      userEvent.click(getByLabelText('clue-1-across'));
      userEvent.type(getByLabelText('crossword-input'), 'XXX', {
        skipClick: true,
      });

      expect(onAnswerCorrect).toBeCalledTimes(0);

      fireEvent.keyDown(input, { key: 'Tab' }); // switches to 2-down
      expect(onAnswerCorrect).toBeCalledTimes(0);
    });
  });
});

describe('onAnswerIncorrect callback', () => {
  it('fires onAnswerIncorrect when an answer is entered incorrectly', () => {
    const onAnswerIncorrect = jest.fn();
    const { getByLabelText } = render(
      <Simple withGrid withClues onAnswerIncorrect={onAnswerIncorrect} />
    );

    userEvent.click(getByLabelText('clue-1-across'));
    userEvent.paste(getByLabelText('crossword-input'), 'あああ');

    expect(onAnswerIncorrect).toBeCalledTimes(1);
    expect(onAnswerIncorrect).toBeCalledWith('across', '1', 'りんご');
  });

  it('does not fire onAnswerIncorrect when a correct answer is entered', () => {
    const onAnswerIncorrect = jest.fn();
    const { getByLabelText } = render(
      <Simple withGrid withClues onAnswerIncorrect={onAnswerIncorrect} />
    );

    const input = getByLabelText('crossword-input');

    userEvent.click(getByLabelText('clue-1-across'));
    userEvent.paste(getByLabelText('crossword-input'), 'りんご');

    expect(onAnswerIncorrect).toBeCalledTimes(0);

    fireEvent.keyDown(input, { key: 'Tab' }); // switches to 2-down
    expect(onAnswerIncorrect).toBeCalledTimes(0);
  });
});

describe('onCellChange callback', () => {
  it('fires onCellChange when a cell is changed', () => {
    const onCellChange = jest.fn();
    const { getByLabelText } = render(
      <Simple withGrid withClues onCellChange={onCellChange} />
    );

    userEvent.click(getByLabelText('clue-1-across'));
    userEvent.paste(getByLabelText('crossword-input'), 'り');

    expect(onCellChange).toBeCalledTimes(1);
    expect(onCellChange).toBeCalledWith(0, 0, 'り');
  });

  it('does not fire onCellChange when a cell gets the same value', () => {
    const onCellChange = jest.fn();
    const { getByLabelText } = render(
      <Simple withGrid withClues onCellChange={onCellChange} />
    );

    userEvent.click(getByLabelText('clue-1-across'));
    userEvent.paste(getByLabelText('crossword-input'), 'り');

    expect(onCellChange).toBeCalledTimes(1);
    onCellChange.mockClear();

    userEvent.click(getByLabelText('clue-1-across'));
    userEvent.paste(getByLabelText('crossword-input'), 'り');
    expect(onCellChange).toBeCalledTimes(0);
  });
});

describe('onCrosswordComplete callback', () => {
  it('fires onCrosswordComplete(true) when the crossword becomes entirely correct', () => {
    const onCrosswordComplete = jest.fn();
    const { getByLabelText } = render(
      <Simple withGrid withClues onCrosswordComplete={onCrosswordComplete} />
    );

    onCrosswordComplete.mockClear();
    userEvent.click(getByLabelText('clue-1-across'));
    userEvent.paste(getByLabelText('crossword-input'), 'りんご');
    userEvent.click(getByLabelText('clue-2-down'));
    userEvent.paste(getByLabelText('crossword-input'), 'ごり');
    expect(onCrosswordComplete).toBeCalledTimes(0);
    userEvent.paste(getByLabelText('crossword-input'), 'ら');

    expect(onCrosswordComplete).toBeCalledTimes(1);
    expect(onCrosswordComplete).toBeCalledWith(true);
  });

  it('fires onCrosswordComplete(false) when the crossword is filled but *not* entirely correct', () => {
    const onCrosswordComplete = jest.fn();
    const { getByLabelText } = render(
      <Simple withGrid withClues onCrosswordComplete={onCrosswordComplete} />
    );

    onCrosswordComplete.mockClear();
    userEvent.click(getByLabelText('clue-1-across'));
    userEvent.paste(getByLabelText('crossword-input'), 'りんご');
    userEvent.click(getByLabelText('clue-2-down'));
    userEvent.paste(getByLabelText('crossword-input'), 'ごりら');
    expect(onCrosswordComplete).toBeCalledTimes(1);
    onCrosswordComplete.mockClear();

    userEvent.paste(getByLabelText('crossword-input'), 'あ');

    expect(onCrosswordComplete).toBeCalledTimes(1);
    expect(onCrosswordComplete).toBeCalledWith(false);
  });
});

describe('onCrosswordCorrect callback', () => {
  // it('fires onCrosswordCorrect(falsy) when the crossword loads', () => {
  //   const onCrosswordCorrect = jest.fn();
  //   render(
  //     <Simple withGrid withClues onCrosswordCorrect={onCrosswordCorrect} />
  //   );

  //   expect(onCrosswordCorrect).toBeCalledWith(false);
  //   expect(onCrosswordCorrect).not.toBeCalledWith(true);
  // });

  it('fires onCrosswordCorrect(true) when the crossword becomes entirely correct', () => {
    const onCrosswordCorrect = jest.fn();
    const { getByLabelText } = render(
      <Simple withGrid withClues onCrosswordCorrect={onCrosswordCorrect} />
    );

    onCrosswordCorrect.mockClear();
    userEvent.click(getByLabelText('clue-1-across'));
    userEvent.paste(getByLabelText('crossword-input'), 'りんご');
    userEvent.click(getByLabelText('clue-2-down'));
    userEvent.paste(getByLabelText('crossword-input'), 'ごり');
    expect(onCrosswordCorrect).toBeCalledTimes(0);
    userEvent.paste(getByLabelText('crossword-input'), 'ら');

    expect(onCrosswordCorrect).toBeCalledTimes(1);
    expect(onCrosswordCorrect).toBeCalledWith(true);
  });

  it('fires onCrosswordCorrect(false) when the crossword becomes *not* entirely correct again', () => {
    const onCrosswordCorrect = jest.fn();
    const { getByLabelText } = render(
      <Simple withGrid withClues onCrosswordCorrect={onCrosswordCorrect} />
    );

    onCrosswordCorrect.mockClear();
    userEvent.click(getByLabelText('clue-1-across'));
    userEvent.paste(getByLabelText('crossword-input'), 'りんご');
    userEvent.click(getByLabelText('clue-2-down'));
    userEvent.paste(getByLabelText('crossword-input'), 'ごりら');
    expect(onCrosswordCorrect).toBeCalledTimes(1);
    onCrosswordCorrect.mockClear();

    userEvent.paste(getByLabelText('crossword-input'), 'あ');

    expect(onCrosswordCorrect).toBeCalledTimes(1);
    expect(onCrosswordCorrect).toBeCalledWith(false);
  });
});

describe('context handlers', () => {
  describe('handleClueSelected()', () => {
    it('calls onClueSelected on valid selection', () => {
      const onClueSelected = jest.fn();
      const { getByLabelText } = render(
        <Simple withGrid withClues onClueSelected={onClueSelected} />
      );

      userEvent.click(getByLabelText('clue-1-across'));

      expect(onClueSelected).toBeCalledTimes(1);
      expect(onClueSelected).toBeCalledWith('across', '1');
    });

    it('does not call onClueSelected on invalid selection', () => {
      function BadClueSelectorButton() {
        const { handleClueSelected } = useContext(CrosswordContext);

        const handleClick = useCallback(() => {
          handleClueSelected('across', 'BOGUS');
        }, [handleClueSelected]);
        return (
          <button data-testid="BADSELECTOR" type="button" onClick={handleClick}>
            DUMMY
          </button>
        );
      }

      const onClueSelected = jest.fn();
      const { getByTestId } = render(
        <Simple withClues onClueSelected={onClueSelected}>
          <BadClueSelectorButton />
        </Simple>
      );

      userEvent.click(getByTestId('BADSELECTOR'));

      expect(onClueSelected).toBeCalledTimes(0);
    });
  });
});

describe('imperative commands', () => {
  it('sets focus when requested', () => {
    const ref = React.createRef<CrosswordProviderImperative>();
    const { getByLabelText, container } = render(
      <Simple withGrid withClues forwardedRef={ref} />
    );

    const doc = container.ownerDocument;

    // no focus yet?
    const input = getByLabelText('crossword-input');
    expect(doc.activeElement).not.toBe(input);

    expect(ref.current).toBeTruthy();
    act(() => {
      ref.current?.focus();
    });

    expect(doc.activeElement).toBe(input);
  });

  it('focus without grid does nothing (except log)', () => {
    const ref = React.createRef<CrosswordProviderImperative>();
    /* const { container } = */ render(<Simple withClues forwardedRef={ref} />);

    // const doc = container.ownerDocument;

    expect(ref.current).toBeTruthy();
    act(() => {
      ref.current?.focus();
    });

    // TODO?: start with focus elsewhere and check that it doesn't change?
    // expect(doc.activeElement).toBe(input);
  });

  it('resets data when requested', () => {
    const ref = React.createRef<CrosswordProviderImperative>();
    const { getByLabelText, queryByText } = render(
      <Simple withGrid withClues forwardedRef={ref} />
    );

    userEvent.click(getByLabelText('clue-1-across'));

    const input = getByLabelText('crossword-input');

    fireEvent.change(input, { target: { value: 'あ' } });
    let textEl = queryByText('あ');
    expect(textEl).toBeTruthy();

    expect(ref.current).toBeTruthy();
    act(() => {
      ref.current?.reset();
    });

    textEl = queryByText('あ');
    expect(textEl).toBeFalsy();
  });

  it('resets data including storage when requested', () => {
    const ref = React.createRef<CrosswordProviderImperative>();
    const { getByLabelText, queryByText } = render(
      <Simple withGrid withClues useStorage forwardedRef={ref} />
    );

    userEvent.click(getByLabelText('clue-1-across'));

    const input = getByLabelText('crossword-input');

    fireEvent.change(input, { target: { value: 'あ' } });
    let textEl = queryByText('あ');
    expect(textEl).toBeTruthy();

    expect(ref.current).toBeTruthy();
    act(() => {
      ref.current?.reset();
    });

    textEl = queryByText('あ');
    expect(textEl).toBeFalsy();
  });

  it('fills answers when requested', () => {
    const ref = React.createRef<CrosswordProviderImperative>();
    const { queryByText } = render(
      <Simple withGrid withClues forwardedRef={ref} />
    );

    let textEl = queryByText('ご');
    expect(textEl).toBeFalsy();

    expect(ref.current).toBeTruthy();
    act(() => {
      ref.current?.fillAllAnswers();
    });

    textEl = queryByText('ご');
    expect(textEl).toBeTruthy();
  });

  it('calls onLoadedCorrect after filling answers', () => {
    const onLoadedCorrect = jest.fn();
    const ref = React.createRef<CrosswordProviderImperative>();
    render(
      <Simple
        withGrid
        withClues
        onLoadedCorrect={onLoadedCorrect}
        forwardedRef={ref}
      />
    );

    expect(ref.current).toBeTruthy();
    act(() => {
      ref.current?.fillAllAnswers();
    });

    expect(onLoadedCorrect).toBeCalledWith([
      ['across', '1', 'りんご'],
      ['down', '2', 'ごりら'],
    ]);
  });

  it('calls onCrosswordComplete after filling answers', () => {
    const onCrosswordComplete = jest.fn();
    const ref = React.createRef<CrosswordProviderImperative>();
    render(
      <Simple
        withGrid
        withClues
        onCrosswordComplete={onCrosswordComplete}
        forwardedRef={ref}
      />
    );

    onCrosswordComplete.mockClear();
    expect(ref.current).toBeTruthy();
    act(() => {
      ref.current?.fillAllAnswers();
    });

    expect(onCrosswordComplete).toBeCalledTimes(1);
    expect(onCrosswordComplete).toBeCalledWith(true);
  });

  it('returns whether the crossword is correct', () => {
    const ref = React.createRef<CrosswordProviderImperative>();
    render(<Simple withGrid withClues forwardedRef={ref} />);
    expect(ref.current).toBeTruthy();
    let isCorrect = true;
    act(() => {
      isCorrect = ref.current?.isCrosswordCorrect();
    });

    expect(isCorrect).toBeFalsy();
  });

  it('setGuess() can set a guess', () => {
    const ref = React.createRef<CrosswordProviderImperative>();
    const { queryByText } = render(
      <Simple withGrid withClues forwardedRef={ref} />
    );

    let textEl = queryByText('り');
    expect(textEl).toBeFalsy();

    expect(ref.current).toBeTruthy();
    act(() => {
      ref.current?.setGuess(0, 0, 'り');
    });

    textEl = queryByText('り');
    expect(textEl).toBeTruthy();
  });

  it('setGuess() throws on an unused cell', () => {
    const ref = React.createRef<CrosswordProviderImperative>();
    render(<Simple withGrid withClues forwardedRef={ref} />);

    expect(ref.current).toBeTruthy();
    act(() => {
      expect(() => ref.current?.setGuess(1, 0, 'り')).toThrow();
    });
  });
});

// for ease of calling, textEl is an HTMLElement.... but it's *really* a
// SVGTextElement!
function posForText(textEl: HTMLElement) {
  // get the position from the <rect> that's the first child of the enclosing
  // <g>...
  const rect = textEl!.parentElement!.firstChild! as SVGRectElement;
  return { x: rect.getAttribute('x'), y: rect.getAttribute('y') };
}
