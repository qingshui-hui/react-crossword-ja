// import { jest } from '@jest/globals';
import React from 'react';
// import ReactDom from 'react-dom';

import CrosswordProvider, {
  CrosswordProviderImperative,
  CrosswordProviderProps,
} from '../CrosswordProvider';
import CrosswordGrid from '../CrosswordGrid';
import DirectionClues from '../DirectionClues';
import { CluesInput } from '../types';

const emptyData = {
  across: {},
  down: {},
};

const simpleData = {
  across: {
    1: {
      clue: 'apple',
      answer: 'りんご',
      row: 0,
      col: 0,
    },
  },
  down: {
    2: {
      clue: 'gorilla',
      answer: 'ごりら',
      row: 0,
      col: 2,
    },
  },
};

const lowerData = {
  across: {
    1: {
      clue: 'sea otter',
      answer: 'らっこ',
      row: 0,
      col: 0,
    },
  },
  down: {
    2: {
      clue: 'building blocks',
      answer: 'つみき',
      row: 0,
      col: 1,
    },
  },
};

// Simplify tests by using data that makes a 4x4 grid (so that each cell is
// 25x25, plus the 0.125 padding):
//
//       0 25 50 75
//    +------------
//  0 |  り ん ご .
// 25 |  .  .  り す
// 50 |  .  .  ら .
// 75 |  .  .  .  .

const size4Data = {
  across: {
    1: {
      clue: 'apple',
      answer: 'りんご',
      row: 0,
      col: 0,
    },
    3: {
      clue: 'りす',
      answer: 'squirrel',
      row: 1,
      col: 2,
    },
  },
  down: {
    2: {
      clue: 'gorilla',
      answer: 'ごりら',
      row: 0,
      col: 2,
    },
  },
};

type ProviderProps = {
  withGrid?: boolean;
  withClues?: boolean;
  forwardedRef?: React.RefObject<CrosswordProviderImperative>;
} & Omit<CrosswordProviderProps, 'data'>;

const defaultProps = {
  withGrid: false,
  withClues: false,
  forwardedRef: undefined,
};

// stub CrosswordProviders for testing...
export function Empty(props: ProviderProps) {
  return <ProviderAndComponents {...props} data={emptyData} />;
}

Empty.defaultProps = defaultProps;

export function Simple(props: ProviderProps) {
  return <ProviderAndComponents {...props} data={simpleData} />;
}

Simple.defaultProps = defaultProps;

export function Size4(props: ProviderProps) {
  return <ProviderAndComponents {...props} data={size4Data} />;
}

Size4.defaultProps = defaultProps;

export function LowerHiragana(props: ProviderProps) {
  return <ProviderAndComponents {...props} data={lowerData} />;
}

LowerHiragana.defaultProps = defaultProps;

function ProviderAndComponents({
  data,
  withGrid,
  withClues,
  forwardedRef,
  children,
  ...props
}: ProviderProps & { data: CluesInput }) {
  return (
    <CrosswordProvider
      useStorage={false}
      {...props}
      data={data}
      ref={forwardedRef}
    >
      {withGrid && <CrosswordGrid />}
      {withClues && (
        <>
          <DirectionClues direction="across" />
          <DirectionClues direction="down" />
        </>
      )}
      {children}
    </CrosswordProvider>
  );
}

ProviderAndComponents.defaultProps = defaultProps;
