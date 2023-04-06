import React, { useContext, useMemo } from 'react';
import PropTypes, { InferProps } from 'prop-types';

import { ThemeContext, ThemeProvider } from 'styled-components';

import KeyCell from './KeyCell';

import { CrosswordContext, CrosswordSizeContext } from './context';
import { UsedCellData } from './types';

const defaultTheme = {
  columnBreakpoint: '768px',
  gridBackground: 'rgb(0,0,0)',
  cellBackground: 'rgb(255,255,255)',
  cellBorder: 'rgb(0,0,0)',
  textColor: 'rgb(0,0,0)',
  numberColor: 'rgba(0,0,0, 0.25)',
  focusBackground: 'rgb(255,255,0)',
  highlightBackground: 'rgb(255,255,204)',
};

const KeyCellsPropTypes = {
  /** presentation values for the crossword; these override any values coming from a parent ThemeProvider context. */
  theme: PropTypes.shape({
    /** browser-width at which the clues go from showing beneath the grid to showing beside the grid */
    columnBreakpoint: PropTypes.string,

    /** overall background color (fill) for the crossword grid; can be `'transparent'` to show through a page background image */
    gridBackground: PropTypes.string,
    /**  background for an answer cell */
    cellBackground: PropTypes.string,
    /** border for an answer cell */
    cellBorder: PropTypes.string,
    /** color for answer text (entered by the player) */
    textColor: PropTypes.string,
    /** color for the across/down numbers in the grid */
    numberColor: PropTypes.string,
    /** background color for the cell with focus, the one that the player is typing into */
    focusBackground: PropTypes.string,
    /** background color for the cells in the answer the player is working on,
     * helps indicate in which direction focus will be moving; also used as a
     * background on the active clue  */
    highlightBackground: PropTypes.string,
  }),
};

export type KeyCellsProps = InferProps<typeof KeyCellsPropTypes>;

/**
 * The rendering component for the crossword grid itself.
 */
export default function KeyCells({ theme }: KeyCellsProps) {
  const {
    size,
    gridData,
    keyIndexes,
    handleCellClick,
    focused,
    selectedPosition: { row: focusedRow, col: focusedCol },
  } = useContext(CrosswordContext);

  const contextTheme = useContext(ThemeContext);

  const cellSize = 100 / size;
  const cellPadding = 0.125;
  const cellInner = cellSize - cellPadding * 2;
  const cellHalf = cellSize / 2;
  const fontSize = cellInner * 0.7;

  const sizeContext = useMemo(
    () => ({ cellSize, cellPadding, cellInner, cellHalf, fontSize }),
    [cellSize, cellPadding, cellInner, cellHalf, fontSize]
  );

  // The final theme is the merger of three values: the "theme" property
  // passed to the component (which takes precedence), any values from
  // ThemeContext, and finally the "defaultTheme" values fill in for any
  // needed ones that are missing.  (We create this in standard last-one-wins
  // order in Javascript, of course.)
  const finalTheme = useMemo(
    () => ({
      ...defaultTheme,
      ...contextTheme,
      ...theme,
      columnBreakpoint: '768px',
      gridBackground: 'rgb(255,255,255)',
      cellBorder: 'red',
    }),
    [contextTheme, theme]
  );

  const flattenCells = gridData
    .flat()
    .filter((cellData) => cellData.used) as UsedCellData[];
  // filter is for rendering before gridData is set.
  const keyCells: UsedCellData[] = keyIndexes
    .map((i) => flattenCells[i])
    .filter((cellData) => cellData);

  return (
    <CrosswordSizeContext.Provider value={sizeContext}>
      <ThemeProvider theme={finalTheme}>
        <div
          style={{
            margin: 0,
            padding: 0,
            display: 'flex',
            gap: `${cellHalf}px`,
          }}
        >
          {keyCells.map((cellData, idx) => (
            <KeyCell
              // eslint-disable-next-line react/no-array-index-key
              key={`R${idx}`}
              index={idx}
              cellData={cellData}
              focus={
                focused &&
                cellData.row === focusedRow &&
                cellData.col === focusedCol
              }
              onClick={handleCellClick}
            />
          ))}
        </div>
      </ThemeProvider>
    </CrosswordSizeContext.Provider>
  );
}

KeyCells.propTypes = KeyCellsPropTypes;

KeyCells.defaultProps = {
  theme: null,
};
