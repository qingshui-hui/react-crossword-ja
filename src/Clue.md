```jsx
import {
  Clue,
  CrosswordContext,
  ThemeProvider,
} from '@naari3/react-crossword-ja';

<ThemeProvider
  theme={{
    highlightBackground: 'rgb(255,255,204)',
  }}
>
  <CrosswordContext.Provider
    value={{
      focused: true,
      selectedDirection: 'across',
      selectedNumber: '2',
    }}
  >
    <Clue direction="across" number="1">
      This is a clue.
    </Clue>

    <Clue direction="across" number="2" highlight={true}>
      This is a highlighted clue.
    </Clue>
  </CrosswordContext.Provider>
</ThemeProvider>;
```
