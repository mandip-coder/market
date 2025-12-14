
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import SimpleBarReact, { Props as SimpleBarProps } from "simplebar-react";

import type SimpleBarCore from "simplebar-core";

export const ScrollContext = createContext<HTMLElement | null>(null);

export const useScroll = () => useContext(ScrollContext);

interface AppScrollbarProps extends SimpleBarProps {
  children: React.ReactNode;
  scrollToTop?: boolean;
  className?: string;
  
}

const AppScrollbar: React.FC<AppScrollbarProps> = ({
  children,
  scrollToTop,
  className,
  ...others
}) => {
  
  const simplebarRef = useRef<SimpleBarCore | null>(null);
  const [scrollElement, setScrollElement] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (simplebarRef.current) {
      setScrollElement(simplebarRef.current.getScrollElement());
    }
  }, []);

  return (
    <ScrollContext.Provider value={scrollElement}>
      <SimpleBarReact ref={simplebarRef} {...others} className={className}>
        {children}
      </SimpleBarReact>
    </ScrollContext.Provider>
  );
};

export default AppScrollbar;
