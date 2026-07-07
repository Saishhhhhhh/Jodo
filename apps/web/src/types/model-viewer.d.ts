// eslint-disable-next-line @typescript-eslint/no-unused-vars
import * as React from 'react';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & { [key: string]: unknown }, HTMLElement>;
    }
  }
  namespace React {
    namespace JSX {
      interface IntrinsicElements {
        'model-viewer': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & { [key: string]: unknown }, HTMLElement>;
      }
    }
  }
}
