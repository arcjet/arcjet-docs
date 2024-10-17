import type { ForwardedRef, HTMLProps } from "react";
import { forwardRef } from "react";

export interface Props extends HTMLProps<SVGSVGElement> {}

export const Hono = forwardRef(
  ({ className, ...props }: Props, ref: ForwardedRef<SVGSVGElement>) => {
    let cls = "aj-Icon aj-Icon-hono";
    if (className) cls += " " + className;
    return (
      <svg
        ref={ref}
        viewBox="0 0 128 128"
        width="128"
        height="128"
        fill="currentColor"
        className={cls}
        {...props}
      >
        <path
          opacity="0.993"
          fillRule="evenodd"
          clipRule="evenodd"
          d="M66.966 6.24295C66.7305 6.04808 66.4587 5.97044 66.1508 6.01003C56.3098 18.1928 47.8467 31.3143 40.7617 45.3747C39.8335 44.5632 38.9407 43.7091 38.083 42.8125C36.2308 40.2613 34.2898 37.7767 32.2599 35.3589C29.7717 38.468 27.7529 41.8841 26.2037 45.6077C22.4859 54.7338 20.1566 64.2062 19.2159 74.0248C18.651 79.729 19.1945 85.3192 20.8464 90.7956C27.1882 107.617 39.1841 117.827 56.8337 121.426C71.5994 123.541 84.6433 119.814 95.9655 110.245C108.906 97.73 112.205 83.0167 105.865 66.1053C101.895 56.61 97.081 47.6036 91.4234 39.0857C83.7817 27.7639 75.6293 16.8164 66.966 6.24295ZM88.6024 61.0867C81.6984 49.8813 73.9729 39.322 65.4261 29.4086C60.2355 36.2699 54.9947 43.1024 49.7035 49.9062L42.7157 60.155C40.2508 64.1527 38.1545 68.3454 36.4266 72.7331C35.215 76.2834 34.8267 79.9326 35.262 83.6807C37.0558 95.5681 43.6942 103.294 55.1773 106.857C65.8258 109.405 75.6087 107.542 84.5261 101.267C93.7463 93.7762 96.8908 84.2649 93.9597 72.7331C92.5526 68.6767 90.767 64.7945 88.6024 61.0867Z"
          stroke="none"
        />
      </svg>
    );
  },
);
