import { useEffect, useRef, useState } from "react";

const useElementInView = ({
  id,
  options,
}: {
  id?: string;
  options: IntersectionObserverInit;
}) => {
  const [isInView, setIsInView] = useState(false);
  const targetRef = useRef(null);

  const [target, setTarget] = useState<HTMLElement | null | undefined>();

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      const [entry] = entries;
      setIsInView(entry.isIntersecting);
    }, options);

    if (id) setTarget(document.getElementById(id));

    if (target) {
      observer.observe(target);
    } else if (targetRef.current) {
      observer.observe(targetRef.current);
    }

    return () => {
      if (target) {
        observer.unobserve(target);
      } else if (targetRef.current) {
        observer.unobserve(targetRef.current);
      }
    };
  }, [options]);

  return [target ? target : targetRef.current, isInView];
};

export default useElementInView;
