// We re-export ThemeProvider from styled-components so that consumers don't
// have to pull it in explicitly if we are the only reason.  (This also helps
// with our style guide!)
import { ThemeProvider } from 'styled-components';

import Cell from './Cell';

import Clue from './Clue';

import DirectionClues from './DirectionClues';

import KeyCells from './KeyCells';

import Crossword, { CrosswordImperative, CrosswordProps } from './Crossword';

import CrosswordGrid, {
  // CrosswordGridImperative,
  CrosswordGridProps,
} from './CrosswordGrid';

import CrosswordProvider, {
  CrosswordProviderImperative,
  CrosswordProviderProps,
} from './CrosswordProvider';

import { CrosswordContext, CrosswordSizeContext } from './context';

import { AnswerTuple, CluesInput, CellData, GridPosition } from './types';

export {
  Cell,
  Clue,
  DirectionClues,
  Crossword,
  CrosswordImperative,
  CrosswordProps,
  CrosswordGrid,
  KeyCells,
  // CrosswordGridImperative,
  CrosswordGridProps,
  CrosswordProvider,
  CrosswordProviderImperative,
  CrosswordProviderProps,
  CrosswordContext,
  CrosswordSizeContext,
  AnswerTuple,
  CluesInput,
  CellData,
  GridPosition,
  ThemeProvider,
};

export default Crossword;
