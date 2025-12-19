declare module 'react-quill' {
  import { Component } from 'react';

  export interface ReactQuillProps {
    value?: string | any;
    defaultValue?: string | any;
    placeholder?: string;
    readOnly?: boolean;
    modules?: any;
    formats?: string[];
    theme?: string;
    bounds?: string | HTMLElement;
    onChange?: (content: string, delta: any, source: string, editor: any) => void;
    onChangeSelection?: (range: any, source: string, editor: any) => void;
    onFocus?: (range: any, source: string, editor: any) => void;
    onBlur?: (previousRange: any, source: string, editor: any) => void;
    onKeyPress?: (event: any) => void;
    onKeyDown?: (event: any) => void;
    onKeyUp?: (event: any) => void;
    tabIndex?: number;
    className?: string;
    style?: React.CSSProperties;
    preserveWhitespace?: boolean;
    scrollingContainer?: string | HTMLElement;
    status?: string;
  }

  export default class ReactQuill extends Component<ReactQuillProps> { }
}
