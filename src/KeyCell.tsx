import React, { useCallback, useContext } from 'react';
import PropTypes from 'prop-types';
import { ThemeContext } from 'styled-components';

import { CrosswordSizeContext } from './context';
import type { UsedCellData, EnhancedProps } from './types';
import { indexToAlphabet } from './util';

const keyCellPropTypes = {
  /** the data specific to this cell */
  cellData: PropTypes.shape({
    row: PropTypes.number.isRequired,
    col: PropTypes.number.isRequired,
    guess: PropTypes.string, // .isRequired,
    number: PropTypes.string,
    answer: PropTypes.string,
  }).isRequired,

  /** the 0 start number of the key cell */
  index: PropTypes.number.isRequired,

  /** whether this cell has focus */
  focus: PropTypes.bool,

  /** handler called when the cell is clicked */
  onClick: PropTypes.func,
};

export type KeyCellProps = EnhancedProps<
  typeof keyCellPropTypes,
  {
    /** the data specific to this cell */
    cellData: UsedCellData;
    /** handler called when the cell is clicked */
    onClick?: (cellData: UsedCellData) => void;
  }
>;

/**
 * An individual-letter answer cell within the crossword grid.
 *
 * A `Cell` lives inside the SVG for a
 * [`CrosswordGrid`](#/Complex%20layouts/CrosswordGrid), and renders at a
 * position determined by the `row`, `col`, and `cellSize` properties from
 * `cellData` and `renderContext`.
 */
export default function KeyCell({
  cellData,
  index,
  onClick,
  focus,
}: KeyCellProps) {
  const { cellInner: masterCellInner } = useContext(CrosswordSizeContext);
  const {
    // gridBackground,
    cellBackground,
    cellBorder,
    textColor,
    focusBackground,
  } = useContext(ThemeContext);

  const handleClick = useCallback(
    (event) => {
      event.preventDefault();
      if (onClick) {
        onClick(cellData);
      }
    },
    [cellData, onClick]
  );

  const { guess, answer } = cellData;

  let cellInner = 60;
  if (masterCellInner > 60) {
    cellInner = masterCellInner;
  }

  return (
    <div
      style={{
        height: `${cellInner * 1.5}px`,
        display: 'flex',
        alignItems: 'end',
      }}
    >
      {/*  eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
      <div
        onClick={handleClick}
        style={{
          cursor: 'default',
          fontSize: `${cellInner * 0.75}px`,
          border: `3px solid ${cellBorder}`,
          width: `${cellInner}px`,
          height: `${cellInner}px`,
          position: 'relative',
          background: focus ? focusBackground : cellBackground,
        }}
        className="clue-cell"
      >
        <div
          style={{
            fontSize: `${cellInner * 0.4}px`,
            color: '#F69896',
            position: 'absolute',
            top: `${-cellInner * 0.55}px`,
            left: `3px`,
          }}
        >
          {/* 36進数 */}
          {indexToAlphabet(index)}
        </div>
        <div
          style={{
            fill: textColor,
            display: 'flex',
            justifyContent: 'center',
            height: '100%',
            alignItems: 'center',
            fontWeight: '600',
          }}
          className={
            answer === guess ? 'guess-text-correct' : 'guess-text-incorrect'
          }
        >
          {guess}
        </div>
      </div>
    </div>
  );
}

KeyCell.propTypes = keyCellPropTypes;

KeyCell.defaultProps = {
  focus: false,
  onClick: null,
};
